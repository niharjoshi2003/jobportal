import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
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
        // create a new application
        const newApplication = await Application.create({
            job:jobId,
            applicant:userId,
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
            populate: { path: 'applicant' }
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