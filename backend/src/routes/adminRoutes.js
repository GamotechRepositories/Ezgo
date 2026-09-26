import express from 'express';
import { getAdminMetrics, verifyProvider } from '../controllers/adminController.js';
import { seedDatabase } from '../config/seedData.js';

const router = express.Router();

router.get('/metrics', getAdminMetrics);
router.post('/verify-provider', verifyProvider);
router.post('/seed', async (req, res) => {
  await seedDatabase();
  res.json({ success: true, message: 'Database reset & seeded successfully' });
});

export default router;
