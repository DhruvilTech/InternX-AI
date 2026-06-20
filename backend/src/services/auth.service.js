import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import College from '../models/College.js';
import Recruiter from '../models/Recruiter.js';
import CollegeRepresentative from '../models/CollegeRepresentative.js';
import { jwtConfig } from '../config/jwt.js';
import { generateAccessToken } from '../utils/generateToken.js';
import { cloudinary } from '../config/cloudinary.js';
import { sendMail } from '../utils/mailer.js';
import { getOtpTemplate } from '../utils/emailTemplates.js';

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

  let cloudinaryUrl = userData.cloudinaryUrl || '';

  if (userData.verificationDocFile) {
    try {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        let fileToUpload = userData.verificationDocFile;
        if (!fileToUpload.startsWith('data:')) {
          fileToUpload = `data:image/png;base64,${fileToUpload}`;
        }

        console.log('Uploading verification document to Cloudinary...');
        const uploadRes = await cloudinary.uploader.upload(fileToUpload, {
          folder: 'internx_verification',
          resource_type: 'auto',
        });
        cloudinaryUrl = uploadRes.secure_url;
        console.log('Cloudinary upload successful:', cloudinaryUrl);
      } else {
        console.log('Cloudinary not configured in environment, using client-provided/mock URL.');
      }
    } catch (uploadError) {
      console.error('Cloudinary upload error, using local/mock fallback:', uploadError.message);
    }
  }

  const userPayload = {
    email,
    password,
    role,
    fullName: userData.fullName || userData.collegeName || userData.companyName || '',
    verificationDocName: userData.verificationDocName || '',
    verificationDocFile: userData.verificationDocFile || '',
    cloudinaryUrl,
    collegeId: userData.collegeId || null,
    customCollegeName: userData.customCollegeName || '',
    department: userData.department || '',
    year: userData.year ? Number(userData.year) : null,
    careerPath: userData.careerPath || '',
  };

  const user = new User(userPayload);

  // Generate registration OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.isEmailVerified = false;

  await user.save();

  // Create profile documents for roles
  if (role === 'student') {
    await Student.create({
      userId: user._id,
      fullName: userData.fullName,
      collegeName: userData.collegeName || userData.customCollegeName || '',
      course: userData.course || '',
      year: userData.year ? Number(userData.year) : 1,
      skills: userData.skills || [],
    });
  } else if (role === 'recruiter') {
    await Recruiter.create({
      userId: user._id,
      companyName: userData.companyName,
      industry: userData.industry,
      companySize: userData.companySize,
      website: userData.website || '',
    });
  } else if (role === 'college_representative') {
    await CollegeRepresentative.create({
      userId: user._id,
      collegeId: userData.collegeId,
      designation: userData.designation,
      officialEmail: userData.officialEmail,
      phone: userData.phone,
      verificationStatus: 'pending',
      verificationDocument: cloudinaryUrl || userData.verificationDocFile || 'mock-doc-url',
    });
  }

  // Send registration verification email
  await sendMail({
    to: user.email,
    subject: 'Welcome to InternX AI - Verify your email',
    text: `Your email verification OTP is: ${otp}. This code is valid for 10 minutes.`,
    html: getOtpTemplate(otp)
  });

  return user;
};

/**
 * Authenticate credentials and update last login timestamp.
 */
export const loginUser = async (email, password) => {
  console.log(`[LOGIN SERVICE] Searching for email: "${email}"`);
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log(`[LOGIN SERVICE] User not found for email: "${email}"`);
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }
  console.log(`[LOGIN SERVICE] User found. Hash in DB: "${user.password}"`);

  if (!user.isActive) {
    const error = new Error('Your account is deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  console.log(`[LOGIN SERVICE] Password comparison result for "${email}": ${isMatch}`);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Block login if email is not verified, and send a new OTP
  if (!user.isEmailVerified) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendMail({
      to: user.email,
      subject: 'Verify your email address - InternX AI',
      text: `Your email verification OTP is: ${otp}. This code is valid for 10 minutes.`,
      html: getOtpTemplate(otp)
    });

    const error = new Error('Your email address is not verified. A new OTP has been sent to your email.');
    error.statusCode = 401;
    error.code = 'EMAIL_NOT_VERIFIED'; // Client checks this code
    throw error;
  }

  // Block login if the account has not been approved by the admin
  if (user.role === 'student' && !user.isVerified) {
    const error = new Error('Your account is pending admin approval.');
    error.statusCode = 403;
    throw error;
  }
  if (user.role === 'recruiter' && !user.isRecruiterVerified) {
    const error = new Error('Your recruiter account is pending admin approval.');
    error.statusCode = 403;
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

/**
 * Resend OTP code to unverified user.
 */
export const resendUserOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('No user found with this email address');
    error.statusCode = 404;
    throw error;
  }
  if (user.isEmailVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  await sendMail({
    to: user.email,
    subject: 'Verify your email address - InternX AI',
    text: `Your email verification OTP is: ${otp}. This code is valid for 10 minutes.`,
    html: getOtpTemplate(otp)
  });
  return user;
};

/**
 * Update user profile details and synchronize with role-specific collection.
 */
export const updateUserProfile = async (user, profileData) => {
  const { fullName, email } = profileData;

  const dbUser = await User.findById(user._id);
  if (!dbUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // If email is changing, make sure it is not already taken
  if (email && email !== dbUser.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email is already registered by another account');
      error.statusCode = 400;
      throw error;
    }
    dbUser.email = email;
  }

  if (fullName !== undefined) {
    dbUser.fullName = fullName.trim();
  }

  await dbUser.save();

  // Keep in sync with role-specific collection
  if (user.role === 'student') {
    await Student.findOneAndUpdate(
      { userId: user._id },
      { fullName: fullName.trim() },
      { runValidators: true }
    );

  } else if (user.role === 'recruiter') {
    await Recruiter.findOneAndUpdate(
      { userId: user._id },
      { companyName: fullName.trim() },
      { runValidators: true }
    );
  }

  // Fetch fully populated updated user to return
  const updatedUser = await User.findById(user._id).populate([
    { path: 'studentProfile' },
    { path: 'recruiterProfile' },
    {
      path: 'selectedCareer',
      populate: {
        path: 'careerId',
        model: 'CareerPath',
      },
    },
  ]);

  return updatedUser;
};

