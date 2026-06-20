import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

/**
 * Guard to restrict access to guest users (non-authenticated).
 * Authenticated users are redirected to their dashboards.
 */
export default function PublicRoute() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    let dashboardPath = '/dashboard';
    if (role === 'student') dashboardPath = '/student/dashboard';
    else if (role === 'college' || role === 'college_admin') dashboardPath = '/college/dashboard';
    else if (role === 'recruiter') dashboardPath = '/recruiter/dashboard';
    else if (role === 'admin') dashboardPath = '/admin/dashboard';

    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}
