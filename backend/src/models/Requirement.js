import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    location: {
      city: { type: String, required: true, default: 'Hyderabad' },
      area: { type: String, required: true },
      venueAddress: { type: String, default: '' },
    },
    eventDate: {
      type: String,
      required: true,
    },
    timeWindow: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    guestCount: {
      type: Number,
      default: 100,
    },
    budget: {
      type: Number,
      required: true,
      min: 500,
    },
    // Max allowable bid to qualify for 15% discount rule: budget * 0.85
    maxAcceptableBid: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'ACCEPTED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
    },
    bidsCount: {
      type: Number,
      default: 0,
    },
    lowestBid: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate maxAcceptableBid (15% rule)
requirementSchema.pre('validate', function () {
  if (this.budget) {
    this.maxAcceptableBid = Math.floor(this.budget * 0.85);
  }
});

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement;
