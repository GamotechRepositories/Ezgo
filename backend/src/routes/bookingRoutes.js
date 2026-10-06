import express from 'express';
import {
  acceptBid,
  processPayment,
  completeBooking,
  cancelBooking,
  getBookings,
  addReview,
} from '../controllers/bookingController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getBookings);
router.get('/provider/:providerId', (req, res, next) => {
  req.query.role = 'provider';
  req.query.userId = req.params.providerId;
  return getBookings(req, res, next);
});
router.get('/user/:userId', (req, res, next) => {
  req.query.role = 'requester';
  req.query.userId = req.params.userId;
  return getBookings(req, res, next);
});

router.post('/accept-bid', acceptBid);
router.post('/pay', processPayment);
router.post('/cancel', cancelBooking);
router.post('/complete', completeBooking);
router.post('/review', addReview);


export default router;
