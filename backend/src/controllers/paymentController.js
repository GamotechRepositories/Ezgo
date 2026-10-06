import crypto from 'crypto';
import mongoose from 'mongoose';
import razorpayInstance from '../config/razorpay.js';
import Booking from '../models/Booking.js';
import Requirement from '../models/Requirement.js';
import Transaction from '../models/Transaction.js';

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/create-order, POST /api/payments/create-order
 * @access  Public / Protected
 */
export const createOrder = async (req, res, next) => {
  try {
    let { amount, currency = 'INR', receipt, bookingId, notes = {} } = req.body;

    if (!bookingId && req.user?.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'A booking is required to pay.' });
    }

    // For a booking, the amount always comes from the database, never from the browser
    let booking = null;
    if (bookingId) {
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ success: false, message: 'Invalid booking id.' });
      }
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }
      if (req.user?.role !== 'admin' && booking.requesterId.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only pay for your own booking.' });
      }
      if (booking.status !== 'AWAITING_PAYMENT') {
        return res.status(400).json({
          success: false,
          message: booking.status === 'ACTIVE' ? 'This booking is already paid.' : `This booking cannot be paid (status: ${booking.status}).`,
        });
      }
      amount = Math.round(booking.totalPaid * 100);
      currency = 'INR';
      receipt = receipt || `rcpt_bkg_${booking._id.toString().slice(-8)}`;
      notes = {
        ...notes,
        bookingId: booking._id.toString(),
        requirementId: booking.requirementId?.toString() || '',
      };
    }

    const numericAmount = Number(amount);

    // Validate amount >= 100 paise (₹1)
    if (!numericAmount || isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum amount required is 100 paise (₹1).',
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay API credentials are not configured on the server.',
      });
    }

    const options = {
      amount: Math.round(numericAmount),
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now().toString().slice(-10)}`,
      notes: {
        ...notes,
        createdVia: 'EzGo Razorpay Web Checkout',
      },
    };

    const order = await razorpayInstance.orders.create(options);

    if (booking) {
      booking.paymentDetails.orderId = order.id;
      await booking.save();
    }

    return res.status(201).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay createOrder Error:', error);

    // Handle authentication failures with Razorpay API
    if (error.statusCode === 401 || error.error?.code === 'BAD_REQUEST_ERROR') {
      return res.status(401).json({
        success: false,
        message: 'Razorpay authentication failed. Please check your API keys.',
        error: error.error || error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.error?.description || error.message || 'Internal server error',
    });
  }
};

/**
 * @desc    Verify Razorpay Payment Signature
 * @route   POST /api/verify-payment, POST /api/payments/verify-payment
 * @access  Public / Protected
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay Secret Key is not configured on the server.',
      });
    }

    // Signature Verification: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf8');

    const isMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }

    // Signature verified! If a valid bookingId is associated, update booking & escrow state
    let updatedBooking = null;
    if (bookingId) {
      const booking = mongoose.Types.ObjectId.isValid(bookingId)
        ? await Booking.findById(bookingId).populate('providerId').populate('requesterId').populate('requirementId')
        : null;

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }
      const ownerId = (booking.requesterId?._id || booking.requesterId).toString();
      if (req.user?.role !== 'admin' && ownerId !== req.user?._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only confirm payment for your own booking.' });
      }
      if (booking.paymentDetails?.orderId !== razorpay_order_id) {
        return res.status(400).json({ success: false, message: 'This payment does not belong to this booking.' });
      }
      if (booking.status === 'ACTIVE' && booking.paymentDetails.transactionId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: 'Payment already confirmed.',
          data: { order_id: razorpay_order_id, payment_id: razorpay_payment_id, booking },
        });
      }
      if (booking.status !== 'AWAITING_PAYMENT') {
        return res.status(409).json({
          success: false,
          message: `Payment received but this booking is ${booking.status.toLowerCase()}. Please contact EzGo support with payment ref ${razorpay_payment_id} for a refund.`,
        });
      }

      booking.status = 'ACTIVE';
      booking.isContactRevealed = true;
      booking.paymentDetails = {
        transactionId: razorpay_payment_id,
        orderId: razorpay_order_id,
        method: 'Razorpay Standard Checkout',
        paidAt: new Date(),
        escrowStatus: 'HELD',
      };
      await booking.save();

      if (booking.requirementId?._id) {
        await Requirement.findByIdAndUpdate(booking.requirementId._id, { status: 'ACTIVE' });
      }

      await Transaction.create({
        bookingId: booking._id,
        type: 'PAYMENT_HELD_ESCROW',
        amount: booking.totalPaid,
        fromUser: booking.requesterId?._id,
        toUser: booking.providerId?._id,
        status: 'SUCCESS',
        referenceId: razorpay_payment_id,
        metadata: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          bidAmount: booking.bidAmount,
          platformFee: booking.platformFee,
          note: 'Funds held in EzGo Escrow via Razorpay Standard Checkout',
        },
      });

      updatedBooking = booking;
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Escrow funds secured.',
      data: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        booking: updatedBooking,
      },
    });
  } catch (error) {
    console.error('Razorpay verifyPayment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message || 'Internal server error',
    });
  }
};

