import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Internship } from "../models/internship.model.js";
import { Application } from "../models/application.model.js";
import { InternshipApplication } from "../models/internshipApplication.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import { recordAuditLog } from "../utils/audit.js";
import { logControllerError } from "../utils/controllerError.js";

// Generate a human-readable but strong password (12 chars, mixed).
const generatePassword = () => {
    // 9 random bytes -> 12 base64 chars; strip ambiguous chars and ensure length.
    const raw = crypto.randomBytes(9).toString("base64");
    return raw.replace(/[+/=]/g, "x").slice(0, 12);
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

const getActorContext = async (req) => {
    if (req.user?._id) {
        return {
            actorId: req.user._id,
            actorRole: req.user.role || "admin",
        };
    }
    if (!req.id || !isValidObjectId(req.id)) return null;
    const actor = await User.findById(req.id).select("_id role");
    if (!actor) return null;
    return {
        actorId: actor._id,
        actorRole: actor.role || "admin",
    };
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
        const [
            newUsersThisWeek, newJobsThisWeek, newInternshipsThisWeek,
            jobStatusAgg, internshipStatusAgg, topJobsAgg, topCompaniesAgg,
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: since } }),
            Job.countDocuments({ createdAt: { $gte: since } }),
            Internship.countDocuments({ createdAt: { $gte: since } }),
            Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            InternshipApplication.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            Application.aggregate([
                { $group: { _id: "$job", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 8 },
                { $lookup: { from: "jobs", localField: "_id", foreignField: "_id", as: "job" } },
                { $unwind: "$job" },
                { $lookup: { from: "companies", localField: "job.company", foreignField: "_id", as: "company" } },
                { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                { $project: { count: 1, jobId: "$job._id", title: "$job.title", companyName: "$company.name" } },
            ]),
            Application.aggregate([
                { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "job" } },
                { $unwind: "$job" },
                { $group: { _id: "$job.company", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 8 },
                { $lookup: { from: "companies", localField: "_id", foreignField: "_id", as: "company" } },
                { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                { $project: { count: 1, companyId: "$company._id", companyName: "$company.name" } },
            ]),
        ]);

        const toStatusMap = (rows) => {
            const map = { pending: 0, shortlisted: 0, accepted: 0, rejected: 0 };
            for (const row of rows) {
                if (row._id && map[row._id] !== undefined) map[row._id] = row.count;
            }
            return map;
        };

        return res.status(200).json({
            stats: {
                users: { total: totalUsers, students: totalStudents, recruiters: totalRecruiters, admins: totalAdmins, pendingStudents },
                companies: { total: totalCompanies, verified: verifiedCompanies, pending: totalCompanies - verifiedCompanies },
                jobs: { total: totalJobs },
                internships: { total: totalInternships },
                applications: {
                    jobs: totalJobApplications,
                    internships: totalInternshipApplications,
                    jobStatus: toStatusMap(jobStatusAgg),
                    internshipStatus: toStatusMap(internshipStatusAgg),
                    topJobs: topJobsAgg,
                    topCompanies: topCompaniesAgg,
                },
                lastWeek: { users: newUsersThisWeek, jobs: newJobsThisWeek, internships: newInternshipsThisWeek },
            },
            success: true,
        });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
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
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

const attachApplicantCounts = async (items, Model, foreignKey) => {
    if (!items.length) return items;
    const ids = items.map((item) => item._id);
    const agg = await Model.aggregate([
        { $match: { [foreignKey]: { $in: ids } } },
        { $group: { _id: `$${foreignKey}`, total: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(agg.map((row) => [String(row._id), row.total]));
    return items.map((item) => ({
        ...item,
        applicantCount: map[String(item._id)] || 0,
    }));
};

// Admin can open any student's profile plus every job/internship they applied to.
export const getStudentProfile = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user id.", success: false });
        }
        const student = await User.findById(req.params.id).select("-password -notifications");
        if (!student) return res.status(404).json({ message: "Student not found.", success: false });
        if (student.role !== "student") {
            return res.status(400).json({ message: "Only student profiles can be viewed here.", success: false });
        }

        const [jobApplications, internshipApplications] = await Promise.all([
            Application.find({ applicant: student._id })
                .populate({
                    path: "job",
                    select: "title location jobType",
                    populate: { path: "company", select: "name" },
                })
                .sort({ createdAt: -1 }),
            InternshipApplication.find({ applicant: student._id })
                .populate({
                    path: "internship",
                    select: "title location",
                    populate: { path: "company", select: "name" },
                })
                .sort({ createdAt: -1 }),
        ]);

        return res.status(200).json({
            applicant: student,
            jobApplications,
            internshipApplications,
            success: true,
        });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// Platform-wide application list: which student applied to which company/job.
export const listApplications = async (req, res) => {
    try {
        const { q, status, kind = "job" } = req.query;
        const allowedStatus = ["pending", "shortlisted", "accepted", "rejected"];
        const statusFilter = allowedStatus.includes(String(status)) ? { status: String(status) } : {};
        const needle = String(q || "").trim().toLowerCase();

        const matchesSearch = (row) => {
            if (!needle) return true;
            const haystack = [
                row.applicant?.fullname,
                row.applicant?.email,
                row.applicant?.college,
                row.applicant?.rollNumber,
                row.listingTitle,
                row.companyName,
            ].join(" ").toLowerCase();
            return haystack.includes(needle);
        };

        const rows = [];
        if (kind !== "internship") {
            const jobApps = await Application.find(statusFilter)
                .sort({ createdAt: -1 })
                .limit(1000)
                .populate({ path: "applicant", select: "fullname email college rollNumber phoneNumber" })
                .populate({
                    path: "job",
                    select: "title location jobType company",
                    populate: { path: "company", select: "name" },
                })
                .lean();
            for (const app of jobApps) {
                rows.push({
                    _id: app._id,
                    kind: "job",
                    status: app.status,
                    createdAt: app.createdAt,
                    applicant: app.applicant,
                    listingId: app.job?._id,
                    listingTitle: app.job?.title || "",
                    companyName: app.job?.company?.name || "",
                    location: app.job?.location || "",
                });
            }
        }

        if (kind !== "job") {
            const internshipApps = await InternshipApplication.find(statusFilter)
                .sort({ createdAt: -1 })
                .limit(1000)
                .populate({ path: "applicant", select: "fullname email college rollNumber phoneNumber" })
                .populate({
                    path: "internship",
                    select: "title location company",
                    populate: { path: "company", select: "name" },
                })
                .lean();
            for (const app of internshipApps) {
                rows.push({
                    _id: app._id,
                    kind: "internship",
                    status: app.status,
                    createdAt: app.createdAt,
                    applicant: app.applicant,
                    listingId: app.internship?._id,
                    listingTitle: app.internship?.title || "",
                    companyName: app.internship?.company?.name || "",
                    location: app.internship?.location || "",
                });
            }
        }

        const applications = rows
            .filter(matchesSearch)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.status(200).json({ applications, success: true });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const approveStudent = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found.", success: false });
        if (user.role !== 'student') {
            return res.status(400).json({ message: "Only student accounts require approval.", success: false });
        }
        user.status = 'approved';
        user.approvedBy = actor.actorId;
        user.approvedAt = new Date();
        user.rejectionReason = "";
        await user.save();
        await recordAuditLog({
            req,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            action: "student.approved",
            entityType: "User",
            entityId: user._id,
            metadata: { targetEmail: user.email },
        });
        const safe = user.toObject();
        delete safe.password;
        return res.status(200).json({ message: "Student approved.", user: safe, success: true });
    } catch (error) {
        logControllerError("approve_student_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const rejectStudent = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
        const { reason } = req.body || {};
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found.", success: false });
        if (user.role !== 'student') {
            return res.status(400).json({ message: "Only student accounts can be rejected here.", success: false });
        }
        user.status = 'rejected';
        user.rejectionReason = reason ? String(reason).trim() : "";
        user.approvedBy = actor.actorId;
        user.approvedAt = new Date();
        await user.save();
        await recordAuditLog({
            req,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            action: "student.rejected",
            entityType: "User",
            entityId: user._id,
            metadata: { targetEmail: user.email, reason: user.rejectionReason || null },
        });
        const safe = user.toObject();
        delete safe.password;
        return res.status(200).json({ message: "Student rejected.", user: safe, success: true });
    } catch (error) {
        logControllerError("reject_student_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
        const { role } = req.body;
        if (!['student', 'recruiter', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role.", success: false });
        }
        // Prevent an admin from demoting themselves accidentally.
        if (req.params.id === String(actor.actorId) && role !== 'admin') {
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
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            action: "user.role_updated",
            entityType: "User",
            entityId: user._id,
            metadata: { targetEmail: user.email, previousRole: existingUser.role, nextRole: role },
        });
        return res.status(200).json({ message: "User role updated.", user, success: true });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid user id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
        if (req.params.id === String(actor.actorId)) {
            return res.status(400).json({
                message: "You cannot delete your own account here.",
                success: false,
            });
        }
        const user = await User.findByIdAndDelete(req.params.id).select("email role");
        if (!user) return res.status(404).json({ message: "User not found.", success: false });
        await recordAuditLog({
            req,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            action: "user.deleted",
            entityType: "User",
            entityId: user._id,
            metadata: { targetEmail: user.email, targetRole: user.role },
        });
        return res.status(200).json({ message: "User deleted.", success: true });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ============ COMPANIES ============

// Admin-only: create a Company AND its dedicated recruiter User in one go.
// Returns the generated password ONCE in the response — admin must copy it.
export const createCompanyWithRecruiter = async (req, res) => {
    try {
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
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
            verifiedBy: actor.actorId,
        });

        // Link recruiter to company on the user profile too.
        recruiter.profile = recruiter.profile || {};
        recruiter.profile.company = company._id;
        await recruiter.save();
        await recordAuditLog({
            req,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
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
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// Admin-only: reset the recruiter's password for a given company.
export const resetRecruiterPassword = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid company id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
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
            actorId: actor.actorId,
            actorRole: actor.actorRole,
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
        logControllerError("admin_handler_failed", error, req);
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
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const setCompanyVerified = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid company id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
        const { verified } = req.body;
        const existingCompany = await Company.findById(req.params.id).select("verified name");
        if (!existingCompany) return res.status(404).json({ message: "Company not found.", success: false });
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            {
                verified: !!verified,
                verifiedAt: verified ? new Date() : null,
                verifiedBy: verified ? actor.actorId : null,
            },
            { new: true }
        );
        if (!company) return res.status(404).json({ message: "Company not found.", success: false });
        await recordAuditLog({
            req,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
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
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid company id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
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
            actorId: actor.actorId,
            actorRole: actor.actorRole,
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
        logControllerError("admin_handler_failed", error, req);
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
            .sort({ createdAt: -1 })
            .lean();
        const jobsWithCounts = await attachApplicantCounts(jobs, Application, "job");
        return res.status(200).json({ jobs: jobsWithCounts, success: true });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteJob = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid job id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
        const job = await Job.findByIdAndDelete(req.params.id).select("title company");
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });
        await Application.deleteMany({ job: req.params.id });
        await recordAuditLog({
            req,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            action: "job.deleted",
            entityType: "Job",
            entityId: job._id,
            metadata: { jobTitle: job.title },
        });
        return res.status(200).json({ message: "Job deleted.", success: true });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const updateJobLifecycle = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid job id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
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
            actorId: actor.actorId,
            actorRole: actor.actorRole,
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
        logControllerError("admin_handler_failed", error, req);
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
        logControllerError("admin_handler_failed", error, req);
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
            .sort({ createdAt: -1 })
            .lean();
        const internshipsWithCounts = await attachApplicantCounts(internships, InternshipApplication, "internship");
        return res.status(200).json({ internships: internshipsWithCounts, success: true });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteInternship = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid internship id.", success: false });
        }
        const actor = await getActorContext(req);
        if (!actor) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
        const internship = await Internship.findByIdAndDelete(req.params.id).select("title company");
        if (!internship) return res.status(404).json({ message: "Internship not found.", success: false });
        await InternshipApplication.deleteMany({ internship: req.params.id });
        await recordAuditLog({
            req,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            action: "internship.deleted",
            entityType: "Internship",
            entityId: internship._id,
            metadata: { internshipTitle: internship.title },
        });
        return res.status(200).json({ message: "Internship deleted.", success: true });
    } catch (error) {
        logControllerError("admin_handler_failed", error, req);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
