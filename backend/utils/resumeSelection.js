// Keep legacy single-resume profiles working until the student manages their files.
export const selectedResume = (profile = {}) => {
    const resumes = profile.resumes || [];
    if (profile.selectedResumeId) return resumes.find(r => String(r._id) === String(profile.selectedResumeId)) || null;
    if (profile.selectedResumeId === null) return null;
    return resumes.find(r => r.url === profile.resume) || (profile.resume ? { url: profile.resume, originalName: profile.resumeOriginalName } : null);
};

export const normalizeResumes = (profile) => {
    if (profile.resume && !profile.resumes.some(r => r.url === profile.resume)) {
        profile.resumes.push({ url: profile.resume, originalName: profile.resumeOriginalName, type: 'master' });
    }
    const selected = selectedResume(profile);
    profile.selectedResumeId = selected?._id || null;
};

export const exposeSelectedResumes = (value) => {
    if (!value || typeof value !== 'object') return value;
    if (value.profile) {
        const profile = value.profile;
        const selected = selectedResume(profile);
        profile.resumes = selected ? [selected] : [];
        profile.resume = selected?.url || '';
        profile.resumeOriginalName = selected?.originalName || '';
    }
    for (const child of Object.values(value)) {
        if (child && typeof child === 'object') exposeSelectedResumes(child);
    }
    return value;
};
