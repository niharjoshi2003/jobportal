import { v2 as cloudinary } from "cloudinary";
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

export const uploadBufferToCloudinary = (file, options = {}) =>
    new Promise((resolve, reject) => {
        if (!file?.buffer) {
            reject(new Error("Missing file buffer for upload."));
            return;
        }
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder,
                resource_type: options.resource_type || "auto",
                use_filename: true,
                unique_filename: true,
                overwrite: false,
            },
            (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            }
        );
        uploadStream.end(file.buffer);
    });

export default cloudinary;
