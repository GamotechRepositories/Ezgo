import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: undefined,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    googleId: {
      type: String,
      trim: true,
      default: undefined,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    passwordHash: {
      type: String,
      default: '',
      select: false,
    },
    usesDemoPassword: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['requester', 'provider', 'admin'],
      default: 'requester',
    },
    roles: {
      type: [String],
      enum: ['requester', 'provider', 'admin'],
      default: function () {
        return [this.role || 'requester'];
      },
    },
    // Provider specific fields
    businessName: {
      type: String,
      default: '',
    },
    categories: [
      {
        type: String,
      },
    ],
    serviceArea: {
      type: String,
      default: 'Hyderabad',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    bankDetails: {
      accountHolder: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
      isKycCompleted: { type: Boolean, default: false },
    },
    kycDocuments: {
      aadhaarNumber: { type: String, default: '' },
      aadhaarFront: { type: String, default: '' },
      aadhaarBack: { type: String, default: '' },
      panNumber: { type: String, default: '' },
      panCard: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
      gstDoc: { type: String, default: '' },
      businessAddress: { type: String, default: '' },
      submittedAt: { type: Date, default: null },
      rejectionReason: { type: String, default: '' },
      reviewRequestedAt: { type: Date, default: null },
      reviewRequestedMessage: { type: String, default: '' },
    },
    avatar: {
      type: String,
      default: '',
    },
    unavailableDates: [
      {
        date: { type: String, required: true },
        reason: { type: String, default: 'Booked / Offline Event' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    verificationAudit: [
      {
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'], default: 'PENDING' },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedByName: { type: String, default: 'Administrator' },
        reviewedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

userSchema.index(
  { phone: 1 },
  { unique: true, sparse: true, partialFilterExpression: { phone: { $type: 'string', $gt: '' } } }
);
userSchema.index(
  { googleId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { googleId: { $type: 'string', $gt: '' } } }
);
userSchema.index({ email: 1 });

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
