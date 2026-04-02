import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import path from "path";

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

// In serverless env (Vercel) avoid disk writes. Use memory storage as fallback.
const memoryStorage = multer.memoryStorage();

// Use Cloudinary if configured, otherwise fallback to memory storage
const storage = process.env.CLOUDINARY_CLOUD_NAME ? cloudinaryStorage : memoryStorage;

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
