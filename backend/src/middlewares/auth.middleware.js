import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { jwtConfig } from '../config/jwt.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource, token missing',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);

    const user = await User.findById(decoded.id).populate([
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

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This user account has been deactivated/blocked',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Not authorized, token failed',
    });
  }
};
