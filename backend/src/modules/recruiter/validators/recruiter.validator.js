import { body, validationResult } from 'express-validator';

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

export const updateProfileValidationRules = [
  body('companyName')
    .optional()
    .notEmpty().withMessage('Company name cannot be empty')
    .trim(),
  body('industry')
    .optional()
    .notEmpty().withMessage('Industry field cannot be empty')
    .trim(),
  body('companySize')
    .optional()
    .notEmpty().withMessage('Company size is required')
    .trim(),
  body('website')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.trim() !== '') {
        try {
          let urlString = value;
          if (!/^https?:\/\//i.test(value)) {
            urlString = 'http://' + value;
          }
          new URL(urlString);
        } catch (e) {
          throw new Error('Invalid website URL format');
        }
      }
      return true;
    }),
  body('fullName')
    .optional()
    .notEmpty().withMessage('Full name cannot be empty')
    .trim(),
  body('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

export const pipelineValidationRules = [
  body('stage')
    .notEmpty().withMessage('Pipeline stage is required')
    .isIn(['applied', 'shortlisted', 'interviewing', 'offered', 'rejected'])
    .withMessage('Stage must be one of: applied, shortlisted, interviewing, offered, rejected'),
  body('notes')
    .optional()
    .trim(),
];

export const contactRequestValidationRules = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID format'),
  body('subject')
    .notEmpty().withMessage('Subject line is required')
    .trim(),
  body('message')
    .notEmpty().withMessage('Message body is required')
    .trim(),
];
