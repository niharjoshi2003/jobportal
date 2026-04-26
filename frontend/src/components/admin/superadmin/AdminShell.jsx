import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Users, Building2, Briefcase, GraduationCap, LogOut, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const navItems = [
    { path: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/all-companies', label: 'Companies', icon: Building2 },
    { path: '/admin/all-jobs', label: 'Jobs', icon: Briefcase },
    { path: '/admin/all-internships', label: 'Internships', icon: GraduationCap },
];

const AdminShell = ({ children, title, subtitle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    const logout = async () => {
        try { await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true }); } catch (e) { /* ignore */ }
        dispatch(setUser(null));
        navigate('/login');
        toast.success('Logged out');
    };

    return (
        <div className="min-h-screen bg-background flex">
            <aside className="w-64 bg-[hsl(222,47%,8%)] border-r border-white/10 flex flex-col">
                <div className="px-5 py-5 border-b border-white/10">
                    <Link to="/admin/overview" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <ShieldCheck size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white tracking-tight">Job-O-Hire</p>
                            <p className="text-[10px] text-purple-300 uppercase tracking-wider">Admin Console</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
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
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="border-b border-border bg-card/50 px-6 py-4">
                    <h1 className="text-xl font-bold text-foreground">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
};

export default AdminShell;
