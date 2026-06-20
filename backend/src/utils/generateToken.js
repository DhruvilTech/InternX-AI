import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpire }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpire }
  );
};

export const sendTokenResponse = async (user, statusCode, message, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token to db
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Cookie configuration
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  // Convert mongoose model to plain JS object
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;
  delete userResponse.emailVerificationToken;
  delete userResponse.emailVerificationExpires;
  delete userResponse.otp;
  delete userResponse.otpExpires;
  delete userResponse.twoFactorSecret;

  // InternX Role Dashboard Mapping
  let dashboardUrl = '/dashboard';
  if (user.role === 'student') dashboardUrl = '/dashboard/student';
  else if (user.role === 'college') dashboardUrl = '/dashboard/college';
  else if (user.role === 'recruiter') dashboardUrl = '/dashboard/recruiter';
  else if (user.role === 'admin') dashboardUrl = '/dashboard/admin';

  userResponse.dashboardUrl = dashboardUrl;

  return res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      message,
      accessToken,
      refreshToken,
      user: userResponse,
      data: {
        accessToken,
        refreshToken,
        user: userResponse,
      },
    });
};
