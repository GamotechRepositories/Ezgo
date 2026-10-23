import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    badge: {
      type: String,
      trim: true,
      default: 'FEATURED OFFER',
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    targetUrl: {
      type: String,
      trim: true,
      default: '',
    },
    ctaText: {
      type: String,
      trim: true,
      default: 'Claim Deal',
    },
    city: {
      type: String,
      trim: true,
      default: 'ALL',
    },
    placement: {
      type: String,
      enum: ['hero_banner', 'featured_banner', 'all'],
      default: 'hero_banner',
    },
    discountPercent: {
      type: Number,
      default: 15,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
