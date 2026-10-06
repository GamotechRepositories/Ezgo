import express from 'express';
import { register, login, me, demoAccounts, getDemoUsers, updateProfile } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/demo-accounts', demoAccounts);
router.get('/me', requireAuth, me);
router.get('/users', requireAuth, requireRole('admin'), getDemoUsers);
router.put('/profile', requireAuth, updateProfile);

export default router;
