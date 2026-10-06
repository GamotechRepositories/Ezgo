import express from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

export default router;
