import express from 'express';
import {
  createSubmission,
  getMySubmissions,
  getEvaluationBySubmissionId,
  getStudentSubmissions,
  getSubmissionStatus,
  getSubmissionProgress,
  evaluateSubmission,
  getSkillsBySubmissionId
} from '../controllers/submission.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// Require login on all submission paths
router.use(protect);

// Student submission endpoints
router.post('/create', authorizeRoles('student'), createSubmission);
router.post('/', authorizeRoles('student'), createSubmission); // Keep old root path for backward compatibility
router.get('/my-submissions', authorizeRoles('student'), getMySubmissions);

// Status and progress trackers
router.get('/:id/status', getSubmissionStatus);
router.get('/:id/progress', getSubmissionProgress);

// Re-run evaluation trigger
router.post('/evaluate', authorizeRoles('student', 'admin'), evaluateSubmission);

// Report details & skills updates
router.get('/:id/report', getEvaluationBySubmissionId);
router.get('/:id/evaluation', getEvaluationBySubmissionId); // Keep old path for backward compatibility
router.get('/:id/skills', getSkillsBySubmissionId);

// Privileged recruiter/admin lookup
router.get('/student/:studentId', authorizeRoles('admin', 'recruiter', 'college_representative'), getStudentSubmissions);

export default router;
