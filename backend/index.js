import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import { app, appConfig } from "./app.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        logger.info("server_started", {
            port: PORT,
            allowedOrigins: appConfig.allowedOrigins,
            env: process.env.NODE_ENV || "development",
        });
    });
};

process.on("unhandledRejection", (reason) => {
    logger.error("unhandled_rejection", {
        reason: reason?.message || String(reason),
        stack: reason?.stack || null,
    });
});

process.on("uncaughtException", (error) => {
    logger.error("uncaught_exception", {
        message: error?.message,
        stack: error?.stack,
    });
});

startServer().catch((error) => {
    logger.error("server_start_failed", { error: error?.message, stack: error?.stack });
    process.exit(1);
});
