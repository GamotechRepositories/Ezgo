import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    type: {
      type: String,
      enum: ['PAYMENT_HELD_ESCROW', 'PAYOUT_RELEASED_PROVIDER', 'COMMISSION_EARNED', 'REFUND'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED'],
      default: 'SUCCESS',
    },
    referenceId: {
      type: String,
      default: () => 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
