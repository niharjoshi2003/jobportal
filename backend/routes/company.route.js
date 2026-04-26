import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorize from "../middlewares/authorize.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/mutler.js";

const router = express.Router();

// Legacy route kept admin-only for backward compatibility.
// Preferred path for creating companies is POST /api/v1/admin/companies (creates company + recruiter).
router.route("/register").post(isAuthenticated, authorize("admin"), registerCompany);
router.route("/get").get(isAuthenticated, getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById);
// Recruiters cannot edit company details \u2014 only admins.
router.route("/update/:id").put(isAuthenticated, authorize("admin"), singleUpload, updateCompany);

export default router;
