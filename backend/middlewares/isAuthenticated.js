import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const readBearerToken = (req) => {
    const header = req.headers?.authorization || req.headers?.Authorization;
    if (!header || typeof header !== "string") return null;
    const [scheme, value] = header.split(" ");
    if (!value || scheme.toLowerCase() !== "bearer") return null;
    const token = value.trim();
    return token || null;
};

const isAuthenticated = async (req, res, next) => {
    try {
        // Cookie is preferred. Phones often drop the cross-site cookie, so the
        // same JWT may also arrive as Authorization: Bearer from sessionStorage.
        const token = req.cookies?.token || readBearerToken(req);
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        const secret = process.env.SECRET_KEY;
        if (!secret) {
            return res.status(500).json({
                message: "Server misconfigured: SECRET_KEY is missing.",
                success: false,
            });
        }

        const decoded = jwt.verify(token, secret);
        if (!decoded?.userId) {
            return res.status(401).json({
                message: "Invalid token",
                success: false,
            });
        }

        req.id = decoded.userId;

        // Load the user record so downstream middleware (e.g. authorize) and
        // controllers can access role/email without an extra query.
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                message: "User no longer exists",
                success: false,
            });
        }
        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
        });
    }
};

export default isAuthenticated;
