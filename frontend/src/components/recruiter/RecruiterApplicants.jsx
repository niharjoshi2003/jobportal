import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
    Briefcase, ChevronRight, MapPin, Users, Search,
    Download, Eye,
} from 'lucide-react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import {
    APPLICATION_API_END_POINT, USER_API_END_POINT,
} from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { downloadCsv } from '@/utils/csv';

const statusColor = {
    pending: 'text-yellow-400',
    shortlisted: 'text-blue-400',
    accepted: 'text-green-400',
    rejected: 'text-red-400',
};

const RecruiterApplicants = () => {
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const load = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${APPLICATION_API_END_POINT}/recruiter/jobs`,
                { withCredentials: true }
            );
            if (res.data?.success) {
                setCompany(res.data.company);
                setJobs(res.data.jobs || []);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const logout = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data?.success) {
                dispatch(setUser(null));
                navigate('/portal-login');
            }
        } catch {
            toast.error('Logout failed.');
        }
    };

    const filteredJobs = useMemo(() => {
        if (!q.trim()) return jobs;
        const needle = q.trim().toLowerCase();
        return jobs.filter((j) =>
            j.title?.toLowerCase().includes(needle)
            || j.location?.toLowerCase().includes(needle)
            || j.jobType?.toLowerCase().includes(needle)
        );
    }, [jobs, q]);

    const totals = useMemo(() => {
        return jobs.reduce(
            (acc, j) => {
                acc.total += j.counts?.total || 0;
                acc.pending += j.counts?.pending || 0;
                acc.shortlisted += j.counts?.shortlisted || 0;
                acc.accepted += j.counts?.accepted || 0;
                acc.rejected += j.counts?.rejected || 0;
                return acc;
            },
            { total: 0, pending: 0, shortlisted: 0, accepted: 0, rejected: 0 }
        );
    }, [jobs]);

    const exportAllApplicants = async () => {
        try {
            const res = await axios.get(
                `${APPLICATION_API_END_POINT}/recruiter/all`,
                { withCredentials: true }
            );
            const apps = res.data?.applications || [];
            if (apps.length === 0) {
                toast.error('No applicants to export yet.');
                return;
            }
            const columns = [
                { label: 'Job', value: (a) => a.job?.title || '' },
                { label: 'Name', value: (a) => a.applicant?.fullname || '' },
                { label: 'Email', value: (a) => a.applicant?.email || '' },
                { label: 'Phone', value: (a) => a.applicant?.phoneNumber || '' },
                { label: 'College', value: (a) => a.applicant?.college || '' },
                { label: 'Roll Number', value: (a) => a.applicant?.rollNumber || '' },
                { label: 'Graduation Year', value: (a) => a.applicant?.graduationYear || '' },
                {
                    label: 'Skills',
                    value: (a) => [
                        ...(a.applicant?.profile?.skills || []),
                        ...(a.applicant?.profile?.customSkills || []),
                    ].join('; '),
                },
                { label: 'Status', value: (a) => a.status || '' },
                {
                    label: 'Applied Date',
                    value: (a) => (a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : ''),
                },
                {
                    label: 'Custom Responses',
                    value: (a) => (a.applicationAnswers || [])
                        .map((ans) => `${ans.question}: ${ans.answer}`)
                        .join(' | '),
                },
                { label: 'Resume URL', value: (a) => a.applicant?.profile?.resume || '' },
            ];
            const safeCompany = (company?.name || 'company').replace(/[^\w\d-_]+/g, '_').slice(0, 40);
            const stamp = new Date().toISOString().split('T')[0];
            downloadCsv(`applicants_${safeCompany}_${stamp}.csv`, apps, columns);
            toast.success(`Exported ${apps.length} applicants.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Export failed.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Recruiter Dashboard{company ? ` — ${company.name}` : ''}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pick a job to review its applicants, view profiles, and export data.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={exportAllApplicants}
                            className="inline-flex items-center gap-2"
                            disabled={loading || jobs.length === 0}
                        >
                            <Download size={16} /> Export all (CSV)
                        </Button>
                        <Button variant="outline" onClick={logout}>Logout</Button>
                    </div>
                </div>

                {/* Top-line totals across all jobs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="p-4 rounded-xl border border-border bg-white/5">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Applicants</div>
                        <div className="text-2xl font-bold text-foreground mt-1">{totals.total}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-white/5">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Pending</div>
                        <div className={`text-2xl font-bold mt-1 ${statusColor.pending}`}>{totals.pending}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-white/5">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Shortlisted</div>
                        <div className={`text-2xl font-bold mt-1 ${statusColor.shortlisted}`}>{totals.shortlisted}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-white/5">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Accepted</div>
                        <div className={`text-2xl font-bold mt-1 ${statusColor.accepted}`}>{totals.accepted}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-white/5">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Rejected</div>
                        <div className={`text-2xl font-bold mt-1 ${statusColor.rejected}`}>{totals.rejected}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-full md:w-96 mb-4">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search jobs by title, location, type..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-2xl">
                        <Briefcase className="mx-auto text-muted-foreground mb-3" size={32} />
                        <p className="text-muted-foreground mb-1">No job postings yet for your company.</p>
                        <p className="text-xs text-muted-foreground">
                            Contact the admin to post jobs on your behalf.
                        </p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-2xl">
                        <p className="text-muted-foreground">No jobs match your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredJobs.map((job) => {
                            const c = job.counts || {};
                            return (
                                <Link
                                    key={job._id}
                                    to={`/recruiter/jobs/${job._id}/applicants`}
                                    className="group glass-card rounded-2xl p-5 hover:border-primary transition relative"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary truncate">
                                                {job.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                                {job.location && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin size={12} /> {job.location}
                                                    </span>
                                                )}
                                                {job.jobType && <span>· {job.jobType}</span>}
                                                {typeof job.position === 'number' && job.position > 0 && (
                                                    <span>· {job.position} opening{job.position === 1 ? '' : 's'}</span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary flex-shrink-0" />
                                    </div>

                                    <div className="mt-4 flex items-center gap-4 text-sm">
                                        <div className="inline-flex items-center gap-1.5">
                                            <Users size={14} className="text-muted-foreground" />
                                            <span className="text-foreground font-semibold">{c.total || 0}</span>
                                            <span className="text-muted-foreground">applicants</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded-md bg-yellow-500/10 ${statusColor.pending}`}>
                                            {c.pending || 0} pending
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md bg-blue-500/10 ${statusColor.shortlisted}`}>
                                            {c.shortlisted || 0} shortlisted
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md bg-green-500/10 ${statusColor.accepted}`}>
                                            {c.accepted || 0} accepted
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md bg-red-500/10 ${statusColor.rejected}`}>
                                            {c.rejected || 0} rejected
                                        </span>
                                    </div>

                                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary">
                                        <Eye size={12} /> View applicants
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterApplicants;
