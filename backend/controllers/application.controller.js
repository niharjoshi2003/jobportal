import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        const incomingAnswers = Array.isArray(req.body?.answers) ? req.body.answers : [];
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }
        if (job.status && job.status !== "open") {
            return res.status(400).json({
                message: "This job is not accepting applications right now.",
                success: false
            });
        }

        if (job.deadline && new Date(job.deadline) < new Date()) {
            return res.status(400).json({
                message: "Application deadline has passed for this job.",
                success: false
            });
        }

        const totalApplications = await Application.countDocuments({ job: jobId });
        if (typeof job.position === "number" && job.position > 0 && totalApplications >= job.position) {
            return res.status(400).json({
                message: "This job has reached the maximum number of applications.",
                success: false
            });
        }

        const answersMap = new Map(
            incomingAnswers.map((entry) => [
                String(entry?.questionId || ""),
                String(entry?.answer || "").trim()
            ])
        );

        const applicationAnswers = [];
        for (const question of job.applicationQuestions || []) {
            const questionId = String(question._id);
            const answer = answersMap.get(questionId) || "";
            const isRequired = question.required !== false;

            if (isRequired && !answer) {
                return res.status(400).json({
                    message: `Please answer: ${question.question}`,
                    success: false
                });
            }

            if (!answer) continue;

            if (answer.length > 1000) {
                return res.status(400).json({
                    message: `Answer is too long for "${question.question}".`,
                    success: false
                });
            }

            if (question.type === "yes_no") {
                const normalized = answer.toLowerCase();
                if (!["yes", "no"].includes(normalized)) {
                    return res.status(400).json({
                        message: `Invalid answer for "${question.question}".`,
                        success: false
                    });
                }
                applicationAnswers.push({
                    questionId: question._id,
                    question: question.question,
                    answer: normalized
                });
                continue;
            }

            if (question.type === "multiple_choice") {
                const validOptions = (question.options || []).map((opt) => String(opt || "").trim());
                if (!validOptions.includes(answer)) {
                    return res.status(400).json({
                        message: `Invalid option selected for "${question.question}".`,
                        success: false
                    });
                }
            }

            applicationAnswers.push({
                questionId: question._id,
                question: question.question,
                answer
            });
        }

        // create a new application
        const newApplication = await Application.create({
            job:jobId,
            applicant:userId,
            applicationAnswers,
        });

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message:"Job applied successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getAppliedJobs = async (req,res) => {
    try {
        const userId = req.id;
        const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
            path:'job',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'company',
                options:{sort:{createdAt:-1}},
            }
        });
        if(!application){
            return res.status(404).json({
                message:"No Applications",
                success:false
            })
        };
        return res.status(200).json({
            application,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// Per-job applicants. Admins see any job; recruiters only their own company's jobs.
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: { path: 'applicant', select: '-password -notifications' }
        });
        if (!job) {
            return res.status(404).json({ message: 'Job not found.', success: false });
        }

        if (req.user?.role === 'recruiter') {
            const company = await Company.findOne({ userId: req.user._id }).select('_id');
            if (!company || String(job.company) !== String(company._id)) {
                return res.status(403).json({
                    message: 'Forbidden: this job does not belong to your company.',
                    success: false,
                });
            }
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// Recruiter dashboard: list every job belonging to the recruiter's company
// with applicant counts (total + per-status). Powers the per-job overview.
export const getRecruiterJobs = async (req, res) => {
    try {
        const company = await Company.findOne({ userId: req.user._id }).select('_id name');
        if (!company) {
            return res.status(404).json({
                message: 'No company is linked to your account. Contact an administrator.',
                success: false,
            });
        }

        const jobs = await Job.find({ company: company._id })
            .select('_id title location jobType salary position deadline createdAt')
            .sort({ createdAt: -1 })
            .lean();

        if (jobs.length === 0) {
            return res.status(200).json({
                company: { _id: company._id, name: company.name },
                jobs: [],
                success: true,
            });
        }

        const jobIds = jobs.map((j) => j._id);
        // Aggregate per-status counts per job in one round trip.
        const agg = await Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: { job: '$job', status: '$status' }, count: { $sum: 1 } } },
        ]);

        const countsByJob = {};
        for (const row of agg) {
            const key = String(row._id.job);
            if (!countsByJob[key]) {
                countsByJob[key] = { total: 0, pending: 0, shortlisted: 0, accepted: 0, rejected: 0 };
            }
            countsByJob[key][row._id.status] = row.count;
            countsByJob[key].total += row.count;
        }

        const enriched = jobs.map((j) => ({
            ...j,
            counts: countsByJob[String(j._id)] || { total: 0, pending: 0, shortlisted: 0, accepted: 0, rejected: 0 },
        }));

        return res.status(200).json({
            company: { _id: company._id, name: company.name },
            jobs: enriched,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// Recruiter-only: fetch full profile of a student, but ONLY if that student
// has applied to at least one job belonging to the recruiter's company.
export const getRecruiterApplicantProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Invalid user id.', success: false });
        }

        const company = await Company.findOne({ userId: req.user._id }).select('_id name');
        if (!company) {
            return res.status(404).json({
                message: 'No company is linked to your account. Contact an administrator.',
                success: false,
            });
        }

        const jobs = await Job.find({ company: company._id }).select('_id title');
        const jobIds = jobs.map((j) => j._id);

        const hasApplied = await Application.exists({
            job: { $in: jobIds },
            applicant: userId,
        });
        if (!hasApplied) {
            return res.status(403).json({
                message: "This applicant has not applied to any of your company's jobs.",
                success: false,
            });
        }

        const applicant = await User.findById(userId).select('-password -notifications');
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found.', success: false });
        }

        // Include the list of applications this candidate made for THIS company
        // so the recruiter sees a full picture in the profile modal.
        const applications = await Application.find({
            job: { $in: jobIds },
            applicant: userId,
        })
            .populate({ path: 'job', select: 'title location jobType' })
            .sort({ createdAt: -1 });

        return res.status(200).json({ applicant, applications, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

// Recruiter dashboard: every applicant who applied to ANY job belonging to
// the recruiter's company. Returns flattened applications with job + applicant populated.
export const getRecruiterApplicants = async (req, res) => {
    try {
        const company = await Company.findOne({ userId: req.user._id }).select('_id name');
        if (!company) {
            return res.status(404).json({
                message: 'No company is linked to your account. Contact an administrator.',
                success: false,
            });
        }

        const jobs = await Job.find({ company: company._id }).select('_id title');
        const jobIds = jobs.map(j => j._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .sort({ createdAt: -1 })
            .populate({ path: 'job', select: 'title location jobType' })
            .populate({ path: 'applicant', select: '-password' });

        return res.status(200).json({
            company: { _id: company._id, name: company.name },
            applications,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};
export const updateStatus = async (req,res) => {
    try {
        const {status} = req.body;
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message:'status is required',
                success:false
            })
        };

        const allowed = ['pending', 'shortlisted', 'accepted', 'rejected'];
        const next = String(status).toLowerCase();
        if (!allowed.includes(next)) {
            return res.status(400).json({
                message: 'Invalid status value.',
                success: false
            });
        }

        const application = await Application.findOne({ _id: applicationId }).populate('job');
        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }

        if (req.user?.role === 'recruiter') {
            const company = await Company.findOne({ userId: req.user._id }).select('_id');
            if (!company || String(application.job?.company) !== String(company._id)) {
                return res.status(403).json({
                    message: 'Forbidden: you can only update applications for your own company.',
                    success: false,
                });
            }
        }

        application.status = next;
        await application.save();

        return res.status(200).json({
            message:"Status updated successfully.",
            success:true
        });

    } catch (error) {
        console.log(error);
    }
}