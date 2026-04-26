import React, { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Clock, Users, Calendar, Briefcase, Share2,
    Bookmark, BookmarkCheck, Globe2,
} from 'lucide-react';
import axios from 'axios';
import { INTERNSHIP_API_END_POINT, BOOKMARK_API_END_POINT } from '@/utils/constant';
import { setSingleInternship } from '@/redux/internshipSlice';
import { setUser } from '@/redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const applicantId = (a) => {
    // applications may be stored as raw applicant ids, populated objects,
    // or { applicant: id|object } records. Normalize to a string id.
    if (!a) return null;
    if (typeof a === 'string') return a;
    if (a.applicant) {
        return typeof a.applicant === 'string' ? a.applicant : a.applicant?._id || null;
    }
    return a._id || null;
};

const InternshipDescription = () => {
    const { singleInternship } = useSelector(store => store.internship);
    const { user } = useSelector(store => store.auth);
    const params = useParams();
    const internshipId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const computeIsApplied = (intern) =>
        !!intern?.applications?.some(a => applicantId(a) === user?._id);

    const [isApplied, setIsApplied] = useState(computeIsApplied(singleInternship));
    const isBookmarked = user?.bookmarkedJobs?.includes(singleInternship?._id);

    const applyHandler = async () => {
        try {
            const res = await axios.get(`${INTERNSHIP_API_END_POINT}/apply/${internshipId}`, { withCredentials: true });
            if (res.data.success) {
                setIsApplied(true);
                const updated = {
                    ...singleInternship,
                    applications: [...(singleInternship?.applications || []), { applicant: user?._id }],
                };
                dispatch(setSingleInternship(updated));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Application failed");
        }
    };

    const handleBookmark = async () => {
        try {
            const res = await axios.put(`${BOOKMARK_API_END_POINT}/toggle/${internshipId}`, {}, { withCredentials: true });
            if (res.data.success) {
                const updatedBookmarks = res.data.bookmarked
                    ? [...(user.bookmarkedJobs || []), internshipId]
                    : (user.bookmarkedJobs || []).filter(id => id !== internshipId);
                dispatch(setUser({ ...user, bookmarkedJobs: updatedBookmarks }));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchInternship = async () => {
            try {
                const res = await axios.get(`${INTERNSHIP_API_END_POINT}/get/${internshipId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleInternship(res.data.internship));
                    setIsApplied(computeIsApplied(res.data.internship));
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchInternship();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [internshipId, dispatch, user?._id]);

    const compensationText = (() => {
        const c = singleInternship?.compensation;
        if (!c || c.type === 'TBA' || !c.amount) return 'TBA';
        return `${Number(c.amount).toLocaleString()} ${c.currency || 'JPY'}`;
    })();

    const isStudent = user?.role === 'student';

    return (
        <div className="max-w-4xl animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft size={16} />Back
            </button>

            <div className="glass-card rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-foreground mb-3">{singleInternship?.title}</h1>
                        <div className="flex flex-wrap items-center gap-2">
                            {singleInternship?.openings > 0 && (
                                <Badge className="bg-blue-500/10 text-blue-400 border-0">{singleInternship.openings} Openings</Badge>
                            )}
                            {singleInternship?.locationType && (
                                <Badge className="bg-purple-500/10 text-purple-400 border-0">{singleInternship.locationType}</Badge>
                            )}
                            <Badge className="bg-green-500/10 text-green-400 border-0">{compensationText}</Badge>
                            {singleInternship?.status && (
                                <Badge className={`border-0 ${singleInternship.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {singleInternship.status}
                                </Badge>
                            )}
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
                                onClick={isApplied ? null : applyHandler}
                                disabled={isApplied}
                                className={`px-6 ${isApplied ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white'}`}
                            >
                                {isApplied ? 'Already Applied' : 'Apply Now'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-3 border-b border-border">Internship Details</h2>
                <div className="space-y-4">
                    {[
                        { icon: Briefcase, label: 'Role', value: singleInternship?.title },
                        { icon: MapPin, label: 'Location', value: singleInternship?.location },
                        { icon: Globe2, label: 'Mode', value: singleInternship?.locationType },
                        { icon: null, label: 'Description', value: singleInternship?.description },
                        {
                            icon: Clock,
                            label: 'Duration',
                            value: singleInternship?.duration?.value
                                ? `${singleInternship.duration.value} ${singleInternship.duration.unit || 'days'}`
                                : null,
                        },
                        { icon: null, label: 'Compensation', value: compensationText },
                        { icon: Users, label: 'Total Applicants', value: singleInternship?.applications?.length },
                        { icon: Calendar, label: 'Posted Date', value: singleInternship?.createdAt?.split("T")[0] },
                    ].filter(item => item.value).map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">{item.label}:</span>
                            <span className="text-sm text-muted-foreground">{item.value}</span>
                        </div>
                    ))}

                    {singleInternship?.requirements?.length > 0 && (
                        <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Requirements:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {singleInternship.requirements.map((req, i) => (
                                    <Badge key={i} className="bg-white/5 text-muted-foreground border-0 text-xs">{req}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {singleInternship?.eligibility?.length > 0 && (
                        <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Eligibility:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {singleInternship.eligibility.map((e, i) => (
                                    <Badge key={i} className="bg-white/5 text-muted-foreground border-0 text-xs">{e}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {singleInternship?.deadline && (
                        <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Deadline:</span>
                            <span className="text-sm text-muted-foreground">{new Date(singleInternship.deadline).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InternshipDescription;
