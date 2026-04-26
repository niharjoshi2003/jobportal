import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Trash2, ChevronDown } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import AdminShell from './AdminShell';
import { Input } from '../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

const ROLES = ['student', 'recruiter', 'admin'];

const RoleBadge = ({ role }) => {
    const cls = role === 'admin' ? 'bg-pink-500/15 text-pink-400'
        : role === 'recruiter' ? 'bg-purple-500/15 text-purple-400'
        : 'bg-blue-500/15 text-blue-400';
    return <span className={`text-xs px-2 py-1 rounded-full capitalize ${cls}`}>{role}</span>;
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (roleFilter) params.set('role', roleFilter);
            const res = await axios.get(`${ADMIN_API_END_POINT}/users?${params}`, { withCredentials: true });
            if (res.data.success) setUsers(res.data.users);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); /* eslint-disable-next-line */ }, [roleFilter]);

    const onSearchSubmit = (e) => { e.preventDefault(); fetchUsers(); };

    const changeRole = async (userId, newRole) => {
        if (!window.confirm(`Change role to "${newRole}"?`)) return;
        try {
            const res = await axios.patch(`${ADMIN_API_END_POINT}/users/${userId}/role`, { role: newRole }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update role');
        }
    };

    const deleteUser = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/users/${userId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <AdminShell title="Users" subtitle="Manage all platform users">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <form onSubmit={onSearchSubmit} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-72">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by name or email..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </form>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                >
                    <option value="">All roles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span className="text-sm text-muted-foreground">{users.length} users</span>
            </div>

            <div className="glass-card rounded-xl p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No users found</TableCell></TableRow>
                        ) : users.map(u => (
                            <TableRow key={u._id}>
                                <TableCell className="font-medium">{u.fullname}</TableCell>
                                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                <TableCell className="text-muted-foreground">{u.phoneNumber}</TableCell>
                                <TableCell><RoleBadge role={u.role} /></TableCell>
                                <TableCell className="text-muted-foreground">{u.createdAt?.split('T')[0]}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Popover>
                                            <PopoverTrigger className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 text-xs">
                                                Role <ChevronDown size={12} />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-32 p-1">
                                                {ROLES.filter(r => r !== u.role).map(r => (
                                                    <button
                                                        key={r}
                                                        onClick={() => changeRole(u._id, r)}
                                                        className="w-full text-left px-2 py-1.5 text-xs capitalize rounded-md hover:bg-white/5 text-foreground"
                                                    >
                                                        Set to {r}
                                                    </button>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                        <button
                                            onClick={() => deleteUser(u._id, u.fullname)}
                                            className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400"
                                            title="Delete user"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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

export default AdminUsers;
