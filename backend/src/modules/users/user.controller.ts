import { Request, Response } from "express";
import prisma from "../../lib/prisma"

// Example controller for listing users
export const listUsers = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "User list fetched successfully",
    data: [],
    timestamp: new Date().toISOString(),
  });
};

// Get logged-in user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
};

// Update profile + avatar
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const { fullName, phone, location } = req.body;

    const profileImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        phone,
        location,
        ...(profileImageUrl && { profileImageUrl }),
      },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};