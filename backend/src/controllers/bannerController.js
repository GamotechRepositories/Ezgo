import { logAudit } from '../services/auditService.js';
import Banner from '../models/Banner.js';

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
      const cityName = city.trim().split(',')[0];
      filter.$or = [
        { city: 'ALL' },
        { city: /^all$/i },
        { city: /all cities/i },
        { city: new RegExp(cityName, 'i') },
      ];
    }

    if (placement && placement !== 'all') {
      filter.placement = { $in: [placement, 'all'] };
    }

    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });

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
