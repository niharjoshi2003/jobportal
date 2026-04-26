import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'recruiter', 'admin'],
        required: true
    },
    personalEmail: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Not Confirmed', ''],
        default: ''
    },
    college: {
        type: String,
        default: ""
    },
    graduationYear: {
        type: Number
    },
    profile: {
        bio: { type: String },
        skills: [{ type: String }],
        customSkills: [{ type: String }],
        resume: { type: String },
        resumeOriginalName: { type: String },
        resumes: [{
            url: { type: String },
            originalName: { type: String },
            type: { type: String, enum: ['master', 'domain'], default: 'domain' },
            uploadedAt: { type: Date, default: Date.now }
        }],
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        profilePhoto: {
            type: String,
            default: ""
        },
        introVideo: {
            url: { type: String, default: "" },
            uploadedAt: { type: Date }
        },
        externalLinks: [{
            type: { type: String, enum: ['Portfolio', 'GitHub', 'LinkedIn', 'Others'], default: 'Others' },
            url: { type: String },
            label: { type: String }
        }],
        profileCompletion: {
            type: Number,
            default: 0
        }
    },
    bookmarkedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    notifications: [{
        message: { type: String },
        type: { type: String, enum: ['internship', 'interview', 'application', 'general'], default: 'general' },
        read: { type: Boolean, default: false },
        link: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

userSchema.methods.calculateProfileCompletion = function () {
    let score = 0;
    const total = 10;
    if (this.fullname) score++;
    if (this.email) score++;
    if (this.phoneNumber) score++;
    if (this.profile?.bio) score++;
    if (this.profile?.skills?.length > 0) score++;
    if (this.profile?.resume || this.profile?.resumes?.length > 0) score++;
    if (this.profile?.profilePhoto) score++;
    if (this.profile?.introVideo?.url) score++;
    if (this.profile?.externalLinks?.length > 0) score++;
    if (this.gender) score++;
    return Math.round((score / total) * 100);
};

export const User = mongoose.model('User', userSchema);
