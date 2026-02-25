import { Request, Response } from "express";

// Example controller for listing users
export const listUsers = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "User list fetched successfully",
    data: [], // For now empty, can integrate with DB later
    timestamp: new Date().toISOString(),
  });
};