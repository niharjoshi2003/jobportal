import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Check, X } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import AdminShell from './AdminShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

const StatusBadge = ({ status }) => {
    const cls = status === 'approved' ? 'bg-green-500/15 text-green-400'
        : status === 'rejected' ? 'bg-red-500/15 text-red-400'
        : 'bg-amber-500/15 text-amber-400';
    return <span className={`text-xs px-2 py-1 rounded-full capitalize ${cls}`}>{status || 'pending'}</span>;
};

const AdminPendingStudents = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('role', 'student');
            if (statusFilter) params.set('status', statusFilter);
            if (q) params.set('q', q);
            const res = await axios.get(`${ADMIN_API_END_POINT}/users?${params}`, { withCredentials: true });
            if (res.data.success) setUsers(res.data.users);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); /* eslint-disable-next-line */ }, [statusFilter]);

    const onSearchSubmit = (e) => { e.preventDefault(); fetchUsers(); };

    const approve = async (userId, name) => {
        if (!window.confirm(`Approve "${name}"? They will be able to log in immediately.`)) return;
        try {
            const res = await axios.patch(
                `${ADMIN_API_END_POINT}/users/${userId}/approve`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to approve student');
        }
    };

    const reject = async (userId, name) => {
        const reason = window.prompt(`Reject "${name}"? Optionally enter a reason (shown to the student on login).`, '');
        if (reason === null) return;
        try {
            const res = await axios.patch(
                `${ADMIN_API_END_POINT}/users/${userId}/reject`,
                { reason },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to reject student');
        }
    };

    return (
        <AdminShell title="Pending Approvals" subtitle="Review and approve student registrations">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <form onSubmit={onSearchSubmit} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-72">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search name, email, college, roll no..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="">All</option>
                </select>
                <span className="text-sm text-muted-foreground">{users.length} students</span>
            </div>

            <div className="glass-card rounded-xl p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>College</TableHead>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Signed Up</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No students found</TableCell></TableRow>
                        ) : users.map(u => (
                            <TableRow key={u._id}>
                                <TableCell className="font-medium">{u.fullname}</TableCell>
                                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                <TableCell className="text-muted-foreground">{u.phoneNumber}</TableCell>
                                <TableCell className="text-muted-foreground">{u.college || '—'}</TableCell>
                                <TableCell className="text-muted-foreground">{u.rollNumber || '—'}</TableCell>
                                <TableCell><StatusBadge status={u.status} /></TableCell>
                                <TableCell className="text-muted-foreground">{u.createdAt?.split('T')[0]}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {u.status !== 'approved' && (
                                            <button
                                                onClick={() => approve(u._id, u.fullname)}
                                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                title="Approve student"
                                            >
                                                <Check size={14} /> Approve
                                            </button>
                                        )}
                                        {u.status !== 'rejected' && (
                                            <button
                                                onClick={() => reject(u._id, u.fullname)}
                                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                title="Reject student"
                                            >
                                                <X size={14} /> Reject
                                            </button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AdminShell>
    );
};

export default AdminPendingStudents;
