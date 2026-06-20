import { motion, AnimatePresence } from 'framer-motion'
import useLenis from './hooks/useLenis'
import Spotlight from './components/ui/Spotlight'
import SplashCursor from './components/ui/SplashCursor'
import MatrixRain from './components/ui/MatrixRain'
import LiquidGlass from './components/ui/LiquidGlass'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Global Context UI
import { useNavigation } from './context/NavigationContext'
import ToastContainer from './components/ui/ToastContainer'
import CommandPalette from './components/ui/CommandPalette'
import NotificationsDrawer from './components/layout/NotificationsDrawer'

// Page Components
import LandingPage from './pages/LandingPage'
import AuthPages from './pages/AuthPages'
import OnboardingPage from './pages/OnboardingPage'
import CareerSelectionPage from './pages/CareerSelectionPage'
import InternshipGeneratorPage from './pages/InternshipGeneratorPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import AICompanyPage from './pages/AICompanyPage'
import TaskManagementPage from './pages/TaskManagementPage'
import TaskDetailsPage from './pages/TaskDetailsPage'
import SubmissionPage from './pages/SubmissionPage'
import AIEvaluationPage from './pages/AIEvaluationPage'
import FeedbackCenterPage from './pages/FeedbackCenterPage'
import SkillGapPage from './pages/SkillGapPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AICareerCoachPage from './pages/AICareerCoachPage'
import InterviewSimulatorPage from './pages/InterviewSimulatorPage'
import CertificateCenterPage from './pages/CertificateCenterPage'
import ProfilePage from './pages/ProfilePage'
import RecruiterLoginPage from './pages/RecruiterLoginPage'
import RecruiterDashboardPage from './pages/RecruiterDashboardPage'
import CandidateProfilePage from './pages/CandidateProfilePage'
import CollegeAdminLoginPage from './pages/CollegeAdminLoginPage'
import CollegeDashboardPage from './pages/CollegeDashboardPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPanelPage from './pages/AdminPanelPage'
import { Page404, MaintenancePage } from './pages/ErrorPages'

export default function App() {
  useLenis()
  const { page } = useNavigation()

  // Match the active route
  const renderActivePage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage />
      case 'login':
        return <AuthPages />
      case 'onboarding':
        return <OnboardingPage />
      case 'career_selection':
        return <CareerSelectionPage />
      case 'generator':
        return <InternshipGeneratorPage />
      case 'dashboard':
        return <StudentDashboardPage />
      case 'company':
        return <AICompanyPage />
      case 'kanban':
        return <TaskManagementPage />
      case 'task_details':
        return <TaskDetailsPage />
      case 'submit_task':
        return <SubmissionPage />
      case 'evaluation':
        return <AIEvaluationPage />
      case 'feedback_center':
        return <FeedbackCenterPage />
      case 'skill_gap':
        return <SkillGapPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'career_coach':
        return <AICareerCoachPage />
      case 'interview_simulator':
        return <InterviewSimulatorPage />
      case 'certificates':
        return <CertificateCenterPage />
      case 'profile':
        return <ProfilePage />
      case 'recruiter_login':
        return <RecruiterLoginPage />
      case 'recruiter_dashboard':
        return <RecruiterDashboardPage />
      case 'candidate_profile':
        return <CandidateProfilePage />
      case 'college_login':
        return <CollegeAdminLoginPage />
      case 'college_dashboard':
        return <CollegeDashboardPage />
      case 'notifications':
        return <NotificationsPage />
      case 'settings':
        return <SettingsPage />
      case 'admin_panel':
        return <AdminPanelPage />
      case '404':
        return <Page404 />
      case 'maintenance':
        return <MaintenancePage />
      default:
        return <Page404 />
    }
  }

  // Dashboard pages or split interfaces don't need marketing footers
  const isDashboardView = ['dashboard', 'company', 'kanban', 'task_details', 'submit_task', 'evaluation', 'feedback_center', 'skill_gap', 'analytics', 'career_coach', 'interview_simulator', 'recruiter_dashboard', 'candidate_profile', 'college_dashboard', 'settings', 'notifications', 'admin_panel'].includes(page)

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
            key={page}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderActivePage()}
          </motion.div>
        </AnimatePresence>
        
        {!isDashboardView && <Footer />}
      </main>
    </div>
  )
}
