import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { signToken } from '../middlewares/auth.js';
import { sendAdminOtpEmail } from '../services/emailService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

const withoutPassword = (user) => {
  const plain = user.toObject ? user.toObject() : { ...user };
  delete plain.passwordHash;
  return plain;
};

/**
 * POST /api/admin/auth/send-otp
 * Validates admin eligibility, applies rate limits, generates a cryptographically secure OTP,
 * stores its SHA-256 hash with 5-minute expiry, and dispatches via Nodemailer.
 * Always returns a generic response to prevent account enumeration.
 */
export const sendAdminOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid administrator email address.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Database-level rate limiting per email (cooldown and max requests)
    const activeChallenge = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'admin_login',
      isVerified: false,
    }).sort({ createdAt: -1 });

    if (activeChallenge) {
      const secondsSinceLast = (Date.now() - new Date(activeChallenge.createdAt).getTime()) / 1000;
      if (secondsSinceLast < 60) {
        const remainingCooldown = Math.ceil(60 - secondsSinceLast);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingCooldown} second${remainingCooldown === 1 ? '' : 's'} before requesting another code.`,
        });
      }
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentRequestsCount = await Otp.countDocuments({
      email: normalizedEmail,
      purpose: 'admin_login',
      createdAt: { $gte: fifteenMinutesAgo },
    });

    if (recentRequestsCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests for this account. Please wait 15 minutes before trying again.',
      });
    }

    // 2. Account verification: Check if an authorized admin account exists with this email
    const admin = await User.findOne({
      email: normalizedEmail,
      $or: [{ role: 'admin' }, { roles: 'admin' }],
    });

    // 3. Generic response to prevent account enumeration
    const genericResponse = {
      success: true,
      message: 'If an authorized admin account is registered with this email, a 6-digit verification code has been sent.',
    };

    // If no admin account exists, do not send email and return generic response
    if (!admin) {
      // Artificial delay to prevent timing attacks on email existence
      await new Promise((resolve) => setTimeout(resolve, 250));
      return res.json(genericResponse);
    }

    // 4. Invalidate any existing OTPs for this admin email
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'admin_login' });

    // 5. Generate cryptographically secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // 6. Store ONLY cryptographic hash of OTP in database
    await Otp.create({
      email: normalizedEmail,
      userId: admin._id,
      otpHash,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      isVerified: false,
      purpose: 'admin_login',
    });

    // 7. Dispatch OTP via email service (Never log the OTP value!)
    try {
      await sendAdminOtpEmail({
        to: admin.email,
        otpCode,
        adminName: admin.name || 'Administrator',
      });
    } catch (emailErr) {
      console.error('Failed to send admin OTP email:', emailErr.message);
      // Delete the generated challenge so the admin is not locked out with an undelivered OTP
      await Otp.deleteMany({ email: normalizedEmail, purpose: 'admin_login' });
      return res.status(500).json({
        success: false,
        message: 'Unable to deliver verification email at this time. Please check mail service configuration.',
      });
    }

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/auth/verify-otp
 * Verifies the submitted OTP against the stored cryptographic hash.
 * Enforces attempt limits, 5-minute expiry, single-use invalidation, and admin role authorization.
 */
export const verifyAdminOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Valid administrator email address is required.',
      });
    }

    const cleanOtp = String(otp || '').trim();
    if (!OTP_REGEX.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit verification code.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Locate active challenge
    const challenge = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'admin_login',
      isVerified: false,
    }).sort({ createdAt: -1 });

    if (!challenge || !challenge.otpHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification session. Please request a new OTP.',
      });
    }

    // 2. Check expiration (5 minutes)
    if (new Date() > challenge.expiresAt) {
      await Otp.deleteOne({ _id: challenge._id });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new OTP.',
      });
    }

    // 3. Check attempt limit (max 5)
    if (challenge.attempts >= challenge.maxAttempts) {
      await Otp.deleteOne({ _id: challenge._id });
      return res.status(429).json({
        success: false,
        message: 'Too many invalid attempts. This verification code has been invalidated. Please request a new OTP.',
      });
    }

    // 4. Verify OTP using timing-safe comparison on SHA-256 hash
    const submittedHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
    const isMatch =
      challenge.otpHash.length === submittedHash.length &&
      crypto.timingSafeEqual(Buffer.from(submittedHash, 'utf8'), Buffer.from(challenge.otpHash, 'utf8'));

    if (!isMatch) {
      challenge.attempts += 1;
      await challenge.save();
      const remaining = challenge.maxAttempts - challenge.attempts;

      if (remaining <= 0) {
        await Otp.deleteOne({ _id: challenge._id });
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code. Maximum attempts exceeded. Please request a new OTP.',
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    // 5. Success: Invalidate OTP immediately to prevent reuse / replay
    await Otp.deleteOne({ _id: challenge._id });

    // 6. Verify administrator role
    const admin = await User.findById(challenge.userId);
    if (!admin || (admin.role !== 'admin' && !admin.roles?.includes('admin'))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Account is not an authorized administrator.',
      });
    }

    // 7. Establish admin session
    const token = signToken(admin);

    return res.json({
      success: true,
      message: 'Admin authentication successful',
      data: {
        token,
        user: withoutPassword(admin),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/auth/login
 * Email + password sign-in for administrator accounts only.
 */
export const loginAdminPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid administrator email address.',
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Enter your password.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const admin = await User.findOne({
      email: normalizedEmail,
      $or: [{ role: 'admin' }, { roles: 'admin' }],
    }).select('+passwordHash');

    const matches = admin?.passwordHash && (await bcrypt.compare(String(password), admin.passwordHash));
    if (!matches) {
      return res.status(401).json({
        success: false,
        message: 'Wrong email or password.',
      });
    }

    const token = signToken(admin);
    return res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: withoutPassword(admin),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/auth/logout
 * Invalidate admin session
 */
export const logoutAdmin = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * GET /api/admin/auth/me
 * Return currently authenticated admin profile
 */
export const getAdminMe = async (req, res) => {
  res.json({
    success: true,
    data: withoutPassword(req.user),
  });
};
