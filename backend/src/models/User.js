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
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
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
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
