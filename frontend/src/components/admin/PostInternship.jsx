import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { INTERNSHIP_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

const locationTypes = ['On-site', 'Remote', 'Hybrid'];
const compensationTypes = ['TBA', 'Fixed', 'Stipend'];
const durationUnits = ['days', 'weeks', 'months'];

const PostInternship = () => {
    const [input, setInput] = useState({
        title: '',
        description: '',
        requirements: '',
        eligibility: '',
        location: '',
        locationType: 'On-site',
        compensationType: 'TBA',
        compensationAmount: '',
        compensationCurrency: 'JPY',
        durationValue: 30,
        durationUnit: 'days',
        openings: 1,
        deadline: '',
        tags: '',
        companyId: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);

    const onChange = (e) => setInput({ ...input, [e.target.name]: e.target.value });

    const onCompanyChange = (value) => {
        const selected = companies.find(c => c.name?.toLowerCase() === value);
        if (selected) setInput({ ...input, companyId: selected._id });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.companyId) {
            toast.error('Please select a company');
            return;
        }

        const payload = {
            title: input.title,
            description: input.description,
            requirements: input.requirements,
            eligibility: input.eligibility,
            location: input.location,
            locationType: input.locationType,
            compensation: {
                type: input.compensationType,
                amount: input.compensationAmount ? Number(input.compensationAmount) : undefined,
                currency: input.compensationCurrency || 'JPY',
            },
            duration: {
                value: Number(input.durationValue) || 30,
                unit: input.durationUnit,
            },
            openings: Number(input.openings) || 1,
            deadline: input.deadline,
            tags: input.tags,
            companyId: input.companyId,
        };

        try {
            setLoading(true);
            const res = await axios.post(`${INTERNSHIP_API_END_POINT}/post`, payload, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/admin/internships');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post internship');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft size={16} />Back
                </button>
                <div className="glass-card rounded-xl p-6">
                    <h1 className="text-xl font-bold text-foreground mb-6">Post New Internship</h1>
                    <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label className="text-foreground text-sm">Title *</Label>
                            <Input name="title" value={input.title} onChange={onChange} required className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-foreground text-sm">Description *</Label>
                            <textarea
                                name="description"
                                value={input.description}
                                onChange={onChange}
                                rows={4}
                                required
                                className="mt-1 w-full rounded-md bg-white/5 border border-border p-2 text-foreground text-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Requirements (comma-separated)</Label>
                            <Input name="requirements" value={input.requirements} onChange={onChange} placeholder="React, Node.js" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Eligibility (comma-separated)</Label>
                            <Input name="eligibility" value={input.eligibility} onChange={onChange} placeholder="Final year, B.Tech" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Location *</Label>
                            <Input name="location" value={input.location} onChange={onChange} required className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Location Type</Label>
                            <select name="locationType" value={input.locationType} onChange={onChange} className="mt-1 w-full rounded-md bg-white/5 border border-border p-2 text-foreground text-sm">
                                {locationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Compensation Type</Label>
                            <select name="compensationType" value={input.compensationType} onChange={onChange} className="mt-1 w-full rounded-md bg-white/5 border border-border p-2 text-foreground text-sm">
                                {compensationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        {input.compensationType !== 'TBA' && (
                            <>
                                <div>
                                    <Label className="text-foreground text-sm">Amount</Label>
                                    <Input type="number" name="compensationAmount" value={input.compensationAmount} onChange={onChange} className="mt-1 bg-white/5 border-border text-foreground" />
                                </div>
                                <div>
                                    <Label className="text-foreground text-sm">Currency</Label>
                                    <Input name="compensationCurrency" value={input.compensationCurrency} onChange={onChange} className="mt-1 bg-white/5 border-border text-foreground" />
                                </div>
                            </>
                        )}
                        <div>
                            <Label className="text-foreground text-sm">Duration value</Label>
                            <Input type="number" name="durationValue" value={input.durationValue} onChange={onChange} className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Duration unit</Label>
                            <select name="durationUnit" value={input.durationUnit} onChange={onChange} className="mt-1 w-full rounded-md bg-white/5 border border-border p-2 text-foreground text-sm">
                                {durationUnits.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Openings</Label>
                            <Input type="number" name="openings" value={input.openings} onChange={onChange} className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Deadline *</Label>
                            <Input type="date" name="deadline" value={input.deadline} onChange={onChange} required className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-foreground text-sm">Tags (comma-separated)</Label>
                            <Input name="tags" value={input.tags} onChange={onChange} placeholder="frontend, paid, remote-friendly" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-foreground text-sm mb-1 block">Company *</Label>
                            {companies && companies.length > 0 ? (
                                <Select onValueChange={onCompanyChange}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select a company" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {companies.map(c => (
                                                <SelectItem key={c._id} value={c.name?.toLowerCase()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-xs text-red-500">Please register a company first.</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            {loading ? (
                                <Button className="w-full" disabled>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                                </Button>
                            ) : (
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Post Internship</Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostInternship;
