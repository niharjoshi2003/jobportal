import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { APPLICATION_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';

const STATUS_OPTIONS = ['pending', 'shortlisted', 'accepted', 'rejected'];

const statusBadgeClass = (status) => {
    switch (status) {
        case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'shortlisted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
};

const RecruiterApplicants = () => {
    const [data, setData] = useState({ company: null, applications: [] });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const load = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${APPLICATION_API_END_POINT}/recruiter/all`, { withCredentials: true });
            if (res.data?.success) {
                setData({ company: res.data.company, applications: res.data.applications || [] });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load applicants.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (applicationId, status) => {
        try {
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/status/${applicationId}/update`,
                { status },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (res.data?.success) {
                toast.success('Status updated.');
                setData((prev) => ({
                    ...prev,
                    applications: prev.applications.map((a) =>
                        a._id === applicationId ? { ...a, status } : a
                    ),
                }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status.');
        }
    };

    const logout = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data?.success) {
                dispatch(setUser(null));
                navigate('/login');
            }
        } catch {
            toast.error('Logout failed.');
        }
    };

    const filtered = filter === 'all'
        ? data.applications
        : data.applications.filter((a) => a.status === filter);

    const counts = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = data.applications.filter((a) => a.status === s).length;
        return acc;
    }, {});

    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Applicants {data.company ? `- ${data.company.name}` : ''}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            All students who applied to your company's job postings.
                        </p>
                    </div>
                    <Button variant="outline" onClick={logout}>Logout</Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`p-4 rounded-xl border text-left transition ${filter === 'all' ? 'border-primary bg-primary/10' : 'border-border bg-white/5 hover:bg-white/10'}`}
                    >
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
                        <div className="text-2xl font-bold text-foreground mt-1">{data.applications.length}</div>
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

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading applicants...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-2xl">
                        <p className="text-muted-foreground">No applicants found.</p>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Applicant</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">Phone</th>
                                        <th className="px-4 py-3 text-left">Job</th>
                                        <th className="px-4 py-3 text-left">Resume</th>
                                        <th className="px-4 py-3 text-left">Applied</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Update</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((app) => (
                                        <tr key={app._id} className="border-t border-border hover:bg-white/5">
                                            <td className="px-4 py-3 text-foreground font-medium">
                                                {app.applicant?.fullname || '\u2014'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{app.applicant?.email || '\u2014'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{app.applicant?.phoneNumber || '\u2014'}</td>
                                            <td className="px-4 py-3 text-foreground">{app.job?.title || '\u2014'}</td>
                                            <td className="px-4 py-3">
                                                {app.applicant?.profile?.resume ? (
                                                    <a
                                                        href={app.applicant.profile.resume}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground">None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs border capitalize ${statusBadgeClass(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => updateStatus(app._id, e.target.value)}
                                                    className="rounded-md border border-border bg-white/5 px-2 py-1 text-xs text-foreground"
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterApplicants;
