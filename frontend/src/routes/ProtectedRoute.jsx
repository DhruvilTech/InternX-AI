import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import PendingApprovalPage from '../pages/PendingApprovalPage.jsx';

/**
 * Guard to restrict access to authenticated users only.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Intercept and block users pending admin approval (except for admin accounts)
  if (user && user.role !== 'admin') {
    const isStudentPending = user.role === 'student' && !user.isVerified;
    const isCollegePending = user.role === 'college' && !user.isCollegeVerified;
    const isRecruiterPending = user.role === 'recruiter' && !user.isRecruiterVerified;

    if (isStudentPending || isCollegePending || isRecruiterPending) {
      return <PendingApprovalPage />;
    }
  }

  return <Outlet />;
}
