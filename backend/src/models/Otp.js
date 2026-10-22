import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    // Plaintext OTP code - only for legacy mobile SMS flow if required
    otpCode: {
      type: String,
      select: false,
    },
    // Cryptographic hash (SHA-256) of the OTP - used for secure Admin Email OTP
    otpHash: {
      type: String,
      index: true,
      sparse: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '10m' }, // Auto-delete document after 10 minutes
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    purpose: {
      type: String,
      enum: ['login', 'register', 'verification', 'admin_login'],
      default: 'login',
    },
  },
  { timestamps: true }
);

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
