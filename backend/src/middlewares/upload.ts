import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import fs from "fs";
import path from "path";

// Ensure uploads directory exists for local development
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Uploads directory created:", uploadsDir);
  } catch (error) {
    console.error("❌ Failed to create uploads directory:", error);
  }
}

// Configure Cloudinary storage for production
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: "berenda_properties",
      format: "jpg",
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// Local disk storage as fallback
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Use Cloudinary if configured, otherwise fallback to disk storage
const storage = process.env.CLOUDINARY_CLOUD_NAME ? cloudinaryStorage : diskStorage;

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export default upload;
