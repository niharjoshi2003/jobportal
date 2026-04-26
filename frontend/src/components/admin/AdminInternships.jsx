import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Eye, MoreHorizontal, ArrowLeft } from 'lucide-react';
import useGetAllAdminInternships from '@/hooks/useGetAllAdminInternships';

const AdminInternships = () => {
    useGetAllAdminInternships();
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();
    const { allAdminInternships } = useSelector(store => store.internship);

    const filtered = (allAdminInternships || []).filter(i =>
        !filter ||
        i.title?.toLowerCase().includes(filter.toLowerCase()) ||
        i.company?.name?.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/admin/companies')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft size={16} />Back
                </button>
                <div className="flex items-center justify-between my-5">
                    <Input
                        className="w-fit bg-white/5 border-border text-foreground"
                        placeholder="Filter by title, company"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => navigate('/admin/internships/create')}>New Internship</Button>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <Table>
                        <TableCaption>Internships you have posted</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Applicants</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((i) => (
                                <TableRow key={i._id}>
                                    <TableCell>{i.company?.name || '-'}</TableCell>
                                    <TableCell>{i.title}</TableCell>
                                    <TableCell>{i.location}</TableCell>
                                    <TableCell>{i.deadline ? new Date(i.deadline).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell>{i.applications?.length || 0}</TableCell>
                                    <TableCell className="text-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                            <PopoverContent className="w-40">
                                                <div onClick={() => navigate(`/admin/internships/${i._id}/applicants`)} className="flex items-center gap-2 cursor-pointer">
                                                    <Eye className="w-4" />
                                                    <span>Applicants</span>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                        No internships posted yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default AdminInternships;
