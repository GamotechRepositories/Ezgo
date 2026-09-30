import express from 'express';
import { getAdminMetrics, getProviders, verifyProvider } from '../controllers/adminController.js';
import { seedDatabase } from '../config/seedData.js';

const router = express.Router();

router.get('/metrics', getAdminMetrics);
router.get('/providers', getProviders);
router.patch('/providers/:providerId/verify', verifyProvider);
router.post('/verify-provider', verifyProvider);
router.post('/seed', async (req, res) => {
  await seedDatabase(true);
  res.json({ success: true, message: 'Database reset & seeded successfully in MongoDB Atlas' });
});

export default router;
