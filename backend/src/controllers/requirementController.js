import Requirement from '../models/Requirement.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import { broadcastRequirementCreated, broadcastRequirementUpdated } from '../services/socketService.js';

// Create a new requirement (OPEN or DRAFT)
export const createRequirement = async (req, res, next) => {
  try {
    const {
      requesterId,
      category,
      title,
      description,
      occasion,
      eventType,
      location,
      eventDate,
      timeWindow,
      budget,
      guestCount,
      imageUrl,
      images,
      status = 'OPEN',
    } = req.body;

    if (!req.user || (req.user.role !== 'requester' && !req.user.roles?.includes('requester') && req.user.role !== 'provider' && req.user.role !== 'admin')) {
      res.status(403);
      throw new Error('Only a logged-in host can post a request.');
    }

    const ownerId = req.user.role === 'admin' ? requesterId : req.user._id;

    if (!ownerId || !category || !title || !budget || !eventDate || !location?.area) {
      res.status(400);
      throw new Error('Please provide all mandatory fields (category, title, budget, date, location)');
    }

    if (!Number.isFinite(Number(budget)) || Number(budget) < 1000) {
      res.status(400);
      throw new Error('Budget must be at least ₹1,000');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(new Date(eventDate).getTime()) || new Date(eventDate) < today) {
      res.status(400);
      throw new Error('Event date must be today or later');
    }

    const targetStatus = status === 'DRAFT' ? 'DRAFT' : 'OPEN';

    const imageList = Array.isArray(images)
      ? images.filter(Boolean)
      : (imageUrl ? [imageUrl] : []);
    const primaryImage = imageUrl || (imageList.length > 0 ? imageList[0] : '');

    const occasionLabel = (occasion || eventType || '').toString().trim();

    const requirement = await Requirement.create({
      requesterId: ownerId,
      category,
      title,
      description,
      occasion: occasionLabel,
      eventType: occasionLabel,
      imageUrl: primaryImage,
      images: imageList,
      location: {
        city: location.city || 'Pune',
        area: location.area,
        venueAddress: location.venueAddress || '',
      },
      eventDate,
      timeWindow: timeWindow || { start: '18:00', end: '23:00' },
      budget: Number(budget),
      guestCount: Number(guestCount) || 100,
      biddingDeadline: req.body.biddingDeadline ? new Date(req.body.biddingDeadline) : undefined,
      status: targetStatus,
    });

    const populated = await Requirement.findById(requirement._id).populate('requesterId', 'name phone rating avatar');
    
    if (targetStatus === 'OPEN') {
      broadcastRequirementCreated(populated);
    }

    res.status(201).json({
      success: true,
      message: targetStatus === 'DRAFT' ? 'Draft saved successfully.' : 'Requirement published successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing requirement (allowed if DRAFT or OPEN)
export const updateRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requirement = await Requirement.findById(id);

    if (!requirement) {
      res.status(404);
      throw new Error('Requirement not found');
    }

    if (req.user.role !== 'admin' && requirement.requesterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only edit your own request.');
    }

    if (!['DRAFT', 'OPEN'].includes(requirement.status)) {
      res.status(400);
      throw new Error(`Cannot edit request in status: ${requirement.status}`);
    }

    const {
      title,
      description,
      category,
      location,
      eventDate,
      timeWindow,
      budget,
      guestCount,
      imageUrl,
      images,
    } = req.body;

    if (title) requirement.title = title;
    if (description !== undefined) requirement.description = description;
    if (category) requirement.category = category;
    if (images !== undefined) {
      requirement.images = Array.isArray(images) ? images.filter(Boolean) : [];
      if (!imageUrl && requirement.images.length > 0) {
        requirement.imageUrl = requirement.images[0];
      }
    }
    if (imageUrl !== undefined) requirement.imageUrl = imageUrl;
    if (location) {
      if (location.city) requirement.location.city = location.city;
      if (location.area) requirement.location.area = location.area;
      if (location.venueAddress !== undefined) requirement.location.venueAddress = location.venueAddress;
    }
    if (eventDate) requirement.eventDate = eventDate;
    if (timeWindow) requirement.timeWindow = timeWindow;
    if (guestCount) requirement.guestCount = Number(guestCount);
    if (budget) {
      const numBudget = Number(budget);
      if (numBudget < 1000) {
        res.status(400);
        throw new Error('Budget must be at least ₹1,000');
      }
      requirement.budget = numBudget;
      requirement.maxAcceptableBid = Math.floor(numBudget * 0.85);
    }

    const allBids = await Bid.find({ requirementId: requirement._id }).sort({ amount: 1 });
    if (allBids.length > 0) {
      requirement.lowestBid = Math.min(...allBids.map((b) => b.amount));
      requirement.bidsCount = allBids.length;
    }
    await requirement.save();

    const populated = await Requirement.findById(requirement._id).populate('requesterId', 'name phone rating avatar');
    const populatedObj = populated.toObject();
    populatedObj.bids = allBids;
    populatedObj.lowestBid = requirement.lowestBid;
    populatedObj.bidsCount = requirement.bidsCount;
    broadcastRequirementUpdated(populatedObj);
    res.json({ success: true, message: 'Request updated successfully.', data: populatedObj });
  } catch (error) {
    next(error);
  }
};

// Publish a draft requirement
export const publishDraftRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requirement = await Requirement.findById(id);

    if (!requirement) {
      res.status(404);
      throw new Error('Requirement not found');
    }

    if (req.user.role !== 'admin' && requirement.requesterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only publish your own request.');
    }

    if (requirement.status !== 'DRAFT') {
      res.status(400);
      throw new Error(`Only draft requests can be published (Current status: ${requirement.status})`);
    }

    requirement.status = 'OPEN';
    await requirement.save();

    const populated = await Requirement.findById(requirement._id).populate('requesterId', 'name phone rating avatar');
    broadcastRequirementCreated(populated);
    broadcastRequirementUpdated(populated);

    res.json({ success: true, message: 'Draft published! Vendors can now place bids.', data: populated });
  } catch (error) {
    next(error);
  }
};

