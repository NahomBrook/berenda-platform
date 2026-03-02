import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import propertyRoutes from "./modules/properties/property.routes"; 
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import bookingRoutes from "./modules/bookings/booking.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000", // tighten origin in production
    credentials: true,
  })
);

// Body parsing and cookies
app.use(express.json());
app.use(cookieParser());
app.use("/api/properties", propertyRoutes);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ status: 404, message: "Route not found", timestamp: new Date().toISOString() });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  });
});

export default app;