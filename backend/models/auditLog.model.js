import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    actorRole: {
        type: String,
        enum: ["student", "recruiter", "admin", "system"],
        default: "admin",
    },
    action: {
        type: String,
        required: true,
        index: true,
    },
    entityType: {
        type: String,
        required: true,
    },
    entityId: {
        type: String,
        default: "",
    },
    ip: {
        type: String,
        default: "",
    },
    userAgent: {
        type: String,
        default: "",
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);

