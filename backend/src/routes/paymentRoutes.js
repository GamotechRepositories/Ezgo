import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create-order', requireAuth, createOrder);
router.post('/verify-payment', requireAuth, verifyPayment);

export default router;
