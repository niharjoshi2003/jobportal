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

    // Admin/recruiter-only routes should bounce unauthenticated users to the
    // portal login; student routes should bounce to the student login.
    const isStaffRoute = !roles.includes('student');
    const loginRoute = isStaffRoute ? '/portal-login' : '/login';

    useEffect(() => {
        if (!user) {
            navigate(loginRoute);
            return;
        }
        if (!roles.includes(user.role)) {
            navigate("/");
        }
    }, [user, roles, navigate, loginRoute]);

    if (!user || !roles.includes(user.role)) return null;

    return <>{children}</>;
};

export default ProtectedRoute;
