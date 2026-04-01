// backend/src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import propertyRoutes from "./modules/properties/property.routes"; 
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import bookingRoutes from "./modules/bookings/booking.routes";
import adminRoutes from "./modules/admin/admin.routes";
import chatRoutes from "./modules/chat/chat.routes";
import locationRoutes from "./modules/locations/location.routes"; 
import aiRoutes from "./modules/ai/ai.routes";
import paymentRoutes from "./modules/payments/payments.routes";

const app = express();
const YOUR_IP = '192.168.1.2';

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    `http://${YOUR_IP}:3000`,
    'http://localhost:5000',
    `http://${YOUR_IP}:5000`
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing and cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use("/api/ai", aiRoutes);

// Static files for uploads
app.use("/uploads", express.static("uploads"));

// Routes - ORDER MATTERS! Put more specific routes first
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chats", chatRoutes); // Chat routes
app.use("/api/locations", locationRoutes); // Location routes
app.use("/api/payments", paymentRoutes);

// Health check - should be before 404 handler
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler - catch all unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    status: 404, 
    message: `Route ${req.method} ${req.url} not found`, 
    timestamp: new Date().toISOString() 
  });
});

// Centralized error handler - must be last
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack || err);
  
  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Invalid or missing authentication token',
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      status: 400,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;