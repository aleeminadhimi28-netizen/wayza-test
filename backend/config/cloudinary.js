import { v2 as cloudinary } from "cloudinary";
import { createRequire } from "module";
import multer from "multer";
import dotenv from "dotenv";

const require = createRequire(import.meta.url);
const CloudinaryStorage = require("multer-storage-cloudinary");

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || 'demo',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wayzza_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, crop: "limit" }]
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
export default cloudinary;
