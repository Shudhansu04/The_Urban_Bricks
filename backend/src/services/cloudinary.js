import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

let configured = false;

if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
  configured = true;
}

export function isCloudinaryConfigured() {
  return configured;
}

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder (e.g. "properties", "projects")
 * @param {string} [originalName] - Original filename for context
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
export async function uploadToCloudinary(buffer, folder, originalName = "image") {
  if (!configured) {
    throw new Error("Cloudinary is not configured");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `property-marketplace/${folder}`,
        resource_type: "image",
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result?.secure_url) return reject(new Error("No URL returned from Cloudinary"));
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Upload multiple files from multer memory storage.
 * @param {Array<{buffer: Buffer, originalname: string}>} files - Multer memory files
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<string[]>} - Array of secure URLs
 */
export async function uploadFilesToCloudinary(files, folder) {
  const urls = await Promise.all(
    (files || []).map((file) =>
      uploadToCloudinary(file.buffer, folder, file.originalname)
    )
  );
  return urls;
}
