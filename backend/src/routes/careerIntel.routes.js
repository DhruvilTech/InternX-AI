import express from 'express';
import { analyzeCareer, getLatestReport } from '../controllers/careerIntel.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Main endpoints
router.post('/analyze', analyzeCareer);
router.get('/report/:studentId', getLatestReport);

// Backward compatibility endpoints
router.post('/generate', analyzeCareer);
router.get('/student/:studentId', getLatestReport);

export default router;

