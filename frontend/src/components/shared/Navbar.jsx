import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, User2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
        } catch (error) {
            // Backend offline, proceed with client-side logout
        }
        dispatch(setUser(null));
        navigate("/login");
        toast.success("Logged out successfully.");
    };

    return (
        <div className="bg-card border-b border-border">
            <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4">
                <Link to={(user?.role === 'recruiter' || user?.role === 'admin') ? '/admin/companies' : '/dashboard'} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-border flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">JOH</span>
                    </div>
                    <span className="text-lg font-bold text-foreground tracking-tight">Job-O-Hire</span>
                </Link>

                <div className="flex items-center gap-8">
                    <ul className="flex font-medium items-center gap-5">
                        {(user?.role === 'recruiter' || user?.role === 'admin') ? (
                            <>
                                <li><Link to="/admin/companies" className="text-muted-foreground hover:text-foreground transition-colors">Companies</Link></li>
                                <li><Link to="/admin/jobs" className="text-muted-foreground hover:text-foreground transition-colors">Jobs</Link></li>
                                <li><Link to="/admin/internships" className="text-muted-foreground hover:text-foreground transition-colors">Internships</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
                                <li><Link to="/internships" className="text-muted-foreground hover:text-foreground transition-colors">Internships</Link></li>
                                <li><Link to="/companies" className="text-muted-foreground hover:text-foreground transition-colors">Companies</Link></li>
                            </>
                        )}
                    </ul>

                    {!user ? (
                        <div className="flex items-center gap-2">
                            <Link to="/login"><Button variant="outline" className="bg-white/5 border-border text-foreground">Login</Button></Link>
                            <Link to="/signup"><Button className="bg-primary hover:bg-primary/90 text-white">Signup</Button></Link>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className="cursor-pointer border border-border">
                                    <AvatarImage
                                        src={user?.profile?.profilePhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.fullname || 'U')}
                                        alt={user?.fullname}
                                    />
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 bg-card border-border">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar>
                                        <AvatarImage src={user?.profile?.profilePhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.fullname || 'U')} />
                                    </Avatar>
                                    <div>
                                        <h4 className="font-medium text-foreground">{user?.fullname}</h4>
                                        <p className="text-sm text-muted-foreground">{user?.profile?.bio || user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-muted-foreground">
                                    {user?.role === 'student' && (
                                        <Link to="/profile" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <User2 size={16} />
                                            <span className="text-sm">View Profile</span>
                                        </Link>
                                    )}
                                    <button onClick={logoutHandler} className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-400/10 hover:text-red-400 transition-colors w-full">
                                        <LogOut size={16} />
                                        <span className="text-sm">Logout</span>
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
