import express from 'express';
import {
  startInterview,
  getInterview,
  getCurrentQuestion,
  saveAnswer,
  completeInterview,
  getStudentInterviews,
} from '../controllers/interview.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// Enforce auth and student role on all interview routes
router.use(protect);
router.use(authorizeRoles('student'));

router.get('/', getStudentInterviews);
router.post('/start', startInterview);
router.get('/:id', getInterview);
router.get('/:id/question', getCurrentQuestion);
router.post('/:id/answer', saveAnswer);
router.post('/:id/complete', completeInterview);

export default router;
