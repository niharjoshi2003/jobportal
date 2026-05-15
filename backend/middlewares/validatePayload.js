const hasDangerousMongoKeys = (value) => {
    if (!value || typeof value !== "object") return false;

    if (Array.isArray(value)) {
        return value.some((entry) => hasDangerousMongoKeys(entry));
    }

    return Object.entries(value).some(([key, nestedValue]) => {
        if (key.startsWith("$") || key.includes(".")) return true;
        return hasDangerousMongoKeys(nestedValue);
    });
};

export const validatePayload = (req, res, next) => {
    if (hasDangerousMongoKeys(req.body) || hasDangerousMongoKeys(req.query) || hasDangerousMongoKeys(req.params)) {
        return res.status(400).json({
            success: false,
            message: "Invalid request payload.",
        });
    }
    next();
};

