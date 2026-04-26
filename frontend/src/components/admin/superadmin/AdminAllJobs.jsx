import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Trash2, ShieldCheck } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import AdminShell from './AdminShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

const AdminAllJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            const res = await axios.get(`${ADMIN_API_END_POINT}/jobs?${params}`, { withCredentials: true });
            if (res.data.success) setJobs(res.data.jobs);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); /* eslint-disable-next-line */ }, []);

    const deleteJob = async (id, title) => {
        if (!window.confirm(`Delete job "${title}"? Its applications will be removed too.`)) return;
        try {
            const res = await axios.delete(`${ADMIN_API_END_POINT}/jobs/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchJobs();
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete');
        }
    };

    return (
        <AdminShell title="Jobs" subtitle="All jobs across the platform">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-72">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by title..."
                        className="bg-transparent text-sm text-foreground outline-none w-full"
                    />
                </form>
                <span className="text-sm text-muted-foreground">{jobs.length} jobs</span>
            </div>

            <div className="glass-card rounded-xl p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Posted by</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Salary</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No jobs found</TableCell></TableRow>
                        ) : jobs.map(j => (
                            <TableRow key={j._id}>
                                <TableCell className="font-medium">{j.title}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <span>{j.company?.name || '-'}</span>
                                        {j.company?.verified && <ShieldCheck size={12} className="text-green-400" />}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {j.created_by?.fullname || '-'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{j.location}</TableCell>
                                <TableCell className="text-muted-foreground">{j.salary} LPA</TableCell>
                                <TableCell className="text-muted-foreground">{j.createdAt?.split('T')[0]}</TableCell>
                                <TableCell className="text-right">
                                    <button
                                        onClick={() => deleteJob(j._id, j.title)}
                                        className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400"
                                        title="Delete job"
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

export default AdminAllJobs;
