import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn(
        "[cloudinary] Missing CLOUDINARY_* env vars. File uploads will fail until they are set."
    );
}

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const safeUploadBase = (name = "") =>
    path.basename(name, path.extname(name))
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^[._]+|[._]+$/g, "")
        .slice(0, 80) || "file";

export const uploadBufferToCloudinary = (file, options = {}) =>
    new Promise((resolve, reject) => {
        if (!file?.buffer) {
            reject(new Error("Missing file buffer for upload."));
            return;
        }
        const resourceType = options.resource_type || "auto";
        const uploadOptions = {
            folder: options.folder,
            resource_type: resourceType,
            overwrite: false,
        };
        if (resourceType === "raw") {
            const ext = path.extname(file.originalname || "").toLowerCase();
            const filename = `${safeUploadBase(file.originalname)}_${crypto.randomBytes(4).toString("hex")}${ext}`;
            uploadOptions.public_id = filename;
            uploadOptions.use_filename = false;
            uploadOptions.unique_filename = false;
            if (ext) uploadOptions.filename_override = `${safeUploadBase(file.originalname)}${ext}`;
        } else {
            uploadOptions.use_filename = true;
            uploadOptions.unique_filename = true;
        }
        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            }
        );
        uploadStream.end(file.buffer);
    });

export default cloudinary;
