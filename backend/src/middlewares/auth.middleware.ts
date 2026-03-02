import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Matching your .env variable exactly
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "superlongrandomaccesssecret";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      message: "No token provided. Format should be: Bearer <token>" 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach the decoded payload (id and role) to the request object
    (req as any).user = decoded;
    
    next();
  } catch (err: any) {
    // Log the specific error (expired vs invalid) to your terminal
    console.error("JWT Verification Error:", err.message);
    
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token",
      error: err.message 
    });
  }
};

export const isAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  
  // Checking if 'admin' exists in the user's roles array
  if (user && user.roles && user.roles.includes("admin")) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied: Admins only" });
  }
};