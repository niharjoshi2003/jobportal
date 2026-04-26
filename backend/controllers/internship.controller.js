import { Internship } from "../models/internship.model.js";
import { InternshipApplication } from "../models/internshipApplication.model.js";

export const createInternship = async (req, res) => {
    try {
        const {
            title, description, requirements, eligibility, compensation,
            location, locationType, duration, openings, deadline, companyId, tags
        } = req.body;
        const userId = req.id;

        if (!title || !description || !location || !deadline || !companyId) {
            return res.status(400).json({ message: "Required fields missing.", success: false });
        }

        const internship = await Internship.create({
            title,
            description,
            requirements: requirements ? requirements.split(",") : [],
            eligibility: eligibility ? eligibility.split(",") : [],
            compensation: compensation || { type: 'TBA' },
            location,
            locationType: locationType || 'On-site',
            duration: duration || { value: 30, unit: 'days' },
            openings: openings || 1,
            deadline,
            company: companyId,
            created_by: userId,
            tags: tags ? tags.split(",") : []
        });

        return res.status(201).json({ message: "Internship created successfully.", internship, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getAllInternships = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const location = req.query.location || "";
        const status = req.query.status || "open";

        let query = { status };

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ];
        }
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        const internships = await Internship.find(query)
            .populate({ path: "company" })
            .sort({ createdAt: -1 });

        return res.status(200).json({ internships, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate({ path: "company" })
            .populate({ path: "applications" });

        if (!internship) {
            return res.status(404).json({ message: "Internship not found.", success: false });
        }

        return res.status(200).json({ internship, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getAdminInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ created_by: req.id })
            .populate({ path: 'company' })
            .sort({ createdAt: -1 });

        return res.status(200).json({ internships, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const applyInternship = async (req, res) => {
    try {
        const userId = req.id;
        const internshipId = req.params.id;
        if (!internshipId) {
            return res.status(400).json({ message: "Internship id is required.", success: false });
        }

        const existing = await InternshipApplication.findOne({
            internship: internshipId,
            applicant: userId,
        });
        if (existing) {
            return res.status(400).json({
                message: "You have already applied for this internship.",
                success: false,
            });
        }

        const internship = await Internship.findById(internshipId);
        if (!internship) {
            return res.status(404).json({ message: "Internship not found.", success: false });
        }

        const application = await InternshipApplication.create({
            internship: internshipId,
            applicant: userId,
        });

        internship.applications.push(application._id);
        await internship.save();

        return res.status(201).json({
            message: "Internship applied successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getAppliedInternships = async (req, res) => {
    try {
        const userId = req.id;
        const applications = await InternshipApplication.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "internship",
                populate: { path: "company" },
            });

        return res.status(200).json({ applications, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getInternshipApplicants = async (req, res) => {
    try {
        const internshipId = req.params.id;
        const internship = await Internship.findById(internshipId).populate({
            path: "applications",
            options: { sort: { createdAt: -1 } },
            populate: { path: "applicant", select: "-password" },
        });
        if (!internship) {
            return res.status(404).json({ message: "Internship not found.", success: false });
        }
        return res.status(200).json({ internship, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const updateInternshipApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        if (!status) {
            return res.status(400).json({ message: "status is required", success: false });
        }
        const allowed = ["pending", "shortlisted", "accepted", "rejected"];
        const next = String(status).toLowerCase();
        if (!allowed.includes(next)) {
            return res.status(400).json({ message: "Invalid status value.", success: false });
        }

        const application = await InternshipApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }

        application.status = next;
        await application.save();

        return res.status(200).json({ message: "Status updated successfully.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
