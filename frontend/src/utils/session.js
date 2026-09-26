const SESSION_TOKEN_KEY = "jobohire.sessionToken";

export const getSessionToken = () => {
    try {
        return sessionStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setSessionToken = (token) => {
    try {
        if (token) sessionStorage.setItem(SESSION_TOKEN_KEY, token);
        else sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
        // Private mode can block storage; the httpOnly cookie may still work.
    }
};

export const clearSessionToken = () => setSessionToken(null);
