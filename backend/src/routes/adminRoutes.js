import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getAdminMetrics,
  getProviders,
  verifyProvider,
  getAuditLogs,
  getProviderKyc,
  getAllUsers,
  updateUserRole,
  getSystemHealth,
  testSmtpDiagnostic,
} from '../controllers/adminController.js';
import {
  sendAdminOtp,
  verifyAdminOtp,
  logoutAdmin,
  getAdminMe,
} from '../controllers/adminAuthController.js';
import { seedDatabase } from '../config/seedData.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Dedicated rate limiters for Admin OTP endpoints
const adminSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Max 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests from this IP address. Please try again after 10 minutes.',
  },
});

const adminVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Max 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts from this IP address. Please try again later.',
  },
});

// ==========================================
// 1. Admin Authentication Routes (Public / Auth)
// ==========================================
router.post('/auth/send-otp', adminSendLimiter, sendAdminOtp);
router.post('/auth/verify-otp', adminVerifyLimiter, verifyAdminOtp);
router.post('/auth/logout', logoutAdmin);
router.get('/auth/me', requireAuth, requireRole('admin'), getAdminMe);

// ==========================================
// 2. Protected Admin Portal Operations
// ==========================================
router.use(requireAuth, requireRole('admin'));

router.get('/metrics', getAdminMetrics);
router.get('/providers', getProviders);
router.get('/providers/:providerId/kyc', getProviderKyc);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);
router.get('/system-health', getSystemHealth);
router.post('/test-email', testSmtpDiagnostic);
router.get('/audit-logs', getAuditLogs);
router.patch('/providers/:providerId/verify', verifyProvider);
router.post('/verify-provider', verifyProvider);
router.post('/seed', async (req, res) => {
  await seedDatabase(true);
  res.json({ success: true, message: 'Database reset & seeded successfully in MongoDB Atlas' });
});

export default router;
