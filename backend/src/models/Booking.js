import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: true,
    },
    bidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true, // 10% of bidAmount
    },
    totalPaid: {
      type: Number,
      required: true, // bidAmount + platformFee
    },
    status: {
      type: String,
      enum: [
        'AWAITING_PAYMENT',
        'ACTIVE',
        'COMPLETED',
        'PAYOUT_RELEASED',
        'CANCELLED',
        'DISPUTED',
      ],
      default: 'AWAITING_PAYMENT',
    },
    paymentDetails: {
      transactionId: { type: String, default: '' },
      orderId: { type: String, default: '' },
      refundId: { type: String, default: '' },
      method: { type: String, default: 'UPI' },
      paidAt: { type: Date, default: null },
      escrowStatus: {
        type: String,
        enum: ['HELD', 'RELEASED_TO_PROVIDER', 'REFUNDED'],
        default: 'HELD',
      },
    },
    payoutDetails: {
      transferId: { type: String, default: '' },
      releasedAt: { type: Date, default: null },
      amountToProvider: { type: Number, default: 0 },
      commissionRetained: { type: Number, default: 0 },
    },
    isContactRevealed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    disputeReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
