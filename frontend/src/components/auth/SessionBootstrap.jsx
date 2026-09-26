import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoading, setSessionReady, setUser } from "@/redux/authSlice";
import { USER_API_END_POINT } from "@/utils/constant";
import { clearSessionToken } from "@/utils/session";

/**
 * Replace the user saved in localStorage with whatever the server still accepts.
 * A saved profile with no cookie and no session token is not a login.
 */
const SessionBootstrap = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        let cancelled = false;
        dispatch(setLoading(false));

        const confirmSession = async () => {
            try {
                const res = await axios.get(`${USER_API_END_POINT}/me`, { withCredentials: true });
                if (cancelled) return;
                if (res.data?.success && res.data.user) {
                    dispatch(setUser(res.data.user));
                } else {
                    clearSessionToken();
                    dispatch(setUser(null));
                }
            } catch {
                if (cancelled) return;
                clearSessionToken();
                dispatch(setUser(null));
            } finally {
                if (!cancelled) dispatch(setSessionReady(true));
            }
        };

        confirmSession();
        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    return children;
};

export default SessionBootstrap;
