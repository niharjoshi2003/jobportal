import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useSelector } from 'react-redux';

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);

    const statusColors = {
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        shortlisted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableCaption className="text-muted-foreground">A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Date</TableHead>
                        <TableHead className="text-muted-foreground">Job Role</TableHead>
                        <TableHead className="text-muted-foreground">Company</TableHead>
                        <TableHead className="text-muted-foreground">Applied Via</TableHead>
                        <TableHead className="text-right text-muted-foreground">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allAppliedJobs.length <= 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                You haven't applied to any jobs yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id} className="border-border hover:bg-white/5">
                                <TableCell className="text-foreground text-sm">{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell className="text-foreground text-sm font-medium">{appliedJob.job?.title}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{appliedJob.job?.company?.name}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {appliedJob.applicationSource === 'external' ? 'Company Site' : 'Job-O-Hire'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge className={`border ${statusColors[appliedJob?.status] || statusColors.pending}`}>
                                        {appliedJob.status?.toUpperCase()}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AppliedJobTable;
