import express from 'express';
import {
  register,
  login,
  me,
  demoAccounts,
  getDemoUsers,
  updateProfile,
  sendOtp,
  verifyOtpAndLogin,
  submitKyc,
  blockAvailabilityDate,
  unblockAvailabilityDate,
  getAvailability,
} from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndLogin);
router.post('/submit-kyc', requireAuth, submitKyc);

router.get('/demo-accounts', demoAccounts);
router.get('/me', requireAuth, me);
router.get('/users', requireAuth, requireRole('admin'), getDemoUsers);
router.put('/profile', requireAuth, updateProfile);
router.post('/availability/block', requireAuth, blockAvailabilityDate);
router.delete('/availability/unblock/:date', requireAuth, unblockAvailabilityDate);
router.get('/availability/:providerId?', requireAuth, getAvailability);

export default router;
