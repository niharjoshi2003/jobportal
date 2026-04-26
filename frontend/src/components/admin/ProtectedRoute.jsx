import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

/**
 * Allow only specified roles to access the wrapped element.
 * Defaults to admin-only. Pass `roles={['recruiter']}` etc. to override.
 */
const ProtectedRoute = ({ children, roles = ['admin'] }) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!roles.includes(user.role)) {
            navigate("/");
        }
    }, [user, roles, navigate]);

    if (!user || !roles.includes(user.role)) return null;

    return <>{children}</>;
};

export default ProtectedRoute;
