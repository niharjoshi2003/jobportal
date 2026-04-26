import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    logo: {
        type: String
    },
    industry: [{
        type: String
    }],
    companyType: {
        type: String,
        enum: ['Corporate', 'Start-up', 'MNC', 'Government', ''],
        default: ''
    },
    country: {
        type: String,
        default: 'Japan'
    },
    culture: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export const Company = mongoose.model("Company", companySchema);
