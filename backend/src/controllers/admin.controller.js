import User from '../models/User.js';
import Student from '../models/Student.js';
import College from '../models/College.js';
import Recruiter from '../models/Recruiter.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Retrieve all registered users with their profiles populated.
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('studentProfile recruiterProfile');
    return sendResponse(res, 200, true, 'Users retrieved successfully', { users });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve a specific user by ID with their profile populated.
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('studentProfile recruiterProfile');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }
    return sendResponse(res, 200, true, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user credentials and dynamic profile details.
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Update User base fields
    const baseUserFields = [
      'fullName',
      'email',
      'avatar',
      'isActive',
      'isVerified',
      'isCollegeVerified',
      'isRecruiterVerified',
      'role',
    ];
    
    baseUserFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    await user.save({ validateBeforeSave: false });

    // Update role specific profiles
    if (user.role === 'student') {
      const studentFields = ['fullName', 'collegeName', 'course', 'year', 'skills'];
      const updateObj = {};
      studentFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateObj[field] = req.body[field];
        }
      });
      if (Object.keys(updateObj).length > 0) {
        await Student.findOneAndUpdate({ userId: user._id }, { $set: updateObj });
      }
    } else if (user.role === 'recruiter') {
      const recruiterFields = ['companyName', 'industry', 'companySize', 'website'];
      const updateObj = {};
      recruiterFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateObj[field] = req.body[field];
        }
      });
      if (Object.keys(updateObj).length > 0) {
        await Recruiter.findOneAndUpdate({ userId: user._id }, { $set: updateObj });
      }
    }

    const populatedUser = await User.findById(user._id).populate('studentProfile recruiterProfile');
    return sendResponse(res, 200, true, 'User updated successfully', { user: populatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user by ID and cascade delete their role profile.
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Cascade delete role specific profile documents
    if (user.role === 'student') {
      await Student.findOneAndDelete({ userId: user._id });
    } else if (user.role === 'recruiter') {
      await Recruiter.findOneAndDelete({ userId: user._id });
    } else if (user.role === 'college_representative') {
      await mongoose.model('CollegeRepresentative').findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(user._id);
    return sendResponse(res, 200, true, 'User and associated profile deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Block a user (set isActive to false).
 */
export const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    const populatedUser = await User.findById(user._id).populate('studentProfile recruiterProfile');
    return sendResponse(res, 200, true, 'User blocked successfully', { user: populatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Unblock a user (set isActive to true).
 */
export const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    const populatedUser = await User.findById(user._id).populate('studentProfile recruiterProfile');
    return sendResponse(res, 200, true, 'User unblocked successfully', { user: populatedUser });
  } catch (error) {
    next(error);
  }
};
