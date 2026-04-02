// backend/src/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to convert query params to string
const getStringParam = (param: any): string => {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
};

// Get dashboard statistics
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      pendingProperties,
      monthlyRevenue,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.property.count({ where: { approvalStatus: "pending" } }),
      prisma.booking.aggregate({
        where: { 
          createdAt: { gte: startOfYear }, 
          status: "confirmed" 
        },
        _sum: { totalPrice: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { 
          id: true, 
          fullName: true, 
          email: true, 
          createdAt: true 
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { title: true } },
          renter: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalBookings,
        pendingProperties,
        totalRevenue: monthlyRevenue._sum.totalPrice || 0,
        recentUsers,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Error in getAdminDashboard:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all users with pagination and search
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(getStringParam(req.query.page)) || 1;
    const limit = parseInt(getStringParam(req.query.limit)) || 20;
    const search = getStringParam(req.query.search);
    const skip = (page - 1) * limit;

    let where: any = {};
    if (search) {
      where = {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          username: true,
          isVerified: true,
          createdAt: true,
          roles: {
            include: { role: true },
          },
          _count: {
            select: { properties: true, bookings: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add other admin controller functions here...