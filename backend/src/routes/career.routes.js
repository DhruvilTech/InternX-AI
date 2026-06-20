import express from 'express';
import {
  getAllCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
  selectCareer,
  getMyCareer,
} from '../controllers/career.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { careerValidationRules, validate } from '../validations/career.validation.js';

const router = express.Router();

// Require authentication for all career endpoints
router.use(protect);

// Student only endpoints
router.get('/my-career', authorizeRoles('student'), getMyCareer);
router.post('/select', authorizeRoles('student'), selectCareer);

// Shared endpoints (read-only for student, recruiter, college, admin)
router.get('/', getAllCareers);
router.get('/:id', getCareerById);

// Admin only endpoints
router.post('/', authorizeRoles('admin'), careerValidationRules, validate, createCareer);
router.put('/:id', authorizeRoles('admin'), careerValidationRules, validate, updateCareer);
router.delete('/:id', authorizeRoles('admin'), deleteCareer);

export default router;
