import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
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
    eligibility: [{
        type: String
    }],
    compensation: {
        type: { type: String, enum: ['TBA', 'Fixed', 'Stipend'], default: 'TBA' },
        amount: { type: Number },
        currency: { type: String, default: 'JPY' }
    },
    location: {
        type: String,
        required: true
    },
    locationType: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        default: 'On-site'
    },
    duration: {
        value: { type: Number },
        unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' }
    },
    openings: {
        type: Number,
        default: 1
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
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
        ref: 'InternshipApplication',
    }],
    tags: [{
        type: String
    }]
}, { timestamps: true });

export const Internship = mongoose.model("Internship", internshipSchema);
