import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middlewares/auth.js';
import { DEMO_PASSWORDS } from '../config/demoPasswords.js';
import { generateAndSendOtp, verifySubmittedOtp } from '../services/otpService.js';
import { notifyUser } from '../services/notificationService.js';

export const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

const findByPhone = async (phone) => {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  const users = await User.find().select('+passwordHash');
  return users.find((user) => normalizePhone(user.phone) === digits) || null;
};

const withoutPassword = (user) => {
  const plain = user.toObject ? user.toObject() : { ...user };
  delete plain.passwordHash;
  return plain;
};

const wrongPortalMessage = (role) => {
  if (role === 'provider') return 'This is a vendor account. Open the vendor app to log in.';
  if (role === 'admin') return 'This is an admin account. Open the admin app to log in.';
  return 'This is a host account. Open the host app to log in.';
};

// Send OTP
export const sendOtp = async (req, res, next) => {
  try {
    const { phone, purpose = 'login' } = req.body;
    const result = await generateAndSendOtp(phone, purpose);
    res.json({
      success: true,
      message: `OTP sent to +91 ${result.phone}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP & Login / Pre-verify Registration
export const verifyOtpAndLogin = async (req, res, next) => {
  try {
    const { phone, otp, role } = req.body;
    await verifySubmittedOtp(phone, otp);

    const digits = normalizePhone(phone);
    const user = await findByPhone(digits);

    if (!user) {
      // Return pre-verified signal so client can complete registration
      return res.json({
        success: true,
        isNewUser: true,
        message: 'Phone verified! Please complete your account profile.',
        phone: digits,
      });
    }

    if (role && user.role !== role) {
      res.status(403);
      throw new Error(wrongPortalMessage(user.role));
    }

    res.json({
      success: true,
      isNewUser: false,
      message: 'Logged in successfully!',
      data: { token: signToken(user), user: withoutPassword(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, phone, password, role, businessName, serviceArea, email } = req.body;
    const digits = normalizePhone(phone);

    if (!name || !String(name).trim()) {
      res.status(400);
      throw new Error('Enter your name.');
    }
    if (digits.length !== 10) {
      res.status(400);
      throw new Error('Enter a 10-digit mobile number.');
    }
    if (!password || String(password).length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters.');
    }
    if (role !== 'requester' && role !== 'provider') {
      res.status(400);
      throw new Error('Choose a host or vendor account.');
    }
    if (role === 'provider' && !String(businessName || '').trim()) {
      res.status(400);
      throw new Error('Enter your business name.');
    }

    const existing = await findByPhone(digits);
    if (existing) {
      res.status(409);
      throw new Error('An account with this mobile number already exists. Log in instead.');
    }

    const user = await User.create({
      name: String(name).trim(),
      phone: digits,
      email: email ? String(email).trim().toLowerCase() : '',
      role,
      passwordHash: await bcrypt.hash(String(password), 10),
      usesDemoPassword: false,
      businessName: role === 'provider' ? String(businessName).trim() : '',
      serviceArea: serviceArea || 'Pune',
      isVerified: false,
    });

    // Send welcome notification
    await notifyUser({
      userId: user._id,
      title: 'Welcome to EzzyGo! 🎉',
      message:
        role === 'provider'
          ? 'Welcome to EzzyGo Vendor Desk. Complete your KYC and submit bank details to get verified!'
          : 'Welcome to EzzyGo! Post your event requirements and receive competitive bids at least 15% below your budget.',
      type: 'SYSTEM',
    });

    res.status(201).json({
      success: true,
      data: { token: signToken(user), user: withoutPassword(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { phone, password, role } = req.body;
    const user = await findByPhone(phone);
    const matches = user?.passwordHash && (await bcrypt.compare(String(password || ''), user.passwordHash));

    if (!matches) {
      res.status(401);
      throw new Error('Wrong phone number or password.');
    }
    if (role && user.role !== role) {
      res.status(403);
      throw new Error(wrongPortalMessage(user.role));
    }

    res.json({
      success: true,
      data: { token: signToken(user), user: withoutPassword(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// Demo buttons on the login screen. Hidden in production.
export const demoAccounts = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.json({ success: true, data: [] });
    }
    const users = await User.find({ usesDemoPassword: true }).select('name phone role businessName');
    const shown = { requester: 0, provider: 0, admin: 0 };
    const data = users
      .filter((user) => {
        if (!DEMO_PASSWORDS[user.role] || shown[user.role] >= 3) return false;
        shown[user.role] += 1;
        return true;
      })
      .map((user) => ({
        role: user.role,
        name: user.name,
        businessName: user.businessName || '',
        phone: user.phone,
        password: DEMO_PASSWORDS[user.role],
      }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDemoUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId, bankDetails, categories, serviceArea, businessName, email, avatar } = req.body;
    if (req.user.role !== 'admin' && req.user._id.toString() !== String(userId)) {
      res.status(403);
      throw new Error('You can only update your own profile.');
    }
    const updateData = {};
    if (bankDetails) updateData.bankDetails = bankDetails;
    if (categories) updateData.categories = categories;
    if (serviceArea) updateData.serviceArea = serviceArea;
    if (businessName) updateData.businessName = businessName;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Submit vendor KYC documents
export const submitKyc = async (req, res, next) => {
  try {
    const {
      aadhaarNumber,
      aadhaarFront,
      aadhaarBack,
      panNumber,
      panCard,
      gstNumber,
      gstDoc,
      businessAddress,
    } = req.body;

    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Only vendors can submit KYC documents.');
    }

    const targetUserId = req.user._id;
    const user = await User.findByIdAndUpdate(
      targetUserId,
      {
        kycDocuments: {
          aadhaarNumber: aadhaarNumber || '',
          aadhaarFront: aadhaarFront || '',
          aadhaarBack: aadhaarBack || '',
          panNumber: panNumber || '',
          panCard: panCard || '',
          gstNumber: gstNumber || '',
          gstDoc: gstDoc || '',
          businessAddress: businessAddress || '',
          submittedAt: new Date(),
          rejectionReason: '',
        },
      },
      { new: true }
    );

    // Notify user
    await notifyUser({
      userId: targetUserId,
      title: 'KYC Documents Submitted 📄',
      message: 'Your verification documents have been received and are under review by EzzyGo Admin.',
      type: 'KYC_UPDATE',
    });

    res.json({
      success: true,
      message: 'KYC documents submitted successfully. Admin review is pending.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
