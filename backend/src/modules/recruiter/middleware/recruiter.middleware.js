import Recruiter from '../../../models/Recruiter.js';

export const requireRecruiterProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, user details not loaded',
      });
    }

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Recruiter role is required.',
      });
    }

    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found. Please complete corporate profile registration.',
      });
    }

    req.recruiter = recruiter;
    next();
  } catch (error) {
    next(error);
  }
};
