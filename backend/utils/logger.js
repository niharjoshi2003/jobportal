const formatBase = (level, message, context = {}) => {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...context,
    };
    return JSON.stringify(payload);
};

export const logger = {
    info: (message, context = {}) => {
        console.log(formatBase("info", message, context));
    },
    warn: (message, context = {}) => {
        console.warn(formatBase("warn", message, context));
    },
    error: (message, context = {}) => {
        console.error(formatBase("error", message, context));
    },
};

