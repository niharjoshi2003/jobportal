import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Users, Building2, Briefcase, GraduationCap, LogOut, UserCheck, ScrollText, Menu, X, FileText } from 'lucide-react';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { clearSessionToken } from '@/utils/session';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import BrandLogo from '../../shared/BrandLogo';

const navItems = [
    { path: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/pending-students', label: 'Pending Approvals', icon: UserCheck },
    { path: '/admin/all-companies', label: 'Companies', icon: Building2 },
    { path: '/admin/all-jobs', label: 'Jobs', icon: Briefcase },
    { path: '/admin/all-internships', label: 'Internships', icon: GraduationCap },
    { path: '/admin/applications', label: 'Applications', icon: FileText },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

const AdminShell = ({ children, title, subtitle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const [mobileOpen, setMobileOpen] = useState(false);

    const logout = async () => {
        try { await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true }); } catch (e) { /* ignore */ }
        clearSessionToken();
        dispatch(setUser(null));
        setMobileOpen(false);
        navigate('/portal-login');
        toast.success('Logged out');
    };

    const sidebarContent = (
        <>
            <div className="px-5 py-5 border-b border-white/10">
                <Link to="/admin/overview" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <BrandLogo size="sm" />
                    <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold ml-1">Admin</span>
                </Link>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary/15 text-primary'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 px-3 py-4">
                <div className="px-3 py-2 mb-2">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user?.fullname}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors w-full"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-background flex">
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur-md px-4 flex items-center justify-between">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="inline-flex items-center justify-center p-2 rounded-md border border-border text-foreground hover:bg-white/5"
                    aria-label="Open admin menu"
                >
                    <Menu size={18} />
                </button>
                <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                <div className="w-9" />
            </div>

            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 z-50 bg-[hsl(222,47%,8%)] border-r border-white/10 flex flex-col transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-white hover:bg-white/10"
                    aria-label="Close admin menu"
                >
                    <X size={16} />
                </button>
                {sidebarContent}
            </aside>

            <aside className="hidden lg:flex w-64 bg-[hsl(222,47%,8%)] border-r border-white/10 flex-col">
                {sidebarContent}
            </aside>

            <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">
                <div className="border-b border-border bg-card/50 px-4 sm:px-6 py-4">
                    <h1 className="text-xl font-bold text-foreground">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
                <div className="p-4 sm:p-6">{children}</div>
            </main>
        </div>
    );
};

export default AdminShell;
