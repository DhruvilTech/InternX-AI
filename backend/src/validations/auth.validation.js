import { body, validationResult } from 'express-validator';

// Middleware to execute validation rules and return errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export const registerValidationRules = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role')
    .isIn(['student', 'college', 'recruiter', 'admin']).withMessage('Invalid role selected'),

  // Role-specific custom validations
  body('fullName').custom((value, { req }) => {
    if (['student', 'admin'].includes(req.body.role) && (!value || !value.trim())) {
      throw new Error('Full name is required');
    }
    return true;
  }),

  body('collegeName').custom((value, { req }) => {
    if (req.body.role === 'student' && (!value || !value.trim())) {
      throw new Error('College name is required for students');
    }
    return true;
  }),

  body('course').custom((value, { req }) => {
    if (req.body.role === 'student' && (!value || !value.trim())) {
      throw new Error('Course is required for students');
    }
    return true;
  }),

  body('year').custom((value, { req }) => {
    if (req.body.role === 'student') {
      if (!value) {
        throw new Error('Year is required for students');
      }
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        throw new Error('Year must be a positive number');
      }
    }
    return true;
  }),

  body('collegeCode').custom((value, { req }) => {
    if (req.body.role === 'college' && (!value || !value.trim())) {
      throw new Error('College code is required for colleges');
    }
    return true;
  }),

  body('contactPerson').custom((value, { req }) => {
    if (req.body.role === 'college' && (!value || !value.trim())) {
      throw new Error('Contact person name is required for colleges');
    }
    return true;
  }),

  body('companyName').custom((value, { req }) => {
    if (req.body.role === 'recruiter' && (!value || !value.trim())) {
      throw new Error('Company name is required for recruiters');
    }
    return true;
  }),

  body('industry').custom((value, { req }) => {
    if (req.body.role === 'recruiter' && (!value || !value.trim())) {
      throw new Error('Industry is required for recruiters');
    }
    return true;
  }),

  body('companySize').custom((value, { req }) => {
    if (req.body.role === 'recruiter' && (!value || !value.trim())) {
      throw new Error('Company size is required for recruiters');
    }
    return true;
  }),

  body('website').optional().custom((value) => {
    if (value && value.trim() !== '') {
      try {
        // Basic check: prefix with http/https if missing to validate properly
        let urlString = value;
        if (!/^https?:\/\//i.test(value)) {
          urlString = 'http://' + value;
        }
        new URL(urlString);
      } catch (e) {
        throw new Error('Invalid URL format');
      }
    }
    return true;
  }),

  body('skills').optional().custom((value) => {
    if (value && !Array.isArray(value)) {
      throw new Error('Skills must be an array of strings');
    }
    return true;
  }),
];

export const loginValidationRules = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const changePasswordValidationRules = [
  body('oldPassword')
    .notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
];

export const forgotPasswordValidationRules = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

export const resetPasswordValidationRules = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
];
