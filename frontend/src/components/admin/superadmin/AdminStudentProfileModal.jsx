import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../../ui/dialog';
import { Avatar, AvatarImage } from '../../ui/avatar';
import { Mail, Phone, GraduationCap, Hash, FileText, Link as LinkIcon, ExternalLink, Loader2, User, Calendar } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';

const Section = ({ title, children }) => (
    <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-2 text-sm min-w-0">
        <Icon size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <span className="text-muted-foreground shrink-0">{label}:</span>
        <span className="text-foreground font-medium break-words">{value || '—'}</span>
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

const accountStatusClass = (status) => {
    switch (status) {
        case 'approved': return 'bg-green-500/20 text-green-400';
        case 'rejected': return 'bg-red-500/20 text-red-400';
        default: return 'bg-amber-500/20 text-amber-400';
    }
};

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
};

const ApplicationCard = ({ title, company, location, extra, status, createdAt, answers }) => (
    <div className="p-2.5 rounded-lg bg-white/5 border border-border text-sm">
        <div className="flex items-center justify-between gap-3">
            <div>
                <div className="text-foreground font-medium">{title || 'Unknown listing'}</div>
                <div className="text-xs text-muted-foreground">
                    {[company, location, extra].filter(Boolean).join(' · ')}
                    {createdAt ? ` · Applied ${formatDate(createdAt)}` : ''}
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

    const completion = applicant?.profile?.profileCompletion ?? 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[92vh] w-[min(48rem,calc(100vw-1.5rem))] max-w-3xl flex-col gap-0 overflow-hidden p-0">
                <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pr-12">
                    <DialogTitle>Student Profile</DialogTitle>
                </DialogHeader>

                {loading || !applicant ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 size={20} className="animate-spin mr-2" /> Loading...
                    </div>
                ) : (
                    <div className="max-h-[calc(92vh-4.5rem)] space-y-6 overflow-y-auto px-6 py-5 scrollbar-thin">
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
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold text-foreground">{applicant.fullname}</h2>
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${accountStatusClass(applicant.status)}`}>
                                        {applicant.status || 'pending'}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                        {completion}% complete
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                    {applicant.profile?.bio || 'No bio added.'}
                                </p>
                                {applicant.status === 'rejected' && applicant.rejectionReason && (
                                    <p className="text-xs text-red-400 mt-2">Rejection reason: {applicant.rejectionReason}</p>
                                )}
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    <InfoRow icon={Mail} label="College email" value={applicant.email} />
                                    <InfoRow icon={Mail} label="Personal email" value={applicant.personalEmail} />
                                    <InfoRow icon={Phone} label="Phone" value={applicant.phoneNumber} />
                                    <InfoRow icon={GraduationCap} label="College" value={applicant.college} />
                                    <InfoRow icon={Hash} label="Roll No" value={applicant.rollNumber} />
                                    <InfoRow icon={GraduationCap} label="Grad Year" value={applicant.graduationYear} />
                                    <InfoRow icon={GraduationCap} label="Degree" value={applicant.degree} />
                                    <InfoRow icon={GraduationCap} label="Department" value={applicant.department} />
                                    <InfoRow icon={User} label="Nationality" value={applicant.nationality} />
                                    <InfoRow icon={User} label="Japanese" value={applicant.japaneseLevel} />
                                    <InfoRow icon={User} label="English" value={applicant.englishLevel} />
                                    <InfoRow icon={User} label="Preferred work" value={applicant.preferredWorkLocation} />
                                    <InfoRow icon={User} label="Gender" value={applicant.gender} />
                                    <InfoRow icon={Calendar} label="Joined" value={formatDate(applicant.createdAt)} />
                                </div>
                            </div>
                        </div>

                        <Section title="Skills">
                            {skills.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No skills added.</p>
                            ) : (
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
                            )}
                        </Section>

                        {(applicant.profile?.certificates || []).length > 0 && (
                            <Section title="Certificates">
                                <div className="space-y-1.5">
                                    {applicant.profile.certificates.map((cert, i) => (
                                        <div key={`${cert.name}-${i}`} className="text-sm">
                                            <p className="text-foreground">{cert.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {[cert.issuer, cert.category, cert.issuedOn].filter(Boolean).join(' · ')}
                                            </p>
                                            {cert.credentialUrl && (
                                                <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                                                    View credential <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
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
                                            <span>
                                                {applicant.profile?.resumeOriginalName || 'Master resume'}
                                                <span className="text-muted-foreground"> · Master</span>
                                            </span>
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
                                                <span>
                                                    {r.originalName || `${r.type || 'domain'} resume`}
                                                    <span className="text-muted-foreground">
                                                        {` · ${r.type === 'master' ? 'Master' : 'Domain'}`}
                                                        {r.uploadedAt ? ` · ${formatDate(r.uploadedAt)}` : ''}
                                                    </span>
                                                </span>
                                                <ExternalLink size={12} />
                                            </a>
                                        ))}
                                </div>
                            )}
                        </Section>

                        <Section title="Links">
                            {externalLinks.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No external links added.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {externalLinks.map((l, i) => (
                                        <a
                                            key={`${l.url}-${i}`}
                                            href={l.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline min-w-0"
                                        >
                                            <LinkIcon size={14} className="flex-shrink-0" />
                                            <span className="truncate">
                                                {l.label || l.type || 'Link'}
                                                {l.url ? <span className="text-muted-foreground"> · {l.url}</span> : null}
                                            </span>
                                            <ExternalLink size={12} className="flex-shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </Section>

                        <Section title="Intro Video">
                            {applicant.profile?.introVideo?.url ? (
                                <div className="space-y-2">
                                    <video
                                        src={applicant.profile.introVideo.url}
                                        controls
                                        className="rounded-lg w-full max-h-64 bg-black"
                                    />
                                    {applicant.profile.introVideo.uploadedAt && (
                                        <p className="text-xs text-muted-foreground">
                                            Uploaded {formatDate(applicant.profile.introVideo.uploadedAt)}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No intro video uploaded.</p>
                            )}
                        </Section>

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
