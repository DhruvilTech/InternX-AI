import express from 'express';
import {
  registerRepresentative,
  getRepresentativeStatus,
} from '../controllers/representative.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerRepresentative);
router.get('/status', protect, getRepresentativeStatus);

export default router;
