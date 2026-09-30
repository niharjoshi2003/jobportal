import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Search, User, FileText } from 'lucide-react';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import AdminShell from './superadmin/AdminShell';
import AdminStudentProfileModal from './superadmin/AdminStudentProfileModal';

const statusBadgeClass = (status) => {
    switch (status) {
        case 'accepted': return 'bg-green-500/20 text-green-400';
        case 'rejected': return 'bg-red-500/20 text-red-400';
        case 'shortlisted': return 'bg-blue-500/20 text-blue-400';
        default: return 'bg-yellow-500/20 text-yellow-400';
    }
};

const Applicants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${APPLICATION_API_END_POINT}/${id}/applicants`,
                { withCredentials: true }
            );
            if (res.data?.success) {
                setJob(res.data.job);
                setApplications(res.data.job?.applications || []);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load applicants.');
            navigate('/admin/all-jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

    const filtered = useMemo(() => {
        if (!q.trim()) return applications;
        const needle = q.trim().toLowerCase();
        return applications.filter((a) => {
            const u = a.applicant || {};
            return (
                u.fullname?.toLowerCase().includes(needle)
                || u.email?.toLowerCase().includes(needle)
                || u.college?.toLowerCase().includes(needle)
                || u.rollNumber?.toLowerCase().includes(needle)
            );
        });
    }, [applications, q]);

    const openProfile = (userId) => {
        if (!userId) return;
        setSelectedUserId(userId);
        setProfileOpen(true);
    };

    return (
        <AdminShell
            title={job?.title ? `${job.title} — Applicants` : 'Applicants'}
            subtitle={`${applications.length} student${applications.length === 1 ? '' : 's'} applied to this job`}
        >
            <Link
                to="/admin/all-jobs"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
            >
                <ArrowLeft size={14} /> Back to jobs
            </Link>

            <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-full md:w-96 mb-4">
                <Search size={16} className="text-muted-foreground" />
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, email, college, roll no..."
                    className="bg-transparent text-sm text-foreground outline-none w-full"
                />
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left">Student</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">College</th>
                                <th className="px-4 py-3 text-left">Resume</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Applied</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading applicants...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No applicants yet.</td>
                                </tr>
                            ) : filtered.map((app) => {
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
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs capitalize ${statusBadgeClass(app.status)}`}>
                                                {app.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => openProfile(u._id)}
                                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                                            >
                                                <User size={12} /> Profile
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminStudentProfileModal
                userId={selectedUserId}
                open={profileOpen}
                onOpenChange={setProfileOpen}
            />
        </AdminShell>
    );
};

export default Applicants;
