import Booking from '../models/Booking.js';
import Bid from '../models/Bid.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';
import razorpayInstance from '../config/razorpay.js';
import { notifyUser } from '../services/notificationService.js';

const requesterOf = (booking) => (booking.requesterId?._id || booking.requesterId).toString();

const assertHostOrAdmin = (req, res, booking) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Please log in.');
  }
  if (req.user.role !== 'admin' && requesterOf(booking) !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only change your own bookings.');
  }
};

// Accept a bid with strict 15% minimum-discount validation
export const acceptBid = async (req, res, next) => {
  try {
    const { requirementId, bidId, requesterId } = req.body;

    if (req.user.role !== 'admin' && req.user._id.toString() !== String(requesterId)) {
      res.status(403);
      throw new Error('You can only accept bids on your own request.');
    }

    const requirement = await Requirement.findById(requirementId);
    if (!requirement) {
      res.status(404);
      throw new Error('Requirement not found');
    }

    if (requirement.requesterId.toString() !== requesterId) {
      res.status(403);
      throw new Error('Unauthorized: Only the requirement creator can accept bids');
    }

    const bid = await Bid.findById(bidId).populate('providerId');
    if (!bid) {
      res.status(404);
      throw new Error('Bid not found');
    }

    // SERVER-SIDE 15% MINIMUM-DISCOUNT ENFORCEMENT RULE
    const maxAcceptableBid = Math.floor(requirement.budget * 0.85);
    if (bid.amount > maxAcceptableBid) {
      res.status(400);
      throw new Error(
        `15% Rule Violation: This bid of ₹${bid.amount.toLocaleString()} is not eligible. The posted budget is ₹${requirement.budget.toLocaleString()}, so only bids of ₹${maxAcceptableBid.toLocaleString()} or lower (at least 15% discount) can be accepted.`
      );
    }

    // Calculate Platform Fee (10% paid by requester on top of bid)
    const bidAmount = bid.amount;
    const platformFee = Math.round(bidAmount * 0.10);
    const totalPaid = bidAmount + platformFee;

    // Check if booking already exists for this requirement
    let booking = await Booking.findOne({ requirementId });
    if (booking && booking.status !== 'CANCELLED') {
      res.status(400);
      throw new Error('A booking already exists for this requirement');
    }

    booking = await Booking.create({
      requirementId,
      bidId,
      requesterId,
      providerId: bid.providerId._id,
      bidAmount,
      platformFee,
      totalPaid,
      status: 'AWAITING_PAYMENT',
    });

    // Update statuses
    bid.status = 'ACCEPTED';
    await bid.save();

    requirement.status = 'ACCEPTED';
    await requirement.save();

    // Reject other bids
    await Bid.updateMany(
      { requirementId, _id: { $ne: bidId } },
      { status: 'REJECTED' }
    );

    const populated = await Booking.findById(booking._id)
      .populate('providerId', 'name businessName phone rating completedJobs avatar')
      .populate('requesterId', 'name phone')
      .populate('requirementId');

    // Notify vendor that their bid was accepted
    await notifyUser({
      userId: bid.providerId._id,
      title: 'Bid Accepted! 🎉',
      message: `Your bid of ₹${bidAmount.toLocaleString()} for "${requirement.title}" was accepted! Awaiting host payment.`,
      type: 'BID_ACCEPTED',
      metadata: { bookingId: booking._id, requirementId },
    });

    res.status(201).json({
      success: true,
      message: 'Bid accepted! Please proceed to payment to confirm the booking.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// Simulate Escrow Payment (Razorpay Route / Cashfree Split)
export const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    // Marks a booking paid without taking money, so it must never be reachable in production
    if (process.env.NODE_ENV === 'production') {
      res.status(403);
      throw new Error('Simulated payments are disabled. Pay through Razorpay.');
    }

    const booking = await Booking.findById(bookingId)
      .populate('providerId')
      .populate('requesterId')
      .populate('requirementId');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    assertHostOrAdmin(req, res, booking);

    if (booking.status === 'ACTIVE') {
      return res.json({
        success: true,
        message: 'Payment already confirmed and booking is active.',
        data: booking,
      });
    }

    if (booking.status !== 'AWAITING_PAYMENT') {
      res.status(400);
      throw new Error(`Cannot pay for booking with status: ${booking.status}`);
    }

    const transactionRef = 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Update booking to ACTIVE, hold funds in escrow, reveal contact
    booking.status = 'ACTIVE';
    booking.isContactRevealed = true;
    booking.paymentDetails = {
      transactionId: transactionRef,
      method: paymentMethod || 'UPI (Google Pay / PhonePe)',
      paidAt: new Date(),
      escrowStatus: 'HELD',
    };
    await booking.save();

    // Update requirement status
    await Requirement.findByIdAndUpdate(booking.requirementId._id, { status: 'ACTIVE' });

    // Record Escrow transaction
    await Transaction.create({
      bookingId: booking._id,
      type: 'PAYMENT_HELD_ESCROW',
      amount: booking.totalPaid,
      fromUser: booking.requesterId._id,
      toUser: booking.providerId._id,
      status: 'SUCCESS',
      referenceId: transactionRef,
      metadata: {
        bidAmount: booking.bidAmount,
        platformFee: booking.platformFee,
        note: 'Funds held in EzzyGo Escrow until service completion',
      },
    });

    // Notify vendor that payment is confirmed
    await notifyUser({
      userId: booking.providerId._id,
      title: 'Payment Secured in Escrow 🛡️',
      message: `Payment of ₹${booking.totalPaid.toLocaleString()} for "${booking.requirementId.title}" is confirmed and held in EzzyGo Escrow. Host contact is now unlocked!`,
      type: 'PAYMENT_CONFIRMED',
      metadata: { bookingId: booking._id },
    });

    res.json({
      success: true,
      message: 'Payment confirmed! Funds are safely held in EzzyGo Escrow. Provider contact has been unlocked.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Requester marks job completed -> triggers automatic payout release to provider
export const completeBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('providerId')
      .populate('requesterId')
      .populate('requirementId');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    assertHostOrAdmin(req, res, booking);

    if (booking.status !== 'ACTIVE' && booking.status !== 'DISPUTED') {
      res.status(400);
      throw new Error(`Only active bookings can be marked as completed (status: ${booking.status})`);
    }

    const payoutRef = 'POUT-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Payout details
    booking.status = 'COMPLETED';
    booking.completedAt = new Date();
    booking.paymentDetails.escrowStatus = 'RELEASED_TO_PROVIDER';
    booking.payoutDetails = {
      transferId: payoutRef,
      releasedAt: new Date(),
      amountToProvider: booking.bidAmount, // 100% of bid amount to provider
      commissionRetained: booking.platformFee, // 10% platform fee retained by EzzyGo
    };
    if (booking.disputeDetails?.isDisputed) {
      booking.disputeDetails.resolutionAction = 'PAYOUT_VENDOR';
      booking.disputeDetails.resolvedAt = new Date();
    }
    await booking.save();

    // Update requirement status
    await Requirement.findByIdAndUpdate(booking.requirementId._id, { status: 'COMPLETED' });

    // Increment provider's completed jobs counter
    await User.findByIdAndUpdate(booking.providerId._id, {
      $inc: { completedJobs: 1 },
    });

    // Record Provider Payout transaction
    await Transaction.create({
      bookingId: booking._id,
      type: 'PAYOUT_RELEASED_PROVIDER',
      amount: booking.bidAmount,
      fromUser: null, // From Platform Escrow
      toUser: booking.providerId._id,
      status: 'SUCCESS',
      referenceId: payoutRef,
      metadata: {
        method: 'Direct Bank Transfer / UPI',
        bankAccount: booking.providerId.bankDetails?.accountNumber || 'UPI Linked Account',
      },
    });

    // Record EzzyGo Commission transaction
    await Transaction.create({
      bookingId: booking._id,
      type: 'COMMISSION_EARNED',
      amount: booking.platformFee,
      fromUser: booking.requesterId._id,
      toUser: null, // EzzyGo Platform
      status: 'SUCCESS',
      referenceId: 'COMM-' + payoutRef,
      metadata: {
        note: '10% platform fee retained by EzzyGo',
      },
    });

    // Notify vendor that payout has been released
    await notifyUser({
      userId: booking.providerId._id,
      title: 'Payout Released! 💰',
      message: `Full payout of ₹${booking.bidAmount.toLocaleString()} has been released to your account for "${booking.requirementId.title}".`,
      type: 'PAYOUT_RELEASED',
      metadata: { bookingId: booking._id, payoutRef },
    });

    res.json({
      success: true,
      message: `Job marked complete! ₹${booking.bidAmount.toLocaleString()} has been released to ${booking.providerId.businessName || booking.providerId.name}. EzzyGo retained ₹${booking.platformFee.toLocaleString()} commission.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancels an unpaid or paid booking -> refunds the host if they paid, restores requirement to OPEN
export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('providerId').populate('requirementId');
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    assertHostOrAdmin(req, res, booking);

    if (booking.status !== 'AWAITING_PAYMENT' && booking.status !== 'ACTIVE' && booking.status !== 'DISPUTED') {
      res.status(400);
      throw new Error(`Cannot cancel booking with status: ${booking.status}`);
    }

    const wasPaid = booking.status === 'ACTIVE' || booking.status === 'DISPUTED';
    let refundRef = '';

    if (wasPaid) {
      const paymentId = booking.paymentDetails?.transactionId || '';
      // Only real Razorpay payments ("pay_...") can be refunded through the gateway
      if (paymentId.startsWith('pay_')) {
        try {
          const refund = await razorpayInstance.payments.refund(paymentId, {
            amount: Math.round(booking.totalPaid * 100),
            notes: { bookingId: booking._id.toString(), reason: reason || 'Booking cancelled' },
          });
          refundRef = refund.id;
        } catch (err) {
          const reason =
            err?.error?.description ||
            err?.message ||
            (err?.statusCode === 404 ? 'payment not found on Razorpay' : `Razorpay returned status ${err?.statusCode || 'unknown'}`);
          res.status(502);
          throw new Error(`Razorpay refund failed: ${reason}. The booking was not cancelled.`);
        }
      } else {
        refundRef = 'RFND-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      }

      booking.paymentDetails.escrowStatus = 'REFUNDED';
      booking.paymentDetails.refundId = refundRef;
    }

    booking.status = 'CANCELLED';
    booking.disputeReason = reason || 'Payment cancelled by user / Acceptance revoked';
    if (booking.disputeDetails?.isDisputed) {
      booking.disputeDetails.resolutionAction = 'REFUND_HOST';
      booking.disputeDetails.resolvedAt = new Date();
      booking.disputeDetails.resolutionNote = reason || 'Refund issued on cancellation';
    }
    await booking.save();

    if (wasPaid) {
      await Transaction.create({
        bookingId: booking._id,
        type: 'REFUND',
        amount: booking.totalPaid,
        fromUser: null,
        toUser: booking.requesterId,
        status: 'SUCCESS',
        referenceId: refundRef,
        metadata: { reason: booking.disputeReason },
      });
    }

    // Restore requirement status to OPEN so other providers can bid or host can choose another bid
    if (booking.requirementId) {
      const reqId = booking.requirementId._id || booking.requirementId;
      await Requirement.findByIdAndUpdate(reqId, { status: 'OPEN' });
      // Reset rejected bids back to PENDING
      await Bid.updateMany(
        { requirementId: reqId, status: { $in: ['ACCEPTED', 'REJECTED'] } },
        { status: 'PENDING' }
      );
    }

    // Notify both host and vendor
    await notifyUser({
      userId: booking.requesterId,
      title: wasPaid ? 'Booking Cancelled & Refunded 💳' : 'Booking Cancelled',
      message: wasPaid
        ? `Booking cancelled. ₹${booking.totalPaid.toLocaleString()} has been refunded to your source account.`
        : 'Your booking has been cancelled and request reopened.',
      type: 'BOOKING_CANCELLED',
    });

    if (booking.providerId) {
      await notifyUser({
        userId: booking.providerId._id || booking.providerId,
        title: 'Booking Cancelled',
        message: `Booking for "${booking.requirementId?.title || 'event'}" has been cancelled.`,
        type: 'BOOKING_CANCELLED',
      });
    }

    res.json({
      success: true,
      message: wasPaid
        ? `Booking cancelled. ₹${booking.totalPaid.toLocaleString()} refunded to the host. Requirement re-opened for bidding.`
        : 'Booking cancelled. Requirement has been re-opened for bidding.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Raise a dispute on an active booking
export const raiseDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !String(reason).trim()) {
      res.status(400);
      throw new Error('Please enter a dispute reason.');
    }

    const booking = await Booking.findById(id).populate('providerId').populate('requesterId').populate('requirementId');
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    const userId = req.user._id.toString();
    const isHost = booking.requesterId._id.toString() === userId;
    const isVendor = booking.providerId._id.toString() === userId;
    if (!isHost && !isVendor && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('You can only raise disputes on your own bookings.');
    }

    if (booking.status !== 'ACTIVE') {
      res.status(400);
      throw new Error(`Disputes can only be raised on active paid bookings (Current: ${booking.status})`);
    }

    booking.status = 'DISPUTED';
    booking.disputeReason = String(reason).trim();
    booking.disputeDetails = {
      isDisputed: true,
      reason: String(reason).trim(),
      raisedBy: req.user._id,
      raisedAt: new Date(),
      resolutionAction: 'NONE',
      resolutionNote: '',
      resolvedAt: null,
    };
    await booking.save();

    // Notify other party and admin
    const otherUser = isHost ? booking.providerId : booking.requesterId;
    await notifyUser({
      userId: otherUser._id,
      title: 'Dispute Raised ⚠️',
      message: `A dispute has been raised regarding "${booking.requirementId?.title}". EzzyGo Support is reviewing it. Reason: ${reason}`,
      type: 'DISPUTE_RAISED',
      metadata: { bookingId: booking._id },
    });

    res.json({
      success: true,
      message: 'Dispute submitted. EzzyGo support team will review and mediate the payment.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Admin resolves dispute
export const resolveDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;

    if (!['PAYOUT_VENDOR', 'REFUND_HOST', 'DISMISS'].includes(action)) {
      res.status(400);
      throw new Error('Invalid resolution action. Must be PAYOUT_VENDOR, REFUND_HOST, or DISMISS');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (action === 'PAYOUT_VENDOR') {
      req.body.bookingId = id;
      return await completeBooking(req, res, next);
    } else if (action === 'REFUND_HOST') {
      req.body.bookingId = id;
      req.body.reason = note || 'Admin resolved dispute with refund to host';
      return await cancelBooking(req, res, next);
    } else {
      booking.status = 'ACTIVE';
      booking.disputeDetails.isDisputed = false;
      booking.disputeDetails.resolutionAction = 'DISMISSED';
      booking.disputeDetails.resolutionNote = note || 'Dispute dismissed by admin';
      booking.disputeDetails.resolvedAt = new Date();
      await booking.save();
      return res.json({ success: true, message: 'Dispute dismissed. Booking remains active.', data: booking });
    }
  } catch (error) {
    next(error);
  }
};

// Get bookings (filtered by user or role)
export const getBookings = async (req, res, next) => {
  try {
    const { userId, role, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (req.user.role === 'admin') {
      if (role === 'requester' && userId) filter.requesterId = userId;
      if (role === 'provider' && userId) filter.providerId = userId;
    } else if (req.user.role === 'provider') {
      filter.providerId = req.user._id;
    } else {
      filter.requesterId = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('providerId', 'name businessName phone rating reviewCount completedJobs isVerified avatar bankDetails kycDocuments')
      .populate('requesterId', 'name phone email')
      .populate('requirementId');

    const myReviews = await Review.find({
      fromUserId: req.user._id,
      bookingId: { $in: bookings.map((b) => b._id) },
    }).select('bookingId rating');
    const ratingByBooking = new Map(myReviews.map((r) => [r.bookingId.toString(), r.rating]));

    const data = bookings.map((b) => ({
      ...b.toJSON(),
      myRating: ratingByBooking.get(b._id.toString()) ?? null,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// Add two-way review
export const addReview = async (req, res, next) => {
  try {
    const { bookingId, comment } = req.body;
    const rating = Number(req.body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Please choose a rating from 1 to 5 stars.');
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found.');
    }

    const userId = req.user._id.toString();
    const isHost = booking.requesterId.toString() === userId;
    const isVendor = booking.providerId.toString() === userId;
    if (!isHost && !isVendor) {
      res.status(403);
      throw new Error('You can only rate your own bookings.');
    }

    if (booking.status !== 'COMPLETED') {
      res.status(400);
      throw new Error('You can rate only after the event is done.');
    }

    const fromUserId = userId;
    const toUserId = isHost ? booking.providerId : booking.requesterId;
    const role = isHost ? 'requester_to_provider' : 'provider_to_requester';

    if (await Review.exists({ bookingId, fromUserId })) {
      res.status(409);
      throw new Error('You have already rated this booking.');
    }

    const review = await Review.create({
      bookingId,
      fromUserId,
      toUserId,
      rating,
      comment,
      role,
    });

    // If review is for provider, update provider's average rating
    if (role === 'requester_to_provider') {
      const allReviews = await Review.find({ toUserId, role: 'requester_to_provider' });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await User.findByIdAndUpdate(toUserId, {
        rating: Number(avg.toFixed(1)),
        reviewCount: allReviews.length,
      });
    }

    // Notify recipient of new review
    await notifyUser({
      userId: toUserId,
      title: 'New Review Received! ⭐',
      message: `You received a ${rating}-star review${comment ? `: "${comment}"` : '.'}`,
      type: 'SYSTEM',
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};
