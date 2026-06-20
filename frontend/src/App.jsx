import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import useLenis from './hooks/useLenis';
import Spotlight from './components/ui/Spotlight';
import SplashCursor from './components/ui/SplashCursor';
import MatrixRain from './components/ui/MatrixRain';
import LiquidGlass from './components/ui/LiquidGlass';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Global Context UI
import ToastContainer from './components/ui/ToastContainer';
import CommandPalette from './components/ui/CommandPalette';
import NotificationsDrawer from './components/layout/NotificationsDrawer';

// Guards & redirection helpers
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import RoleRoute from './routes/RoleRoute';
import RoleRedirect from './components/RoleRedirect';

// Auth Pages
import AuthPages from './pages/AuthPages';
import CollegeAdminLoginPage from './pages/CollegeAdminLoginPage';
import RecruiterLoginPage from './pages/RecruiterLoginPage';

// Dashboard page wrappers
import StudentDashboard from './pages/dashboards/StudentDashboard';
import CollegeDashboard from './pages/dashboards/CollegeDashboard';
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminInspectUserPage from './pages/AdminInspectUserPage';

// Other Pages
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import CareerSelectionPage from './pages/CareerSelectionPage';
import InternshipGeneratorPage from './pages/InternshipGeneratorPage';
import AICompanyPage from './pages/AICompanyPage';
import TaskManagementPage from './pages/TaskManagementPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import SubmissionPage from './pages/SubmissionPage';
import AIEvaluationPage from './pages/AIEvaluationPage';
import FeedbackCenterPage from './pages/FeedbackCenterPage';
import SkillGapPage from './pages/SkillGapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AICareerCoachPage from './pages/AICareerCoachPage';
import InterviewSimulatorPage from './pages/InterviewSimulatorPage';
import CertificateCenterPage from './pages/CertificateCenterPage';
import ProfilePage from './pages/ProfilePage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import { Page404 } from './pages/ErrorPages';

export default function App() {
  useLenis();
  const location = useLocation();

  // Hide footer on dashboard views or active student program modules or auth views
  const isDashboardView =
    location.pathname.includes('/dashboard') ||
    ['/company', '/kanban', '/task_details', '/submit_task', '/evaluation', '/feedback_center', '/skill_gap', '/analytics', '/career_coach', '/interview_simulator', '/candidate_profile', '/settings', '/notifications', '/login', '/register', '/forgot-password', '/reset-password', '/college-login', '/recruiter-login', '/admin/user'].some((path) =>
      location.pathname.startsWith(path)
    );

  return (
    <div className="relative min-h-screen bg-void text-text overflow-x-hidden transition-colors duration-500">
      {/* Background/Futuristic Canvas and Glow layers */}
      <LiquidGlass />
      <MatrixRain />
      <SplashCursor />
      <Spotlight />
      
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
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              
              {/* Guest Only Auth Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<AuthPages />} />
                <Route path="/register" element={<AuthPages />} />
                <Route path="/forgot-password" element={<AuthPages />} />
                <Route path="/reset-password" element={<AuthPages />} />
                <Route path="/college-login" element={<CollegeAdminLoginPage />} />
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
                  <Route path="/interview_simulator" element={<InterviewSimulatorPage />} />
                  <Route path="/certificates" element={<CertificateCenterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* College specific views */}
                <Route element={<RoleRoute allowedRoles={['college', 'college_admin']} />}>
                  <Route path="/college/dashboard" element={<CollegeDashboard />} />
                </Route>

                {/* Recruiter specific views */}
                <Route element={<RoleRoute allowedRoles={['recruiter']} />}>
                  <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
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
          </motion.div>
        </AnimatePresence>
        
        {!isDashboardView && <Footer />}
      </main>
    </div>
  );
}
