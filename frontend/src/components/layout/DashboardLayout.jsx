import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import { setUser } from '@/redux/authSlice';
import { USER_API_END_POINT } from '@/utils/constant';

const DashboardLayout = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    // Pull fresh notifications periodically so newly posted jobs / approvals show
    // up without forcing the student to log out and back in.
    useEffect(() => {
        if (!user || user.role !== 'student') return;

        let cancelled = false;
        const refresh = async () => {
            try {
                const res = await axios.get(`${USER_API_END_POINT}/notifications`, { withCredentials: true });
                if (cancelled || !res.data?.success) return;
                const incoming = res.data.notifications || [];
                const current = user.notifications || [];
                // Avoid unnecessary redux churn if nothing changed.
                if (incoming.length !== current.length
                    || incoming.some((n, i) => n._id?.toString?.() !== current[i]?._id?.toString?.()
                        || n.read !== current[i]?.read)) {
                    dispatch(setUser({ ...user, notifications: incoming }));
                }
            } catch {
                /* silent: notifications are non-critical */
            }
        };

        refresh();
        const id = setInterval(refresh, 60_000);
        return () => { cancelled = true; clearInterval(id); };
    }, [user?._id, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === 'admin') {
        return <Navigate to="/admin/overview" replace />;
    }
    if (user.role === 'recruiter') {
        return <Navigate to="/recruiter/applicants" replace />;
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
