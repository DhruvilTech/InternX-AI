import express from 'express';
import {
  getProfile,
  patchProfile,
  getDashboard,
  getStudents,
  getStudentDetails,
  getInternships,
  getSkills,
  getPlacementReadiness,
  getCertificates,
  getCertificateDetails,
  verifyCertificate,
  getStudentGithub,
  getReports,
  createDepartment
} from '../controllers/college.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../../middlewares/role.middleware.js';
import { requireCollegeProfile } from '../middleware/college.middleware.js';
import {
  updateProfileValidationRules,
  departmentValidationRules,
  validate
} from '../validators/college.validator.js';

const router = express.Router();

// Publicly verify certificate authenticity
router.get('/certificates/verify/:id', verifyCertificate);

// All other endpoints are protected and restricted to college users
router.use(protect);
router.use(authorizeRoles('college', 'college_admin'));
router.use(requireCollegeProfile);

// Profile management
router.get('/profile', getProfile);
router.patch('/profile', updateProfileValidationRules, validate, patchProfile);

// Dashboard Metrics
router.get('/dashboard', getDashboard);

// Cohorts / Student Management
router.get('/students', getStudents);
router.get('/students/:id', getStudentDetails);
router.get('/students/:id/github', getStudentGithub);

// Performance Analytics
router.get('/internships', getInternships);
router.get('/skills', getSkills);
router.get('/placement-readiness', getPlacementReadiness);

// Certificates Management
router.get('/certificates', getCertificates);
router.get('/certificates/:id', getCertificateDetails);

// Reports Compilation
router.get('/reports', getReports);

// Department Administration
router.post('/departments', departmentValidationRules, validate, createDepartment);

export default router;
