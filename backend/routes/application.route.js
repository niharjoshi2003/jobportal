import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorize from "../middlewares/authorize.js";
import {
    applyJob, getApplicants, getAppliedJobs, updateStatus, getRecruiterApplicants,
} from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, authorize("student"), applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);

// Recruiter dashboard: every applicant for the recruiter's company.
router.route("/recruiter/all").get(isAuthenticated, authorize("recruiter"), getRecruiterApplicants);

router.route("/:id/applicants").get(isAuthenticated, authorize("recruiter", "admin"), getApplicants);
router.route("/status/:id/update").post(isAuthenticated, authorize("recruiter", "admin"), updateStatus);

export default router;
