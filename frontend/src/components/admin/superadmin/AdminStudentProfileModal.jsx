import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../../ui/dialog';
import { Avatar, AvatarImage } from '../../ui/avatar';
import { Mail, Phone, GraduationCap, Hash, MapPin, FileText, Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';

const Section = ({ title, children }) => (
    <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 text-sm">
        <Icon size={14} className="text-muted-foreground flex-shrink-0" />
        <span className="text-muted-foreground">{label}:</span>
        <span className="text-foreground font-medium truncate">{value || '—'}</span>
    </div>
);

const statusBadgeClass = (status) => {
    switch (status) {
        case 'accepted': return 'bg-green-500/20 text-green-400';
        case 'rejected': return 'bg-red-500/20 text-red-400';
        case 'shortlisted': return 'bg-blue-500/20 text-blue-400';
        default: return 'bg-yellow-500/20 text-yellow-400';
    }
};

const ApplicationCard = ({ title, company, location, extra, status, createdAt, answers }) => (
    <div className="p-2.5 rounded-lg bg-white/5 border border-border text-sm">
        <div className="flex items-center justify-between gap-3">
            <div>
                <div className="text-foreground font-medium">{title || 'Unknown listing'}</div>
                <div className="text-xs text-muted-foreground">
                    {[company, location, extra].filter(Boolean).join(' · ')}
                    {createdAt ? ` · Applied ${new Date(createdAt).toLocaleDateString()}` : ''}
                </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-md capitalize ${statusBadgeClass(status)}`}>
                {status || 'pending'}
            </span>
        </div>
        {Array.isArray(answers) && answers.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-border pt-2.5">
                {answers.map((answer, index) => (
                    <div key={`${title}-${index}`} className="text-xs">
                        <p className="text-foreground font-medium">{answer.question}</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{answer.answer}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const AdminStudentProfileModal = ({ userId, open, onOpenChange }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !userId) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setData(null);
                const res = await axios.get(
                    `${ADMIN_API_END_POINT}/users/${userId}/profile`,
                    { withCredentials: true }
                );
                if (cancelled) return;
                if (res.data?.success) {
                    setData(res.data);
                } else {
                    toast.error(res.data?.message || 'Failed to load profile');
                    onOpenChange(false);
                }
            } catch (err) {
                if (cancelled) return;
                toast.error(err.response?.data?.message || 'Failed to load profile');
                onOpenChange(false);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [open, userId, onOpenChange]);

    const applicant = data?.applicant;
    const jobApplications = data?.jobApplications || [];
    const internshipApplications = data?.internshipApplications || [];
    const skills = [
        ...(applicant?.profile?.skills || []),
        ...(applicant?.profile?.customSkills || []),
    ].filter(Boolean);
    const externalLinks = applicant?.profile?.externalLinks || [];
    const resumes = applicant?.profile?.resumes || [];
    const masterResume = applicant?.profile?.resume;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Student Profile</DialogTitle>
                </DialogHeader>

                {loading || !applicant ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 size={20} className="animate-spin mr-2" /> Loading...
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-border">
                            <Avatar className="w-16 h-16 border border-border">
                                <AvatarImage
                                    src={
                                        applicant.profile?.profilePhoto ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.fullname || 'U')}`
                                    }
                                    alt={applicant.fullname}
                                />
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-foreground">{applicant.fullname}</h2>
                                {applicant.profile?.bio && (
                                    <p className="text-sm text-muted-foreground mt-1">{applicant.profile.bio}</p>
                                )}
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    <InfoRow icon={Mail} label="Email" value={applicant.email} />
                                    <InfoRow icon={Phone} label="Phone" value={applicant.phoneNumber} />
                                    <InfoRow icon={GraduationCap} label="College" value={applicant.college} />
                                    <InfoRow icon={Hash} label="Roll No" value={applicant.rollNumber} />
                                    <InfoRow icon={GraduationCap} label="Grad Year" value={applicant.graduationYear} />
                                    <InfoRow icon={MapPin} label="Gender" value={applicant.gender} />
                                </div>
                            </div>
                        </div>

                        {skills.length > 0 && (
                            <Section title="Skills">
                                <div className="flex flex-wrap gap-1.5">
                                    {skills.map((s, i) => (
                                        <span
                                            key={`${s}-${i}`}
                                            className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </Section>
                        )}

                        <Section title="Resumes">
                            {!masterResume && resumes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No resume uploaded.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {masterResume && (
                                        <a
                                            href={masterResume}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <FileText size={14} />
                                            {applicant.profile?.resumeOriginalName || 'Master resume'}
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                    {resumes
                                        .filter((r) => r?.url && r.url !== masterResume)
                                        .map((r) => (
                                            <a
                                                key={r._id || r.url}
                                                href={r.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                                            >
                                                <FileText size={14} />
                                                {r.originalName || `${r.type || 'domain'} resume`}
                                                <ExternalLink size={12} />
                                            </a>
                                        ))}
                                </div>
                            )}
                        </Section>

                        {externalLinks.length > 0 && (
                            <Section title="Links">
                                <div className="space-y-1.5">
                                    {externalLinks.map((l, i) => (
                                        <a
                                            key={`${l.url}-${i}`}
                                            href={l.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <LinkIcon size={14} />
                                            {l.label || l.type || l.url}
                                            <ExternalLink size={12} />
                                        </a>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {applicant.profile?.introVideo?.url && (
                            <Section title="Intro Video">
                                <video
                                    src={applicant.profile.introVideo.url}
                                    controls
                                    className="rounded-lg w-full max-h-64 bg-black"
                                />
                            </Section>
                        )}

                        <Section title={`Job applications (${jobApplications.length})`}>
                            {jobApplications.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No job applications yet.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {jobApplications.map((a) => (
                                        <ApplicationCard
                                            key={a._id}
                                            title={a.job?.title}
                                            company={a.job?.company?.name}
                                            location={a.job?.location}
                                            extra={a.job?.jobType}
                                            status={a.status}
                                            createdAt={a.createdAt}
                                            answers={a.applicationAnswers}
                                        />
                                    ))}
                                </div>
                            )}
                        </Section>

                        <Section title={`Internship applications (${internshipApplications.length})`}>
                            {internshipApplications.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No internship applications yet.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {internshipApplications.map((a) => (
                                        <ApplicationCard
                                            key={a._id}
                                            title={a.internship?.title}
                                            company={a.internship?.company?.name}
                                            location={a.internship?.location}
                                            status={a.status}
                                            createdAt={a.createdAt}
                                        />
                                    ))}
                                </div>
                            )}
                        </Section>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AdminStudentProfileModal;
