/**
 * Role-based authorization middleware.
 * Must run AFTER isAuthenticated (which populates req.user).
 *
 * Usage:
 *   router.post("/post", isAuthenticated, authorize("recruiter", "admin"), postJob);
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated",
                success: false,
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden: insufficient role",
                success: false,
            });
        }
        next();
    };
};

export default authorize;
