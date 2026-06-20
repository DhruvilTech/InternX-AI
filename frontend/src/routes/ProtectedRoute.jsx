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
    const isRecruiterPending = user.role === 'recruiter' && !user.isRecruiterVerified;
    const isRepresentativePending = user.role === 'college_representative' && !user.isVerified;

    if (isStudentPending || isRecruiterPending || isRepresentativePending) {
      return <PendingApprovalPage />;
    }
  }

  return <Outlet />;
}
