import * as authService from '../services/auth.service.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { sendResponse } from '../utils/sendResponse.js';
import { sendMail } from '../utils/mailer.js';
import { getResetTemplate } from '../utils/emailTemplates.js';
import User from '../models/User.js';

/**
 * Register a new user and return JWT tokens.
 */
export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    return sendResponse(res, 201, true, 'Registration successful. Verification OTP sent to your email.', {
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email address using the received OTP.
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (user.isEmailVerified) {
      return sendResponse(res, 400, false, 'Email is already verified');
    }

    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return sendResponse(res, 400, false, 'Invalid or expired OTP verification code');
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save({ validateBeforeSave: false });

    return await sendTokenResponse(user, 200, 'Email verified and logged in successfully', res);
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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetToken = await authService.forgotUserPassword(email);
    
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/#/reset-password?token=${resetToken}`;
    
    await sendMail({
      to: email,
      subject: 'Reset Password Request - InternX AI',
      text: `You requested a password reset. Please click on the link to reset your password: ${resetUrl}. This link is valid for 1 hour.`,
      html: getResetTemplate(resetUrl)
    });

    return sendResponse(res, 200, true, 'Password reset email sent successfully', { resetToken });
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

/**
 * Resend email verification OTP.
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.resendUserOtp(email);
    return sendResponse(res, 200, true, 'Verification OTP sent to your email.');
  } catch (error) {
    next(error);
  }
};

