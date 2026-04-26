import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';
import { USER_API_END_POINT } from '@/utils/constant';

const Login = () => {
    const [input, setInput] = useState({ email: "", password: "", role: "" });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!input.email || !input.password || !input.role) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(
                `${USER_API_END_POINT}/login`,
                input,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            if (res.data?.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message || `Welcome back, ${res.data.user.fullname}`);
                const role = res.data.user.role;
                const dest = role === "admin"
                    ? "/admin/overview"
                    : role === "recruiter"
                        ? "/recruiter/applicants"
                        : "/dashboard";
                navigate(dest);
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
        if (user) navigate("/dashboard");
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl gradient-border flex items-center justify-center">
                            <span className="text-white font-bold text-xs">JOH</span>
                        </div>
                        <span className="text-2xl font-bold text-foreground tracking-tight">Job-O-Hire</span>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-2">India-Japan Talent Bridge</p>
                </div>

                <div className="glass-card rounded-2xl p-6">
                    <h1 className="font-bold text-xl text-foreground mb-6">Login</h1>
                    <form onSubmit={submitHandler} className="space-y-4">
                        <div>
                            <Label className="text-foreground text-sm">Email</Label>
                            <Input type="email" value={input.email} name="email" onChange={changeEventHandler}
                                placeholder="you@example.com" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Password</Label>
                            <Input type="password" value={input.password} name="password" onChange={changeEventHandler}
                                placeholder="Your password" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm mb-2 block">Role</Label>
                            <RadioGroup className="flex items-center gap-6 flex-wrap">
                                {['student', 'recruiter', 'admin'].map(role => (
                                    <div key={role} className="flex items-center space-x-2">
                                        <Input type="radio" name="role" value={role}
                                            checked={input.role === role} onChange={changeEventHandler}
                                            className="cursor-pointer w-4 h-4 accent-primary" />
                                        <Label className="text-foreground capitalize cursor-pointer">{role}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            <p className="text-xs text-muted-foreground mt-2">
                                Recruiters: use the credentials issued by your administrator.
                            </p>
                        </div>

                        {loading ? (
                            <Button className="w-full bg-primary" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Login</Button>
                        )}

                        <p className="text-sm text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:underline">Signup</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
