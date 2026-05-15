import express from "express";
import {
    login, logout, register, updateProfile, updateProfilePhoto,
    addResume, deleteResume, getNotifications, markNotificationRead,
    getDashboardStats, forgotPassword, resetPassword
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/profile/photo").post(isAuthenticated, singleUpload, updateProfilePhoto);
router.route("/profile/resume").post(isAuthenticated, singleUpload, addResume);
router.route("/profile/resume/:resumeId").delete(isAuthenticated, deleteResume);
router.route("/notifications").get(isAuthenticated, getNotifications);
router.route("/notifications/read").put(isAuthenticated, markNotificationRead);
router.route("/dashboard/stats").get(isAuthenticated, getDashboardStats);

export default router;
