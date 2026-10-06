import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(requireAuth, requireRole('admin'), createCategory);

router.route('/:id')
  .put(requireAuth, requireRole('admin'), updateCategory)
  .delete(requireAuth, requireRole('admin'), deleteCategory);

export default router;

