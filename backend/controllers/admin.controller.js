import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Internship } from "../models/internship.model.js";
import { Application } from "../models/application.model.js";
import { InternshipApplication } from "../models/internshipApplication.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { recordAuditLog } from "../utils/audit.js";

// Generate a human-readable but strong password (12 chars, mixed).
const generatePassword = () => {
    // 9 random bytes -> 12 base64 chars; strip ambiguous chars and ensure length.
    const raw = crypto.randomBytes(9).toString("base64");
    return raw.replace(/[+/=]/g, "x").slice(0, 12);
};

// ============ STATS ============
export const getStats = async (req, res) => {
    try {
        const [
            totalUsers, totalStudents, totalRecruiters, totalAdmins,
            pendingStudents,
            totalCompanies, verifiedCompanies,
            totalJobs, totalInternships,
            totalJobApplications, totalInternshipApplications,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'recruiter' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'student', status: 'pending' }),
            Company.countDocuments(),
            Company.countDocuments({ verified: true }),
            Job.countDocuments(),
            Internship.countDocuments(),
            Application.countDocuments(),
            InternshipApplication.countDocuments(),
        ]);

        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [newUsersThisWeek, newJobsThisWeek, newInternshipsThisWeek] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: since } }),
            Job.countDocuments({ createdAt: { $gte: since } }),
            Internship.countDocuments({ createdAt: { $gte: since } }),
        ]);

        return res.status(200).json({
            stats: {
                users: { total: totalUsers, students: totalStudents, recruiters: totalRecruiters, admins: totalAdmins, pendingStudents },
                companies: { total: totalCompanies, verified: verifiedCompanies, pending: totalCompanies - verifiedCompanies },
                jobs: { total: totalJobs },
                internships: { total: totalInternships },
                applications: { jobs: totalJobApplications, internships: totalInternshipApplications },
                lastWeek: { users: newUsersThisWeek, jobs: newJobsThisWeek, internships: newInternshipsThisWeek },
            },
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ============ USERS ============
export const listUsers = async (req, res) => {
    try {
        const { role, q, status } = req.query;
        const filter = {};
        if (role && ['student', 'recruiter', 'admin'].includes(role)) filter.role = role;
        if (status && ['pending', 'approved', 'rejected'].includes(status)) filter.status = status;
        if (q) {
            filter.$or = [
                { fullname: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { college: { $regex: q, $options: "i" } },
                { rollNumber: { $regex: q, $options: "i" } },
            ];
        }
        const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
        return res.status(200).json({ users, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const approveStudent = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found.", success: false });
        if (user.role !== 'student') {
            return res.status(400).json({ message: "Only student accounts require approval.", success: false });
        }
        user.status = 'approved';
        user.approvedBy = req.user._id;
        user.approvedAt = new Date();
        user.rejectionReason = "";
        await user.save();
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "student.approved",
            entityType: "User",
            entityId: user._id,
            metadata: { targetEmail: user.email },
        });
        const safe = user.toObject();
        delete safe.password;
        return res.status(200).json({ message: "Student approved.", user: safe, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const rejectStudent = async (req, res) => {
    try {
        const { reason } = req.body || {};
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found.", success: false });
        if (user.role !== 'student') {
            return res.status(400).json({ message: "Only student accounts can be rejected here.", success: false });
        }
        user.status = 'rejected';
        user.rejectionReason = reason ? String(reason).trim() : "";
        user.approvedBy = req.user._id;
        user.approvedAt = new Date();
        await user.save();
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "student.rejected",
            entityType: "User",
            entityId: user._id,
            metadata: { targetEmail: user.email, reason: user.rejectionReason || null },
        });
        const safe = user.toObject();
        delete safe.password;
        return res.status(200).json({ message: "Student rejected.", user: safe, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'recruiter', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role.", success: false });
        }
        // Prevent an admin from demoting themselves accidentally.
        if (req.params.id === String(req.user._id) && role !== 'admin') {
            return res.status(400).json({
                message: "You cannot change your own admin role.",
                success: false,
            });
        }
        const existingUser = await User.findById(req.params.id).select("role email");
        if (!existingUser) return res.status(404).json({ message: "User not found.", success: false });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "User not found.", success: false });
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "user.role_updated",
            entityType: "User",
            entityId: user._id,
            metadata: { targetEmail: user.email, previousRole: existingUser.role, nextRole: role },
        });
        return res.status(200).json({ message: "User role updated.", user, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (req.params.id === String(req.user._id)) {
            return res.status(400).json({
                message: "You cannot delete your own account here.",
                success: false,
            });
        }
        const user = await User.findByIdAndDelete(req.params.id).select("email role");
        if (!user) return res.status(404).json({ message: "User not found.", success: false });
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "user.deleted",
            entityType: "User",
            entityId: user._id,
            metadata: { targetEmail: user.email, targetRole: user.role },
        });
        return res.status(200).json({ message: "User deleted.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ============ COMPANIES ============

// Admin-only: create a Company AND its dedicated recruiter User in one go.
// Returns the generated password ONCE in the response — admin must copy it.
export const createCompanyWithRecruiter = async (req, res) => {
    try {
        const {
            // company fields
            name, description, website, location, industry,
            companyType, country, culture,
            // recruiter fields
            recruiterFullname, recruiterEmail, recruiterPhone,
        } = req.body;

        if (!name || !recruiterFullname || !recruiterEmail || !recruiterPhone) {
            return res.status(400).json({
                message: "Company name, recruiter name, email and phone are required.",
                success: false,
            });
        }

        const existingCompany = await Company.findOne({ name });
        if (existingCompany) {
            return res.status(400).json({ message: "A company with this name already exists.", success: false });
        }

        const existingUser = await User.findOne({ email: recruiterEmail });
        if (existingUser) {
            return res.status(400).json({
                message: "A user with this email already exists. Pick a different recruiter email.",
                success: false,
            });
        }

        const generatedPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const recruiter = await User.create({
            fullname: recruiterFullname,
            email: recruiterEmail,
            phoneNumber: recruiterPhone,
            password: hashedPassword,
            role: "recruiter",
        });

        const industries = Array.isArray(industry)
            ? industry
            : (typeof industry === "string" && industry.trim())
                ? industry.split(",").map(s => s.trim()).filter(Boolean)
                : [];

        const company = await Company.create({
            name,
            description: description || "",
            website: website || "",
            location: location || "",
            industry: industries,
            companyType: companyType || "",
            country: country || "Japan",
            culture: culture || "",
            userId: recruiter._id,
            verified: true,
            verifiedAt: new Date(),
            verifiedBy: req.user._id,
        });

        // Link recruiter to company on the user profile too.
        recruiter.profile = recruiter.profile || {};
        recruiter.profile.company = company._id;
        await recruiter.save();
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "company.created_with_recruiter",
            entityType: "Company",
            entityId: company._id,
            metadata: { companyName: company.name, recruiterEmail: recruiter.email },
        });

        return res.status(201).json({
            message: "Company and recruiter account created. Share these credentials with the recruiter — the password will not be shown again.",
            company,
            recruiter: {
                _id: recruiter._id,
                fullname: recruiter.fullname,
                email: recruiter.email,
            },
            credentials: {
                email: recruiter.email,
                password: generatedPassword,
            },
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// Admin-only: reset the recruiter's password for a given company.
export const resetRecruiterPassword = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: "Company not found.", success: false });

        const recruiter = await User.findById(company.userId);
        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter for this company not found.", success: false });
        }

        const generatedPassword = generatePassword();
        recruiter.password = await bcrypt.hash(generatedPassword, 10);
        await recruiter.save();
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "recruiter.password_reset",
            entityType: "Company",
            entityId: company._id,
            metadata: { recruiterEmail: recruiter.email, companyName: company.name },
        });

        return res.status(200).json({
            message: "Recruiter password reset. Share these credentials — the password will not be shown again.",
            credentials: {
                email: recruiter.email,
                password: generatedPassword,
            },
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const listCompanies = async (req, res) => {
    try {
        const { verified, q } = req.query;
        const filter = {};
        if (verified === 'true') filter.verified = true;
        if (verified === 'false') filter.verified = false;
        if (q) filter.name = { $regex: q, $options: "i" };

        const companies = await Company.find(filter)
            .populate({ path: "userId", select: "fullname email role" })
            .sort({ createdAt: -1 });
        return res.status(200).json({ companies, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const setCompanyVerified = async (req, res) => {
    try {
        const { verified } = req.body;
        const existingCompany = await Company.findById(req.params.id).select("verified name");
        if (!existingCompany) return res.status(404).json({ message: "Company not found.", success: false });
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            {
                verified: !!verified,
                verifiedAt: verified ? new Date() : null,
                verifiedBy: verified ? req.user._id : null,
            },
            { new: true }
        );
        if (!company) return res.status(404).json({ message: "Company not found.", success: false });
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "company.verification_updated",
            entityType: "Company",
            entityId: company._id,
            metadata: { companyName: company.name, previousVerified: existingCompany.verified, nextVerified: !!verified },
        });
        return res.status(200).json({
            message: verified ? "Company approved." : "Company verification revoked.",
            company,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id).select("name userId");
        if (!company) return res.status(404).json({ message: "Company not found.", success: false });

        // Cascade: delete jobs, internships, and their applications for this company.
        const jobs = await Job.find({ company: req.params.id }, { _id: 1 });
        const jobIds = jobs.map(j => j._id);
        const internships = await Internship.find({ company: req.params.id }, { _id: 1 });
        const internshipIds = internships.map(i => i._id);

        await Promise.all([
            Application.deleteMany({ job: { $in: jobIds } }),
            Job.deleteMany({ company: req.params.id }),
            InternshipApplication.deleteMany({ internship: { $in: internshipIds } }),
            Internship.deleteMany({ company: req.params.id }),
        ]);
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "company.deleted",
            entityType: "Company",
            entityId: company._id,
            metadata: {
                companyName: company.name,
                deletedJobs: jobIds.length,
                deletedInternships: internshipIds.length,
            },
        });

        return res.status(200).json({ message: "Company and related listings deleted.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ============ JOBS ============
export const listJobs = async (req, res) => {
    try {
        const { q, status } = req.query;
        const filter = {};
        if (q) filter.title = { $regex: q, $options: "i" };
        if (status && ["open", "closed", "archived"].includes(String(status))) {
            filter.status = String(status);
        }
        const jobs = await Job.find(filter)
            .populate({ path: "company", select: "name verified" })
            .populate({ path: "created_by", select: "fullname email" })
            .sort({ createdAt: -1 });
        return res.status(200).json({ jobs, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id).select("title company");
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });
        await Application.deleteMany({ job: req.params.id });
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "job.deleted",
            entityType: "Job",
            entityId: job._id,
            metadata: { jobTitle: job.title },
        });
        return res.status(200).json({ message: "Job deleted.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const updateJobLifecycle = async (req, res) => {
    try {
        const { status } = req.body || {};
        if (!["open", "closed", "archived"].includes(String(status))) {
            return res.status(400).json({ message: "Invalid status.", success: false });
        }

        const job = await Job.findById(req.params.id).select("title status closedAt archivedAt");
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        const previousStatus = job.status;
        job.status = status;
        if (status === "closed") {
            job.closedAt = new Date();
            job.archivedAt = undefined;
        } else if (status === "archived") {
            job.archivedAt = new Date();
            if (!job.closedAt) job.closedAt = new Date();
        } else {
            job.closedAt = undefined;
            job.archivedAt = undefined;
        }
        await job.save();

        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "job.lifecycle_updated",
            entityType: "Job",
            entityId: job._id,
            metadata: { jobTitle: job.title, previousStatus, nextStatus: status },
        });

        return res.status(200).json({
            message: `Job moved to ${status}.`,
            job,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const listAuditLogs = async (req, res) => {
    try {
        const { action, entityType, q, page = 1, limit = 25 } = req.query;
        const numericPage = Math.max(1, Number(page) || 1);
        const numericLimit = Math.min(100, Math.max(1, Number(limit) || 25));

        const filter = {};
        if (action) filter.action = String(action);
        if (entityType) filter.entityType = String(entityType);
        if (q) {
            filter.$or = [
                { action: { $regex: q, $options: "i" } },
                { entityType: { $regex: q, $options: "i" } },
                { entityId: { $regex: q, $options: "i" } },
                { "metadata.companyName": { $regex: q, $options: "i" } },
                { "metadata.targetEmail": { $regex: q, $options: "i" } },
                { "metadata.jobTitle": { $regex: q, $options: "i" } },
            ];
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .populate({ path: "actor", select: "fullname email role" })
                .sort({ createdAt: -1 })
                .skip((numericPage - 1) * numericLimit)
                .limit(numericLimit),
            AuditLog.countDocuments(filter),
        ]);

        return res.status(200).json({
            logs,
            pagination: {
                page: numericPage,
                limit: numericLimit,
                total,
                totalPages: Math.ceil(total / numericLimit),
            },
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ============ INTERNSHIPS ============
export const listInternships = async (req, res) => {
    try {
        const { q } = req.query;
        const filter = {};
        if (q) filter.title = { $regex: q, $options: "i" };
        const internships = await Internship.find(filter)
            .populate({ path: "company", select: "name verified" })
            .populate({ path: "created_by", select: "fullname email" })
            .sort({ createdAt: -1 });
        return res.status(200).json({ internships, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findByIdAndDelete(req.params.id).select("title company");
        if (!internship) return res.status(404).json({ message: "Internship not found.", success: false });
        await InternshipApplication.deleteMany({ internship: req.params.id });
        await recordAuditLog({
            req,
            actorId: req.user._id,
            actorRole: req.user.role,
            action: "internship.deleted",
            entityType: "Internship",
            entityId: internship._id,
            metadata: { internshipTitle: internship.title },
        });
        return res.status(200).json({ message: "Internship deleted.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
