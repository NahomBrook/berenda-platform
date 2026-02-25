import { Request, Response } from "express";
import * as authRepo from "./auth.repository";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";

if (!JWT_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
}

// Helper to auto-generate a username
const generateUsername = (fullName: string) => {
  return (
    fullName.replace(/\s+/g, "").toLowerCase() +
    Math.floor(Math.random() * 1000)
  );
};

// Helper to remove sensitive fields
const sanitizeUser = (user: any) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

// ==========================
// LOCAL REGISTER
// ==========================
export const register = async (req: Request, res: Response) => {
  try {
    const { email, fullName, password, username } = req.body;

    // Validate required input
    if (!email || !fullName || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, fullName, and password are required",
      });
    }

    const usernameToUse = username || generateUsername(fullName);

    const user = await authRepo.createUser({
      email,
      fullName,
      password,
      username: usernameToUse,
      provider: "local",
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      token,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Registration failed",
    });
  }
};

// ==========================
// LOCAL LOGIN
// ==========================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await authRepo.validateUser(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      success: true,
      user: sanitizeUser(user),
      token,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};