import express from 'express';
import {
  getReceivedOffers,
  respondToOffer,
} from '../controllers/student.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// Restrict all student endpoints to authenticated users with student role
router.use(protect);
router.use(authorizeRoles('student'));

// Offers
router.get('/offers', getReceivedOffers);
router.patch('/offers/:id/respond', respondToOffer);

export default router;
