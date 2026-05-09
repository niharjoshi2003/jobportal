import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useDispatch, useSelector } from 'react-redux';
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue
} from '../ui/select';
import axios from 'axios';
import { ADMIN_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setCompanies } from '@/redux/companySlice';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 1,
        companyId: "",
        companyName: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const preselectedCompanyId = searchParams.get('companyId') || '';

    const { companies } = useSelector(store => store.company);

    useEffect(() => {
        // Admin needs ALL companies in the picker, not just companies the
        // logged-in user owns (which is what /company/get returns).
        const fetchAll = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/companies`, { withCredentials: true });
                if (res.data?.success) dispatch(setCompanies(res.data.companies));
            } catch (e) {
                // Silently fall back to whatever's already in the store.
            }
        };
        fetchAll();
    }, [dispatch]);

    // Once companies arrive, lock in the pre-selected one (if a query param was
    // provided) so the admin lands directly on the right context.
    useEffect(() => {
        if (!preselectedCompanyId || !companies?.length) return;
        const match = companies.find(c => c._id === preselectedCompanyId);
        if (match && input.companyId !== match._id) {
            setInput(prev => ({ ...prev, companyId: match._id, companyName: match.name }));
        }
        // eslint-disable-next-line
    }, [companies, preselectedCompanyId]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (companyId) => {
        const selectedCompany = companies.find(c => c._id === companyId);
        setInput({
            ...input,
            companyId,
            companyName: selectedCompany?.name || "",
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.title || !input.description || !input.requirements ||
            input.salary === "" || !input.location || !input.jobType ||
            input.experience === "" || !input.companyId) {
            toast.error('Please fill in all required fields.');
            return;
        }
        if (Number(input.position) <= 0) {
            toast.error('Number of openings must be greater than 0.');
            return;
        }

        const payload = {
            title: input.title,
            description: input.description,
            requirements: input.requirements,
            salary: input.salary,
            location: input.location,
            jobType: input.jobType,
            experience: input.experience,
            position: input.position,
            companyId: input.companyId,
        };

        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, payload, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/all-jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post job.');
        } finally {
            setLoading(false);
        }
    };

    const hasCompanies = (companies?.length || 0) > 0;

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 my-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
                >
                    <ArrowLeft size={14} /> Back
                </button>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Post a New Job</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create a job opening for one of the registered companies. All approved students will be notified.
                    </p>
                    {input.companyName && preselectedCompanyId && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                            Posting for <span className="font-semibold">{input.companyName}</span>
                        </div>
                    )}
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    <section className="glass-card rounded-2xl p-6 space-y-4">
                        <h2 className="font-semibold text-foreground">Job Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Title *</Label>
                                <Input name="title" value={input.title} onChange={changeEventHandler}
                                    placeholder="e.g. Backend Engineer" />
                            </div>
                            <div>
                                <Label>Job Type *</Label>
                                <Input name="jobType" value={input.jobType} onChange={changeEventHandler}
                                    placeholder="Full Time / Part Time / Contract" />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Description *</Label>
                                <textarea
                                    name="description"
                                    value={input.description}
                                    onChange={changeEventHandler}
                                    rows={3}
                                    className="mt-1 w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                    placeholder="Describe the role, responsibilities, etc."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Requirements * (comma separated)</Label>
                                <Input name="requirements" value={input.requirements} onChange={changeEventHandler}
                                    placeholder="React, Node.js, MongoDB" />
                            </div>
                            <div>
                                <Label>Salary (LPA) *</Label>
                                <Input type="number" name="salary" value={input.salary}
                                    onChange={changeEventHandler} placeholder="12" min="0" />
                            </div>
                            <div>
                                <Label>Location *</Label>
                                <Input name="location" value={input.location} onChange={changeEventHandler}
                                    placeholder="Tokyo, Japan" />
                            </div>
                            <div>
                                <Label>Experience (years) *</Label>
                                <Input type="number" name="experience" value={input.experience}
                                    onChange={changeEventHandler} placeholder="0" min="0" />
                            </div>
                            <div>
                                <Label>No. of Openings *</Label>
                                <Input type="number" name="position" value={input.position}
                                    onChange={changeEventHandler} min="1" />
                            </div>
                        </div>
                    </section>

                    <section className="glass-card rounded-2xl p-6 space-y-4">
                        <h2 className="font-semibold text-foreground">Company *</h2>
                        {hasCompanies ? (
                            <Select value={input.companyId || undefined} onValueChange={selectChangeHandler}>
                                <SelectTrigger className="w-full md:w-[320px]">
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {companies.map(company => (
                                            <SelectItem key={company._id} value={company._id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-xs text-red-400">
                                No companies registered yet. Please register a company first before posting jobs.
                            </p>
                        )}
                    </section>

                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/all-jobs')}>
                            Cancel
                        </Button>
                        {loading ? (
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                            </Button>
                        ) : (
                            <Button type="submit" disabled={!hasCompanies}>Post Job</Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
