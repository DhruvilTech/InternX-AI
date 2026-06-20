import * as authService from '../services/auth.service.js';
import CollegeRepresentative from '../models/CollegeRepresentative.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Register a new college representative.
 */
export const registerRepresentative = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      role: 'college_representative',
    };
    const user = await authService.registerUser(payload);
    return sendResponse(res, 201, true, 'Representative registration successful. Verification OTP sent.', {
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current verification status of the representative.
 */
export const getRepresentativeStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const representative = await CollegeRepresentative.findOne({ userId }).populate('collegeId');
    if (!representative) {
      return sendResponse(res, 404, false, 'Representative profile not found');
    }
    return sendResponse(res, 200, true, 'Status retrieved successfully', {
      verificationStatus: representative.verificationStatus,
      representative,
    });
  } catch (error) {
    next(error);
  }
};
