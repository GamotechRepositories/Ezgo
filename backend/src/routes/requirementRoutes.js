import express from 'express';
import {
  createRequirement,
  getRequirements,
  getRequirementById,
} from '../controllers/requirementController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .post(createRequirement)
  .get(getRequirements);

router.route('/:id')
  .get(getRequirementById);

export default router;
