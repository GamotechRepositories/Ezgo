import crypto from 'crypto';
import mongoose from 'mongoose';
import razorpayInstance from '../config/razorpay.js';
import Booking from '../models/Booking.js';
import Requirement from '../models/Requirement.js';
import Transaction from '../models/Transaction.js';
import { notifyUser } from '../services/notificationService.js';
import { broadcastBookingUpdated, broadcastRequirementUpdated } from '../services/socketService.js';

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

    // Prevent duplicate charges: If booking already has an active created order, reuse it (Module 06, Task 08)
    if (booking && booking.paymentDetails?.orderId) {
      try {
        const existingOrder = await razorpayInstance.orders.fetch(booking.paymentDetails.orderId);
        if (existingOrder && existingOrder.status === 'created' && existingOrder.amount === Math.round(numericAmount)) {
          return res.status(200).json({
            success: true,
            order_id: existingOrder.id,
            id: existingOrder.id,
            amount: existingOrder.amount,
            currency: existingOrder.currency,
            receipt: existingOrder.receipt,
            key_id: process.env.RAZORPAY_KEY_ID,
            isReused: true,
          });
        }
      } catch (err) {
        // If order fetch fails, proceed with creating fresh order
      }
    }

    const options = {
      amount: Math.round(numericAmount),
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now().toString().slice(-10)}`,
      notes: {
        ...notes,
        createdVia: 'EzzyGo Razorpay Web Checkout',
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
        ? await Booking.findById(bookingId)
            .populate('providerId', 'name businessName phone email rating reviewCount completedJobs isVerified avatar categories serviceArea')
            .populate('requesterId', 'name phone email avatar rating')
            .populate('requirementId')
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
          message: `Payment received but this booking is ${booking.status.toLowerCase()}. Please contact EzzyGo support with payment ref ${razorpay_payment_id} for a refund.`,
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
          method: 'Razorpay',
          note: 'Funds held in EzzyGo Escrow via Razorpay Standard Checkout',
        },
      });

      // Notify vendor that payment has been received and held in escrow
      const vendorId = booking.providerId?._id || booking.providerId;
      await notifyUser({
        userId: vendorId,
        title: 'Payment Secured in Escrow 🛡️',
        message: `Payment of ₹${booking.totalPaid.toLocaleString()} is secured in Escrow! Host contact details have been unlocked.`,
        type: 'PAYMENT_CONFIRMED',
        metadata: { bookingId: booking._id },
      });

      updatedBooking = booking;
      broadcastBookingUpdated(updatedBooking);
      if (booking.requirementId) {
        broadcastRequirementUpdated(booking.requirementId);
      }
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


/**
 * @desc    Handle Razorpay Webhooks (Reconcile pending/failed/captured payments - Module 06, Task 07)
 * @route   POST /api/payments/webhook
 * @access  Public (Signature verified via Razorpay webhook secret)
 */
export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload?.payment?.entity || req.body?.payload?.order?.entity;

    if (!payload) {
      return res.status(200).json({ received: true });
    }

    const orderId = payload.order_id || payload.id;
    const paymentId = payload.id;

    if (event === 'payment.captured' || event === 'order.paid') {
      const booking = await Booking.findOne({ 'paymentDetails.orderId': orderId })
        .populate('providerId', 'name businessName phone email rating reviewCount completedJobs isVerified avatar categories serviceArea')
        .populate('requesterId', 'name phone email avatar rating')
        .populate('requirementId');

      if (booking && booking.status === 'AWAITING_PAYMENT') {
        booking.status = 'ACTIVE';
        booking.isContactRevealed = true;
        booking.paymentDetails = {
          transactionId: paymentId,
          orderId: orderId,
          method: payload.method || 'Razorpay Webhook',
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
          referenceId: paymentId,
          metadata: {
            webhookEvent: event,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            method: payload.method || 'Razorpay Webhook',
            note: 'Reconciled via Razorpay Webhook',
          },
        });

        const vendorId = booking.providerId?._id || booking.providerId;
        await notifyUser({
          userId: vendorId,
          title: 'Payment Secured in Escrow 🔒',
          message: `Payment of ₹${booking.totalPaid.toLocaleString()} is secured in Escrow! Host contact details have been unlocked.`,
          type: 'PAYMENT_CONFIRMED',
          metadata: { bookingId: booking._id },
        });

        broadcastBookingUpdated(booking);
      }
    } else if (event === 'payment.failed') {
      const booking = await Booking.findOne({ 'paymentDetails.orderId': orderId });
      if (booking) {
        await Transaction.create({
          bookingId: booking._id,
          type: 'PAYMENT_HELD_ESCROW',
          amount: booking.totalPaid,
          fromUser: booking.requesterId,
          toUser: booking.providerId,
          status: 'FAILED',
          referenceId: paymentId,
          metadata: {
            webhookEvent: event,
            errorCode: payload.error_code,
            errorDescription: payload.error_description,
          },
        });

        await notifyUser({
          userId: booking.requesterId,
          title: 'Payment Failed ⚠️',
          message: `Payment attempt of ₹${booking.totalPaid.toLocaleString()} failed: ${payload.error_description || 'Transaction declined'}. Please retry from your bookings.`,
          type: 'PAYMENT_FAILED',
          metadata: { bookingId: booking._id },
        });
      }
    }

    return res.status(200).json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const HISTORY_TYPES_HOST = new Set(['PAYMENT_HELD_ESCROW', 'REFUND', 'PAYOUT_RELEASED_PROVIDER']);
const HISTORY_TYPES_VENDOR = new Set(['PAYMENT_HELD_ESCROW', 'PAYOUT_RELEASED_PROVIDER', 'REFUND']);
const PAID_BOOKING_STATUSES = ['ACTIVE', 'COMPLETED', 'PAYOUT_RELEASED', 'DISPUTED'];

const historyLabel = (type, isHost) => {
  if (type === 'PAYMENT_HELD_ESCROW') return isHost ? 'Paid to EzzyGo escrow' : 'Host paid · held in escrow';
  if (type === 'PAYOUT_RELEASED_PROVIDER') return isHost ? 'Released to vendor' : 'Payout received';
  if (type === 'REFUND') return 'Refunded';
  return type;
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isHost = req.user.role === 'requester' || req.user.roles?.includes('requester');

    const paidBookings = await Booking.find({
      $or: [{ requesterId: userId }, { providerId: userId }],
      status: { $in: PAID_BOOKING_STATUSES },
    }).select('_id totalPaid bidAmount platformFee paymentDetails requesterId providerId');

    const existing = await Transaction.find({
      bookingId: { $in: paidBookings.map((b) => b._id) },
      type: 'PAYMENT_HELD_ESCROW',
    }).select('bookingId');
    const have = new Set(existing.map((t) => t.bookingId.toString()));

    for (const booking of paidBookings) {
      if (have.has(booking._id.toString())) continue;
      await Transaction.updateOne(
        { bookingId: booking._id, type: 'PAYMENT_HELD_ESCROW' },
        {
          $setOnInsert: {
            bookingId: booking._id,
            type: 'PAYMENT_HELD_ESCROW',
            amount: booking.totalPaid,
            fromUser: booking.requesterId,
            toUser: booking.providerId,
            status: 'SUCCESS',
            referenceId: booking.paymentDetails?.transactionId || `PAY-${booking._id.toString().slice(-8).toUpperCase()}`,
            metadata: {
              bidAmount: booking.bidAmount,
              platformFee: booking.platformFee,
              method: booking.paymentDetails?.method || 'Demo UPI',
              paidAt: booking.paymentDetails?.paidAt,
              backfilled: true,
            },
          },
        },
        { upsert: true }
      );
    }

    const txns = await Transaction.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'requirementId', select: 'title category eventDate location' },
          { path: 'providerId', select: 'businessName name' },
          { path: 'requesterId', select: 'name' },
        ],
      })
      .lean();

    const allowed = isHost && req.user.role !== 'provider' ? HISTORY_TYPES_HOST : HISTORY_TYPES_VENDOR;
    const data = txns
      .filter((t) => allowed.has(t.type))
      .map((t) => {
        const booking = t.bookingId && typeof t.bookingId === 'object' ? t.bookingId : null;
        const reqDoc = booking?.requirementId && typeof booking.requirementId === 'object' ? booking.requirementId : null;
        const revealed = booking && PAID_BOOKING_STATUSES.includes(booking.status);
        const vendor = booking?.providerId && typeof booking.providerId === 'object' ? booking.providerId : null;
        return {
          _id: t._id,
          type: t.type,
          label: historyLabel(t.type, isHost || String(t.fromUser) === String(userId)),
          amount: t.amount,
          status: t.status,
          referenceId: t.referenceId,
          method: t.metadata?.method || booking?.paymentDetails?.method || '',
          createdAt: t.createdAt,
          bookingId: booking?._id || t.bookingId,
          bookingStatus: booking?.status || '',
          eventTitle: reqDoc?.title || 'Event booking',
          eventDate: reqDoc?.eventDate || '',
          category: reqDoc?.category || '',
          vendorName: revealed ? vendor?.businessName || vendor?.name || 'Vendor' : 'Vendor locked',
          escrowStatus: booking?.paymentDetails?.escrowStatus || '',
        };
      });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};
