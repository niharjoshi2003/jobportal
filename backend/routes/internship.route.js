import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorize from "../middlewares/authorize.js";
import {
    createInternship, getAllInternships,
    getInternshipById, getAdminInternships,
    applyInternship, getAppliedInternships,
    getInternshipApplicants, updateInternshipApplicationStatus,
} from "../controllers/internship.controller.js";

const router = express.Router();

// Only admins can create internships. Recruiters can only review applicants.
router.route("/post").post(isAuthenticated, authorize("admin"), createInternship);
router.route("/admin").get(isAuthenticated, authorize("recruiter", "admin"), getAdminInternships);

// Student: my applied internships (must come BEFORE /:id route)
router.route("/applied").get(isAuthenticated, authorize("student"), getAppliedInternships);

// Public to authenticated users: browse
router.route("/get").get(isAuthenticated, getAllInternships);
router.route("/get/:id").get(isAuthenticated, getInternshipById);

// Student: apply
router.route("/apply/:id").get(isAuthenticated, authorize("student"), applyInternship);

// Recruiter / admin: review applicants + update status
router.route("/:id/applicants").get(isAuthenticated, authorize("recruiter", "admin"), getInternshipApplicants);
router.route("/status/:id/update").post(isAuthenticated, authorize("recruiter", "admin"), updateInternshipApplicationStatus);

export default router;
