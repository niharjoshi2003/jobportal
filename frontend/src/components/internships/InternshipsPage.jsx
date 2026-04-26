import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InternshipCard from './InternshipCard';
import useGetAllInternships from '@/hooks/useGetAllInternships';
import useGetAppliedInternships from '@/hooks/useGetAppliedInternships';

const tabs = [
    { key: 'open', label: 'Open' },
    { key: 'bookmarked', label: 'Bookmarked' },
    { key: 'closed', label: 'Closed' },
    { key: 'applied', label: 'Applied' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'selected', label: 'Selected' },
];

const locationFilters = ['All', 'Japan', 'Remote', 'India', 'USA'];
const typeFilters = ['All', 'Remote', 'On-site', 'Hybrid'];

const InternshipsPage = () => {
    useGetAllInternships();
    useGetAppliedInternships();

    const [searchParams, setSearchParams] = useSearchParams();
    const { allInternships, appliedInternships } = useSelector(store => store.internship);
    const { user } = useSelector(store => store.auth);

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'open');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [locationFilter, setLocationFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tabs.find(t => t.key === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const appliedInternshipIds = appliedInternships?.map(app => app.internship?._id).filter(Boolean) || [];
    const bookmarkedIds = user?.bookmarkedJobs || [];

    const getFilteredInternships = () => {
        let filtered = [...(allInternships || [])];

        if (searchQuery) {
            filtered = filtered.filter(i =>
                i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (locationFilter !== 'All') {
            filtered = filtered.filter(i =>
                i.location?.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        if (typeFilter !== 'All') {
            filtered = filtered.filter(i =>
                i.locationType?.toLowerCase() === typeFilter.toLowerCase()
            );
        }

        switch (activeTab) {
            case 'bookmarked':
                return filtered.filter(i => bookmarkedIds.includes(i._id));
            case 'applied':
                return filtered.filter(i => appliedInternshipIds.includes(i._id));
            case 'closed':
                return filtered.filter(i => {
                    if (i.status === 'closed') return true;
                    if (i.deadline) return new Date(i.deadline) < new Date();
                    return false;
                });
            case 'shortlisted':
                return appliedInternships
                    ?.filter(app => app.status === 'shortlisted')
                    .map(app => app.internship)
                    .filter(Boolean) || [];
            case 'selected':
                return appliedInternships
                    ?.filter(app => app.status === 'accepted')
                    .map(app => app.internship)
                    .filter(Boolean) || [];
            case 'open':
            default:
                return filtered.filter(i => {
                    if (i.status === 'closed') return false;
                    if (i.deadline) return new Date(i.deadline) >= new Date();
                    return true;
                });
        }
    };

    const filteredInternships = getFilteredInternships();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Internships</h1>
                    <p className="text-sm text-muted-foreground mt-1">Discover opportunities that match your skills</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border w-64">
                        <Search size={16} className="text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search internships..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')}>
                                <X size={14} className="text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2.5 rounded-lg border transition-colors ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card rounded-xl p-4 flex flex-wrap gap-6">
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Location</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {locationFilters.map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => setLocationFilter(loc)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${locationFilter === loc
                                                ? 'bg-primary text-white'
                                                : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
                                                }`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Type</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {typeFilters.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTypeFilter(t)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t
                                                ? 'bg-primary text-white'
                                                : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
                                                }`}
                                        >
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
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setSearchParams({ tab: tab.key });
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.key
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {filteredInternships.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">No internships found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredInternships.map((internship) => (
                        <motion.div
                            key={internship._id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <InternshipCard internship={internship} isApplied={appliedInternshipIds.includes(internship._id)} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InternshipsPage;
