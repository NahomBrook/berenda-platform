import { Router } from "express";
import * as UsersController from "./user.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload";

const router = Router();

// Example route
router.get("/", UsersController.listUsers);

// Get logged-in profile
router.get("/profile", verifyToken, UsersController.getProfile);

// Update profile
router.put(
  "/profile",
  verifyToken,
  upload.single("avatar"),
  UsersController.updateProfile
);

export default router;