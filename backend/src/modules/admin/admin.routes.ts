// src/modules/admin/admin.routes.ts
import { Router } from "express";
import { verifyToken, isAdmin } from "../../middlewares/auth.middleware";
import {
  getAllUsers,
  getAllProperties,
  approveProperty,
  rejectProperty,
  getAdminDashboard
} from "./admin.controller";

const router = Router();

// All admin routes require both authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.get("/properties", getAllProperties);
router.patch("/properties/:propertyId/approve", approveProperty);
router.patch("/properties/:propertyId/reject", rejectProperty);

export default router;