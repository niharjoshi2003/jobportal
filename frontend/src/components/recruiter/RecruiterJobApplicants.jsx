import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Download, User, FileText, Search } from 'lucide-react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { downloadCsv } from '@/utils/csv';
import StudentProfileModal from './StudentProfileModal';

const STATUS_OPTIONS = ['pending', 'shortlisted', 'accepted', 'rejected'];

const statusBadgeClass = (status) => {
    switch (status) {
        case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'shortlisted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
};

const RecruiterJobApplicants = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [q, setQ] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${APPLICATION_API_END_POINT}/${jobId}/applicants`,
                { withCredentials: true }
            );
            if (res.data?.success) {
                setJob(res.data.job);
                setApplications(res.data.job?.applications || []);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load applicants.');
            navigate('/recruiter/applicants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [jobId]);

    const updateStatus = async (applicationId, status) => {
        try {
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/status/${applicationId}/update`,
                { status },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (res.data?.success) {
                toast.success('Status updated.');
                setApplications((prev) =>
                    prev.map((a) => (a._id === applicationId ? { ...a, status } : a))
                );
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status.');
        }
    };

    const openProfile = (userId) => {
        setSelectedUserId(userId);
        setProfileOpen(true);
    };

    const filtered = useMemo(() => {
        let list = applications;
        if (filter !== 'all') list = list.filter((a) => a.status === filter);
        if (q.trim()) {
            const needle = q.trim().toLowerCase();
            list = list.filter((a) => {
                const u = a.applicant || {};
                return (
                    u.fullname?.toLowerCase().includes(needle)
                    || u.email?.toLowerCase().includes(needle)
                    || u.college?.toLowerCase().includes(needle)
                    || u.rollNumber?.toLowerCase().includes(needle)
                );
            });
        }
        return list;
    }, [applications, filter, q]);

    const counts = useMemo(() => {
        return STATUS_OPTIONS.reduce((acc, s) => {
            acc[s] = applications.filter((a) => a.status === s).length;
            return acc;
        }, {});
    }, [applications]);

    const exportToCsv = () => {
        if (filtered.length === 0) {
            toast.error('No applicants to export with current filters.');
            return;
        }
        const columns = [
            { key: 'name', label: 'Name', value: (a) => a.applicant?.fullname || '' },
            { key: 'email', label: 'Email', value: (a) => a.applicant?.email || '' },
            { key: 'phone', label: 'Phone', value: (a) => a.applicant?.phoneNumber || '' },
            { key: 'college', label: 'College', value: (a) => a.applicant?.college || '' },
            { key: 'rollNumber', label: 'Roll Number', value: (a) => a.applicant?.rollNumber || '' },
            { key: 'graduationYear', label: 'Graduation Year', value: (a) => a.applicant?.graduationYear || '' },
            { key: 'gender', label: 'Gender', value: (a) => a.applicant?.gender || '' },
            {
                key: 'skills',
                label: 'Skills',
                value: (a) => [
                    ...(a.applicant?.profile?.skills || []),
                    ...(a.applicant?.profile?.customSkills || []),
                ].join('; '),
            },
            { key: 'status', label: 'Status', value: (a) => a.status || '' },
            {
                key: 'applicationSource',
                label: 'Application Source',
                value: (a) => (a.applicationSource === 'external' ? 'Company Site' : 'Job-O-Hire'),
            },
            {
                key: 'appliedAt',
                label: 'Applied Date',
                value: (a) => (a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : ''),
            },
            {
                key: 'customResponses',
                label: 'Custom Responses',
                value: (a) => (a.applicationAnswers || [])
                    .map((ans) => `${ans.question}: ${ans.answer}`)
                    .join(' | '),
            },
            { key: 'resume', label: 'Resume URL', value: (a) => a.applicant?.profile?.resume || '' },
        ];

        const safeTitle = (job?.title || 'job').replace(/[^\w\d-_]+/g, '_').slice(0, 40);
        const stamp = new Date().toISOString().split('T')[0];
        downloadCsv(`applicants_${safeTitle}_${stamp}.csv`, filtered, columns);
        toast.success(`Exported ${filtered.length} applicants.`);
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link
                    to="/recruiter/applicants"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
                >
                    <ArrowLeft size={14} /> Back to jobs
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {job?.title || 'Applicants'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {job?.location ? `${job.location} · ` : ''}
                            {job?.jobType || ''} · {applications.length} total applicants
                        </p>
                    </div>
                    <Button onClick={exportToCsv} className="inline-flex items-center gap-2">
                        <Download size={16} /> Export CSV
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                    <button
                        onClick={() => setFilter('all')}
                        className={`p-4 rounded-xl border text-left transition ${filter === 'all' ? 'border-primary bg-primary/10' : 'border-border bg-white/5 hover:bg-white/10'}`}
                    >
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
                        <div className="text-2xl font-bold text-foreground mt-1">{applications.length}</div>
                    </button>
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`p-4 rounded-xl border text-left transition ${filter === s ? 'border-primary bg-primary/10' : 'border-border bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className="text-xs text-muted-foreground uppercase tracking-wider capitalize">{s}</div>
                            <div className="text-2xl font-bold text-foreground mt-1">{counts[s] || 0}</div>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-full md:w-96 mb-4">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search name, email, college, roll no..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading applicants...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-2xl">
                        <p className="text-muted-foreground">No applicants match the current filters.</p>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Applicant</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">College</th>
                                        <th className="px-4 py-3 text-left">Roll No</th>
                                        <th className="px-4 py-3 text-left">Resume</th>
                                        <th className="px-4 py-3 text-left">Applied</th>
                                        <th className="px-4 py-3 text-left">Source</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((app) => {
                                        const u = app.applicant || {};
                                        return (
                                            <tr key={app._id} className="border-t border-border hover:bg-white/5">
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => openProfile(u._id)}
                                                        className="text-foreground font-medium hover:text-primary text-left"
                                                    >
                                                        {u.fullname || '—'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{u.email || '—'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{u.college || '—'}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{u.rollNumber || '—'}</td>
                                                <td className="px-4 py-3">
                                                    {u.profile?.resume ? (
                                                        <a
                                                            href={u.profile.resume}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-primary hover:underline inline-flex items-center gap-1"
                                                        >
                                                            <FileText size={12} /> View
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground">None</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                                    {app.applicationSource === 'external' ? 'Company Site' : 'Job-O-Hire'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-md text-xs border capitalize ${statusBadgeClass(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openProfile(u._id)}
                                                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                                                            title="View full profile"
                                                        >
                                                            <User size={12} /> Profile
                                                        </button>
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => updateStatus(app._id, e.target.value)}
                                                            className="rounded-md border border-border bg-white/5 px-2 py-1 text-xs text-foreground"
                                                        >
                                                            {STATUS_OPTIONS.map((s) => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <StudentProfileModal
                userId={selectedUserId}
                open={profileOpen}
                onOpenChange={setProfileOpen}
            />
        </div>
    );
};

export default RecruiterJobApplicants;
