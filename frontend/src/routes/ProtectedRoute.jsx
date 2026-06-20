import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

/**
 * Guard to restrict access to authenticated users only.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
