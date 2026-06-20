import express from 'express';
import {
  generateInternshipAndTasks,
  getMyInternship,
} from '../controllers/internship.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// Enforce auth on all internship routes
router.use(protect);

// Student only endpoints
router.post('/generate', authorizeRoles('student'), generateInternshipAndTasks);
router.get('/my-internship', authorizeRoles('student'), getMyInternship);

export default router;