// Delete a draft or open requirement
export const deleteRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requirement = await Requirement.findById(id);

    if (!requirement) {
      res.status(404);
      throw new Error('Requirement not found');
    }

    if (req.user.role !== 'admin' && requirement.requesterId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only delete your own request.');
    }

    if (!['DRAFT', 'OPEN'].includes(requirement.status)) {
      res.status(400);
      throw new Error(`Cannot delete active or completed requirement.`);
    }

    // Delete associated bids if any
    await Bid.deleteMany({ requirementId: requirement._id });
    await Requirement.deleteOne({ _id: requirement._id });

    res.json({ success: true, message: 'Request deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Get all requirements with optional filters and populated bids
export const getRequirements = async (req, res, next) => {
  try {
    // Auto-expire requirements whose bidding deadline or event date has passed
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    await Requirement.updateMany(
      {
        status: 'OPEN',
        $or: [
          { biddingDeadline: { $exists: true, $ne: null, $lt: now } },
          { eventDate: { $lt: todayStr } },
        ],
      },
      { $set: { status: 'EXPIRED' } }
    );

    const { category, status, city, requesterId, includeDrafts } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) {
      filter.status = status;
    } else if (includeDrafts !== 'true') {
      // By default exclude DRAFTs from public marketplace
      filter.status = { $ne: 'DRAFT' };
    }
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (requesterId) filter.requesterId = requesterId;

    const requirements = await Requirement.find(filter)
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name phone rating avatar')
      .lean();

    // Attach all bids for each requirement
    const reqIds = requirements.map((r) => r._id);
    const allBids = await Bid.find({ requirementId: { $in: reqIds } })
      .sort({ amount: 1 })
      .populate('providerId', 'name businessName phone rating reviewCount completedJobs isVerified avatar bankDetails')
      .lean();

    const reqsWithBids = requirements.map((r) => {
      const bids = allBids.filter((b) => b.requirementId.toString() === r._id.toString());
      const lowestBid = bids.length > 0 ? Math.min(...bids.map((b) => b.amount)) : (r.lowestBid || null);
      return {
        ...r,
        bids,
        lowestBid,
        bidsCount: bids.length,
      };
    });

    res.json({ success: true, count: reqsWithBids.length, data: reqsWithBids });
  } catch (error) {
    next(error);
  }
};

// Get single requirement with all bids
export const getRequirementById = async (req, res, next) => {
  try {
    const requirement = await Requirement.findById(req.params.id).populate(
      'requesterId',
      'name phone rating avatar'
    );

    if (!requirement) {
      res.status(404);
      throw new Error('Requirement not found');
    }

    const bids = await Bid.find({ requirementId: requirement._id })
      .sort({ amount: 1 })
      .populate('providerId', 'name businessName rating reviewCount completedJobs isVerified avatar bankDetails');

    res.json({
      success: true,
      data: {
        ...requirement.toObject(),
        bids,
      },
    });
  } catch (error) {
    next(error);
  }
};
