import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorize from "../middlewares/authorize.js";
import {
    getStats,
    listUsers, updateUserRole, deleteUser,
    listCompanies, setCompanyVerified, deleteCompany,
    createCompanyWithRecruiter, resetRecruiterPassword,
    listJobs, deleteJob,
    listInternships, deleteInternship,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(isAuthenticated, authorize("admin"));

router.get("/stats", getStats);

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/companies", listCompanies);
router.post("/companies", createCompanyWithRecruiter);
router.post("/companies/:id/reset-recruiter-password", resetRecruiterPassword);
router.patch("/companies/:id/verify", setCompanyVerified);
router.delete("/companies/:id", deleteCompany);

router.get("/jobs", listJobs);
router.delete("/jobs/:id", deleteJob);

router.get("/internships", listInternships);
router.delete("/internships/:id", deleteInternship);

export default router;
