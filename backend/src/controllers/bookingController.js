import Booking from '../models/Booking.js';
import Bid from '../models/Bid.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';

// Accept a bid with strict 15% minimum-discount validation
export const acceptBid = async (req, res, next) => {
  try {
    const { requirementId, bidId, requesterId } = req.body;

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

    const booking = await Booking.findById(bookingId)
      .populate('providerId')
      .populate('requesterId')
      .populate('requirementId');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
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

// Get bookings (filtered by user or role)
export const getBookings = async (req, res, next) => {
  try {
    const { userId, role, status } = req.query;
    const filter = {};

    if (role === 'requester' && userId) filter.requesterId = userId;
    if (role === 'provider' && userId) filter.providerId = userId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('providerId', 'name businessName phone rating reviewCount completedJobs isVerified avatar bankDetails')
      .populate('requesterId', 'name phone')
      .populate('requirementId');

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// Add two-way review
export const addReview = async (req, res, next) => {
  try {
    const { bookingId, fromUserId, toUserId, rating, comment, role } = req.body;

    const review = await Review.create({
      bookingId,
      fromUserId,
      toUserId,
      rating: Number(rating),
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
