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

// Cloudinary raw uploads from a buffer get a name like file_ehe7cx and no
// extension, so the browser saves a file Windows cannot open. fl_attachment
// sets the download name without changing the stored file.
export const resumeDownloadUrl = (url, originalName = "") => {
    const raw = String(url || "").trim();
    if (!raw || raw.includes("/fl_attachment:") || !raw.includes("/raw/upload/")) return raw;
    const filename = safeResumeFilename(originalName);
    return raw.replace("/raw/upload/", `/raw/upload/fl_attachment:${filename}/`);
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
