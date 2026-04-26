import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./utils/db.js";
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

dotenv.config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, cb) => {
            // Allow non-browser tools (no Origin header) and whitelisted origins
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    })
);

const authLimiter = rateLimit({
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many auth attempts, try again later." },
});

app.get("/healthz", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/register", authLimiter);

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

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});
