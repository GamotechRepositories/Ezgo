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
    } = req.body;

    if (!requesterId || !category || !title || !budget || !eventDate || !location?.area) {
      res.status(400);
      throw new Error('Please provide all mandatory fields (category, title, budget, date, location)');
    }

    const requirement = await Requirement.create({
      requesterId,
      category,
      title,
      description,
      location: {
        city: location.city || 'Hyderabad',
        area: location.area,
        venueAddress: location.venueAddress || '',
      },
      eventDate,
      timeWindow: timeWindow || { start: '18:00', end: '23:00' },
      budget: Number(budget),
      guestCount: Number(guestCount) || 100,
    });

    const populated = await Requirement.findById(requirement._id).populate('requesterId', 'name phone');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// Get all requirements with optional filters
export const getRequirements = async (req, res, next) => {
  try {
    const { category, status, city, requesterId } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (city) filter['location.city'] = city;
    if (requesterId) filter.requesterId = requesterId;

    const requirements = await Requirement.find(filter)
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name rating');

    res.json({ success: true, count: requirements.length, data: requirements });
  } catch (error) {
    next(error);
  }
};

// Get single requirement with all bids (protects provider phone numbers)
export const getRequirementById = async (req, res, next) => {
  try {
    const requirement = await Requirement.findById(req.params.id).populate(
      'requesterId',
      'name phone rating'
    );

    if (!requirement) {
      res.status(404);
      throw new Error('Requirement not found');
    }

    // Fetch bids and mask phone numbers for privacy
    const bids = await Bid.find({ requirementId: requirement._id })
      .sort({ amount: 1 })
      .populate('providerId', 'name businessName rating reviewCount completedJobs isVerified avatar');

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
