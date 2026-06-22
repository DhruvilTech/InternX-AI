import express from 'express';
import { generateFeedback, getFeedbackByStudent, chatWithAIManager } from '../controllers/feedback.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateFeedback);
router.get('/student/:id', getFeedbackByStudent);
router.post('/chat', chatWithAIManager);

export default router;
