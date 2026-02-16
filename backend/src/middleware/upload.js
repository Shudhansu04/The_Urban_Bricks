import multer from "multer";

// Memory storage for Cloudinary upload (buffers kept in memory)
const memoryStorage = multer.memoryStorage();

function createUploader() {
  return multer({
    storage: memoryStorage,
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

const propertyUpload = createUploader();
const projectUpload = createUploader();

export const uploadPropertyImages = propertyUpload.array("images", 10);
export const uploadProjectImages = projectUpload.array("images", 10);
