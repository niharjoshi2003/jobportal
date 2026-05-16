import fs from "fs";
import path from "path";
import crypto from "crypto";

const sanitizeFileName = (name = "") =>
    name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 120);

export const saveFileLocally = async (file, folder = "misc") => {
    if (!file?.buffer) throw new Error("File buffer is missing.");

    const uploadsRoot = path.join(process.cwd(), "uploads");
    const targetDir = path.join(uploadsRoot, folder);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const ext = path.extname(file.originalname || "").toLowerCase();
    const baseName = path.basename(file.originalname || "file", ext);
    const safeName = sanitizeFileName(baseName) || "file";
    const unique = crypto.randomBytes(8).toString("hex");
    const fileName = `${Date.now()}-${unique}-${safeName}${ext}`;
    const absolutePath = path.join(targetDir, fileName);

    await fs.promises.writeFile(absolutePath, file.buffer);

    const relativeUrlPath = `/uploads/${folder}/${fileName}`.replace(/\\/g, "/");
    return { absolutePath, relativeUrlPath, fileName };
};

export const toPublicFileUrl = (req, relativeUrlPath) => {
    const configuredBase = String(process.env.BACKEND_PUBLIC_URL || "").trim();
    if (configuredBase) {
        return `${configuredBase.replace(/\/+$/, "")}${relativeUrlPath}`;
    }
    return `${req.protocol}://${req.get("host")}${relativeUrlPath}`;
};

