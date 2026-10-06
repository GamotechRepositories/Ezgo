import Occasion from '../models/Occasion.js';

const defaultOccasions = [
  {
    name: 'Weddings',
    slug: 'weddings',
    image: '/occasion_weddings.jpg',
    iconType: 'rings',
    order: 1,
    isActive: true,
  },
  {
    name: 'Festivals',
    slug: 'festivals',
    image: '/occasion_festivals.jpg',
    iconType: 'lotus',
    order: 2,
    isActive: true,
  },
  {
    name: 'Corporate Events',
    slug: 'corporate-events',
    image: '/occasion_corporate.jpg',
    iconType: 'corporate',
    order: 3,
    isActive: true,
  },
  {
    name: 'Private Parties',
    slug: 'private-parties',
    image: '/occasion_parties.jpg',
    iconType: 'party',
    order: 4,
    isActive: true,
  },
  {
    name: 'Birthdays',
    slug: 'birthdays',
    image: '/occasion_birthdays.jpg',
    iconType: 'birthday',
    order: 5,
    isActive: true,
  },
];

// @desc    Get all active occasions
// @route   GET /api/occasions
export const getOccasions = async (req, res, next) => {
  try {
    let occasions = await Occasion.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    
    // Seed defaults if collection is empty
    if (occasions.length === 0) {
      await Occasion.insertMany(defaultOccasions);
      occasions = await Occasion.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    }

    res.json({ success: true, count: occasions.length, data: occasions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new occasion card
// @route   POST /api/occasions
export const createOccasion = async (req, res, next) => {
  try {
    const { name, image, iconType, slug, order } = req.body;

    if (!name || !image) {
      res.status(400);
      throw new Error('Please provide occasion name and image');
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const occasion = await Occasion.create({
      name,
      slug: generatedSlug,
      image,
      iconType: iconType || 'sparkles',
      order: Number(order) || 10,
      isActive: true,
    });

    res.status(201).json({ success: true, data: occasion });
  } catch (error) {
    next(error);
  }
};

// @desc    Update occasion card (name, image, icon)
// @route   PUT /api/occasions/:id
export const updateOccasion = async (req, res, next) => {
  try {
    const updates = {};
    for (const key of ['name', 'image', 'iconType', 'order']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const occasion = await Occasion.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!occasion) {
      res.status(404);
      throw new Error('Occasion not found');
    }
    res.json({ success: true, data: occasion });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete occasion card
// @route   DELETE /api/occasions/:id
export const deleteOccasion = async (req, res, next) => {
  try {
    const occasion = await Occasion.findById(req.params.id);
    if (!occasion) {
      res.status(404);
      throw new Error('Occasion not found');
    }

    await Occasion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Occasion deleted successfully' });
  } catch (error) {
    next(error);
  }
};
