import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Camera, Mail, Phone, User, Pen, Plus, X, Upload, FileText,
    Link as LinkIcon, Video, Github, Linkedin, Globe, ChevronDown, ChevronUp
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { PREDEFINED_SKILLS } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
import AppliedJobTable from '../AppliedJobTable';

const SectionCard = ({ title, children, onEdit, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {title}
                    {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {onEdit && (
                    <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
                        <Pen size={14} />
                    </button>
                )}
            </div>
            {open && <div className="p-5">{children}</div>}
        </div>
    );
};

const ProfilePage = () => {
    useGetAppliedJobs();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const [editOpen, setEditOpen] = useState(false);
    const [skillsEditOpen, setSkillsEditOpen] = useState(false);
    const [resumeUploadOpen, setResumeUploadOpen] = useState(false);
    const [linksEditOpen, setLinksEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resumeUploading, setResumeUploading] = useState(false);
    const [customSkillInput, setCustomSkillInput] = useState('');

    const [editForm, setEditForm] = useState({
        fullname: user?.fullname || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        personalEmail: user?.personalEmail || '',
        bio: user?.profile?.bio || '',
        gender: user?.gender || '',
        college: user?.college || '',
        graduationYear: user?.graduationYear || ''
    });

    const [selectedSkills, setSelectedSkills] = useState(user?.profile?.skills || []);
    const [customSkills, setCustomSkills] = useState(user?.profile?.customSkills || []);

    const [links, setLinks] = useState(user?.profile?.externalLinks || []);
    const [newLink, setNewLink] = useState({ type: 'Others', url: '', label: '' });

    const completion = user?.profile?.profileCompletion || 0;

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            Object.entries(editForm).forEach(([key, val]) => {
                if (val) formData.append(key, val);
            });

            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
                setEditOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSkillsUpdate = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('skills', selectedSkills.join(','));
            formData.append('customSkills', customSkills.join(','));

            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success('Skills updated');
                setSkillsEditOpen(false);
            }
        } catch (error) {
            toast.error('Failed to update skills');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File must be less than 2MB');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`${USER_API_END_POINT}/profile/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setUser({
                    ...user,
                    profile: { ...user.profile, profilePhoto: res.data.profilePhoto, profileCompletion: res.data.profileCompletion }
                }));
                toast.success('Photo updated');
            }
        } catch (error) {
            toast.error('Failed to upload photo');
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File must be less than 5MB');
            return;
        }
        try {
            setResumeUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('resumeType', 'master');
            const res = await axios.post(`${USER_API_END_POINT}/profile/resume`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setUser({
                    ...user,
                    profile: { ...user.profile, resumes: res.data.resumes }
                }));
                toast.success('Resume uploaded');
                setResumeUploadOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload resume');
        } finally {
            setResumeUploading(false);
        }
    };

    const handleLinksUpdate = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('externalLinks', JSON.stringify(links));
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success('Links updated');
                setLinksEditOpen(false);
            }
        } catch (error) {
            toast.error('Failed to update links');
        } finally {
            setLoading(false);
        }
    };

    const addCustomSkill = () => {
        if (customSkillInput.trim() && !customSkills.includes(customSkillInput.trim())) {
            setCustomSkills([...customSkills, customSkillInput.trim()]);
            setCustomSkillInput('');
        }
    };

    const linkIcons = { GitHub: Github, LinkedIn: Linkedin, Portfolio: Globe, Others: LinkIcon };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Profile Header */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div className="relative group">
                        <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                                <circle cx="48" cy="48" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                                <circle cx="48" cy="48" r="44" fill="none" stroke="hsl(var(--primary))"
                                    strokeWidth="3" strokeLinecap="round"
                                    strokeDasharray={`${(completion / 100) * 276.46} 276.46`} />
                            </svg>
                            <div className="absolute inset-[6px] rounded-full overflow-hidden">
                                <Avatar className="w-full h-full">
                                    <AvatarImage src={user?.profile?.profilePhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.fullname || 'U') + "&size=200"} />
                                </Avatar>
                            </div>
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-card text-[10px] font-bold text-primary px-1.5 py-0.5 rounded-full border border-border">
                                {completion}%
                            </span>
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Camera size={20} className="text-white" />
                            <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{user?.fullname}</h1>
                                {user?.profile?.bio && <p className="text-sm text-muted-foreground mt-0.5">{user.profile.bio}</p>}
                                {user?.college && <p className="text-xs text-muted-foreground mt-1">{user.college}</p>}
                            </div>
                            <Button onClick={() => setEditOpen(true)} variant="outline" size="sm" className="bg-white/5 border-border text-foreground hover:bg-white/10">
                                <Pen size={14} className="mr-1.5" />Edit
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Mail size={14} />{user?.email}</span>
                            <span className="flex items-center gap-1.5"><Phone size={14} />{user?.phoneNumber}</span>
                            {user?.gender && <span className="flex items-center gap-1.5"><User size={14} />{user.gender}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Section */}
            <SectionCard title="Skills" onEdit={() => setSkillsEditOpen(true)}>
                {(user?.profile?.skills?.length > 0 || user?.profile?.customSkills?.length > 0) ? (
                    <div className="flex flex-wrap gap-2">
                        {user.profile.skills?.map((skill, i) => (
                            <Badge key={i} className="bg-primary/10 text-primary border-0 text-xs">{skill}</Badge>
                        ))}
                        {user.profile.customSkills?.map((skill, i) => (
                            <Badge key={`c-${i}`} className="bg-purple-500/10 text-purple-400 border-0 text-xs">{skill}</Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                )}
            </SectionCard>

            {/* Resume Section */}
            <SectionCard title="Resumes" onEdit={() => setResumeUploadOpen(true)}>
                {user?.profile?.resumes?.length > 0 ? (
                    <div className="space-y-2">
                        {user.profile.resumes.map((resume, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-primary" />
                                    <div>
                                        <a href={resume.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                            {resume.originalName}
                                        </a>
                                        <p className="text-[10px] text-muted-foreground">
                                            {resume.type === 'master' ? 'Master Resume' : 'Domain Specific'} -
                                            Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Badge className={`text-[10px] border-0 ${resume.type === 'master' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-muted-foreground'}`}>
                                    {resume.type}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : user?.profile?.resume ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <FileText size={18} className="text-primary" />
                        <a href={user.profile.resume} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                            {user.profile.resumeOriginalName || 'Resume'}
                        </a>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No resumes uploaded</p>
                )}
            </SectionCard>

            {/* External Links */}
            <SectionCard title="External Links" onEdit={() => setLinksEditOpen(true)}>
                {user?.profile?.externalLinks?.length > 0 ? (
                    <div className="space-y-2">
                        {user.profile.externalLinks.map((link, i) => {
                            const Icon = linkIcons[link.type] || LinkIcon;
                            return (
                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <Icon size={16} className="text-primary" />
                                    <div>
                                        <p className="text-sm text-foreground">{link.label || link.type}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-xs">{link.url}</p>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No external links added</p>
                )}
            </SectionCard>

            {/* Intro Video */}
            <SectionCard title="Intro Video" defaultOpen={false}>
                {user?.profile?.introVideo?.url ? (
                    <div className="space-y-2">
                        <video controls className="w-full max-w-md rounded-lg">
                            <source src={user.profile.introVideo.url} />
                        </video>
                        <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(user.profile.introVideo.uploadedAt).toLocaleDateString()}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <Video size={32} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">Record a 60-90 second introduction video</p>
                        <Button variant="outline" size="sm" className="bg-white/5 border-border text-foreground">
                            <Upload size={14} className="mr-1.5" />Upload Video
                        </Button>
                    </div>
                )}
            </SectionCard>

            {/* Applied Jobs */}
            <SectionCard title="Applied Jobs" defaultOpen={true}>
                <AppliedJobTable />
            </SectionCard>

            {/* Edit Profile Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-lg bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                            {[
                                { id: 'fullname', label: 'Full Name', type: 'text' },
                                { id: 'email', label: 'College Email', type: 'email' },
                                { id: 'personalEmail', label: 'Personal Email', type: 'email' },
                                { id: 'phoneNumber', label: 'Phone Number', type: 'text' },
                                { id: 'bio', label: 'Bio', type: 'text' },
                                { id: 'college', label: 'College', type: 'text' },
                                { id: 'graduationYear', label: 'Graduation Year', type: 'number' },
                            ].map(field => (
                                <div key={field.id} className="grid grid-cols-4 items-center gap-3">
                                    <Label htmlFor={field.id} className="text-right text-xs">{field.label}</Label>
                                    <Input id={field.id} name={field.id} type={field.type}
                                        value={editForm[field.id]}
                                        onChange={e => setEditForm({ ...editForm, [field.id]: e.target.value })}
                                        className="col-span-3 bg-white/5 border-border" />
                                </div>
                            ))}
                            <div className="grid grid-cols-4 items-center gap-3">
                                <Label className="text-right text-xs">Gender</Label>
                                <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                                    className="col-span-3 bg-white/5 border border-border rounded-md px-3 py-2 text-sm text-foreground">
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Not Confirmed">Not Confirmed</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                                {loading ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Skills Dialog */}
            <Dialog open={skillsEditOpen} onOpenChange={setSkillsEditOpen}>
                <DialogContent className="sm:max-w-lg bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle>Manage Skills</DialogTitle></DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                        <div>
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Pre-defined Skills</Label>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {PREDEFINED_SKILLS.map(skill => {
                                    const isSelected = selectedSkills.includes(skill);
                                    return (
                                        <button key={skill} onClick={() => {
                                            setSelectedSkills(isSelected
                                                ? selectedSkills.filter(s => s !== skill)
                                                : [...selectedSkills, skill]);
                                        }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>
                                            {skill}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Custom Skills</Label>
                            <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                                {customSkills.map((skill, i) => (
                                    <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400">
                                        {skill}
                                        <button onClick={() => setCustomSkills(customSkills.filter((_, idx) => idx !== i))}>
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input value={customSkillInput} onChange={e => setCustomSkillInput(e.target.value)}
                                    placeholder="Add custom skill" className="bg-white/5 border-border text-sm"
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())} />
                                <Button type="button" onClick={addCustomSkill} size="sm" variant="outline" className="bg-white/5 border-border">
                                    <Plus size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSkillsUpdate} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                            {loading ? 'Saving...' : 'Save Skills'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Resume Upload Dialog */}
            <Dialog open={resumeUploadOpen} onOpenChange={setResumeUploadOpen}>
                <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle>Upload Resume</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">Upload a PDF, DOC, or DOCX file (max 5MB). Your Master Resume is used for all recommendations.</p>
                        <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl transition-colors ${resumeUploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}>
                            <Upload size={32} className="text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                                {resumeUploading ? 'Please wait, resume is uploading...' : 'Click to upload resume'}
                            </span>
                            <input
                                type="file"
                                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleResumeUpload}
                                disabled={resumeUploading}
                                className="hidden"
                            />
                        </label>
                        {resumeUploading && <p className="text-xs text-muted-foreground">Please wait while we upload your resume.</p>}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Links Dialog */}
            <Dialog open={linksEditOpen} onOpenChange={setLinksEditOpen}>
                <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle>External Links</DialogTitle></DialogHeader>
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin">
                        {links.map((link, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                                <span className="text-xs text-muted-foreground w-16">{link.type}</span>
                                <span className="text-xs text-foreground truncate flex-1">{link.url}</span>
                                <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))}>
                                    <X size={12} className="text-muted-foreground hover:text-red-400" />
                                </button>
                            </div>
                        ))}
                        <div className="grid gap-2">
                            <select value={newLink.type} onChange={e => setNewLink({ ...newLink, type: e.target.value })}
                                className="bg-white/5 border border-border rounded-md px-3 py-2 text-sm text-foreground">
                                <option value="Others">Others</option>
                                <option value="Portfolio">Portfolio</option>
                                <option value="GitHub">GitHub</option>
                                <option value="LinkedIn">LinkedIn</option>
                            </select>
                            <Input value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                placeholder="https://..." className="bg-white/5 border-border text-sm" />
                            <Input value={newLink.label} onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                                placeholder="Label (optional)" className="bg-white/5 border-border text-sm" />
                            <Button type="button" onClick={() => {
                                if (newLink.url) {
                                    setLinks([...links, { ...newLink }]);
                                    setNewLink({ type: 'Others', url: '', label: '' });
                                }
                            }} variant="outline" size="sm" className="bg-white/5 border-border">
                                <Plus size={14} className="mr-1" />Add Link
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleLinksUpdate} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                            {loading ? 'Saving...' : 'Save Links'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfilePage;
