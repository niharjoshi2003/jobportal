import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import SessionBootstrap from './components/auth/SessionBootstrap';

const Login = lazy(() => import('./components/auth/Login'));
const StaffLogin = lazy(() => import('./components/auth/StaffLogin'));
const Signup = lazy(() => import('./components/auth/Signup'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const DashboardHome = lazy(() => import('./components/dashboard/DashboardHome'));
const InternshipsPage = lazy(() => import('./components/internships/InternshipsPage'));
const InternshipDescription = lazy(() => import('./components/internships/InternshipDescription'));
const JobsPage = lazy(() => import('./components/jobs/JobsPage'));
const CompaniesDirectory = lazy(() => import('./components/companies/CompaniesDirectory'));
const InterviewInvites = lazy(() => import('./components/interviews/InterviewInvites'));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'));
const FeedbacksPage = lazy(() => import('./components/feedbacks/FeedbacksPage'));
const ReportsPage = lazy(() => import('./components/reports/ReportsPage'));
const JobDescription = lazy(() => import('./components/JobDescription'));
const Companies = lazy(() => import('./components/admin/Companies'));
const CompanyCreate = lazy(() => import('./components/admin/CompanyCreate'));
const CompanySetup = lazy(() => import('./components/admin/CompanySetup'));
const AdminJobs = lazy(() => import('./components/admin/AdminJobs'));
const AdminInternships = lazy(() => import('./components/admin/AdminInternships'));
const PostJob = lazy(() => import('./components/admin/PostJob'));
const PostInternship = lazy(() => import('./components/admin/PostInternship'));
const Applicants = lazy(() => import('./components/admin/Applicants'));
const InternshipApplicants = lazy(() => import('./components/admin/InternshipApplicants'));
const RecruiterApplicants = lazy(() => import('./components/recruiter/RecruiterApplicants'));
const RecruiterJobApplicants = lazy(() => import('./components/recruiter/RecruiterJobApplicants'));
const AdminOverview = lazy(() => import('./components/admin/superadmin/AdminOverview'));
const AdminUsers = lazy(() => import('./components/admin/superadmin/AdminUsers'));
const AdminPendingStudents = lazy(() => import('./components/admin/superadmin/AdminPendingStudents'));
const LegalPage = lazy(() => import('./components/legal/LegalPage'));
const AdminAllCompanies = lazy(() => import('./components/admin/superadmin/AdminAllCompanies'));
const AdminAllJobs = lazy(() => import('./components/admin/superadmin/AdminAllJobs'));
const AdminAllInternships = lazy(() => import('./components/admin/superadmin/AdminAllInternships'));
const AdminAuditLogs = lazy(() => import('./components/admin/superadmin/AdminAuditLogs'));
const AdminApplications = lazy(() => import('./components/admin/superadmin/AdminApplications'));

const pageFallback = (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading...
    </div>
);

const page = (node) => <Suspense fallback={pageFallback}>{node}</Suspense>;

const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />
    },
    {
        path: '/login',
        element: page(<Login />)
    },
    {
        path: '/portal-login',
        element: page(<StaffLogin />)
    },
    {
        path: '/signup',
        element: page(<Signup />)
    },
    {
        path: '/forgot-password',
        element: page(<ForgotPassword />)
    },
    {
        path: '/reset-password',
        element: page(<ResetPassword />)
    },
    {
        path: '/privacy',
        element: page(<LegalPage />)
    },
    {
        element: page(<DashboardLayout />),
        children: [
            { path: '/dashboard', element: page(<DashboardHome />) },
            { path: '/internships', element: page(<InternshipsPage />) },
            { path: '/internships/:id', element: page(<InternshipDescription />) },
            { path: '/jobs', element: page(<JobsPage />) },
            { path: '/companies', element: page(<CompaniesDirectory />) },
            { path: '/interviews', element: page(<InterviewInvites />) },
            { path: '/profile', element: page(<ProfilePage />) },
            { path: '/feedbacks', element: page(<FeedbacksPage />) },
            { path: '/reports', element: page(<ReportsPage />) },
            { path: '/description/:id', element: page(<JobDescription />) },
            { path: '/hackathons', element: <ComingSoon title="Hackathons" /> },
            { path: '/events', element: <ComingSoon title="Events" /> },
            { path: '/help', element: <ComingSoon title="Help Desk" /> },
        ]
    },
    {
        path: '/recruiter/applicants',
        element: page(<ProtectedRoute roles={['recruiter']}><RecruiterApplicants /></ProtectedRoute>)
    },
    {
        path: '/recruiter/jobs/:jobId/applicants',
        element: page(<ProtectedRoute roles={['recruiter']}><RecruiterJobApplicants /></ProtectedRoute>)
    },
    {
        path: '/admin/companies',
        element: page(<ProtectedRoute roles={['admin']}><Companies /></ProtectedRoute>)
    },
    {
        path: '/admin/companies/create',
        element: page(<ProtectedRoute roles={['admin']}><CompanyCreate /></ProtectedRoute>)
    },
    {
        path: '/admin/companies/:id',
        element: page(<ProtectedRoute roles={['admin']}><CompanySetup /></ProtectedRoute>)
    },
    {
        path: '/admin/jobs',
        element: page(<ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>)
    },
    {
        path: '/admin/jobs/create',
        element: page(<ProtectedRoute roles={['admin']}><PostJob /></ProtectedRoute>)
    },
    {
        path: '/admin/jobs/:id/applicants',
        element: page(<ProtectedRoute roles={['admin']}><Applicants /></ProtectedRoute>)
    },
    {
        path: '/admin/internships',
        element: page(<ProtectedRoute roles={['admin']}><AdminInternships /></ProtectedRoute>)
    },
    {
        path: '/admin/internships/create',
        element: page(<ProtectedRoute roles={['admin']}><PostInternship /></ProtectedRoute>)
    },
    {
        path: '/admin/internships/:id/applicants',
        element: page(<ProtectedRoute roles={['admin']}><InternshipApplicants /></ProtectedRoute>)
    },
    {
        path: '/admin/overview',
        element: page(<ProtectedRoute roles={['admin']}><AdminOverview /></ProtectedRoute>)
    },
    {
        path: '/admin/users',
        element: page(<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>)
    },
    {
        path: '/admin/pending-students',
        element: page(<ProtectedRoute roles={['admin']}><AdminPendingStudents /></ProtectedRoute>)
    },
    {
        path: '/admin/all-companies',
        element: page(<ProtectedRoute roles={['admin']}><AdminAllCompanies /></ProtectedRoute>)
    },
    {
        path: '/admin/all-jobs',
        element: page(<ProtectedRoute roles={['admin']}><AdminAllJobs /></ProtectedRoute>)
    },
    {
        path: '/admin/all-internships',
        element: page(<ProtectedRoute roles={['admin']}><AdminAllInternships /></ProtectedRoute>)
    },
    {
        path: '/admin/audit-logs',
        element: page(<ProtectedRoute roles={['admin']}><AdminAuditLogs /></ProtectedRoute>)
    },
    {
        path: '/admin/applications',
        element: page(<ProtectedRoute roles={['admin']}><AdminApplications /></ProtectedRoute>)
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
        <SessionBootstrap>
            <RouterProvider router={appRouter} />
        </SessionBootstrap>
    );
}

export default App;
