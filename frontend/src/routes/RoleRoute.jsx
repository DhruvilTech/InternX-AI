import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

/**
 * Guard to restrict access to specific roles.
 */
export default function RoleRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is authorized
  const isAuthorized = allowedRoles.includes(role);

  return isAuthorized ? <Outlet /> : <Navigate to="/404" replace />;
}
