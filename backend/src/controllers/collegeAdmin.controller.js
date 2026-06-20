import PendingCollege from '../models/PendingCollege.js';
import CollegeRepresentative from '../models/CollegeRepresentative.js';
import College from '../modules/college/models/College.js';
import User from '../models/User.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Get all pending college registration requests.
 */
export const getPendingColleges = async (req, res, next) => {
  try {
    const list = await PendingCollege.find({ status: 'pending' }).populate('requestedBy', 'fullName email');
    return sendResponse(res, 200, true, 'Pending colleges fetched successfully', list);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pending representative verification requests.
 */
export const getPendingRepresentatives = async (req, res, next) => {
  try {
    const list = await CollegeRepresentative.find({ verificationStatus: 'pending' })
      .populate('userId', 'fullName email')
      .populate('collegeId', 'name shortName');
    return sendResponse(res, 200, true, 'Pending representatives fetched successfully', list);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a pending custom college request and add it to the verified Colleges list.
 */
export const approveCollege = async (req, res, next) => {
  try {
    const { pendingCollegeId } = req.body;
    if (!pendingCollegeId) {
      return sendResponse(res, 400, false, 'Pending college ID is required');
    }

    const pending = await PendingCollege.findById(pendingCollegeId);
    if (!pending) {
      return sendResponse(res, 404, false, 'Pending college request not found');
    }

    if (pending.status !== 'pending') {
      return sendResponse(res, 400, false, `College request has already been ${pending.status}`);
    }

    // Check if college already exists
    let college = await College.findOne({ name: pending.collegeName });
    if (!college) {
      // Generate a mock unique code based on name abbreviation
      const code = pending.collegeName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase() + Math.floor(100 + Math.random() * 900);

      college = new College({
        name: pending.collegeName,
        shortName: pending.collegeName.split(' ').map(w => w[0]).join('').toUpperCase(),
        city: pending.city,
        state: pending.state,
        collegeCode: code,
        verified: true,
      });
      await college.save();
    }

    pending.status = 'approved';
    await pending.save();

    // Cascade update: set collegeId and clear customCollegeName on all users who requested it
    await User.updateMany(
      { customCollegeName: pending.collegeName },
      { collegeId: college._id, customCollegeName: '' }
    );

    return sendResponse(res, 200, true, 'College request approved and added to directories successfully', { college });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a pending custom college request.
 */
export const rejectCollege = async (req, res, next) => {
  try {
    const { pendingCollegeId } = req.body;
    if (!pendingCollegeId) {
      return sendResponse(res, 400, false, 'Pending college ID is required');
    }

    const pending = await PendingCollege.findById(pendingCollegeId);
    if (!pending) {
      return sendResponse(res, 404, false, 'Pending college request not found');
    }

    pending.status = 'rejected';
    await pending.save();

    return sendResponse(res, 200, true, 'College request rejected successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a college representative request, granting access.
 */
export const approveRepresentative = async (req, res, next) => {
  try {
    const { representativeId } = req.body;
    if (!representativeId) {
      return sendResponse(res, 400, false, 'Representative ID is required');
    }

    const rep = await CollegeRepresentative.findById(representativeId);
    if (!rep) {
      return sendResponse(res, 404, false, 'Representative request not found');
    }

    rep.verificationStatus = 'approved';
    rep.verifiedBy = req.user._id;
    rep.verifiedAt = new Date();
    await rep.save();

    // Verify the linked User account
    await User.findByIdAndUpdate(rep.userId, { isVerified: true });

    return sendResponse(res, 200, true, 'Representative verified and dashboard access granted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a college representative request.
 */
export const rejectRepresentative = async (req, res, next) => {
  try {
    const { representativeId } = req.body;
    if (!representativeId) {
      return sendResponse(res, 400, false, 'Representative ID is required');
    }

    const rep = await CollegeRepresentative.findById(representativeId);
    if (!rep) {
      return sendResponse(res, 404, false, 'Representative request not found');
    }

    rep.verificationStatus = 'rejected';
    await rep.save();

    return sendResponse(res, 200, true, 'Representative request rejected successfully');
  } catch (error) {
    next(error);
  }
};
