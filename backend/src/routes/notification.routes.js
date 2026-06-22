import express from 'express';
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  deleteNotification,
  postAnnouncement,
} from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);
router.delete('/:id', deleteNotification);

// Admin-only announcement creation route
router.post('/announcement', authorizeRoles('admin'), postAnnouncement);

export default router;
