import express from 'express';
import {
  getProfile,
  updateProfile,
  getDashboard,
  getStudents,
  getStudentDetails,
  getShortlisted,
  toggleShortlist,
  getPipeline,
  updatePipelineStage,
  deleteFromPipeline,
  getContactRequests,
  createContactRequest,
  getAnalytics,
  createOffer,
  getSentOffers
} from '../controllers/recruiter.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../../middlewares/role.middleware.js';
import { requireRecruiterProfile } from '../middleware/recruiter.middleware.js';
import {
  updateProfileValidationRules,
  pipelineValidationRules,
  contactRequestValidationRules,
  validate
} from '../validators/recruiter.validator.js';

const router = express.Router();

// Enforce auth & role restrictions
router.use(protect);
router.use(authorizeRoles('recruiter'));
router.use(requireRecruiterProfile);

// Profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfileValidationRules, validate, updateProfile);

// Dashboard
router.get('/dashboard', getDashboard);

// Discovery
router.get('/students', getStudents);
router.get('/students/:id', getStudentDetails);

// Shortlist
router.get('/shortlisted', getShortlisted);
router.post('/shortlisted/:studentId', toggleShortlist);

// Pipeline (Kanban)
router.get('/pipeline', getPipeline);
router.post('/pipeline/:studentId', pipelineValidationRules, validate, updatePipelineStage);
router.delete('/pipeline/:studentId', deleteFromPipeline);

// Outreach (Contact)
router.get('/contact-requests', getContactRequests);
router.post('/contact-requests', contactRequestValidationRules, validate, createContactRequest);

// Analytics
router.get('/analytics', getAnalytics);

// Internship Offers
router.post('/offers', createOffer);
router.get('/offers', getSentOffers);

export default router;
