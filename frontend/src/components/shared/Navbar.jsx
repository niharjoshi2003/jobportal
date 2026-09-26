import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, User2, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { clearSessionToken } from '@/utils/session';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import BrandLogo from './BrandLogo';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isStaff = user?.role === 'recruiter' || user?.role === 'admin';
    const navLinks = isStaff
        ? [
            { to: '/admin/companies', label: 'Companies' },
            { to: '/admin/jobs', label: 'Jobs' },
            { to: '/admin/internships', label: 'Internships' },
        ]
        : [
            { to: '/dashboard', label: 'Home' },
            { to: '/internships', label: 'Internships' },
            { to: '/companies', label: 'Companies' },
        ];

    const logoutHandler = async () => {
        try {
            await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
        } catch (error) {
            // Backend offline, proceed with client-side logout
        }
        clearSessionToken();
        dispatch(setUser(null));
        setMobileMenuOpen(false);
        navigate("/login");
        toast.success("Logged out successfully.");
    };

    return (
        <div className="bg-card border-b border-border">
            <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4">
                <Link to={isStaff ? '/admin/companies' : '/dashboard'} className="flex items-center gap-2">
                    <BrandLogo size="sm" />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <ul className="flex font-medium items-center gap-5">
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <Link to={link.to} className="text-muted-foreground hover:text-foreground transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
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

                <button
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-border text-foreground hover:bg-white/5 transition-colors"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                >
                    {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border px-4 py-3 space-y-3">
                    <ul className="space-y-1">
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {!user ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="outline" className="w-full bg-white/5 border-border text-foreground">Login</Button>
                            </Link>
                            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white">Signup</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2 pt-1">
                            {user?.role === 'student' && (
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full inline-flex items-center justify-center gap-2 p-2 rounded-lg bg-white/5 text-sm text-foreground"
                                >
                                    <User2 size={16} />
                                    View Profile
                                </Link>
                            )}
                            <Button
                                onClick={logoutHandler}
                                variant="outline"
                                className="w-full inline-flex items-center justify-center gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut size={16} />
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;
