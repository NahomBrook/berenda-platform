import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes.ts"

const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // tighten origin
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Server running"));

export default app;
