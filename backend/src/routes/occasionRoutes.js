import express from 'express';
import { getOccasions, createOccasion, deleteOccasion } from '../controllers/occasionController.js';

const router = express.Router();

router.route('/')
  .get(getOccasions)
  .post(createOccasion);

router.route('/:id')
  .delete(deleteOccasion);

export default router;
