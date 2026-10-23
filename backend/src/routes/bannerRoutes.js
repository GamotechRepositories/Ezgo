import express from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router
  .route('/')
  .get(getBanners)
  .post(requireAuth, requireRole('admin'), createBanner);

router
  .route('/:id')
  .put(requireAuth, requireRole('admin'), updateBanner)
  .delete(requireAuth, requireRole('admin'), deleteBanner);

export default router;
