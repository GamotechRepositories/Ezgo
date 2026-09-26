import express from 'express';
import {
  createRequirement,
  getRequirements,
  getRequirementById,
} from '../controllers/requirementController.js';

const router = express.Router();

router.route('/')
  .post(createRequirement)
  .get(getRequirements);

router.route('/:id')
  .get(getRequirementById);

export default router;
