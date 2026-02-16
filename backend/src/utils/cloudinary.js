import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { env } from "../config/env.js";

const isConfigured =
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret;

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder (e.g. 'properties', 'projects')
 * @param {string} [resourceType='image'] - Resource type
 * @returns {Promise<{secure_url: string}>}
 */
export async function uploadToCloudinary(buffer, folder, resourceType = "image") {
  if (!isConfigured) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `property-selling/${folder}`,
        resource_type: resourceType,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
}

/**
 * Upload multiple files to Cloudinary and return their secure URLs.
 * @param {Array<{buffer: Buffer}>} files - Array of multer file objects with buffer
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<string[]>} Array of secure URLs
 */
export async function uploadMultipleToCloudinary(files, folder) {
  if (!files || files.length === 0) return [];

  const results = await Promise.all(
    files.map((file) => uploadToCloudinary(file.buffer, folder))
  );

  return results.map((r) => r.secure_url);
}

export { isConfigured };
