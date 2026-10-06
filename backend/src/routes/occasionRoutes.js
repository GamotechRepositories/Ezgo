import express from 'express';
import { getOccasions, createOccasion, updateOccasion, deleteOccasion } from '../controllers/occasionController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getOccasions)
  .post(requireAuth, requireRole('admin'), createOccasion);

router.route('/:id')
  .put(requireAuth, requireRole('admin'), updateOccasion)
  .delete(requireAuth, requireRole('admin'), deleteOccasion);

export default router;
