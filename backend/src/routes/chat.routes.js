import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { sendMentorMessage, getChatHistory } from '../controllers/chat.controller.js';

const router = express.Router();

// Require student authentication for AI Mentor Chat
router.use(protect);
router.use(authorizeRoles('student'));

router.post('/send', sendMentorMessage);
router.get('/history', getChatHistory);

export default router;
