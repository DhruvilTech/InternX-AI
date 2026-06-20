import axiosInstance from './axios.js';

/**
 * Register a new user with role-specific details.
 */
export const register = async (userData) => {
  const response = await axiosInstance.post('/api/auth/register', userData);
  return response.data;
};

/**
 * Login user and retrieve profile + tokens.
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post('/api/auth/login', credentials);
  return response.data;
};

/**
 * Terminate user session.
 */
export const logout = async () => {
  const response = await axiosInstance.post('/api/auth/logout');
  return response.data;
};

/**
 * Retrieve authenticated user profile metadata.
 */
export const getMe = async () => {
  const response = await axiosInstance.get('/api/auth/me');
  return response.data;
};

/**
 * Change current password.
 */
export const changePassword = async (passwords) => {
  const response = await axiosInstance.put('/api/auth/change-password', passwords);
  return response.data;
};

/**
 * Trigger forgot password email/token generation.
 */
export const forgotPassword = async (emailData) => {
  const response = await axiosInstance.post('/api/auth/forgot-password', emailData);
  return response.data;
};

/**
 * Reset password using token.
 */
export const resetPassword = async (resetData) => {
  const response = await axiosInstance.post('/api/auth/reset-password', resetData);
  return response.data;
};

/**
 * Silent token refresh.
 */
export const refreshToken = async () => {
  const response = await axiosInstance.post('/api/auth/refresh-token');
  return response.data;
};

/**
 * Update authenticated user profile metadata.
 */
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/api/auth/profile', profileData);
  return response.data;
};
