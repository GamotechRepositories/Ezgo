import Booking from '../models/Booking.js';
import Bid from '../models/Bid.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';
import razorpayInstance from '../config/razorpay.js';

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
        note: 'Funds held in EzGo Escrow until service completion',
      },
    });

    res.json({
      success: true,
      message: 'Payment confirmed! Funds are safely held in EzGo Escrow. Provider contact has been unlocked.',
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

    if (booking.status !== 'ACTIVE') {
      res.status(400);
      throw new Error('Only active bookings can be marked as completed');
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
      commissionRetained: booking.platformFee, // 10% platform fee retained by EzGo
    };
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

    // Record EzGo Commission transaction
    await Transaction.create({
      bookingId: booking._id,
      type: 'COMMISSION_EARNED',
      amount: booking.platformFee,
      fromUser: booking.requesterId._id,
      toUser: null, // EzGo Platform
      status: 'SUCCESS',
      referenceId: 'COMM-' + payoutRef,
      metadata: {
        note: '10% platform fee retained by EzGo',
      },
    });

    res.json({
      success: true,
      message: `Job marked complete! ₹${booking.bidAmount.toLocaleString()} has been released to ${booking.providerId.businessName || booking.providerId.name}. EzGo retained ₹${booking.platformFee.toLocaleString()} commission.`,
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

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    assertHostOrAdmin(req, res, booking);

    if (booking.status !== 'AWAITING_PAYMENT' && booking.status !== 'ACTIVE') {
      res.status(400);
      throw new Error(`Cannot cancel booking with status: ${booking.status}`);
    }

    const wasPaid = booking.status === 'ACTIVE';
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
      await Requirement.findByIdAndUpdate(booking.requirementId, { status: 'OPEN' });
      // Reset rejected bids back to PENDING
      await Bid.updateMany(
        { requirementId: booking.requirementId, status: { $in: ['ACCEPTED', 'REJECTED'] } },
        { status: 'PENDING' }
      );
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
      .populate('providerId', 'name businessName phone rating reviewCount completedJobs isVerified avatar bankDetails')
      .populate('requesterId', 'name phone')
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

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};
