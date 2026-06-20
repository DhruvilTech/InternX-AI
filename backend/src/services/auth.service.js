import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { jwtConfig } from '../config/jwt.js';
import { generateAccessToken } from '../utils/generateToken.js';

/**
 * Register a new user based on their specific role.
 */
export const registerUser = async (userData) => {
  const { email, password, role } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const userPayload = {
    email,
    password,
    role,
  };

  // Map role-specific parameters
  if (role === 'student') {
    userPayload.fullName = userData.fullName;
    userPayload.collegeName = userData.collegeName;
    userPayload.course = userData.course;
    userPayload.year = userData.year;
    userPayload.skills = userData.skills || [];
  } else if (role === 'college') {
    userPayload.collegeName = userData.collegeName;
    userPayload.collegeCode = userData.collegeCode;
    userPayload.website = userData.website;
    userPayload.contactPerson = userData.contactPerson;
  } else if (role === 'recruiter') {
    userPayload.companyName = userData.companyName;
    userPayload.industry = userData.industry;
    userPayload.website = userData.website;
    userPayload.companySize = userData.companySize;
  } else if (role === 'admin') {
    userPayload.fullName = userData.fullName;
  }

  const user = new User(userPayload);
  await user.save();
  return user;
};

/**
 * Authenticate credentials and update last login timestamp.
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account is deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Clear user refresh token session.
 */
export const logoutUser = async (user) => {
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });
};

/**
 * Verify refresh token and generate new access token.
 */
export const refreshAccessToken = async (token) => {
  if (!token) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('User account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    const accessToken = generateAccessToken(user);
    return { accessToken };
  } catch (error) {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }
};

/**
 * Verify and change password for authenticated user.
 */
export const changeUserPassword = async (user, oldPassword, newPassword) => {
  const dbUser = await User.findById(user._id).select('+password');
  
  const isMatch = await dbUser.comparePassword(oldPassword);
  if (!isMatch) {
    const error = new Error('Incorrect old password');
    error.statusCode = 400;
    throw error;
  }

  dbUser.password = newPassword;
  await dbUser.save();
};

/**
 * Generate password reset token.
 */
export const forgotUserPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('No account found with that email address');
    error.statusCode = 404;
    throw error;
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour validity

  await user.save({ validateBeforeSave: false });

  return resetToken;
};

/**
 * Reset password using token.
 */
export const resetUserPassword = async (resetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();
};
