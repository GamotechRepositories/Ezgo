import express from 'express';
import { createOrder, verifyPayment, handleRazorpayWebhook, getPaymentHistory } from '../controllers/paymentController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create-order', requireAuth, createOrder);
router.post('/verify-payment', requireAuth, verifyPayment);
router.get('/history', requireAuth, getPaymentHistory);
router.post('/webhook', handleRazorpayWebhook);

export default router;
