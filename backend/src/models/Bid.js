import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100,
    },
    proposalNotes: {
      type: String,
      default: '',
    },
    equipmentDetails: {
      type: String,
      default: '',
    },
    // Calculated field: discount against requester budget
    discountPercent: {
      type: Number,
      default: 0,
    },
    // True if discount >= 15%
    isEligibleForAccept: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

const Bid = mongoose.model('Bid', bidSchema);
export default Bid;
