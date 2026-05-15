import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Calendar, DollarSign, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
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

const computeIsApplied = (job, userId) =>
    !!job?.applications?.some((application) => applicantIdOf(application) === userId);

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const [isApplied, setIsApplied] = useState(computeIsApplied(singleJob, user?._id));
    const [questionAnswers, setQuestionAnswers] = useState({});
    const isBookmarked = user?.bookmarkedJobs?.includes(singleJob?._id);
    const isStudent = user?.role === 'student';
    const applicationQuestions = singleJob?.applicationQuestions || [];
    const openingsLeft = Math.max(
        0,
        Number(singleJob?.position || 0) - Number(singleJob?.applications?.length || 0)
    );
    const isDeadlinePassed = singleJob?.deadline ? new Date(singleJob.deadline) < new Date() : false;
    const isClosedByStatus = singleJob?.status && singleJob.status !== "open";
    const isApplicationClosed = isDeadlinePassed || openingsLeft <= 0 || isClosedByStatus;

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const applyJobHandler = async () => {
        const answersPayload = applicationQuestions
            .map((question) => ({
                questionId: question._id,
                answer: String(questionAnswers[question._id] || '').trim(),
            }))
            .filter((answer) => answer.answer);

        const missingRequiredQuestion = applicationQuestions.find((question) => {
            if (question.required === false) return false;
            return !String(questionAnswers[question._id] || '').trim();
        });

        if (missingRequiredQuestion) {
            toast.error(`Please answer: ${missingRequiredQuestion.question}`);
            return;
        }

        try {
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/apply/${jobId}`,
                { answers: answersPayload },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = {
                    ...singleJob,
                    applications: [...(singleJob?.applications || []), { applicant: user?._id }]
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Application failed");
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setQuestionAnswers((prev) => ({ ...prev, [questionId]: value }));
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
                    setIsApplied(computeIsApplied(res.data.job, user?._id));
                    setQuestionAnswers({});
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
                                disabled={isApplied || isApplicationClosed}
                                className={`px-6 ${isApplied ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white'}`}
                            >
                                {isApplied ? 'Already Applied' : isApplicationClosed ? 'Applications Closed' : 'Apply Now'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-3 border-b border-border">Job Details</h2>
                <div className="space-y-4">
                    {[
                        { icon: MapPin, label: 'Location', value: singleJob?.location },
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
                    <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Summary:</span>
                        <span className="text-sm text-muted-foreground whitespace-pre-wrap">{singleJob?.description || 'Not provided'}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Openings Left:</span>
                        <span className="text-sm text-muted-foreground">{openingsLeft}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Status:</span>
                        <span className="text-sm text-muted-foreground capitalize">{singleJob?.status || "open"}</span>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-6 mt-6 space-y-5">
                <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">Company Information</h2>
                    <p className="text-sm text-muted-foreground">
                        {singleJob?.company?.name ? `${singleJob.company.name} · ` : ''}
                        {singleJob?.company?.location || singleJob?.location || 'Location not specified'}
                    </p>
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">About Company</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {singleJob?.companyOverview || singleJob?.company?.description || 'Not provided'}
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Job Requirements</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {singleJob?.jobRequirementsDetail || 'Not provided'}
                    </p>
                    {singleJob?.requirements?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {singleJob.requirements.map((req, i) => (
                                <Badge key={i} className="bg-white/5 text-muted-foreground border-0 text-xs">{req}</Badge>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Additional Information</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {singleJob?.additionalInfo || 'Not provided'}
                    </p>
                </div>
            </div>

            {isStudent && !isApplied && !isApplicationClosed && applicationQuestions.length > 0 && (
                <div className="glass-card rounded-xl p-6 mt-6">
                    <h2 className="text-lg font-semibold text-foreground mb-1">Application Questions</h2>
                    <p className="text-xs text-muted-foreground mb-4">
                        Please answer the company-specific questions before applying.
                    </p>
                    <div className="space-y-4">
                        {applicationQuestions.map((question, index) => (
                            <div key={question._id || index} className="space-y-2">
                                <label className="block text-sm font-medium text-foreground">
                                    {index + 1}. {question.question} {question.required !== false && <span className="text-red-400">*</span>}
                                </label>
                                {question.type === 'long_text' ? (
                                    <textarea
                                        value={questionAnswers[question._id] || ''}
                                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                        rows={4}
                                        className="w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                        placeholder="Write your answer"
                                    />
                                ) : question.type === 'yes_no' ? (
                                    <select
                                        value={questionAnswers[question._id] || ''}
                                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    >
                                        <option value="">Select</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                ) : question.type === 'multiple_choice' ? (
                                    <select
                                        value={questionAnswers[question._id] || ''}
                                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    >
                                        <option value="">Select</option>
                                        {(question.options || []).map((option, optionIndex) => (
                                            <option key={`${option}-${optionIndex}`} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        value={questionAnswers[question._id] || ''}
                                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                        className="w-full rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-foreground"
                                        placeholder="Write your answer"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {singleJob?.deadline && (
                <div className="glass-card rounded-xl p-6 mt-6">
                    <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-foreground w-32 flex-shrink-0">Application Deadline:</span>
                        <span className="text-sm text-muted-foreground">{new Date(singleJob.deadline).toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDescription;
