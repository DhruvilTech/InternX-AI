import { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi.js';
import axiosInstance from '../api/axios.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); // guest, student, college, recruiter, admin
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Retrieve authenticated profile details
  const fetchCurrentUser = async () => {
    try {
      const data = await authApi.getMe();
      if (data?.success && data?.data?.user) {
        setUser(data.data.user);
        setRole(data.data.user.role);
        setIsAuthenticated(true);
        return data.data.user;
      }
    } catch (err) {
      // Clear state locally if authorization fails
      setUser(null);
      setRole('guest');
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
    }
  };

  // Perform user credentials login
  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res?.success && res?.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.accessToken}`;
        
        const currentUser = res.user || res.data?.user;
        setUser(currentUser);
        setRole(currentUser.role);
        setIsAuthenticated(true);
        return res;
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Perform user register
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      if (res?.success && res?.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.accessToken}`;
        
        const currentUser = res.user || res.data?.user;
        setUser(currentUser);
        setRole(currentUser.role);
        setIsAuthenticated(true);
        return res;
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Log out user session
  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setUser(null);
      setRole('guest');
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Refresh access token manually
  const refreshSessionToken = async () => {
    try {
      const res = await authApi.refreshToken();
      if (res?.success && res?.data?.accessToken) {
        const token = res.data.accessToken;
        localStorage.setItem('accessToken', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return token;
      }
    } catch (err) {
      console.error('Manual token refresh failed:', err);
      await logout();
    }
  };

  // Update profile attributes in local state
  const updateProfile = (updatedUserData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUserData } : null));
    if (updatedUserData.role) {
      setRole(updatedUserData.role);
    }
  };

  // Setup check on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchCurrentUser();
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for logout events broadcasted by Axios interceptors
    const handleGlobalLogout = () => {
      setUser(null);
      setRole('guest');
      setIsAuthenticated(false);
    };
    window.addEventListener('auth_logout', handleGlobalLogout);

    return () => {
      window.removeEventListener('auth_logout', handleGlobalLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshToken: refreshSessionToken,
        fetchCurrentUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
