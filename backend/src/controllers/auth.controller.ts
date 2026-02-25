import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.services";
import { sendResponse } from "../utils/response";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await AuthService.registerUser(email, password, role, fullName);
    sendResponse(res, 201, "User registered", { id: user.id, email: user.email, role: user.role, fullName: user.fullName });
  } catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { user, token } = await AuthService.loginUser(email, password);
    sendResponse(res, 200, "Login successful", {
      token,
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    });
  } catch (err: any) {
    next(err);
  }
};