import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    GraduationCap, Hash, Mail, Phone, Search, ShieldCheck, UserRoundSearch,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../shared/Navbar';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { USER_API_END_POINT } from '@/utils/constant';

const profileInfo = (Icon, label, value) => (
    <div className="flex items-center gap-2 min-w-0">
        <Icon size={15} className="text-primary flex-shrink-0" />
        <span className="text-muted-foreground">{label}:</span>
        <span className="text-foreground truncate">{value || '—'}</span>
    </div>
);

const RecruiterTalentPool = () => {
    const [students, setStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${USER_API_END_POINT}/recruiter/talent-pool`, {
                    params: query.trim() ? { q: query.trim() } : {},
                    withCredentials: true,
                });
                if (!cancelled && response.data?.success) {
                    setStudents(response.data.students || []);
                    setTotalStudents(response.data.totalStudents || 0);
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(error.response?.data?.message || 'Failed to load the student talent pool.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);

    const skills = useMemo(() => {
        if (!selectedStudent) return [];
        return [
            ...(selectedStudent.profile?.skills || []),
            ...(selectedStudent.profile?.customSkills || []),
        ];
    }, [selectedStudent]);

    return (
        <div>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-2">
                            <UserRoundSearch size={17} /> Student Talent Pool
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Discover students before posting a role
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                            Review available skills and academic backgrounds to understand the portal&apos;s talent pool.
                            Contact details remain protected until a student applies to your company.
                        </p>
                    </div>

                    <div className="glass-card rounded-2xl px-6 py-4 min-w-56">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Approved students</div>
                        <div className="text-3xl font-bold text-primary mt-1">{totalStudents}</div>
                        <div className="text-xs text-muted-foreground mt-1">currently available on the portal</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-5">
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-card rounded-lg border border-border w-full sm:max-w-xl">
                        <Search size={16} className="text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by name, college, or skill..."
                            className="bg-transparent text-sm text-foreground outline-none w-full"
                        />
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck size={15} className="text-green-400" />
                        Personal contact information is masked
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">Loading student profiles...</div>
                ) : students.length === 0 ? (
                    <div className="glass-card rounded-2xl text-center py-16">
                        <UserRoundSearch size={34} className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No student profiles match your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {students.map((student) => {
                            const studentSkills = [
                                ...(student.profile?.skills || []),
                                ...(student.profile?.customSkills || []),
                            ];
                            return (
                                <button
                                    key={student._id}
                                    onClick={() => setSelectedStudent(student)}
                                    className="glass-card rounded-2xl p-5 text-left hover:border-primary transition"
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar className="w-14 h-14 border border-border">
                                            <AvatarImage
                                                src={student.profile?.profilePhoto
                                                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullname || 'Student')}`}
                                                alt={student.fullname}
                                            />
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-semibold text-foreground truncate">{student.fullname}</h2>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {student.college || 'College not provided'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {[student.degree, student.department].filter(Boolean).join(' · ') || 'Program not provided'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Graduation: {student.graduationYear || 'Not provided'}
                                                {student.japaneseLevel ? ` · Japanese: ${student.japaneseLevel}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {student.profile?.bio && (
                                        <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
                                            {student.profile.bio}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {studentSkills.slice(0, 5).map((skill) => (
                                            <span
                                                key={skill}
                                                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {studentSkills.length > 5 && (
                                            <span className="text-xs px-2 py-1 text-muted-foreground">
                                                +{studentSkills.length - 5} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border text-xs text-primary">
                                        View profile preview
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </main>

            <Dialog open={Boolean(selectedStudent)} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Student Profile Preview</DialogTitle>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-xl bg-white/5 border border-border">
                                <Avatar className="w-24 h-24 border border-border">
                                    <AvatarImage
                                        src={selectedStudent.profile?.profilePhoto
                                            || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.fullname || 'Student')}`}
                                        alt={selectedStudent.fullname}
                                    />
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-2xl font-bold text-foreground">{selectedStudent.fullname}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
                                        {profileInfo(Mail, 'Email', selectedStudent.maskedEmail)}
                                        {profileInfo(Phone, 'Phone', selectedStudent.maskedPhone)}
                                        {profileInfo(GraduationCap, 'College', selectedStudent.college)}
                                        {profileInfo(Hash, 'Roll No.', selectedStudent.maskedRollNumber)}
                                        {profileInfo(GraduationCap, 'Grad Year', selectedStudent.graduationYear)}
                                        {profileInfo(GraduationCap, 'Degree', selectedStudent.degree)}
                                        {profileInfo(GraduationCap, 'Department', selectedStudent.department)}
                                        {profileInfo(GraduationCap, 'Japanese', selectedStudent.japaneseLevel)}
                                        {profileInfo(GraduationCap, 'Preferred work', selectedStudent.preferredWorkLocation)}
                                    </div>
                                </div>
                            </div>

                            <section className="p-5 rounded-xl bg-white/5 border border-border">
                                <h3 className="font-semibold text-foreground mb-3">Self Introduction</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {selectedStudent.profile?.bio || 'No self introduction provided.'}
                                </p>
                            </section>

                            <section className="p-5 rounded-xl bg-white/5 border border-border">
                                <h3 className="font-semibold text-foreground mb-3">Skills</h3>
                                {skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                                )}
                            </section>

                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-green-400" />
                                Resume, links, and complete contact details become available after this student applies.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RecruiterTalentPool;
