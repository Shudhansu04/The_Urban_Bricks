import fs from "fs";
import path from "path";
import multer from "multer";
import { isCloudinaryConfigured } from "../services/cloudinary.js";

const memoryStorage = multer.memoryStorage();

function createDiskStorage(subdir, fallbackName) {
  const uploadRoot = path.join(process.cwd(), "uploads", subdir);
  fs.mkdirSync(uploadRoot, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadRoot);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const base = path
        .basename(file.originalname || fallbackName, ext)
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .slice(0, 50);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${base || fallbackName}-${unique}${ext}`);
    },
  });
}

function createUploader(subdir, fallbackName) {
  const storage = isCloudinaryConfigured() ? memoryStorage : createDiskStorage(subdir, fallbackName);

  return multer({
    storage,
    fileFilter,
    limits: { files: 10, fileSize: 5 * 1024 * 1024 },
  });
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image files are allowed"));
};

const propertyUpload = createUploader("properties", "property");
const projectUpload = createUploader("projects", "project");

export const uploadPropertyImages = propertyUpload.array("images", 10);
export const uploadProjectImages = projectUpload.array("images", 10);
