import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://berenda-platform.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing and cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==================== PUBLIC ROUTES ====================
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/api/ai/test", (req: Request, res: Response) => {
  res.json({
    message: "AI routes are working!",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/properties", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: "Properties endpoint is working"
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (email === 'admin@berenda.com' && password === 'Admin123!') {
    res.json({
      success: true,
      data: {
        token: 'test-token-123',
        user: {
          id: '1',
          email: 'admin@berenda.com',
          fullName: 'Super Admin',
          roles: [{ name: 'ADMIN' }]
        }
      }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

app.post("/api/auth/register", (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }
  
  res.json({
    success: true,
    data: {
      token: 'test-token-register',
      user: {
        id: '2',
        email,
        fullName,
        roles: [{ name: 'USER' }]
      }
    }
  });
});

// ==================== 404 HANDLER ====================
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    status: 404, 
    message: `Route ${req.method} ${req.url} not found`, 
    timestamp: new Date().toISOString() 
  });
});

// ==================== ERROR HANDLER ====================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack || err);
  res.status(500).json({
    success: false,
    status: 500,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString()
  });
});

export default app;
