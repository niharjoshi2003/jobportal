import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../shared/Navbar';
import StudentProfileModal from './StudentProfileModal';
import { INTERNSHIP_API_END_POINT } from '@/utils/constant';

const STATUS_OPTIONS = ['pending', 'shortlisted', 'accepted', 'rejected'];

const statusBadgeClass = (status) => {
    switch (status) {
        case 'accepted': return 'bg-green-500/20 text-green-400';
        case 'rejected': return 'bg-red-500/20 text-red-400';
        case 'shortlisted': return 'bg-blue-500/20 text-blue-400';
        default: return 'bg-yellow-500/20 text-yellow-400';
    }
};

const RecruiterInternshipApplicants = () => {
    const { internshipId } = useParams();
    const navigate = useNavigate();
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${INTERNSHIP_API_END_POINT}/${internshipId}/applicants`,
                    { withCredentials: true }
                );
                if (res.data?.success) setInternship(res.data.internship);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to load applicants.');
                navigate('/recruiter/applicants');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [internshipId, navigate]);

    const applications = useMemo(() => internship?.applications || [], [internship]);
    const filtered = useMemo(() => {
        if (!q.trim()) return applications;
        const needle = q.trim().toLowerCase();
        return applications.filter(({ applicant = {} }) => (
            applicant.fullname?.toLowerCase().includes(needle)
            || applicant.email?.toLowerCase().includes(needle)
            || applicant.college?.toLowerCase().includes(needle)
            || applicant.rollNumber?.toLowerCase().includes(needle)
        ));
    }, [applications, q]);

    const updateStatus = async (applicationId, status) => {
        try {
            const res = await axios.post(
                `${INTERNSHIP_API_END_POINT}/status/${applicationId}/update`,
                { status },
                { withCredentials: true }
            );
            if (res.data?.success) {
                setInternship((current) => ({
                    ...current,
                    applications: current.applications.map((application) => (
                        application._id === applicationId ? { ...application, status } : application
                    )),
                }));
                toast.success('Status updated.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status.');
        }
    };

    const openProfile = (userId) => {
        if (!userId) return;
        setSelectedUserId(userId);
        setProfileOpen(true);
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link
                    to="/recruiter/applicants"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
                >
                    <ArrowLeft size={14} /> Back to openings
                </Link>

                <h1 className="text-2xl font-bold text-foreground">
                    {internship?.title || 'Internship Applicants'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 mb-5">
                    {applications.length} total applicant{applications.length === 1 ? '' : 's'}
                </p>

                <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-full md:w-96 mb-4">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        placeholder="Search name, email, college, roll no..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </div>

                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left">Applicant</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">College</th>
                                    <th className="px-4 py-3 text-left">Resume</th>
                                    <th className="px-4 py-3 text-left">Applied</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                            Loading applicants...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                            No applicants match the current search.
                                        </td>
                                    </tr>
                                ) : filtered.map((application) => {
                                    const applicant = application.applicant || {};
                                    return (
                                        <tr key={application._id} className="border-t border-border hover:bg-white/5">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => openProfile(applicant._id)}
                                                    className="text-foreground font-medium hover:text-primary text-left"
                                                >
                                                    {applicant.fullname || '—'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{applicant.email || '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{applicant.college || '—'}</td>
                                            <td className="px-4 py-3">
                                                {applicant.profile?.resume ? (
                                                    <a
                                                        href={applicant.profile.resume}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-primary hover:underline inline-flex items-center gap-1"
                                                    >
                                                        <FileText size={12} /> View
                                                    </a>
                                                ) : <span className="text-muted-foreground">None</span>}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(application.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs capitalize ${statusBadgeClass(application.status)}`}>
                                                    {application.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openProfile(applicant._id)}
                                                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                                                    >
                                                        <User size={12} /> Profile
                                                    </button>
                                                    <select
                                                        value={application.status}
                                                        onChange={(event) => updateStatus(application._id, event.target.value)}
                                                        className="rounded-md border border-border bg-white/5 px-2 py-1 text-xs text-foreground"
                                                    >
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <option key={status} value={status}>{status}</option>
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
            </div>

            <StudentProfileModal
                userId={selectedUserId}
                open={profileOpen}
                onOpenChange={setProfileOpen}
            />
        </div>
    );
};

export default RecruiterInternshipApplicants;
