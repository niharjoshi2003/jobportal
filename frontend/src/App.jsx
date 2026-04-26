import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import InternshipsPage from './components/internships/InternshipsPage';
import InternshipDescription from './components/internships/InternshipDescription';
import JobsPage from './components/jobs/JobsPage';
import CompaniesDirectory from './components/companies/CompaniesDirectory';
import InterviewInvites from './components/interviews/InterviewInvites';
import ProfilePage from './components/profile/ProfilePage';
import FeedbacksPage from './components/feedbacks/FeedbacksPage';
import ReportsPage from './components/reports/ReportsPage';
import JobDescription from './components/JobDescription';
import Companies from './components/admin/Companies';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';
import AdminJobs from './components/admin/AdminJobs';
import AdminInternships from './components/admin/AdminInternships';
import PostJob from './components/admin/PostJob';
import PostInternship from './components/admin/PostInternship';
import Applicants from './components/admin/Applicants';
import InternshipApplicants from './components/admin/InternshipApplicants';
import ProtectedRoute from './components/admin/ProtectedRoute';
import RecruiterApplicants from './components/recruiter/RecruiterApplicants';
import AdminOverview from './components/admin/superadmin/AdminOverview';
import AdminUsers from './components/admin/superadmin/AdminUsers';
import AdminAllCompanies from './components/admin/superadmin/AdminAllCompanies';
import AdminAllJobs from './components/admin/superadmin/AdminAllJobs';
import AdminAllInternships from './components/admin/superadmin/AdminAllInternships';

const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/signup',
        element: <Signup />
    },
    {
        element: <DashboardLayout />,
        children: [
            { path: '/dashboard', element: <DashboardHome /> },
            { path: '/internships', element: <InternshipsPage /> },
            { path: '/internships/:id', element: <InternshipDescription /> },
            { path: '/jobs', element: <JobsPage /> },
            { path: '/companies', element: <CompaniesDirectory /> },
            { path: '/interviews', element: <InterviewInvites /> },
            { path: '/profile', element: <ProfilePage /> },
            { path: '/feedbacks', element: <FeedbacksPage /> },
            { path: '/reports', element: <ReportsPage /> },
            { path: '/description/:id', element: <JobDescription /> },
            { path: '/hackathons', element: <ComingSoon title="Hackathons" /> },
            { path: '/events', element: <ComingSoon title="Events" /> },
            { path: '/help', element: <ComingSoon title="Help Desk" /> },
        ]
    },
    // Recruiter dashboard
    {
        path: '/recruiter/applicants',
        element: <ProtectedRoute roles={['recruiter']}><RecruiterApplicants /></ProtectedRoute>
    },
    // Admin-only management
    {
        path: '/admin/companies',
        element: <ProtectedRoute roles={['admin']}><Companies /></ProtectedRoute>
    },
    {
        path: '/admin/companies/create',
        element: <ProtectedRoute roles={['admin']}><CompanyCreate /></ProtectedRoute>
    },
    {
        path: '/admin/companies/:id',
        element: <ProtectedRoute roles={['admin']}><CompanySetup /></ProtectedRoute>
    },
    {
        path: '/admin/jobs',
        element: <ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>
    },
    {
        path: '/admin/jobs/create',
        element: <ProtectedRoute roles={['admin']}><PostJob /></ProtectedRoute>
    },
    {
        path: '/admin/jobs/:id/applicants',
        element: <ProtectedRoute roles={['admin']}><Applicants /></ProtectedRoute>
    },
    {
        path: '/admin/internships',
        element: <ProtectedRoute roles={['admin']}><AdminInternships /></ProtectedRoute>
    },
    {
        path: '/admin/internships/create',
        element: <ProtectedRoute roles={['admin']}><PostInternship /></ProtectedRoute>
    },
    {
        path: '/admin/internships/:id/applicants',
        element: <ProtectedRoute roles={['admin']}><InternshipApplicants /></ProtectedRoute>
    },
    // Super-admin (admin role only) console
    {
        path: '/admin/overview',
        element: <ProtectedRoute roles={['admin']}><AdminOverview /></ProtectedRoute>
    },
    {
        path: '/admin/users',
        element: <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
    },
    {
        path: '/admin/all-companies',
        element: <ProtectedRoute roles={['admin']}><AdminAllCompanies /></ProtectedRoute>
    },
    {
        path: '/admin/all-jobs',
        element: <ProtectedRoute roles={['admin']}><AdminAllJobs /></ProtectedRoute>
    },
    {
        path: '/admin/all-internships',
        element: <ProtectedRoute roles={['admin']}><AdminAllInternships /></ProtectedRoute>
    },
]);

function ComingSoon({ title }) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground">Coming soon! We're building something amazing.</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <div>
            <RouterProvider router={appRouter} />
        </div>
    );
}

export default App;
