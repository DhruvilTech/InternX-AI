import express from 'express';
import {
  getTasks,
  updateTaskStatus,
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// Enforce auth on all task routes
router.use(protect);

// Student only endpoints
router.get('/', authorizeRoles('student'), getTasks);
router.patch('/:id/status', authorizeRoles('student'), updateTaskStatus);

export default router;
