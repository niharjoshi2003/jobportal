import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, Briefcase, DollarSign, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage } from '../ui/avatar';
import { setUser } from '@/redux/authSlice';
import { BOOKMARK_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const tabs = [
    { key: 'open', label: 'Open' },
    { key: 'bookmarked', label: 'Bookmarked' },
    { key: 'applied', label: 'Applied' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'selected', label: 'Selected' },
];

const locationFilters = ['All', 'Japan', 'Remote', 'India', 'USA'];
const typeFilters = ['All', 'Full Time', 'Part Time', 'Contract'];

const JobCard = ({ job, isApplied, isBookmarked, onBookmarkToggle }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/description/${job?._id}`)}
            className="glass-card rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-all duration-200 group relative"
        >
            {isApplied && (
                <Badge className="absolute top-3 right-3 bg-green-500/20 text-green-400 border-0 text-[10px]">
                    Applied
                </Badge>
            )}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                        {job?.company?.logo ? (
                            <Avatar className="w-10 h-10 rounded-lg">
                                <AvatarImage src={job.company.logo} />
                            </Avatar>
                        ) : (
                            <span className="text-sm font-bold text-primary">{job?.company?.name?.charAt(0) || 'C'}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{job?.company?.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            <span>{job?.location || '-'}</span>
                        </div>
                    </div>
                </div>
                {!isApplied && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onBookmarkToggle(job._id); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {isBookmarked ? <BookmarkCheck size={18} className="text-primary" /> : <Bookmark size={18} className="text-muted-foreground" />}
                    </button>
                )}
            </div>
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{job?.title}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{job?.description}</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {job?.jobType && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Briefcase size={12} />
                        <span>{job.jobType}</span>
                    </div>
                )}
                {job?.salary !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <DollarSign size={12} />
                        <span>{job.salary} LPA</span>
                    </div>
                )}
                {job?.position > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{job.position} openings</span>
                    </div>
                )}
            </div>
            {job?.deadline && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>Closes {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
};

const JobsPage = () => {
    useGetAllJobs();
    useGetAppliedJobs();

    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { allJobs, allAppliedJobs } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'open');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [locationFilter, setLocationFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tabs.find(t => t.key === tab)) setActiveTab(tab);
    }, [searchParams]);

    const appliedJobIds = (allAppliedJobs || []).map(app => app.job?._id).filter(Boolean);
    const bookmarkedIds = user?.bookmarkedJobs || [];

    const handleBookmarkToggle = async (jobId) => {
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

    const getFiltered = () => {
        let filtered = [...(allJobs || [])];

        if (searchQuery) {
            filtered = filtered.filter(j =>
                j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                j.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                j.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (locationFilter !== 'All') {
            filtered = filtered.filter(j => j.location?.toLowerCase().includes(locationFilter.toLowerCase()));
        }
        if (typeFilter !== 'All') {
            filtered = filtered.filter(j => j.jobType?.toLowerCase() === typeFilter.toLowerCase());
        }

        switch (activeTab) {
            case 'bookmarked':
                return filtered.filter(j => bookmarkedIds.includes(j._id));
            case 'applied':
                return filtered.filter(j => appliedJobIds.includes(j._id));
            case 'shortlisted':
                return (allAppliedJobs || []).filter(a => a.status === 'shortlisted').map(a => a.job).filter(Boolean);
            case 'selected':
                return (allAppliedJobs || []).filter(a => a.status === 'accepted').map(a => a.job).filter(Boolean);
            case 'open':
            default:
                return filtered.filter(j => {
                    if (j.deadline) return new Date(j.deadline) >= new Date();
                    return true;
                });
        }
    };

    const filteredJobs = getFiltered();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
                    <p className="text-sm text-muted-foreground mt-1">Find your next full-time role</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-64">
                        <Search size={16} className="text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')}><X size={14} className="text-muted-foreground" /></button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2.5 rounded-lg border transition-colors ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="glass-card rounded-xl p-4 flex flex-wrap gap-6">
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Location</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {locationFilters.map(loc => (
                                        <button key={loc} onClick={() => setLocationFilter(loc)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${locationFilter === loc ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'}`}>
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Type</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {typeFilters.map(t => (
                                        <button key={t} onClick={() => setTypeFilter(t)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchParams({ tab: tab.key }); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {filteredJobs.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">No jobs found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map(job => (
                        <motion.div key={job._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                            <JobCard
                                job={job}
                                isApplied={appliedJobIds.includes(job._id)}
                                isBookmarked={bookmarkedIds.includes(job._id)}
                                onBookmarkToggle={handleBookmarkToggle}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobsPage;
