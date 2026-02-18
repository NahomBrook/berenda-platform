import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ success: false, message: "Missing token" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET!, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid or expired token" });

    // Attach decoded info to request object
    (req as any).user = decoded;
    next();
  });
};
