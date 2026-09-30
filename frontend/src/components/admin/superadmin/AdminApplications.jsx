import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, User } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import AdminShell from './AdminShell';
import AdminStudentProfileModal from './AdminStudentProfileModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

const STATUS_OPTIONS = ['pending', 'shortlisted', 'accepted', 'rejected'];

const statusBadgeClass = (status) => {
    switch (status) {
        case 'accepted': return 'bg-green-500/20 text-green-400';
        case 'rejected': return 'bg-red-500/20 text-red-400';
        case 'shortlisted': return 'bg-blue-500/20 text-blue-400';
        default: return 'bg-yellow-500/20 text-yellow-400';
    }
};

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [kind, setKind] = useState('job');
    const [status, setStatus] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('kind', kind);
            if (q) params.set('q', q);
            if (status) params.set('status', status);
            const res = await axios.get(`${ADMIN_API_END_POINT}/applications?${params}`, { withCredentials: true });
            if (res.data.success) setApplications(res.data.applications || []);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kind, status]);

    const openProfile = (userId) => {
        if (!userId) return;
        setSelectedUserId(userId);
        setProfileOpen(true);
    };

    return (
        <AdminShell title="Applications" subtitle="See which student applied to which company, job, or internship">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <form
                    onSubmit={(e) => { e.preventDefault(); fetchApplications(); }}
                    className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-full sm:w-80"
                >
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search student, company, or job..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </form>
                <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                >
                    <option value="job">Jobs</option>
                    <option value="internship">Internships</option>
                    <option value="all">Jobs & internships</option>
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                >
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <span className="text-sm text-muted-foreground">{applications.length} applications</span>
            </div>

            <div className="glass-card rounded-xl p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>College</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Listing</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applied</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">Loading...</TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No applications found</TableCell>
                            </TableRow>
                        ) : applications.map((app) => (
                            <TableRow key={`${app.kind}-${app._id}`}>
                                <TableCell>
                                    <button
                                        onClick={() => openProfile(app.applicant?._id)}
                                        className="font-medium text-foreground hover:text-primary text-left"
                                    >
                                        {app.applicant?.fullname || '—'}
                                    </button>
                                    <div className="text-xs text-muted-foreground">{app.applicant?.email}</div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{app.applicant?.college || '—'}</TableCell>
                                <TableCell className="text-foreground">{app.companyName || '—'}</TableCell>
                                <TableCell>
                                    {app.listingId ? (
                                        <Link
                                            to={app.kind === 'internship'
                                                ? `/admin/internships/${app.listingId}/applicants`
                                                : `/admin/jobs/${app.listingId}/applicants`}
                                            className="text-foreground hover:text-primary"
                                        >
                                            {app.listingTitle || '—'}
                                        </Link>
                                    ) : (
                                        app.listingTitle || '—'
                                    )}
                                </TableCell>
                                <TableCell className="capitalize text-muted-foreground">{app.kind}</TableCell>
                                <TableCell>
                                    <span className={`text-xs px-2 py-1 rounded-md capitalize ${statusBadgeClass(app.status)}`}>
                                        {app.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <button
                                        onClick={() => openProfile(app.applicant?._id)}
                                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                        <User size={12} /> Profile
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AdminStudentProfileModal
                userId={selectedUserId}
                open={profileOpen}
                onOpenChange={setProfileOpen}
            />
        </AdminShell>
    );
};

export default AdminApplications;
