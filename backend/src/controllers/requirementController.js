import Requirement from '../models/Requirement.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';

// Create a new requirement
export const createRequirement = async (req, res, next) => {
  try {
    const {
      requesterId,
      category,
      title,
      description,
      location,
      eventDate,
      timeWindow,
      budget,
      guestCount,
      imageUrl,
    } = req.body;

    if (!req.user || (req.user.role !== 'requester' && req.user.role !== 'admin')) {
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

    const requirement = await Requirement.create({
      requesterId: ownerId,
      category,
      title,
      description,
      imageUrl: imageUrl || '',
      location: {
        city: location.city || 'Pune',
        area: location.area,
        venueAddress: location.venueAddress || '',
      },
      eventDate,
      timeWindow: timeWindow || { start: '18:00', end: '23:00' },
      budget: Number(budget),
      guestCount: Number(guestCount) || 100,
    });

    const populated = await Requirement.findById(requirement._id).populate('requesterId', 'name phone rating avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// Get all requirements with optional filters and populated bids
export const getRequirements = async (req, res, next) => {
  try {
    const { category, status, city, requesterId } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
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

    const reqsWithBids = requirements.map((r) => ({
      ...r,
      bids: allBids.filter((b) => b.requirementId.toString() === r._id.toString()),
    }));

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
