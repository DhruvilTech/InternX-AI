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
  body('collegeName')
    .optional()
    .notEmpty().withMessage('College name cannot be empty'),
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
  body('establishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid established year'),
  body('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email address'),
];

export const departmentValidationRules = [
  body('departmentName')
    .notEmpty().withMessage('Department name is required')
    .trim(),
  body('departmentCode')
    .notEmpty().withMessage('Department code is required')
    .trim(),
  body('headOfDepartment')
    .optional()
    .trim(),
];
