import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const getTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) return null;
    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
};

export const sendEmail = async ({ to, subject, html }) => {
    const transporter = getTransporter();
    if (!transporter) {
        logger.warn("smtp_not_configured", { to, subject });
        return { sent: false, reason: "SMTP not configured" };
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || "Job-O-Hire <no-reply@jobohire.com>",
        to,
        subject,
        html,
    });
    return { sent: true };
};

