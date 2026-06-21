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
  createDepartment,
  getPlacements,
  getCollegeNotifications,
  readCollegeNotification
} from '../controllers/college.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../../middlewares/role.middleware.js';
import { requireCollegeProfile } from '../middleware/college.middleware.js';
import {
  updateProfileValidationRules,
  departmentValidationRules,
  validate
} from '../validators/college.validator.js';
import {
  getCollegeDashboard,
  getCollegeStudents
} from '../../../controllers/college.controller.js';

const router = express.Router();

// Dynamic handlers to support both modular college users and college_representatives
const handleDashboard = (req, res, next) => {
  return requireCollegeProfile(req, res, () => getDashboard(req, res, next));
};

const handleStudents = (req, res, next) => {
  return requireCollegeProfile(req, res, () => getStudents(req, res, next));
};

const handlePlacements = (req, res, next) => {
  return requireCollegeProfile(req, res, () => getPlacements(req, res, next));
};

const handleNotifications = (req, res, next) => {
  return requireCollegeProfile(req, res, () => getCollegeNotifications(req, res, next));
};

const handleReadNotification = (req, res, next) => {
  return requireCollegeProfile(req, res, () => readCollegeNotification(req, res, next));
};

// Publicly verify certificate authenticity
router.get('/certificates/verify/:id', verifyCertificate);

// All other endpoints are protected
router.use(protect);

// Dashboard, students, placements, and notifications endpoints accessible by representative role too
router.get('/dashboard', authorizeRoles('college_representative', 'college_admin'), handleDashboard);
router.get('/students', authorizeRoles('college_representative', 'college_admin'), handleStudents);
router.get('/placements', authorizeRoles('college_representative', 'college_admin'), handlePlacements);
router.get('/notifications', authorizeRoles('college_representative', 'college_admin'), handleNotifications);
router.patch('/notifications/:id/read', authorizeRoles('college_representative', 'college_admin'), handleReadNotification);

// Restrict subsequent routes to college representatives/admins and enforce profile requirement
router.use(authorizeRoles('college_representative', 'college_admin'));
router.use(requireCollegeProfile);

// Profile management
router.get('/profile', getProfile);
router.patch('/profile', updateProfileValidationRules, validate, patchProfile);
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
