import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2, ShieldCheck, Building2, GraduationCap } from 'lucide-react';
import { USER_API_END_POINT } from '@/utils/constant';
import BrandLogo from '../shared/BrandLogo';

// Admin + Recruiter login. Students log in at /login.
const StaffLogin = () => {
    const [input, setInput] = useState({ email: "", password: "", role: "recruiter" });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const setRole = (role) => setInput({ ...input, role });

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.email || !input.password || !input.role) {
            toast.error("Please fill all fields.");
            return;
        }
        try {
            dispatch(setLoading(true));
            const res = await axios.post(
                `${USER_API_END_POINT}/login`,
                input,
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );
            if (res.data?.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message || `Welcome back, ${res.data.user.fullname}`);
                const role = res.data.user.role;
                navigate(role === 'admin' ? '/admin/overview' : '/recruiter/applicants');
            } else {
                toast.error(res.data?.message || "Login failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (user) {
            const dest = user.role === 'admin'
                ? '/admin/overview'
                : user.role === 'recruiter'
                    ? '/recruiter/applicants'
                    : '/dashboard';
            navigate(dest);
        }
        // eslint-disable-next-line
    }, []);

    const roleTabs = [
        { id: 'recruiter', label: 'Recruiter', icon: Building2, hint: 'Use the credentials issued by your administrator.' },
        { id: 'admin', label: 'Admin', icon: ShieldCheck, hint: 'Platform administrators only.' },
    ];

    const activeHint = roleTabs.find(t => t.id === input.role)?.hint;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <BrandLogo size="lg" showTagline />
                    </Link>
                    <p className="text-sm text-muted-foreground mt-2">Portal Access</p>
                </div>

                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                            <ShieldCheck size={18} className="text-purple-300" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-foreground leading-tight">Recruiter & Admin Login</h1>
                            <p className="text-xs text-muted-foreground">For company recruiters and platform admins.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-5 p-1 rounded-xl bg-white/5 border border-border">
                        {roleTabs.map(t => {
                            const Icon = t.icon;
                            const active = input.role === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setRole(t.id)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-primary text-white shadow shadow-primary/20'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon size={15} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={submitHandler} className="space-y-4">
                        <div>
                            <Label className="text-foreground text-sm">Email</Label>
                            <Input type="email" value={input.email} name="email" onChange={changeEventHandler}
                                placeholder="you@company.com"
                                className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Password</Label>
                            <Input type="password" value={input.password} name="password" onChange={changeEventHandler}
                                placeholder="Your password"
                                className="mt-1 bg-white/5 border-border text-foreground" />
                            <div className="text-right mt-1">
                                <Link to={`/forgot-password?role=${input.role}`} className="text-xs text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">{activeHint}</p>

                        {loading ? (
                            <Button className="w-full bg-primary" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white capitalize">
                                Login as {input.role}
                            </Button>
                        )}
                    </form>
                </div>

                <Link
                    to="/login"
                    className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <GraduationCap size={16} />
                    <span>Are you a student? <span className="text-primary font-medium">Use the student login</span></span>
                </Link>

                <p className="text-xs text-center text-muted-foreground mt-6">
                    By logging in you agree to our{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Terms & Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
};

export default StaffLogin;
