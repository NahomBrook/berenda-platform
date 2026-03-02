import { Router } from "express";
import { getAdminAnalytics, adminDeleteProperty } from "./admin.controller";
import { verifyToken, isAdmin } from "../../middlewares/auth.middleware";

const router = Router();

// All routes here require both a valid token AND the admin role
router.get("/analytics", verifyToken, isAdmin, getAdminAnalytics);
router.delete("/property/:id", verifyToken, isAdmin, adminDeleteProperty);

export default router;