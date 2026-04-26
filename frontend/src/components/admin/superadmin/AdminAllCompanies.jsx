import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import AdminShell from './AdminShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Avatar, AvatarImage } from '../../ui/avatar';

const AdminAllCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [verified, setVerified] = useState('');

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (verified) params.set('verified', verified);
            const res = await axios.get(`${ADMIN_API_END_POINT}/companies?${params}`, { withCredentials: true });
            if (res.data.success) setCompanies(res.data.companies);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCompanies(); /* eslint-disable-next-line */ }, [verified]);

    const toggleVerify = async (id, next) => {
        try {
            const res = await axios.patch(`${ADMIN_API_END_POINT}/companies/${id}/verify`, { verified: next }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchCompanies();
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update');
        }
    };

    const deleteCompany = async (id, name) => {
        if (!window.confirm(`Delete company "${name}"? All its jobs, internships, and applications will be removed too.`)) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/companies/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchCompanies();
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete');
        }
    };

    return (
        <AdminShell title="Companies" subtitle="Approve, manage, and remove company accounts">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <form onSubmit={(e) => { e.preventDefault(); fetchCompanies(); }} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-72">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by name..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </form>
                <select
                    value={verified}
                    onChange={(e) => setVerified(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                >
                    <option value="">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Pending</option>
                </select>
                <span className="text-sm text-muted-foreground">{companies.length} companies</span>
            </div>

            <div className="glass-card rounded-xl p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                        ) : companies.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No companies found</TableCell></TableRow>
                        ) : companies.map(c => (
                            <TableRow key={c._id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {c.logo ? (
                                            <Avatar className="w-8 h-8 rounded-md"><AvatarImage src={c.logo} /></Avatar>
                                        ) : (
                                            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {c.name?.charAt(0) || 'C'}
                                            </div>
                                        )}
                                        <span className="font-medium">{c.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {c.userId?.fullname || '-'}<br />
                                    <span className="text-xs">{c.userId?.email}</span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{c.location || '-'}</TableCell>
                                <TableCell>
                                    {c.verified ? (
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400 inline-flex items-center gap-1">
                                            <ShieldCheck size={12} /> Verified
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400">Pending</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{c.createdAt?.split('T')[0]}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {c.verified ? (
                                            <button
                                                onClick={() => toggleVerify(c._id, false)}
                                                className="px-2 py-1 rounded-md text-xs bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 inline-flex items-center gap-1"
                                            >
                                                <ShieldOff size={12} /> Revoke
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => toggleVerify(c._id, true)}
                                                className="px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 inline-flex items-center gap-1"
                                            >
                                                <ShieldCheck size={12} /> Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteCompany(c._id, c.name)}
                                            className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400"
                                            title="Delete company"
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

export default AdminAllCompanies;
