import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Use the same JWT_SECRET that was used to sign the tokens
const JWT_SECRET = process.env.JWT_SECRET || "superlongrandomaccesssecret";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log("=== Auth Middleware Debug ===");
  console.log("JWT_SECRET used:", JWT_SECRET ? "Secret is set" : "Secret is MISSING");
  console.log("JWT_SECRET value:", JWT_SECRET); // Be careful with this in production
  
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No valid Bearer token found");
    return res.status(401).json({ 
      success: false, 
      message: "No token provided. Format should be: Bearer <token>" 
    });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received (first 20 chars):", token.substring(0, 20) + "...");

  try {
    console.log("Attempting to verify token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified successfully!");
    console.log("Decoded user:", decoded);
    
    // Attach the decoded payload to the request object
    (req as any).user = decoded;
    
    next();
  } catch (err: any) {
    console.error("JWT Verification Error Details:");
    console.error("- Error name:", err.name);
    console.error("- Error message:", err.message);
    
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token",
      error: err.message 
    });
  }
};
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // Check if user has admin role
  // You might need to adjust this based on how roles are stored in your token
  if (user && (user.role === "admin" || (user.roles && user.roles.includes("admin")))) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Access denied: Admins only" 
    });
  }
};
