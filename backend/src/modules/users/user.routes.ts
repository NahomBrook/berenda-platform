import { Router } from "express";
import { authenticateJWT } from "../../middlewares/auth.middleware";

const router = Router();

// Test protected route
router.get("/profile", authenticateJWT, (req, res) => {
  const user = (req as any).user;
  res.json({ success: true, message: "Access granted", user });
});

export default router;
