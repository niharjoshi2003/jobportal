import axios from "axios";
import store from "@/redux/store";
import { setUser } from "@/redux/authSlice";
import { clearSessionToken, getSessionToken } from "@/utils/session";

axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
    const token = getSessionToken();
    config.withCredentials = true;
    if (token) {
        config.headers = config.headers || {};
        if (!config.headers.Authorization && !config.headers.authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = String(error.config?.url || "");
        const isAuthAttempt = /\/login|\/register|\/forgot-password|\/reset-password/.test(url);
        if (status === 401 && !isAuthAttempt) {
            clearSessionToken();
            store.dispatch(setUser(null));
        }
        return Promise.reject(error);
    }
);
