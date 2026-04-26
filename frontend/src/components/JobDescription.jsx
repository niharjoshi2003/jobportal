import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Calendar, Briefcase, DollarSign, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, BOOKMARK_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { setUser } from '@/redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const applicantIdOf = (a) => {
    if (!a) return null;
    if (typeof a === 'string') return a;
    if (a.applicant) {
        return typeof a.applicant === 'string' ? a.applicant : a.applicant?._id || null;
    }
    return a._id || null;
};

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const computeIsApplied = (job) =>
        !!job?.applications?.some(a => applicantIdOf(a) === user?._id);
    const [isApplied, setIsApplied] = useState(computeIsApplied(singleJob));
    const isBookmarked = user?.bookmarkedJobs?.includes(singleJob?._id);
    const isStudent = user?.role === 'student';

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Application failed");
        }
    };

    const handleBookmark = async () => {
        try {
            const res = await axios.put(`${BOOKMARK_API_END_POINT}/toggle/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                const updatedBookmarks = res.data.bookmarked
                    ? [...(user.bookmarkedJobs || []), jobId]
                    : (user.bookmarkedJobs || []).filter(id => id !== jobId);
                dispatch(setUser({ ...user, bookmarkedJobs: updatedBookmarks }));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(computeIsApplied(res.data.job));
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    return (
        <div className="max-w-4xl animate-fade-in">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft size={16} />Back
            </button>

            {/* Header */}
            <div className="glass-card rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-foreground mb-3">{singleJob?.title}</h1>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-blue-500/10 text-blue-400 border-0">{singleJob?.position} Positions</Badge>
                            <Badge className="bg-purple-500/10 text-purple-400 border-0">{singleJob?.jobType}</Badge>
                            <Badge className="bg-green-500/10 text-green-400 border-0">{singleJob?.salary} LPA</Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleBookmark} className="p-2.5 rounded-lg border border-border hover:bg-white/10 transition-colors">
                            {isBookmarked ? <BookmarkCheck size={18} className="text-primary" /> : <Bookmark size={18} className="text-muted-foreground" />}
                        </button>
                        <button className="p-2.5 rounded-lg border border-border hover:bg-white/10 text-muted-foreground transition-colors">
                            <Share2 size={18} />
                        </button>
                        {isStudent && (
                            <Button
                                onClick={isApplied ? null : applyJobHandler}
                                disabled={isApplied}
                                className={`px-6 ${isApplied ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white'}`}
                            >
                                {isApplied ? 'Already Applied' : 'Apply Now'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-3 border-b border-border">Job Description</h2>
                <div className="space-y-4">
                    {[
                        { icon: Briefcase, label: 'Role', value: singleJob?.title },
                        { icon: MapPin, label: 'Location', value: singleJob?.location },
                        { icon: null, label: 'Description', value: singleJob?.description },
                        { icon: Clock, label: 'Experience', value: `${singleJob?.experienceLevel} yrs` },
                        { icon: DollarSign, label: 'Salary', value: `${singleJob?.salary} LPA` },
                        { icon: Users, label: 'Total Applicants', value: singleJob?.applications?.length },
                        { icon: Calendar, label: 'Posted Date', value: singleJob?.createdAt?.split("T")[0] },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">{item.label}:</span>
                            <span className="text-sm text-muted-foreground">{item.value}</span>
                        </div>
                    ))}

                    {singleJob?.requirements?.length > 0 && (
                        <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Requirements:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {singleJob.requirements.map((req, i) => (
                                    <Badge key={i} className="bg-white/5 text-muted-foreground border-0 text-xs">{req}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {singleJob?.deadline && (
                        <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Deadline:</span>
                            <span className="text-sm text-muted-foreground">{new Date(singleJob.deadline).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDescription;
