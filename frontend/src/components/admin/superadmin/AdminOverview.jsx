import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Users, Building2, Briefcase, GraduationCap, FileText, ShieldCheck, Clock, TrendingUp, UserCheck } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import AdminShell from './AdminShell';

const StatCard = ({ icon: Icon, label, value, sub, color = 'primary' }) => (
    <div className="glass-card rounded-xl p-5">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value ?? 0}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            <div className={`p-2.5 rounded-lg bg-${color}/10`}>
                <Icon size={20} className={`text-${color}`} />
            </div>
        </div>
    </div>
);

const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${ADMIN_API_END_POINT}/stats`, { withCredentials: true });
                if (res.data.success) setStats(res.data.stats);
            } catch (e) {
                setError(e.response?.data?.message || 'Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <AdminShell title="Overview" subtitle="Site-wide stats at a glance">
            {loading ? (
                <p className="text-muted-foreground">Loading...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : (
                <div className="space-y-6">
                    {stats?.users?.pendingStudents > 0 && (
                        <Link
                            to="/admin/pending-students"
                            className="block rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 hover:bg-amber-500/15 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-amber-500/20">
                                        <UserCheck size={20} className="text-amber-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-200">
                                            {stats.users.pendingStudents} student{stats.users.pendingStudents === 1 ? '' : 's'} awaiting your approval
                                        </p>
                                        <p className="text-xs text-amber-300/80 mt-0.5">
                                            Review their college and roll number, then approve or reject.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-amber-200 font-medium">Review &rarr;</span>
                            </div>
                        </Link>
                    )}

                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Users</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard icon={Users} label="Total Users" value={stats?.users?.total} color="primary" />
                            <StatCard icon={Users} label="Students" value={stats?.users?.students} sub={`${stats?.users?.pendingStudents || 0} pending approval`} color="blue-400" />
                            <StatCard icon={Users} label="Recruiters" value={stats?.users?.recruiters} color="purple-400" />
                            <StatCard icon={ShieldCheck} label="Admins" value={stats?.users?.admins} color="pink-400" />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Marketplace</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard icon={Building2} label="Companies" value={stats?.companies?.total} sub={`${stats?.companies?.verified || 0} verified, ${stats?.companies?.pending || 0} pending`} color="primary" />
                            <StatCard icon={Briefcase} label="Jobs Posted" value={stats?.jobs?.total} color="emerald-400" />
                            <StatCard icon={GraduationCap} label="Internships" value={stats?.internships?.total} color="indigo-400" />
                            <StatCard icon={FileText} label="Applications" value={(stats?.applications?.jobs || 0) + (stats?.applications?.internships || 0)} sub={`${stats?.applications?.jobs || 0} jobs · ${stats?.applications?.internships || 0} internships`} color="orange-400" />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Clock size={14} /> Last 7 days
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard icon={TrendingUp} label="New Users" value={stats?.lastWeek?.users} color="primary" />
                            <StatCard icon={TrendingUp} label="New Jobs" value={stats?.lastWeek?.jobs} color="emerald-400" />
                            <StatCard icon={TrendingUp} label="New Internships" value={stats?.lastWeek?.internships} color="indigo-400" />
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

export default AdminOverview;
