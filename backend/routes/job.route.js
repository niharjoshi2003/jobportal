import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorize from "../middlewares/authorize.js";
import { getAdminJobs, getAllJobs, getJobById, postJob } from "../controllers/job.controller.js";

const router = express.Router();

// Only admins can post jobs. Recruiters can only review applicants.
router.route("/post").post(isAuthenticated, authorize("admin"), postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, authorize("recruiter", "admin"), getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

export default router;
