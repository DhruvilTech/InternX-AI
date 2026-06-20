import express from 'express';
import {
  getColleges,
  searchColleges,
  requestCollege,
} from '../controllers/college.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Publicly searchable
router.get('/', getColleges);
router.get('/search', searchColleges);

// Request listing requires student login
router.post('/request', protect, requestCollege);

export default router;
