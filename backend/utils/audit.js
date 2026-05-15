import { AuditLog } from "../models/auditLog.model.js";
import { logger } from "./logger.js";

export const recordAuditLog = async ({
    req,
    actorId,
    actorRole = "admin",
    action,
    entityType,
    entityId = "",
    metadata = {},
}) => {
    try {
        if (!actorId || !action || !entityType) return;
        await AuditLog.create({
            actor: actorId,
            actorRole,
            action,
            entityType,
            entityId: String(entityId || ""),
            ip: req?.clientIp || req?.ip || "",
            userAgent: req?.headers?.["user-agent"] || "",
            metadata,
        });
    } catch (error) {
        logger.error("audit_log_failed", {
            action,
            entityType,
            entityId,
            error: error?.message,
            requestId: req?.requestId || null,
        });
    }
};

