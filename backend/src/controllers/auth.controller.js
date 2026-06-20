import * as authService from '../services/auth.service.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Register a new user and return JWT tokens.
 */
export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    return await sendTokenResponse(user, 201, 'Registration successful', res);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user, sign JWTs, and save session refresh token.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    return await sendTokenResponse(user, 200, 'Login successful', res);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user, invalidate refresh token in db, and clear cookies.
 */
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await authService.logoutUser(req.user);
    }
    
    // Clear cookies
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    return sendResponse(res, 200, true, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using cookie or body refresh token.
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshAccessToken(token);
    return sendResponse(res, 200, true, 'Access token refreshed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile of current logged-in user with role-based metadata.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    delete user.refreshToken;

    // InternX Role Dashboard URL
    let dashboardUrl = '/dashboard';
    if (user.role === 'student') dashboardUrl = '/dashboard/student';
    else if (user.role === 'college') dashboardUrl = '/dashboard/college';
    else if (user.role === 'recruiter') dashboardUrl = '/dashboard/recruiter';
    else if (user.role === 'admin') dashboardUrl = '/dashboard/admin';

    user.dashboardUrl = dashboardUrl;

    return sendResponse(res, 200, true, 'User profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Change current user password.
 */
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changeUserPassword(req.user, oldPassword, newPassword);
    return sendResponse(res, 200, true, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Generate password reset token.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetToken = await authService.forgotUserPassword(email);
    
    // In production, an email would be sent. Returning token for development/testing convenience.
    return sendResponse(res, 200, true, 'Password reset token generated successfully', { resetToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetUserPassword(token, newPassword);
    return sendResponse(res, 200, true, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};
