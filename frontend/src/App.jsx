import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import useLenis from './hooks/useLenis';

// ── Always-eager: layout shells & UI canvas (tiny, needed immediately) ──────
import FuturisticBackground from './components/ui/FuturisticBackground';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ToastContainer from './components/ui/ToastContainer';
import CommandPalette from './components/ui/CommandPalette';
import NotificationsDrawer from './components/layout/NotificationsDrawer';

// ── Route guards (tiny, needed on every route evaluation) ────────────────────
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import RoleRoute from './routes/RoleRoute';
import RoleRedirect from './components/RoleRedirect';

// ── Skeleton fallback for Suspense ───────────────────────────────────────────
import PageSkeleton from './components/ui/PageSkeleton';

// ── Lazy-loaded: Auth pages ──────────────────────────────────────────────────
const AuthPages = lazy(() => import('./pages/AuthPages'));
const RecruiterLoginPage = lazy(() => import('./pages/RecruiterLoginPage'));

// ── Lazy-loaded: Dashboard shells ───────────────────────────────────────────
const StudentDashboard = lazy(() => import('./pages/dashboards/StudentDashboard'));
const CollegeDashboard = lazy(() => import('./pages/dashboards/CollegeDashboard'));
const RecruiterDashboard = lazy(() => import('./pages/dashboards/RecruiterDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const AdminInspectUserPage = lazy(() => import('./pages/AdminInspectUserPage'));

// ── Lazy-loaded: Landing ─────────────────────────────────────────────────────
const LandingPage = lazy(() => import('./pages/LandingPage'));

// ── Lazy-loaded: Student portal pages ───────────────────────────────────────
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const CareerSelectionPage = lazy(() => import('./pages/CareerSelectionPage'));
const CareerDetailsPage = lazy(() => import('./pages/CareerDetailsPage'));
const MyCareerPage = lazy(() => import('./pages/MyCareerPage'));
const InternshipGeneratorPage = lazy(() => import('./pages/InternshipGeneratorPage'));
const AICompanyPage = lazy(() => import('./pages/AICompanyPage'));
const TaskManagementPage = lazy(() => import('./pages/TaskManagementPage'));
const TaskDetailsPage = lazy(() => import('./pages/TaskDetailsPage'));
const SubmissionPage = lazy(() => import('./pages/SubmissionPage'));
const AIEvaluationPage = lazy(() => import('./pages/AIEvaluationPage'));
const FeedbackCenterPage = lazy(() => import('./pages/FeedbackCenterPage'));
const SkillGapPage = lazy(() => import('./pages/SkillGapPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AICareerCoachPage = lazy(() => import('./pages/AICareerCoachPage'));
const InterviewDashboardPage = lazy(() => import('./pages/InterviewDashboardPage'));
const LiveInterviewPage = lazy(() => import('./pages/LiveInterviewPage'));
const InterviewReportPage = lazy(() => import('./pages/InterviewReportPage'));
const CertificateCenterPage = lazy(() => import('./pages/CertificateCenterPage'));
const VerifyCertificatePage = lazy(() => import('./pages/VerifyCertificatePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const StudentNotificationsPage = lazy(() => import('./pages/StudentNotificationsPage'));
const StudentOffersPage = lazy(() => import('./pages/StudentOffersPage'));

// ── Lazy-loaded: GitHub module pages ────────────────────────────────────────
const GitHubConnectPage = lazy(() => import('./pages/GitHubConnectPage'));
const GitHubProfilePage = lazy(() => import('./pages/GitHubProfilePage'));
const GitHubRepositoriesPage = lazy(() => import('./pages/GitHubRepositoriesPage'));
const RepositoryDetailsPage = lazy(() => import('./pages/RepositoryDetailsPage'));
const RepositorySelectionPage = lazy(() => import('./pages/RepositorySelectionPage'));

// ── Lazy-loaded: College portal pages ───────────────────────────────────────
const StudentsManagementPage = lazy(() => import('./pages/StudentsManagementPage'));
const StudentDetailsPage = lazy(() => import('./pages/StudentDetailsPage'));
const InternshipAnalyticsPage = lazy(() => import('./pages/InternshipAnalyticsPage'));
const SkillsAnalyticsPage = lazy(() => import('./pages/SkillsAnalyticsPage'));
const PlacementReadinessPage = lazy(() => import('./pages/PlacementReadinessPage'));
const CertificateManagementPage = lazy(() => import('./pages/CertificateManagementPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const PlacementTrackingPage = lazy(() => import('./pages/PlacementTrackingPage'));
const CollegeNotificationsPage = lazy(() => import('./pages/CollegeNotificationsPage'));

// ── Lazy-loaded: Recruiter portal pages ─────────────────────────────────────
const StudentDiscoveryPage = lazy(() => import('./pages/StudentDiscoveryPage'));
const StudentDetailPage = lazy(() => import('./pages/StudentDetailPage'));
const ShortlistedCandidatesPage = lazy(() => import('./pages/ShortlistedCandidatesPage'));
const HiringPipelinePage = lazy(() => import('./pages/HiringPipelinePage'));
const RecruiterAnalyticsPage = lazy(() => import('./pages/RecruiterAnalyticsPage'));
const RecruiterProfilePage = lazy(() => import('./pages/RecruiterProfilePage'));
const RecruiterDashboardPage = lazy(() => import('./pages/RecruiterDashboardPage'));

// ── Lazy-loaded: Shared pages ────────────────────────────────────────────────
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const CandidateProfilePage = lazy(() => import('./pages/CandidateProfilePage'));
const Page404 = lazy(() =>
  import('./pages/ErrorPages').then((m) => ({ default: m.Page404 }))
);

export default function App() {
  useLenis();
  const location = useLocation();

  // Hide footer on dashboard views or active student program modules or auth views
  const isDashboardView =
    location.pathname.includes('/dashboard') ||
    ['/company', '/kanban', '/task_details', '/submit_task', '/evaluation', '/feedback_center', '/skill_gap', '/analytics', '/career_coach', '/interview_simulator', '/interview', '/candidate_profile', '/settings', '/notifications', '/login', '/register', '/forgot-password', '/reset-password', '/recruiter-login', '/admin/user', '/recruiter'].some((path) =>
      location.pathname.startsWith(path)
    );

  return (
    <div className="relative min-h-screen bg-void text-text overflow-x-hidden transition-colors duration-500">
      {/* Consolidated GPU Background system */}
      <FuturisticBackground />
      
      {/* Global Overlays and Dialog Controllers */}
      <Navbar />
      <NotificationsDrawer />
      <CommandPalette />
      <ToastContainer />
      
      {/* Page Content with Slide-Fade transitions */}
      <main className="relative z-[2]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<PageSkeleton />}>
              <Routes location={location}>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/verify/:id" element={<VerifyCertificatePage />} />
                
                {/* Guest Only Auth Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<AuthPages />} />
                  <Route path="/register" element={<AuthPages />} />
                  <Route path="/forgot-password" element={<AuthPages />} />
                  <Route path="/reset-password" element={<AuthPages />} />
                  <Route path="/recruiter-login" element={<RecruiterLoginPage />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  {/* Router redirect based on active user role */}
                  <Route path="/dashboard" element={<RoleRedirect />} />

                  {/* Student specific views */}
                  <Route element={<RoleRoute allowedRoles={['student']} />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/career_selection" element={<CareerSelectionPage />} />
                    <Route path="/careers" element={<CareerSelectionPage />} />
                    <Route path="/careers/:id" element={<CareerDetailsPage />} />
                    <Route path="/my-career" element={<MyCareerPage />} />
                    <Route path="/generator" element={<InternshipGeneratorPage />} />
                    <Route path="/company" element={<AICompanyPage />} />
                    <Route path="/kanban" element={<TaskManagementPage />} />
                    <Route path="/task_details" element={<TaskDetailsPage />} />
                    <Route path="/submit_task" element={<SubmissionPage />} />
                    <Route path="/evaluation" element={<AIEvaluationPage />} />
                    <Route path="/feedback_center" element={<FeedbackCenterPage />} />
                    <Route path="/skill_gap" element={<SkillGapPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/career_coach" element={<AICareerCoachPage />} />
                    <Route path="/interview_simulator" element={<Navigate to="/dashboard/interview" replace />} />
                    <Route path="/dashboard/interview" element={<InterviewDashboardPage />} />
                    <Route path="/interview/live/:id" element={<LiveInterviewPage />} />
                    <Route path="/interview/report/:id" element={<InterviewReportPage />} />
                    <Route path="/certificates" element={<CertificateCenterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/student/notifications" element={<StudentNotificationsPage />} />
                    <Route path="/student/offers" element={<StudentOffersPage />} />
                    
                    {/* GitHub Module Views */}
                    <Route path="/dashboard/github" element={<GitHubConnectPage />} />
                    <Route path="/dashboard/github/profile" element={<GitHubProfilePage />} />
                    <Route path="/dashboard/github/repositories" element={<GitHubRepositoriesPage />} />
                    <Route path="/dashboard/github/repositories/:id" element={<RepositoryDetailsPage />} />
                    <Route path="/dashboard/github/select" element={<RepositorySelectionPage />} />
                  </Route>

                  {/* College specific views */}
                  <Route element={<RoleRoute allowedRoles={['college_representative', 'college_admin']} />}>
                    <Route path="/college/dashboard" element={<CollegeDashboard />} />
                    <Route path="/college/students" element={<StudentsManagementPage />} />
                    <Route path="/college/students/:id" element={<StudentDetailsPage />} />
                    <Route path="/college/placements" element={<PlacementTrackingPage />} />
                    <Route path="/college/notifications" element={<CollegeNotificationsPage />} />
                    <Route path="/college/internships" element={<InternshipAnalyticsPage />} />
                    <Route path="/college/skills" element={<SkillsAnalyticsPage />} />
                    <Route path="/college/placement" element={<PlacementReadinessPage />} />
                    <Route path="/college/certificates" element={<CertificateManagementPage />} />
                    <Route path="/college/reports" element={<ReportsPage />} />
                  </Route>

                  {/* Recruiter specific views */}
                  <Route element={<RoleRoute allowedRoles={['recruiter']} />}>
                    <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
                    <Route path="/recruiter/students" element={<StudentDiscoveryPage />} />
                    <Route path="/recruiter/students/:id" element={<StudentDetailPage />} />
                    <Route path="/recruiter/shortlisted" element={<ShortlistedCandidatesPage />} />
                    <Route path="/recruiter/pipeline" element={<HiringPipelinePage />} />
                    <Route path="/recruiter/analytics" element={<RecruiterAnalyticsPage />} />
                    <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
                    <Route path="/candidate_profile" element={<CandidateProfilePage />} />
                  </Route>

                  {/* Admin specific views */}
                  <Route element={<RoleRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/user/:id" element={<AdminInspectUserPage />} />
                  </Route>

                  {/* Shared User views */}
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                </Route>

                {/* Catch-all 404 handler */}
                <Route path="*" element={<Page404 />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
        
        {!isDashboardView && <Footer />}
      </main>
    </div>
  );
}
