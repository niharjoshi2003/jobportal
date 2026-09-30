const extensionFromName = (name = "") => {
    const match = String(name).toLowerCase().match(/\.(pdf|docx|doc)$/);
    return match ? match[0] : "";
};

export const safeResumeFilename = (originalName = "", fallbackExt = ".pdf") => {
    const raw = String(originalName || "").trim();
    const ext = extensionFromName(raw) || fallbackExt;
    const base = raw
        .replace(/\.(pdf|docx|doc)$/i, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^[._]+|[._]+$/g, "")
        .slice(0, 80) || "resume";
    return `${base}${ext}`;
};

// A dot inside fl_attachment is parsed as a format flag. Cloudinary then
// returns "Invalid flag in transformation: pdf", which the browser shows as
// ERR_INVALID_RESPONSE. Files that already end in .pdf/.doc/.docx can be
// opened from the plain URL.
export const resumeDownloadUrl = (url, originalName = "") => {
    let raw = String(url || "").trim();
    if (!raw || !raw.includes("/raw/upload/")) return raw;
    raw = raw.replace(/\/fl_attachment:[^/]+\//, "/");
    if (/\.(pdf|docx|doc)(?:$|\?)/i.test(raw)) return raw;
    const base = safeResumeFilename(originalName).replace(/\.(pdf|docx|doc)$/i, "");
    return raw.replace("/raw/upload/", `/raw/upload/fl_attachment:${base}/`);
};

export const rewriteProfileResumeUrls = (profile) => {
    if (!profile || typeof profile !== "object") return profile;
    if (profile.resume) {
        profile.resume = resumeDownloadUrl(profile.resume, profile.resumeOriginalName);
    }
    if (Array.isArray(profile.resumes)) {
        for (const resume of profile.resumes) {
            if (resume?.url) {
                resume.url = resumeDownloadUrl(resume.url, resume.originalName || profile.resumeOriginalName);
            }
        }
    }
    return profile;
};
