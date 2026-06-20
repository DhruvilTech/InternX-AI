import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import LoadingScreen from './LoadingScreen.jsx';

/**
 * Route level redirection handler to steer authenticated users to their dashboard home.
 */
export default function RoleRedirect() {
  const { isAuthenticated, role, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  let redirectPath = '/login';
  if (role === 'student') {
    if (!user?.selectedCareer) {
      redirectPath = '/careers';
    } else {
      redirectPath = '/student/dashboard';
    }
  } else if (role === 'college' || role === 'college_admin') {
    redirectPath = '/college/dashboard';
  } else if (role === 'recruiter') {
    redirectPath = '/recruiter/dashboard';
  } else if (role === 'admin') {
    redirectPath = '/admin/dashboard';
  }

  return <Navigate to={redirectPath} replace />;
}
