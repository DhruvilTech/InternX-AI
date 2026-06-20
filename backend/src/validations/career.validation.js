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

export const careerValidationRules = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim(),
  body('description')
    .notEmpty().withMessage('Description is required')
    .trim(),
  body('category')
    .notEmpty().withMessage('Category is required')
    .trim(),
  body('difficultyLevel')
    .isIn(['Beginner', 'Medium', 'Hard']).withMessage('Difficulty level must be Beginner, Medium, or Hard'),
  body('duration')
    .notEmpty().withMessage('Duration estimation is required')
    .trim(),
  body('requiredSkills')
    .optional()
    .isArray().withMessage('Required skills must be an array of strings'),
  body('learningRoadmap')
    .optional()
    .isArray().withMessage('Learning roadmap must be an array of phase objects'),
];
