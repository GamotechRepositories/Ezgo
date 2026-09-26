import express from 'express';
import { getDemoUsers, loginAsRole, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.get('/users', getDemoUsers);
router.post('/login', loginAsRole);
router.put('/profile', updateProfile);

export default router;
