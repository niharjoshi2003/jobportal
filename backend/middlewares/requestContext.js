import crypto from "crypto";
import { logger } from "../utils/logger.js";

const getClientIp = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (forwardedFor) return String(forwardedFor).split(",")[0].trim();
    return req.ip || req.socket?.remoteAddress || "unknown";
};

export const requestContext = (req, res, next) => {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    req.requestId = String(requestId);
    req.clientIp = getClientIp(req);

    res.setHeader("x-request-id", req.requestId);

    const start = Date.now();
    res.on("finish", () => {
        logger.info("request_completed", {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - start,
            userId: req.id || null,
            ip: req.clientIp,
        });
    });
    next();
};

