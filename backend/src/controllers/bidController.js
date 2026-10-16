import Bid from '../models/Bid.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import { notifyUser } from '../services/notificationService.js';
import { broadcastBidPlaced, broadcastRequirementUpdated } from '../services/socketService.js';

// Submit a bid by a provider
export const placeBid = async (req, res, next) => {
  try {
    const { requirementId, providerId, amount, proposalNotes, equipmentDetails } = req.body;

    if (!req.user || (req.user.role !== 'provider' && !req.user.roles?.includes('provider'))) {
      res.status(403);
      throw new Error('Only a logged-in vendor can place a bid.');
    }
    if (req.user._id.toString() !== String(providerId)) {
      res.status(403);
      throw new Error('You can only place a bid as yourself.');
    }

    if (!requirementId || !providerId || !amount) {
      res.status(400);
      throw new Error('Requirement ID, Provider ID, and Bid Amount are required');
    }

    const requirement = await Requirement.findById(requirementId);
    if (!requirement) {
      res.status(404);
      throw new Error('Requirement not found');
    }

    if (requirement.requesterId.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot bid on your own event requirement.');
    }

    if (requirement.status !== 'OPEN') {
      res.status(400);
      throw new Error('This requirement is no longer accepting bids');
    }

    const now = new Date();
    if (requirement.biddingDeadline && new Date(requirement.biddingDeadline) < now) {
      requirement.status = 'EXPIRED';
      await requirement.save();
      res.status(400);
      throw new Error('Bidding deadline has closed for this event requirement.');
    }

    const provider = await User.findById(providerId);
    if (!provider || (provider.role !== 'provider' && !provider.roles?.includes('provider'))) {
      res.status(403);
      throw new Error('Only vendor accounts can place bids');
    }

    // Check if vendor has blocked this event date in their availability calendar (Module 04, Task 08)
    const reqDate = requirement.eventDate ? String(requirement.eventDate).split('T')[0] : '';
    const isDateBlocked = (provider.unavailableDates || []).some(
      (d) => d.date === reqDate || d.date === requirement.eventDate
    );
    if (isDateBlocked) {
      res.status(400);
      throw new Error(`You have marked yourself as unavailable/booked on ${requirement.eventDate}. Please unblock this date in your Availability Calendar if you wish to place a bid.`);
    }

    // Bid must be strictly lower than budget
    const bidAmount = Number(amount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      res.status(400);
      throw new Error('Please enter a valid bid amount');
    }
    if (bidAmount >= requirement.budget) {
      res.status(400);
      throw new Error(`Bid amount must be strictly lower than the requester's budget of ₹${requirement.budget.toLocaleString()}`);
    }

    // Calculate discount against budget
    const discountAmount = requirement.budget - bidAmount;
    const discountPercent = Math.round((discountAmount / requirement.budget) * 100);
    const isEligibleForAccept = discountPercent >= 15;

    // Check if provider already bid on this requirement
    let bid = await Bid.findOne({ requirementId, providerId });
    const isUpdate = Boolean(bid);

    if (bid && bidAmount >= bid.amount) {
      res.status(400);
      throw new Error(`Your revised bid must be strictly lower than your current bid of ₹${bid.amount.toLocaleString()} to remain competitive.`);
    }

    if (bid) {
      // Update existing bid
      bid.amount = bidAmount;
      bid.proposalNotes = proposalNotes || bid.proposalNotes;
      bid.equipmentDetails = equipmentDetails || bid.equipmentDetails;
      bid.discountPercent = discountPercent;
      bid.isEligibleForAccept = isEligibleForAccept;
      await bid.save();
    } else {
      // Create new bid
      bid = await Bid.create({
        requirementId,
        providerId,
        amount: bidAmount,
        proposalNotes,
        equipmentDetails,
        discountPercent,
        isEligibleForAccept,
      });
    }

    // Recalculate requirement bid metrics
    const allBids = await Bid.find({ requirementId });
    const lowest = Math.min(...allBids.map((b) => b.amount));

    requirement.bidsCount = allBids.length;
    requirement.lowestBid = lowest;
    await requirement.save();

    const populatedBid = await Bid.findById(bid._id).populate(
      'providerId',
      'name businessName rating completedJobs isVerified avatar'
    );

    // Broadcast live real-time bid update via Socket.io
    broadcastBidPlaced({
      requirementId: String(requirementId),
      bid: populatedBid,
      isUpdate,
      lowestBid: lowest,
      bidsCount: allBids.length,
      requirement: {
        _id: String(requirement._id),
        lowestBid: lowest,
        bidsCount: allBids.length,
        status: requirement.status,
      },
    });

    // Notify the host about the new / revised bid
    const providerDisplayName = provider.businessName || provider.name;
    await notifyUser({
      userId: requirement.requesterId,
      title: isUpdate ? 'Bid Updated 🏷️' : 'New Bid Received! 🎉',
      message: `${providerDisplayName} submitted a bid of ₹${bidAmount.toLocaleString()} (${discountPercent}% below your budget) for "${requirement.title}".`,
      type: 'BID_RECEIVED',
      link: '/#requests',
      metadata: { requirementId, bidId: bid._id, amount: bidAmount },
    });

    res.status(201).json({
      success: true,
      message: isUpdate
        ? `Your bid was revised successfully to ₹${bidAmount.toLocaleString()}!`
        : isEligibleForAccept
        ? `Bid placed successfully! ${discountPercent}% discount meets the 15% rule.`
        : `Bid placed! Note: At ${discountPercent}% discount, this bid is currently ineligible for acceptance until lowered to at least 15% discount (₹${requirement.maxAcceptableBid.toLocaleString()} or below).`,
      data: populatedBid,
    });
  } catch (error) {
    next(error);
  }
};

// Get all bids placed by a provider
export const getProviderBids = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const bids = await Bid.find({ providerId })
      .sort({ createdAt: -1 })
      .populate('requirementId');

    res.json({ success: true, count: bids.length, data: bids });
  } catch (error) {
    next(error);
  }
};
