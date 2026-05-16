import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import internshipRoute from "./routes/internship.route.js";
import interviewRoute from "./routes/interview.route.js";
import testimonialRoute from "./routes/testimonial.route.js";
import bookmarkRoute from "./routes/bookmark.route.js";
import adminRoute from "./routes/admin.route.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { requestContext } from "./middlewares/requestContext.js";
import { validatePayload } from "./middlewares/validatePayload.js";

dotenv.config();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const authLimiter = rateLimit({
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many auth attempts, try again later." },
});

const applyLimiter = rateLimit({
    windowMs: Number(process.env.APPLY_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
    max: Number(process.env.APPLY_RATE_LIMIT_MAX) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many application attempts, please try again later." },
});

const resetLimiter = rateLimit({
    windowMs: Number(process.env.RESET_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
    max: Number(process.env.RESET_RATE_LIMIT_MAX) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many password reset requests, try again later." },
});

const globalLimiter = rateLimit({
    windowMs: Number(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.GLOBAL_RATE_LIMIT_MAX) || 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please slow down." },
});

export const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(requestContext);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(validatePayload);
app.use(globalLimiter);

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    })
);

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
        maxAge: "1d",
        etag: true,
    })
);

app.get("/healthz", (_req, res) => {
    res.json({
        ok: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.get("/readyz", (_req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const dbState = states[mongoose.connection.readyState] || "unknown";
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ ok: false, dbState });
    }
    return res.status(200).json({ ok: true, dbState });
});

app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/register", authLimiter);
app.use("/api/v1/user/forgot-password", resetLimiter);
app.use("/api/v1/user/reset-password", resetLimiter);
app.use("/api/v1/application/apply", applyLimiter);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/internship", internshipRoute);
app.use("/api/v1/interview", interviewRoute);
app.use("/api/v1/testimonial", testimonialRoute);
app.use("/api/v1/bookmark", bookmarkRoute);
app.use("/api/v1/admin", adminRoute);

app.use(notFound);
app.use(errorHandler);

export const appConfig = { allowedOrigins };

