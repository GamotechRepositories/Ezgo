import { logAudit } from '../services/auditService.js';
import Banner from '../models/Banner.js';

const defaultBanners = [
  {
    title: 'Grand Festive & Wedding Sound Setup',
    subtitle: 'High-output Line Arrays, JBL Bass & Pioneer DJ Consoles with reverse-bidding savings.',
    badge: 'SPONSORED',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80',
    targetUrl: '#services-grid',
    ctaText: 'Book Sound & DJ',
    city: 'ALL',
    placement: 'hero_banner',
    discountPercent: 25,
    order: 1,
    isActive: true,
  },
  {
    title: 'Luxury Floral Stage & Mandap Decoration',
    subtitle: 'Handpicked fresh orchid arches, royal thematic backdrops, and fairy light canopies.',
    badge: 'LIMITED OFFER',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80',
    targetUrl: '#services-grid',
    ctaText: 'Explore Decor Deals',
    city: 'ALL',
    placement: 'hero_banner',
    discountPercent: 20,
    order: 2,
    isActive: true,
  },
  {
    title: 'Cinematic 4K Drone & Candid Photography',
    subtitle: 'Experienced drone pilots & Sony FX3 filmmakers ready with 100% Escrow safe payments.',
    badge: 'TOP RATED PROS',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=80',
    targetUrl: '#services-grid',
    ctaText: 'Hire Photographers',
    city: 'ALL',
    placement: 'featured_banner',
    discountPercent: 18,
    order: 3,
    isActive: true,
  },
];

// @desc    Get all active banners (supports city and placement filters)
// @route   GET /api/banners
export const getBanners = async (req, res, next) => {
  try {
    const { city, placement, all } = req.query;

    const filter = {};
    if (all !== 'true') {
      filter.isActive = true;
    }

    if (city && city !== 'ALL' && city !== 'All Cities') {
      filter.$or = [{ city: 'ALL' }, { city: new RegExp(city.trim().split(',')[0], 'i') }];
    }

    if (placement && placement !== 'all') {
      filter.placement = { $in: [placement, 'all'] };
    }

    let banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });

    // Auto-seed default banners if collection is completely empty
    const totalCount = await Banner.countDocuments();
    if (totalCount === 0) {
      await Banner.insertMany(defaultBanners);
      banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    }

    res.json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new advertisement / promo banner
// @route   POST /api/banners
export const createBanner = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      badge,
      imageUrl,
      targetUrl,
      ctaText,
      city,
      placement,
      discountPercent,
      order,
      isActive,
    } = req.body;

    if (!title || !imageUrl) {
      res.status(400);
      throw new Error('Please provide both banner title and image');
    }

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      badge: badge ? badge.trim() : 'FEATURED OFFER',
      imageUrl: imageUrl.trim(),
      targetUrl: targetUrl ? targetUrl.trim() : '',
      ctaText: ctaText ? ctaText.trim() : 'Claim Deal',
      city: city || 'ALL',
      placement: placement || 'hero_banner',
      discountPercent: Number(discountPercent) || 15,
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await logAudit({
      req,
      action: 'BANNER_CREATED',
      targetType: 'Banner',
      targetId: banner._id,
      details: `Created new promotional ad banner "${banner.title}" for city "${banner.city}"`,
      metadata: { title: banner.title, city: banner.city, placement: banner.placement },
      status: 'SUCCESS',
    });

    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Update banner details or toggle status
// @route   PUT /api/banners/:id
export const updateBanner = async (req, res, next) => {
  try {
    const updates = {};
    const allowedFields = [
      'title',
      'subtitle',
      'badge',
      'imageUrl',
      'targetUrl',
      'ctaText',
      'city',
      'placement',
      'discountPercent',
      'order',
      'isActive',
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      res.status(404);
      throw new Error('Banner not found');
    }

    await logAudit({
      req,
      action: 'BANNER_UPDATED',
      targetType: 'Banner',
      targetId: banner._id,
      details: `Updated promotional banner "${banner.title}"`,
      metadata: updates,
      status: 'INFO',
    });

    res.json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      res.status(404);
      throw new Error('Banner not found');
    }

    await Banner.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      action: 'BANNER_DELETED',
      targetType: 'Banner',
      targetId: req.params.id,
      details: `Deleted promotional banner "${banner.title}"`,
      status: 'WARNING',
    });

    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};
