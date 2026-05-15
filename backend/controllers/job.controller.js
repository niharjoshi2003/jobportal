import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";

const sanitizeList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || "").trim()).filter(Boolean);
    }
    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const sanitizeApplicationQuestions = (questions) => {
    if (!Array.isArray(questions)) return [];
    const allowedTypes = ["short_text", "long_text", "yes_no", "multiple_choice"];

    return questions
        .map((raw) => {
            const question = String(raw?.question || "").trim();
            const type = allowedTypes.includes(raw?.type) ? raw.type : "short_text";
            const required = raw?.required !== false;
            const options = sanitizeList(raw?.options);

            if (!question) return null;
            if (type === "multiple_choice" && options.length < 2) {
                throw new Error(`Question "${question}" needs at least 2 options.`);
            }

            return {
                question,
                type,
                required,
                options: type === "multiple_choice" ? options : [],
            };
        })
        .filter(Boolean);
};

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            deadline,
            companyId,
            companyOverview,
            jobRequirementsDetail,
            additionalInfo,
            applicationQuestions
        } = req.body;
        const userId = req.id;

        const missing =
            !title || !description || !requirements ||
            salary === undefined || salary === null || salary === "" ||
            !location || !jobType ||
            experience === undefined || experience === null || experience === "" ||
            position === undefined || position === null || position === "" ||
            Number(position) <= 0 ||
            Number(salary) < 0 ||
            Number(experience) < 0 ||
            !companyOverview || !jobRequirementsDetail || !additionalInfo ||
            !companyId;

        if (missing) {
            return res.status(400).json({
                message: "Something is missing. Salary/experience must be non-negative and position must be greater than 0.",
                success: false
            });
        }

        let parsedDeadline = null;
        if (deadline) {
            parsedDeadline = new Date(deadline);
            if (Number.isNaN(parsedDeadline.getTime())) {
                return res.status(400).json({
                    message: "Invalid deadline date.",
                    success: false
                });
            }
            if (parsedDeadline <= new Date()) {
                return res.status(400).json({
                    message: "Deadline must be in the future.",
                    success: false
                });
            }
        }

        let sanitizedQuestions = [];
        try {
            sanitizedQuestions = sanitizeApplicationQuestions(applicationQuestions);
        } catch (questionError) {
            return res.status(400).json({
                message: questionError.message,
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: sanitizeList(requirements),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experience),
            position: Number(position),
            deadline: parsedDeadline || undefined,
            status: "open",
            companyOverview: String(companyOverview).trim(),
            jobRequirementsDetail: String(jobRequirementsDetail).trim(),
            additionalInfo: String(additionalInfo).trim(),
            applicationQuestions: sanitizedQuestions,
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
            $and: [
                {
                    $or: [
                        { title: { $regex: keyword, $options: "i" } },
                        { description: { $regex: keyword, $options: "i" } },
                    ]
                },
                {
                    status: "open",
                },
                {
                    $or: [
                        { deadline: { $exists: false } },
                        { deadline: null },
                        { deadline: { $gte: new Date() } },
                    ]
                }
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
        const job = await Job.findById(jobId)
            .populate({
                path: "applications",
                select: "applicant status createdAt"
            })
            .populate({
                path: "company",
                select: "name description website location industry companyType country logo culture"
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
