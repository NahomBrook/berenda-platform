import { Router } from "express";
import { 
  createProperty, 
  getProperties, 
  getPropertyById, 
  updateProperty, 
  deleteProperty,
  uploadPropertyImages // Import the plural version from main controller
} from "./property.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { upload } from "../../config/cloudinary";

const router = Router();

// Public routes
router.get("/", getProperties);
router.get("/:id", getPropertyById);

// Protected routes (require login)
router.post("/", verifyToken, createProperty);
router.patch("/:id", verifyToken, updateProperty);
router.delete("/:id", verifyToken, deleteProperty);

// Multi-image upload route
router.post("/:propertyId/images", verifyToken, upload.array("images", 5), uploadPropertyImages);

export default router;