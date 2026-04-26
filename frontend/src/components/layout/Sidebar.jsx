import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarImage } from '../ui/avatar';
import {
    Home, Building2, Briefcase, CalendarCheck, Trophy, Calendar,
    BarChart3, MessageSquare, User, HelpCircle, LogOut, ChevronLeft,
    ChevronRight, Menu, X
} from 'lucide-react';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const menuItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/companies', label: 'Companies', icon: Building2 },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/internships', label: 'Internships', icon: Briefcase },
    { path: '/interviews', label: 'Interview Invites', icon: CalendarCheck },
    { path: '/hackathons', label: 'Hackathons', icon: Trophy },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { path: '/profile', label: 'Your Profile', icon: User },
];

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const completion = user?.profile?.profileCompletion || 0;

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

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-4 py-5 flex items-center justify-between">
                {!collapsed && (
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-border flex items-center justify-center">
                            <span className="text-white font-bold text-[10px]">JOH</span>
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">Job-O-Hire</span>
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Profile Card */}
            <div className={`mx-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10 ${collapsed ? 'items-center' : ''}`}>
                <div className={`flex ${collapsed ? 'justify-center' : 'items-center gap-3'}`}>
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                            <AvatarImage
                                src={user?.profile?.profilePhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.fullname || 'U')}
                                alt={user?.fullname}
                            />
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[hsl(222,47%,8%)]" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.fullname}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Profile</span>
                            <span className="text-xs font-semibold text-primary">{completion}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full gradient-border transition-all duration-500"
                                style={{ width: `${completion}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
                {menuItems.map(item => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                }
                                ${collapsed ? 'justify-center' : ''}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={19} className={isActive ? 'text-primary' : ''} />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
                <Link
                    to="/help"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                    <HelpCircle size={19} />
                    {!collapsed && <span>Help Desk</span>}
                </Link>
                <button
                    onClick={logoutHandler}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={19} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border text-foreground"
            >
                <Menu size={20} />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 bg-[hsl(222,47%,8%)] border-r border-white/10 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-muted-foreground"
                >
                    <X size={18} />
                </button>
                {sidebarContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col h-screen sticky top-0 bg-[hsl(222,47%,8%)] border-r border-white/10 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;
