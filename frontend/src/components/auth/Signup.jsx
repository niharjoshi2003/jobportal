import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "", email: "", phoneNumber: "", password: "", role: "", adminCode: "", file: ""
    });
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.role === 'admin' && input.adminCode) formData.append("adminCode", input.adminCode);
        if (input.file) formData.append("file", input.file);

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
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
                    <h1 className="font-bold text-xl text-foreground mb-6">Sign Up</h1>
                    <form onSubmit={submitHandler} className="space-y-4">
                        <div>
                            <Label className="text-foreground text-sm">Full Name</Label>
                            <Input type="text" value={input.fullname} name="fullname" onChange={changeEventHandler}
                                placeholder="John Doe" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Email</Label>
                            <Input type="email" value={input.email} name="email" onChange={changeEventHandler}
                                placeholder="you@example.com" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Phone Number</Label>
                            <Input type="text" value={input.phoneNumber} name="phoneNumber" onChange={changeEventHandler}
                                placeholder="9876543210" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div>
                            <Label className="text-foreground text-sm">Password</Label>
                            <Input type="password" value={input.password} name="password" onChange={changeEventHandler}
                                placeholder="Create a password" className="mt-1 bg-white/5 border-border text-foreground" />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <Label className="text-foreground text-sm mb-2 block">Role</Label>
                                <RadioGroup className="flex items-center gap-6 flex-wrap">
                                    {['student', 'admin'].map(role => (
                                        <div key={role} className="flex items-center space-x-2">
                                            <Input type="radio" name="role" value={role}
                                                checked={input.role === role} onChange={changeEventHandler}
                                                className="cursor-pointer w-4 h-4 accent-primary" />
                                            <Label className="text-foreground capitalize cursor-pointer">{role}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Recruiter accounts are issued by an administrator after a company is registered.
                                </p>
                            </div>
                            <div>
                                <Label className="text-foreground text-sm">Profile Photo</Label>
                                <Input accept="image/*" type="file" onChange={changeFileHandler}
                                    className="mt-1 cursor-pointer bg-white/5 border-border text-foreground text-xs" />
                            </div>
                        </div>

                        {input.role === 'admin' && (
                            <div>
                                <Label className="text-foreground text-sm">Admin Signup Code</Label>
                                <Input
                                    type="password"
                                    name="adminCode"
                                    value={input.adminCode}
                                    onChange={changeEventHandler}
                                    placeholder="Required to create an admin account"
                                    className="mt-1 bg-white/5 border-border text-foreground"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Ask the site owner for the admin signup code.
                                </p>
                            </div>
                        )}

                        {loading ? (
                            <Button className="w-full bg-primary" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Sign Up</Button>
                        )}

                        <p className="text-sm text-center text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
