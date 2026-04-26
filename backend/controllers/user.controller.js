import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role, adminCode } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        const allowedRoles = ['student', 'admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role. Recruiter accounts are created by an administrator.",
                success: false,
            });
        }

        if (role === 'admin') {
            const expected = process.env.ADMIN_SIGNUP_CODE;
            if (!expected) {
                return res.status(500).json({ message: "Admin signup is disabled (ADMIN_SIGNUP_CODE not set).", success: false });
            }
            if (!adminCode || adminCode !== expected) {
                return res.status(403).json({ message: "Invalid admin signup code.", success: false });
            }
        }

        const file = req.file;
        let profilePhotoUrl = "";
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl,
            }
        });

        return res.status(201).json({ message: "Account created successfully.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or password.", success: false });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Incorrect email or password.", success: false });
        }

        if (role !== user.role) {
            return res.status(400).json({ message: "Account doesn't exist with current role.", success: false });
        }

        if (!process.env.SECRET_KEY) {
            return res.status(500).json({ message: "Server misconfigured: SECRET_KEY missing.", success: false });
        }
        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: process.env.JWT_EXPIRY || "1d" });

        const profileCompletion = user.calculateProfileCompletion();
        user.profile.profileCompletion = profileCompletion;
        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            gender: user.gender,
            college: user.college,
            personalEmail: user.personalEmail,
            graduationYear: user.graduationYear,
            profile: user.profile,
            bookmarkedJobs: user.bookmarkedJobs,
        };

        const isProd = process.env.NODE_ENV === "production";
        return res.status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: isProd ? "none" : "lax",
                secure: isProd,
            })
            .json({ message: `Welcome back ${user.fullname}`, user, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200)
            .cookie("token", "", { maxAge: 0 })
            .json({ message: "Logged out successfully.", success: true });
    } catch (error) {
        console.log(error);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills, gender, personalEmail, college, graduationYear, customSkills, externalLinks } = req.body;

        const file = req.file;
        let cloudResponse = null;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }

        let customSkillsArray;
        if (customSkills) {
            customSkillsArray = customSkills.split(",");
        }

        const userId = req.id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found.", success: false });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;
        if (customSkills) user.profile.customSkills = customSkillsArray;
        if (gender) user.gender = gender;
        if (personalEmail) user.personalEmail = personalEmail;
        if (college) user.college = college;
        if (graduationYear) user.graduationYear = graduationYear;
        if (externalLinks) {
            try {
                user.profile.externalLinks = JSON.parse(externalLinks);
            } catch (e) { /* ignore parse errors */ }
        }

        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        user.profile.profileCompletion = user.calculateProfileCompletion();
        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            gender: user.gender,
            college: user.college,
            personalEmail: user.personalEmail,
            graduationYear: user.graduationYear,
            profile: user.profile,
            bookmarkedJobs: user.bookmarkedJobs,
        };

        return res.status(200).json({ message: "Profile updated successfully.", user, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const updateProfilePhoto = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded.", success: false });
        }

        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const userId = req.id;
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found.", success: false });
        }

        user.profile.profilePhoto = cloudResponse.secure_url;
        user.profile.profileCompletion = user.calculateProfileCompletion();
        await user.save();

        return res.status(200).json({
            message: "Profile photo updated.",
            profilePhoto: cloudResponse.secure_url,
            profileCompletion: user.profile.profileCompletion,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const addResume = async (req, res) => {
    try {
        const file = req.file;
        const { resumeType } = req.body;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded.", success: false });
        }

        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const userId = req.id;
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found.", success: false });
        }

        const newResume = {
            url: cloudResponse.secure_url,
            originalName: file.originalname,
            type: resumeType || 'domain',
            uploadedAt: new Date()
        };

        if (resumeType === 'master') {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        user.profile.resumes.push(newResume);
        user.profile.profileCompletion = user.calculateProfileCompletion();
        await user.save();

        return res.status(200).json({
            message: "Resume uploaded successfully.",
            resumes: user.profile.resumes,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteResume = async (req, res) => {
    try {
        const userId = req.id;
        const resumeId = req.params.resumeId;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found.", success: false });
        }

        user.profile.resumes = user.profile.resumes.filter(r => r._id.toString() !== resumeId);
        await user.save();

        return res.status(200).json({ message: "Resume deleted.", resumes: user.profile.resumes, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select('notifications');

        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        const sorted = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
        return res.status(200).json({ notifications: sorted, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        user.notifications.forEach(n => { n.read = true; });
        await user.save();

        return res.status(200).json({ message: "Notifications marked as read.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        const { Application } = await import("../models/application.model.js");
        const { InterviewInvite } = await import("../models/interviewInvite.model.js");

        const totalApplications = await Application.countDocuments({ applicant: userId });
        const acceptedApplications = await Application.countDocuments({ applicant: userId, status: 'accepted' });
        const pendingApplications = await Application.countDocuments({ applicant: userId, status: 'pending' });
        const rejectedApplications = await Application.countDocuments({ applicant: userId, status: 'rejected' });
        const totalInterviews = await InterviewInvite.countDocuments({ candidate: userId });
        const bookmarkedCount = user.bookmarkedJobs?.length || 0;

        return res.status(200).json({
            stats: {
                totalApplications,
                acceptedApplications,
                pendingApplications,
                rejectedApplications,
                totalInterviews,
                bookmarkedCount,
                profileCompletion: user.profile.profileCompletion || 0,
                interviewSuccessRate: totalInterviews > 0 ? Math.round((acceptedApplications / totalInterviews) * 100) : 0
            },
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
