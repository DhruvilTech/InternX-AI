import express from 'express';
import { getStudentEvaluationReport } from '../controllers/evaluation.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/student/:studentId', getStudentEvaluationReport);

export default router;
