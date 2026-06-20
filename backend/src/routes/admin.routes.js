import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
} from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// Enforce authentication and RBAC admin role on all endpoints in this router
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getUsers);
router.get('/user/:id', getUserById);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.patch('/block/:id', blockUser);
router.patch('/unblock/:id', unblockUser);

// Super Admin approval endpoints for College Ecosystem
import {
  getPendingColleges,
  getPendingRepresentatives,
  approveCollege,
  rejectCollege,
  approveRepresentative,
  rejectRepresentative,
} from '../controllers/collegeAdmin.controller.js';

router.get('/pending-colleges', getPendingColleges);
router.get('/pending-representatives', getPendingRepresentatives);
router.put('/approve-college', approveCollege);
router.put('/reject-college', rejectCollege);
router.put('/approve-representative', approveRepresentative);
router.put('/reject-representative', rejectRepresentative);

export default router;
