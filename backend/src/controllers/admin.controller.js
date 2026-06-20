import User from '../models/User.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Retrieve all registered users.
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return sendResponse(res, 200, true, 'Users retrieved successfully', { users });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve a specific user by ID.
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }
    return sendResponse(res, 200, true, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user details by ID.
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Expose modifiable keys
    const modifiableFields = [
      'fullName',
      'collegeName',
      'course',
      'year',
      'skills',
      'collegeCode',
      'website',
      'contactPerson',
      'companyName',
      'industry',
      'companySize',
      'isVerified',
      'isActive',
      'profileCompleted',
      'avatar',
      'isCollegeVerified',
      'isRecruiterVerified',
      'role',
    ];

    modifiableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();
    return sendResponse(res, 200, true, 'User updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user by ID.
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }
    return sendResponse(res, 200, true, 'User deleted successfully');
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

    return sendResponse(res, 200, true, 'User blocked successfully', { user });
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

    return sendResponse(res, 200, true, 'User unblocked successfully', { user });
  } catch (error) {
    next(error);
  }
};
