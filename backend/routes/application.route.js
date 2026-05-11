import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorize from "../middlewares/authorize.js";
import {
    applyJob, getApplicants, getAppliedJobs, updateStatus,
    getRecruiterApplicants, getRecruiterJobs, getRecruiterApplicantProfile,
} from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, authorize("student"), applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);

// Recruiter dashboard: every applicant for the recruiter's company.
router.route("/recruiter/all").get(isAuthenticated, authorize("recruiter"), getRecruiterApplicants);
// Recruiter dashboard: jobs overview (per-job applicant counts).
router.route("/recruiter/jobs").get(isAuthenticated, authorize("recruiter"), getRecruiterJobs);
// Recruiter-only: view a specific applicant's profile (must have applied to the company).
router.route("/recruiter/applicant/:userId").get(isAuthenticated, authorize("recruiter"), getRecruiterApplicantProfile);

router.route("/:id/applicants").get(isAuthenticated, authorize("recruiter", "admin"), getApplicants);
router.route("/status/:id/update").post(isAuthenticated, authorize("recruiter", "admin"), updateStatus);

export default router;
