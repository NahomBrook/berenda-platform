import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ANALYTICS: Provides a bird's-eye view of the platform activities
 */
export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    // Running counts in parallel for performance
    const [totalUsers, totalProperties, totalBookings, bookingStats] = await Promise.all([
      prisma.user.count(),
      prisma.property.count({ where: { deletedAt: null } }),
      prisma.booking.count(),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);

    // Group properties by location for geographic distribution data
    const propertiesByLocation = await prisma.property.groupBy({
      by: ['location'],
      _count: { _all: true },
      where: { deletedAt: null }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          users: totalUsers,
          activeProperties: totalProperties,
          totalBookings: totalBookings
        },
        bookingBreakdown: bookingStats,
        geographicDistribution: propertiesByLocation
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * USER MANAGEMENT: List all users with their activity counts
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        roles: true,
        createdAt: true,
        _count: {
          select: {
            properties: true,
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * USER MANAGEMENT: Permanent removal of a user
 */
export const adminDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists before deleting
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await prisma.user.delete({ where: { id } });
    
    res.status(200).json({ success: true, message: "User permanently removed from platform" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PROPERTY MANAGEMENT: Admin can soft-delete any property (God Mode)
 */
export const adminDeleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ message: "Property not found" });

    await prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.status(200).json({ success: true, message: "Property removed by administrative action" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};