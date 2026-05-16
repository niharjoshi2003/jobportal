import { useEffect, useState } from 'react';
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
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';

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
        deadline: "",
        companyOverview: "",
        jobRequirementsDetail: "",
        additionalInfo: "",
        applicationMode: "internal",
        externalApplyUrl: "",
        applicationQuestions: [],
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

    const addQuestion = () => {
        setInput((prev) => ({
            ...prev,
            applicationQuestions: [
                ...prev.applicationQuestions,
                { question: "", type: "short_text", required: true, options: "" },
            ],
        }));
    };

    const removeQuestion = (index) => {
        setInput((prev) => ({
            ...prev,
            applicationQuestions: prev.applicationQuestions.filter((_, idx) => idx !== index),
        }));
    };

    const updateQuestion = (index, key, value) => {
        setInput((prev) => ({
            ...prev,
            applicationQuestions: prev.applicationQuestions.map((question, idx) =>
                idx === index ? { ...question, [key]: value } : question
            ),
        }));
    };

    const updateApplicationMode = (mode) => {
        setInput((prev) => ({
            ...prev,
            applicationMode: mode,
            externalApplyUrl: mode === "external" ? prev.externalApplyUrl : "",
            applicationQuestions: mode === "external" ? [] : prev.applicationQuestions,
        }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.title || !input.description || !input.requirements ||
            input.salary === "" || !input.location || !input.jobType ||
            input.experience === "" || !input.companyId ||
            !input.companyOverview || !input.jobRequirementsDetail || !input.additionalInfo) {
            toast.error('Please fill in all required fields.');
            return;
        }
        if (Number(input.position) <= 0) {
            toast.error('Number of openings must be greater than 0.');
            return;
        }
        if (Number(input.salary) < 0) {
            toast.error('Salary must be 0 or greater.');
            return;
        }
        if (Number(input.experience) < 0) {
            toast.error('Experience must be 0 or greater.');
            return;
        }
        if (input.deadline) {
            const selectedDeadline = new Date(input.deadline);
            if (selectedDeadline <= new Date()) {
                toast.error('Deadline must be in the future.');
                return;
            }
        }
        if (input.applicationMode === "external") {
            if (!input.externalApplyUrl.trim()) {
                toast.error('External application URL is required for external apply mode.');
                return;
            }
            try {
                const parsed = new URL(input.externalApplyUrl.trim());
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    throw new Error('Invalid protocol');
                }
            } catch {
                toast.error('Please enter a valid external URL (http/https).');
                return;
            }
        }

        const normalizedQuestions = input.applicationQuestions
            .map((question) => {
                const normalized = {
                    question: question.question.trim(),
                    type: question.type,
                    required: question.required !== false,
                    options: question.type === "multiple_choice"
                        ? String(question.options || "")
                            .split(",")
                            .map((option) => option.trim())
                            .filter(Boolean)
                        : [],
                };
                return normalized;
            })
            .filter((question) => question.question);

        const invalidQuestion = normalizedQuestions.find(
            (question) => question.type === "multiple_choice" && question.options.length < 2
        );
        if (invalidQuestion) {
            toast.error(`"${invalidQuestion.question}" needs at least 2 options.`);
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
            deadline: input.deadline || undefined,
            companyOverview: input.companyOverview,
            jobRequirementsDetail: input.jobRequirementsDetail,
            additionalInfo: input.additionalInfo,
            applicationMode: input.applicationMode,
            externalApplyUrl: input.applicationMode === "external" ? input.externalApplyUrl.trim() : "",
            applicationQuestions: normalizedQuestions,
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
                        <h2 className="font-semibold text-foreground">Company Details</h2>
                        {hasCompanies ? (
                            <div>
                                <Label>Company *</Label>
                                <Select value={input.companyId || undefined} onValueChange={selectChangeHandler}>
                                    <SelectTrigger className="w-full md:w-[320px] mt-1">
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
                            </div>
                        ) : (
                            <p className="text-xs text-red-400">
                                No companies registered yet. Please register a company first before posting jobs.
                            </p>
                        )}
                        <div>
                            <Label>About Company *</Label>
                            <textarea
                                name="companyOverview"
                                value={input.companyOverview}
                                onChange={changeEventHandler}
                                rows={4}
                                className="mt-1 w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                placeholder="Introduce company culture, mission, business domain, and why students should join."
                            />
                        </div>
                    </section>

                    <section className="glass-card rounded-2xl p-6 space-y-4">
                        <h2 className="font-semibold text-foreground">Job Requirements</h2>
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
                                <Label>Requirements * (comma separated)</Label>
                                <Input name="requirements" value={input.requirements} onChange={changeEventHandler}
                                    placeholder="React, Node.js, MongoDB" />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Detailed Requirements *</Label>
                                <textarea
                                    name="jobRequirementsDetail"
                                    value={input.jobRequirementsDetail}
                                    onChange={changeEventHandler}
                                    rows={4}
                                    className="mt-1 w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                    placeholder="Describe responsibilities, qualifications, tools, and selection criteria in detail."
                                />
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
                            <div>
                                <Label>Application Deadline</Label>
                                <Input
                                    type="date"
                                    name="deadline"
                                    value={input.deadline}
                                    onChange={changeEventHandler}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="glass-card rounded-2xl p-6 space-y-4">
                        <h2 className="font-semibold text-foreground">Additional Information</h2>
                        <div className="space-y-4">
                            <div>
                                <Label>Role Summary *</Label>
                                <textarea
                                    name="description"
                                    value={input.description}
                                    onChange={changeEventHandler}
                                    rows={4}
                                    className="mt-1 w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                    placeholder="What this role does day-to-day."
                                />
                            </div>
                            <div>
                                <Label>Additional Info *</Label>
                                <textarea
                                    name="additionalInfo"
                                    value={input.additionalInfo}
                                    onChange={changeEventHandler}
                                    rows={4}
                                    className="mt-1 w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                    placeholder="Perks, work model, process timeline, onboarding details, or any extra notes."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Application Mode *</Label>
                                    <select
                                        value={input.applicationMode}
                                        onChange={(e) => updateApplicationMode(e.target.value)}
                                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    >
                                        <option value="internal">Apply on Job-O-Hire</option>
                                        <option value="external">Redirect to company site</option>
                                    </select>
                                </div>
                                {input.applicationMode === "external" && (
                                    <div>
                                        <Label>External Apply URL *</Label>
                                        <Input
                                            name="externalApplyUrl"
                                            value={input.externalApplyUrl}
                                            onChange={changeEventHandler}
                                            placeholder="https://company.com/careers/apply/123"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="glass-card rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-foreground">Application Questions</h2>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Add custom questions for applicants. These answers are visible to recruiters/admins.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addQuestion}
                                disabled={input.applicationMode === "external"}
                                className="inline-flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Add Question
                            </Button>
                        </div>

                        {input.applicationMode === "external" ? (
                            <p className="text-xs text-muted-foreground">
                                Custom questions are disabled for external apply mode because students apply on the company website.
                            </p>
                        ) : input.applicationQuestions.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No custom question added yet. Applicants can still apply directly.</p>
                        ) : (
                            <div className="space-y-4">
                                {input.applicationQuestions.map((question, index) => (
                                    <div key={index} className="rounded-xl border border-border bg-white/5 p-4 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="md:col-span-2">
                                                <Label>Question {index + 1} *</Label>
                                                <Input
                                                    value={question.question}
                                                    onChange={(e) => updateQuestion(index, "question", e.target.value)}
                                                    placeholder="e.g. What interests you in this role?"
                                                />
                                            </div>
                                            <div>
                                                <Label>Answer Type</Label>
                                                <select
                                                    value={question.type}
                                                    onChange={(e) => updateQuestion(index, "type", e.target.value)}
                                                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                                >
                                                    <option value="short_text">Short text</option>
                                                    <option value="long_text">Long text</option>
                                                    <option value="yes_no">Yes / No</option>
                                                    <option value="multiple_choice">Multiple choice</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2 pt-6">
                                                <input
                                                    id={`required-${index}`}
                                                    type="checkbox"
                                                    checked={question.required !== false}
                                                    onChange={(e) => updateQuestion(index, "required", e.target.checked)}
                                                />
                                                <Label htmlFor={`required-${index}`}>Required question</Label>
                                            </div>
                                            {question.type === "multiple_choice" && (
                                                <div className="md:col-span-2">
                                                    <Label>Options (comma separated) *</Label>
                                                    <Input
                                                        value={question.options}
                                                        onChange={(e) => updateQuestion(index, "options", e.target.value)}
                                                        placeholder="Option 1, Option 2, Option 3"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={() => removeQuestion(index)}
                                            >
                                                <Trash2 size={14} className="mr-1.5" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
