import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProperties = await prisma.property.count();
    const totalBookings = await prisma.booking.count();
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalBookings
      }
    });
  } catch (error) {
    console.error("Error in getAdminDashboard:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        isVerified: true,
        createdAt: true
      }
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owner: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });
    res.json({ success: true, properties });
  } catch (error) {
    console.error("Error in getAllProperties:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const approveProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: { approvalStatus: "approved" }
    });
    
    res.json({ success: true, property });
  } catch (error) {
    console.error("Error in approveProperty:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const rejectProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: { approvalStatus: "rejected" }
    });
    
    res.json({ success: true, property });
  } catch (error) {
    console.error("Error in rejectProperty:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
