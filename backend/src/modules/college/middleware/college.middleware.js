import College from '../models/College.js';

export const requireCollegeProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, user details not loaded',
      });
    }

    const college = await College.findOne({ userId: req.user._id });
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College profile not found. Please complete institution registration.',
      });
    }

    req.college = college;
    next();
  } catch (error) {
    next(error);
  }
};
