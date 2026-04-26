import mongoose from "mongoose";

const internshipApplicationSchema = new mongoose.Schema({
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship",
        required: true,
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "shortlisted", "accepted", "rejected"],
        default: "pending",
    },
}, { timestamps: true });

internshipApplicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });

export const InternshipApplication = mongoose.model(
    "InternshipApplication",
    internshipApplicationSchema
);
