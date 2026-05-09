import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Trash2, ShieldCheck, ShieldOff, KeyRound, Copy, Plus, Briefcase } from 'lucide-react';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import AdminShell from './AdminShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Avatar, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';

const AdminAllCompanies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [verified, setVerified] = useState('');
    const [credentials, setCredentials] = useState(null); // { companyName, email, password }
    const [resettingId, setResettingId] = useState(null);

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

    const resetRecruiterPassword = async (id, name) => {
        if (!window.confirm(
            `Reset the recruiter password for "${name}"?\n\nThe old password will stop working immediately. ` +
            `A new one will be generated and shown once \u2014 share it with the recruiter through a secure channel.`
        )) return;
        try {
            setResettingId(id);
            const res = await axios.post(
                `${ADMIN_API_END_POINT}/companies/${id}/reset-recruiter-password`,
                {},
                { withCredentials: true }
            );
            if (res.data?.success) {
                toast.success('Recruiter password reset.');
                setCredentials({
                    companyName: name,
                    email: res.data.credentials.email,
                    password: res.data.credentials.password,
                });
            } else {
                toast.error(res.data?.message || 'Failed to reset password.');
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to reset password.');
        } finally {
            setResettingId(null);
        }
    };

    const copyCredentials = async () => {
        if (!credentials) return;
        const text = `Company: ${credentials.companyName}\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nLogin: ${window.location.origin}/portal-login`;
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Credentials copied to clipboard.');
        } catch {
            toast.error('Could not copy. Please select and copy manually.');
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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                    Register a new partner company &mdash; the system will create the recruiter login automatically.
                </p>
                <Link
                    to="/admin/companies/create"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow shadow-primary/20"
                >
                    <Plus size={16} />
                    Register New Company
                </Link>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 mb-4 text-xs text-muted-foreground">
                <span className="text-blue-300 font-medium">Recruiter credentials:</span>{' '}
                The recruiter's login email is shown next to each company. Passwords are stored
                hashed and cannot be viewed again after creation, but you can issue a new one anytime
                by clicking <span className="text-foreground font-medium">Reset Password</span>.
            </div>

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
                            <TableHead>Recruiter</TableHead>
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
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Plus size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">No companies registered yet</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Add your first partner company to start posting jobs.
                                            </p>
                                        </div>
                                        <Link
                                            to="/admin/companies/create"
                                            className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90"
                                        >
                                            <Plus size={14} /> Register New Company
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
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
                                <TableCell className="text-sm">
                                    <div className="text-foreground">{c.userId?.fullname || '-'}</div>
                                    {c.userId?.email && (
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-xs text-muted-foreground font-mono">{c.userId.email}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(c.userId.email);
                                                    toast.success('Email copied');
                                                }}
                                                className="p-0.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                                title="Copy recruiter email"
                                            >
                                                <Copy size={11} />
                                            </button>
                                        </div>
                                    )}
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
                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                        <button
                                            onClick={() => navigate(`/admin/jobs/create?companyId=${c._id}`)}
                                            className="px-2 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 inline-flex items-center gap-1"
                                            title="Post a new job for this company"
                                        >
                                            <Briefcase size={12} />
                                            Post Job
                                        </button>
                                        <button
                                            onClick={() => resetRecruiterPassword(c._id, c.name)}
                                            disabled={resettingId === c._id || !c.userId}
                                            className="px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 inline-flex items-center gap-1 disabled:opacity-50"
                                            title="Generate a new recruiter password"
                                        >
                                            <KeyRound size={12} />
                                            {resettingId === c._id ? 'Resetting...' : 'Reset Password'}
                                        </button>
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

            {credentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="bg-background border border-border rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-foreground">New Recruiter Credentials</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            New password for <strong className="text-foreground">{credentials.companyName}</strong>.
                            Copy and share these credentials with the recruiter through a secure channel.
                            <span className="text-amber-300"> The password will not be shown again.</span>
                        </p>
                        <div className="mt-4 p-4 rounded-lg bg-white/5 border border-border space-y-2 font-mono text-sm">
                            <div><span className="text-muted-foreground">Email: </span><span className="text-foreground">{credentials.email}</span></div>
                            <div><span className="text-muted-foreground">Password: </span><span className="text-primary">{credentials.password}</span></div>
                            <div><span className="text-muted-foreground">Login: </span><span className="text-foreground text-xs">{window.location.origin}/portal-login</span></div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <Button onClick={copyCredentials} className="flex-1">Copy</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setCredentials(null)}>
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

export default AdminAllCompanies;
