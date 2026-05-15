import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2, GraduationCap, Briefcase } from 'lucide-react';
import { USER_API_END_POINT } from '@/utils/constant';
import BrandLogo from '../shared/BrandLogo';

// Student-only login. Admin / Recruiter login lives at /portal-login.
const Login = () => {
    const [input, setInput] = useState({ email: "", password: "" });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.email || !input.password) {
            toast.error("Please enter your email and password.");
            return;
        }
        try {
            dispatch(setLoading(true));
            const res = await axios.post(
                `${USER_API_END_POINT}/login`,
                { ...input, role: 'student' },
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );
            if (res.data?.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message || `Welcome back, ${res.data.user.fullname}`);
                navigate('/dashboard');
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
        if (!user) return;
        const dest = user.role === 'admin'
            ? '/admin/overview'
            : user.role === 'recruiter'
                ? '/recruiter/applicants'
                : '/dashboard';
        navigate(dest);
        // eslint-disable-next-line
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <BrandLogo size="lg" showTagline />
                    </Link>
                </div>

                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                            <GraduationCap size={18} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-foreground leading-tight">Student Login</h1>
                            <p className="text-xs text-muted-foreground">Access your dashboard, jobs, and applications.</p>
                        </div>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-4">
                        <div>
                            <Label className="text-foreground text-sm">Email</Label>
                            <Input type="email" value={input.email} name="email" onChange={changeEventHandler}
                                placeholder="you@example.com"
                                className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Password</Label>
                            <Input type="password" value={input.password} name="password" onChange={changeEventHandler}
                                placeholder="Your password"
                                className="mt-1 bg-white/5 border-border text-foreground" />
                            <div className="text-right mt-1">
                                <Link to="/forgot-password?role=student" className="text-xs text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {loading ? (
                            <Button className="w-full bg-primary" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                                Login as Student
                            </Button>
                        )}

                        <p className="text-sm text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
                        </p>
                    </form>
                </div>

                <Link
                    to="/portal-login"
                    className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Briefcase size={16} />
                    <span>Recruiter or Admin? <span className="text-primary font-medium">Use the portal login</span></span>
                </Link>

                <p className="text-xs text-center text-muted-foreground mt-6">
                    By logging in you agree to our{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Terms & Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
};

export default Login;
