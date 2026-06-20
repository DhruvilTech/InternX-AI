import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  registerValidationRules,
  loginValidationRules,
  changePasswordValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  validate,
} from '../validations/auth.validation.js';

const router = express.Router();

// Public Authentication endpoints
router.post('/register', registerValidationRules, validate, register);
router.post('/login', loginValidationRules, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidationRules, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidationRules, validate, resetPassword);

// Protected Authentication endpoints
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordValidationRules, validate, changePassword);

export default router;
