import mongoose from "mongoose";

const applicationQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["short_text", "long_text", "yes_no", "multiple_choice"],
        default: "short_text"
    },
    options: [{
        type: String,
        trim: true
    }],
    required: {
        type: Boolean,
        default: true
    }
}, { _id: true });

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    salary: {
        type: Number,
        required: true
    },
    experienceLevel: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date
    },
    duration: {
        value: { type: Number },
        unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' }
    },
    eligibility: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    companyOverview: {
        type: String,
        default: ""
    },
    jobRequirementsDetail: {
        type: String,
        default: ""
    },
    additionalInfo: {
        type: String,
        default: ""
    },
    applicationQuestions: [applicationQuestionSchema],
    status: {
        type: String,
        enum: ["open", "closed", "archived"],
        default: "open"
    },
    closedAt: {
        type: Date
    },
    archivedAt: {
        type: Date
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
    }]
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);
