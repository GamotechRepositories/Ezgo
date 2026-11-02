import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['requester_to_provider', 'provider_to_requester'],
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    moderationReason: {
      type: String,
      default: '',
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
