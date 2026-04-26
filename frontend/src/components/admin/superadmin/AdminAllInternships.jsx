import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Trash2, ShieldCheck } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import AdminShell from './AdminShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

const AdminAllInternships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            const res = await axios.get(`${ADMIN_API_END_POINT}/internships?${params}`, { withCredentials: true });
            if (res.data.success) setInternships(res.data.internships);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load internships');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

    const deleteInternship = async (id, title) => {
        if (!window.confirm(`Delete internship "${title}"? Its applications will be removed too.`)) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/internships/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchData();
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete');
        }
    };

    return (
        <AdminShell title="Internships" subtitle="All internships across the platform">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-72">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by title..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </form>
                <span className="text-sm text-muted-foreground">{internships.length} internships</span>
            </div>

            <div className="glass-card rounded-xl p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Posted by</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                        ) : internships.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No internships found</TableCell></TableRow>
                        ) : internships.map(i => (
                            <TableRow key={i._id}>
                                <TableCell className="font-medium">{i.title}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <span>{i.company?.name || '-'}</span>
                                        {i.company?.verified && <ShieldCheck size={12} className="text-green-400" />}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {i.created_by?.fullname || '-'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{i.location}</TableCell>
                                <TableCell>
                                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                        i.status === 'open' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                                    }`}>{i.status}</span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{i.deadline ? new Date(i.deadline).toLocaleDateString() : '-'}</TableCell>
                                <TableCell className="text-right">
                                    <button
                                        onClick={() => deleteInternship(i._id, i.title)}
                                        className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400"
                                        title="Delete internship"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AdminShell>
    );
};

export default AdminAllInternships;
