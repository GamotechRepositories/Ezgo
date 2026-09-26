import express from 'express';
import {
  acceptBid,
  processPayment,
  completeBooking,
  getBookings,
  addReview,
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getBookings);
router.post('/accept-bid', acceptBid);
router.post('/pay', processPayment);
router.post('/complete', completeBooking);
router.post('/review', addReview);

export default router;
