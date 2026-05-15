import { logger } from "../utils/logger.js";

export const notFound = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        requestId: req.requestId,
    });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";

    if (process.env.NODE_ENV !== "test") {
        logger.error("request_failed", {
            requestId: req.requestId || null,
            method: req.method,
            path: req.originalUrl,
            status,
            message,
            stack: status >= 500 ? err.stack : undefined,
        });
    }

    res.status(status).json({
        success: false,
        message,
        requestId: req.requestId,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
