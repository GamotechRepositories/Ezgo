import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middlewares/auth.js';
import { DEMO_PASSWORDS } from '../config/demoPasswords.js';
import { generateAndSendOtp, verifySubmittedOtp } from '../services/otpService.js';
import { notifyUser } from '../services/notificationService.js';
import { handleGoogleAuth, linkGoogleToAccount, syncUserRoleForPortal } from '../services/googleAuthService.js';

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

    let authenticatedUser = user;
    if (role) {
      authenticatedUser = await syncUserRoleForPortal(user, role);
    }

    res.json({
      success: true,
      isNewUser: false,
      message: 'Logged in successfully!',
      data: { token: signToken(authenticatedUser), user: withoutPassword(authenticatedUser) },
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth Sign-In & Onboarding
export const googleAuth = async (req, res, next) => {
  try {
    const { idToken, accessToken, role } = req.body;
    const result = await handleGoogleAuth({ idToken, accessToken, role });

    res.json({
      success: true,
      isNewUser: result.isNewUser,
      message: result.message,
      googleProfile: result.googleProfile,
      data: result.token ? { token: result.token, user: result.user } : undefined,
    });
  } catch (error) {
    console.error('❌ Google Auth Error:', error.message || error);
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

// Link Google account to authenticated user session
export const googleLink = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const result = await linkGoogleToAccount(req.user._id, idToken);
    res.json({
      success: true,
      message: result.message,
      data: result.user,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      password,
      role,
      businessName,
      serviceArea,
      email,
      bankDetails,
      kycDocuments,
      googleId,
    } = req.body;
    const digits = normalizePhone(phone);

    if (!name || !String(name).trim()) {
      res.status(400);
      throw new Error('Enter your name.');
    }
    if (digits.length !== 10) {
      res.status(400);
      throw new Error('Enter a 10-digit mobile number.');
    }
    if (!googleId && (!password || String(password).length < 6)) {
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
      // If host is onboarding as vendor on vendor portal, allow upgrading existing account
      if (role === 'provider' && (existing.role === 'requester' || existing.roles?.includes('requester'))) {
        const matches = existing.passwordHash
          ? (password && (await bcrypt.compare(String(password), existing.passwordHash)))
          : (googleId && existing.googleId === googleId);

        if (matches) {
          existing.role = 'provider';
          if (!Array.isArray(existing.roles)) existing.roles = ['requester'];
          if (!existing.roles.includes('provider')) existing.roles.push('provider');
          if (businessName) existing.businessName = String(businessName).trim();
          if (serviceArea) existing.serviceArea = serviceArea;
          if (email && !existing.email) existing.email = String(email).trim().toLowerCase();
          if (googleId && !existing.googleId) existing.googleId = googleId;
          if (bankDetails) {
            existing.bankDetails = {
              accountHolder: bankDetails.accountHolder ? String(bankDetails.accountHolder).trim() : existing.bankDetails?.accountHolder || '',
              accountNumber: bankDetails.accountNumber ? String(bankDetails.accountNumber).trim() : existing.bankDetails?.accountNumber || '',
              ifscCode: bankDetails.ifscCode ? String(bankDetails.ifscCode).trim().toUpperCase() : existing.bankDetails?.ifscCode || '',
              upiId: bankDetails.upiId ? String(bankDetails.upiId).trim() : existing.bankDetails?.upiId || '',
              isKycCompleted: existing.bankDetails?.isKycCompleted || false,
            };
          }
          if (kycDocuments) {
            existing.kycDocuments = {
              aadhaarNumber: kycDocuments.aadhaarNumber ? String(kycDocuments.aadhaarNumber).trim() : existing.kycDocuments?.aadhaarNumber || '',
              aadhaarFront: kycDocuments.aadhaarFront ? String(kycDocuments.aadhaarFront).trim() : existing.kycDocuments?.aadhaarFront || '',
              aadhaarBack: kycDocuments.aadhaarBack ? String(kycDocuments.aadhaarBack).trim() : existing.kycDocuments?.aadhaarBack || '',
              panNumber: kycDocuments.panNumber ? String(kycDocuments.panNumber).trim().toUpperCase() : existing.kycDocuments?.panNumber || '',
              panCard: kycDocuments.panCard ? String(kycDocuments.panCard).trim() : existing.kycDocuments?.panCard || '',
              gstNumber: kycDocuments.gstNumber ? String(kycDocuments.gstNumber).trim().toUpperCase() : existing.kycDocuments?.gstNumber || '',
              gstDoc: kycDocuments.gstDoc ? String(kycDocuments.gstDoc).trim() : existing.kycDocuments?.gstDoc || '',
              businessAddress: kycDocuments.businessAddress ? String(kycDocuments.businessAddress).trim() : existing.kycDocuments?.businessAddress || '',
              submittedAt: new Date(),
              rejectionReason: '',
            };
          }
          await existing.save();

          return res.status(200).json({
            success: true,
            message: 'Your host account has been upgraded to a vendor account! Welcome to the Vendor Desk.',
            data: { token: signToken(existing), user: withoutPassword(existing) },
          });
        }
      }

      res.status(409);
      throw new Error('An account with this mobile number already exists. Log in instead.');
    }

    if (googleId) {
      const existingGoogle = await User.findOne({ googleId });
      if (existingGoogle) {
        res.status(409);
        throw new Error('An account with this Google profile already exists.');
      }
    }

    const hasKycOrBank = Boolean(
      bankDetails?.accountNumber ||
      bankDetails?.upiId ||
      kycDocuments?.aadhaarNumber ||
      kycDocuments?.panNumber
    );

    const user = await User.create({
      name: String(name).trim(),
      phone: digits,
      email: email ? String(email).trim().toLowerCase() : '',
      googleId: googleId || undefined,
      authProvider: googleId ? 'google' : 'local',
      role,
      roles: [role],
      passwordHash: password ? await bcrypt.hash(String(password), 10) : '',
      usesDemoPassword: false,
      businessName: role === 'provider' ? String(businessName).trim() : '',
      serviceArea: serviceArea || 'Pune',
      isVerified: false,
      bankDetails: {
        accountHolder: bankDetails?.accountHolder ? String(bankDetails.accountHolder).trim() : '',
        accountNumber: bankDetails?.accountNumber ? String(bankDetails.accountNumber).trim() : '',
        ifscCode: bankDetails?.ifscCode ? String(bankDetails.ifscCode).trim().toUpperCase() : '',
        upiId: bankDetails?.upiId ? String(bankDetails.upiId).trim() : '',
        isKycCompleted: false,
      },
      kycDocuments: {
        aadhaarNumber: kycDocuments?.aadhaarNumber ? String(kycDocuments.aadhaarNumber).trim() : '',
        aadhaarFront: kycDocuments?.aadhaarFront ? String(kycDocuments.aadhaarFront).trim() : '',
        aadhaarBack: kycDocuments?.aadhaarBack ? String(kycDocuments.aadhaarBack).trim() : '',
        panNumber: kycDocuments?.panNumber ? String(kycDocuments.panNumber).trim().toUpperCase() : '',
        panCard: kycDocuments?.panCard ? String(kycDocuments.panCard).trim() : '',
        gstNumber: kycDocuments?.gstNumber ? String(kycDocuments.gstNumber).trim().toUpperCase() : '',
        gstDoc: kycDocuments?.gstDoc ? String(kycDocuments.gstDoc).trim() : '',
        businessAddress: kycDocuments?.businessAddress ? String(kycDocuments.businessAddress).trim() : '',
        submittedAt: hasKycOrBank ? new Date() : null,
        rejectionReason: '',
      },
    });

    // Send welcome notification
    await notifyUser({
      userId: user._id,
      title: 'Welcome to EzzyGo! 🎉',
      message:
        role === 'provider'
          ? 'Welcome to EzzyGo Vendor Desk. Your KYC and bank details have been submitted for review.'
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
    let authenticatedUser = user;
    if (role) {
      authenticatedUser = await syncUserRoleForPortal(user, role);
    }

    res.json({
      success: true,
      data: { token: signToken(authenticatedUser), user: withoutPassword(authenticatedUser) },
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

    if (req.user.role !== 'provider' && !req.user.roles?.includes('provider') && req.user.role !== 'admin') {
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

// Vendor availability management (Module 04, Task 08)
export const blockAvailabilityDate = async (req, res, next) => {
  try {
    const { date, reason } = req.body;
    if (!date) {
      res.status(400);
      throw new Error('Date is required in YYYY-MM-DD format');
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.unavailableDates = user.unavailableDates || [];
    const alreadyBlocked = user.unavailableDates.some((d) => d.date === date);
    if (alreadyBlocked) {
      res.status(400);
      throw new Error(`Date ${date} is already marked as unavailable.`);
    }
    user.unavailableDates.push({
      date,
      reason: reason || 'Booked / Offline Event',
      createdAt: new Date(),
    });
    user.unavailableDates.sort((a, b) => a.date.localeCompare(b.date));
    await user.save();
    res.json({ success: true, message: `Date ${date} marked as unavailable.`, data: user });
  } catch (error) {
    next(error);
  }
};

export const unblockAvailabilityDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.unavailableDates = (user.unavailableDates || []).filter((d) => d.date !== date);
    await user.save();
    res.json({ success: true, message: `Date ${date} is now available.`, data: user });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const providerId = req.params.providerId || req.user._id;
    const user = await User.findById(providerId).select('name businessName unavailableDates');
    if (!user) {
      res.status(404);
      throw new Error('Provider not found');
    }
    res.json({ success: true, data: user.unavailableDates || [] });
  } catch (error) {
    next(error);
  }
};
