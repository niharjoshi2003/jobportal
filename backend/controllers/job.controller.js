import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        const missing =
            !title || !description || !requirements ||
            salary === undefined || salary === null || salary === "" ||
            !location || !jobType ||
            experience === undefined || experience === null || experience === "" ||
            position === undefined || position === null || position === "" ||
            Number(position) <= 0 ||
            !companyId;

        if (missing) {
            return res.status(400).json({
                message: "Something is missing or position must be greater than 0.",
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: Array.isArray(requirements) ? requirements : String(requirements).split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId,
            created_by: userId
        });

        // Notify all approved students about the new job opportunity.
        try {
            const company = await Company.findById(companyId).select('name');
            const companyName = company?.name || 'a company';
            await User.updateMany(
                { role: 'student', status: 'approved' },
                {
                    $push: {
                        notifications: {
                            message: `New job posted: ${title} at ${companyName}`,
                            type: 'application',
                            link: `/description/${job._id}`,
                        }
                    }
                }
            );
        } catch (notifyErr) {
            console.log("Failed to push new-job notifications:", notifyErr.message);
        }

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
