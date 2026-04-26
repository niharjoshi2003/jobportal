import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { INTERNSHIP_API_END_POINT } from '@/utils/constant';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const STATUS_OPTIONS = ['pending', 'shortlisted', 'accepted', 'rejected'];

const InternshipApplicants = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${INTERNSHIP_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
            if (res.data.success) setInternship(res.data.internship);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load applicants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const updateStatus = async (status, applicationId) => {
        try {
            const res = await axios.post(`${INTERNSHIP_API_END_POINT}/status/${applicationId}/update`, { status }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchApplicants();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const apps = internship?.applications || [];

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/admin/internships')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft size={16} />Back to internships
                </button>

                <h1 className="font-bold text-xl mb-1 text-foreground">{internship?.title || 'Internship'} - Applicants</h1>
                <p className="text-sm text-muted-foreground mb-5">{apps.length} applicant{apps.length === 1 ? '' : 's'}</p>

                <div className="glass-card rounded-xl p-4">
                    <Table>
                        <TableCaption>Applicants for this internship</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Resume</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Applied On</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Loading...</TableCell></TableRow>
                            ) : apps.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No applicants yet.</TableCell></TableRow>
                            ) : apps.map(item => (
                                <TableRow key={item._id}>
                                    <TableCell>{item?.applicant?.fullname}</TableCell>
                                    <TableCell>{item?.applicant?.email}</TableCell>
                                    <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                                    <TableCell>
                                        {item?.applicant?.profile?.resume
                                            ? <a className="text-blue-400 hover:underline" href={item.applicant.profile.resume} target="_blank" rel="noopener noreferrer">{item.applicant.profile.resumeOriginalName || 'Resume'}</a>
                                            : <span className="text-muted-foreground">NA</span>}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                            item.status === 'accepted' ? 'bg-green-500/10 text-green-400' :
                                            item.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                            item.status === 'shortlisted' ? 'bg-yellow-500/10 text-yellow-400' :
                                            'bg-blue-500/10 text-blue-400'
                                        }`}>{item.status}</span>
                                    </TableCell>
                                    <TableCell>{item?.createdAt?.split('T')[0]}</TableCell>
                                    <TableCell className="text-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                            <PopoverContent className="w-36">
                                                {STATUS_OPTIONS.map(s => (
                                                    <div key={s} onClick={() => updateStatus(s, item._id)} className="flex items-center my-1 cursor-pointer text-sm capitalize hover:text-primary">
                                                        {s}
                                                    </div>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default InternshipApplicants;
