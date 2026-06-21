import express from 'express';
import { analyzeSkills, getSkillsByStudent } from '../controllers/feedback.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeSkills);
router.get('/student/:id', getSkillsByStudent);

export default router;
