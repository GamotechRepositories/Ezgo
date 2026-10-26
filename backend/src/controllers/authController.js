import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middlewares/auth.js';
import { DEMO_PASSWORDS } from '../config/demoPasswords.js';
import { generateAndSendOtp, verifySubmittedOtp } from '../services/otpService.js';
import { notifyUser } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';
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
    const emailNorm = email ? String(email).trim().toLowerCase() : '';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm);

    if (!name || !String(name).trim()) {
      res.status(400);
      throw new Error('Enter your name.');
    }
    if (digits.length !== 10 && !emailOk) {
      res.status(400);
      throw new Error('Enter a valid email or a 10-digit mobile number.');
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

    // Check if account already exists by Google ID, email, or phone
    let existingUser = null;
    if (googleId) {
      existingUser = await User.findOne({ googleId });
    }
    if (!existingUser && emailOk) {
      existingUser = await User.findOne({ email: emailNorm });
    }
    if (!existingUser && digits.length === 10) {
      existingUser = await findByPhone(digits);
    }

    if (existingUser) {
      // If completing or upgrading Service Provider profile:
      if (role === 'provider') {
        existingUser.role = 'provider';
        if (!Array.isArray(existingUser.roles)) existingUser.roles = [existingUser.role || 'requester'];
        if (!existingUser.roles.includes('provider')) existingUser.roles.push('provider');
        if (name && !existingUser.name) existingUser.name = String(name).trim();
        if (businessName) existingUser.businessName = String(businessName).trim();
        if (serviceArea) existingUser.serviceArea = serviceArea;
        if (digits) existingUser.phone = digits;
        if (email && !existingUser.email) existingUser.email = String(email).trim().toLowerCase();
        if (googleId && !existingUser.googleId) existingUser.googleId = googleId;
        if (password && !existingUser.passwordHash) {
          existingUser.passwordHash = await bcrypt.hash(String(password), 10);
        }
        if (bankDetails) {
          existingUser.bankDetails = {
            accountHolder: bankDetails.accountHolder ? String(bankDetails.accountHolder).trim() : existingUser.bankDetails?.accountHolder || '',
            accountNumber: bankDetails.accountNumber ? String(bankDetails.accountNumber).trim() : existingUser.bankDetails?.accountNumber || '',
            ifscCode: bankDetails.ifscCode ? String(bankDetails.ifscCode).trim().toUpperCase() : existingUser.bankDetails?.ifscCode || '',
            upiId: bankDetails.upiId ? String(bankDetails.upiId).trim() : existingUser.bankDetails?.upiId || '',
            isKycCompleted: existingUser.bankDetails?.isKycCompleted || false,
          };
        }
        if (kycDocuments) {
          existingUser.kycDocuments = {
            aadhaarNumber: kycDocuments.aadhaarNumber ? String(kycDocuments.aadhaarNumber).trim() : existingUser.kycDocuments?.aadhaarNumber || '',
            aadhaarFront: kycDocuments.aadhaarFront ? String(kycDocuments.aadhaarFront).trim() : existingUser.kycDocuments?.aadhaarFront || '',
            aadhaarBack: kycDocuments.aadhaarBack ? String(kycDocuments.aadhaarBack).trim() : existingUser.kycDocuments?.aadhaarBack || '',
            panNumber: kycDocuments.panNumber ? String(kycDocuments.panNumber).trim().toUpperCase() : existingUser.kycDocuments?.panNumber || '',
            panCard: kycDocuments.panCard ? String(kycDocuments.panCard).trim() : existingUser.kycDocuments?.panCard || '',
            gstNumber: kycDocuments.gstNumber ? String(kycDocuments.gstNumber).trim().toUpperCase() : existingUser.kycDocuments?.gstNumber || '',
            gstDoc: kycDocuments.gstDoc ? String(kycDocuments.gstDoc).trim() : existingUser.kycDocuments?.gstDoc || '',
            businessAddress: kycDocuments.businessAddress ? String(kycDocuments.businessAddress).trim() : existingUser.kycDocuments?.businessAddress || '',
            submittedAt: new Date(),
            rejectionReason: '',
          };
        }
        await existingUser.save();

        return res.status(200).json({
          success: true,
          message: 'Service Provider profile registered successfully! Welcome to EzzyGo.',
          data: { token: signToken(existingUser), user: withoutPassword(existingUser) },
        });
      }

      res.status(409);
      throw new Error('An account with this mobile number or email already exists. Log in instead.');
    }

    const hasKycOrBank = Boolean(
      bankDetails?.accountNumber ||
      bankDetails?.upiId ||
      kycDocuments?.aadhaarNumber ||
      kycDocuments?.panNumber
    );

    const user = await User.create({
      name: String(name).trim(),
      phone: digits.length === 10 ? digits : undefined,
      email: emailOk ? emailNorm : '',
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
    const { phone, email, password, role } = req.body;
    const rawEmail = String(email || '').trim().toLowerCase();
    const rawPhone = String(phone || '').trim();
    const identifier = rawEmail || rawPhone;

    if (!identifier) {
      res.status(400);
      throw new Error('Enter your email or mobile number.');
    }
    if (!password) {
      res.status(400);
      throw new Error('Enter your password.');
    }

    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await User.findOne({ email: identifier }).select('+passwordHash')
      : await findByPhone(identifier);

    if (!user) {
      res.status(401);
      throw new Error(isEmail ? 'Wrong email or password.' : 'Wrong phone number or password.');
    }

    if (!user.passwordHash) {
      res.status(401);
      throw new Error('This account was created with Google. Continue with Google to sign in.');
    }

    const matches = await bcrypt.compare(String(password), user.passwordHash);
    if (!matches) {
      res.status(401);
      throw new Error(isEmail ? 'Wrong email or password.' : 'Wrong phone number or password.');
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
    const { userId, name, bankDetails, categories, serviceArea, businessName, email, avatar, phone } = req.body;
    const targetUserId = userId || req.user._id;

    if (req.user.role !== 'admin' && String(req.user._id) !== String(targetUserId)) {
      res.status(403);
      throw new Error('You can only update your own profile.');
    }
    const updateData = {};
    if (name && String(name).trim()) updateData.name = String(name).trim();
    if (bankDetails) updateData.bankDetails = bankDetails;
    if (categories) updateData.categories = categories;
    if (serviceArea) updateData.serviceArea = serviceArea;
    if (businessName !== undefined) updateData.businessName = String(businessName).trim();
    if (email !== undefined) updateData.email = String(email).trim().toLowerCase();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (phone) {
      const digits = normalizePhone(phone);
      if (digits.length === 10) updateData.phone = digits;
    }

    const user = await User.findByIdAndUpdate(targetUserId, updateData, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Submit vendor KYC documents
// Submit vendor KYC documents / Re-apply
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
      bankDetails,
    } = req.body;

    if (req.user.role !== 'provider' && !req.user.roles?.includes('provider') && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Only vendors can submit KYC documents.');
    }

    const targetUserId = req.user._id;
    const updatePayload = {
      isVerified: false,
      'kycDocuments.aadhaarNumber': aadhaarNumber || '',
      'kycDocuments.aadhaarFront': aadhaarFront || '',
      'kycDocuments.aadhaarBack': aadhaarBack || '',
      'kycDocuments.panNumber': panNumber ? panNumber.toUpperCase() : '',
      'kycDocuments.panCard': panCard || '',
      'kycDocuments.gstNumber': gstNumber ? gstNumber.toUpperCase() : '',
      'kycDocuments.gstDoc': gstDoc || '',
      'kycDocuments.businessAddress': businessAddress || '',
      'kycDocuments.submittedAt': new Date(),
      'kycDocuments.rejectionReason': '',
    };

    if (bankDetails) {
      if (bankDetails.accountHolder) updatePayload['bankDetails.accountHolder'] = bankDetails.accountHolder;
      if (bankDetails.accountNumber) updatePayload['bankDetails.accountNumber'] = bankDetails.accountNumber;
      if (bankDetails.ifscCode) updatePayload['bankDetails.ifscCode'] = bankDetails.ifscCode.toUpperCase();
      if (bankDetails.upiId !== undefined) updatePayload['bankDetails.upiId'] = bankDetails.upiId;
    }

    const user = await User.findByIdAndUpdate(targetUserId, { $set: updatePayload }, { new: true });

    // Append to verification audit trail
    user.verificationAudit = user.verificationAudit || [];
    user.verificationAudit.unshift({
      status: 'PENDING',
      reviewedByName: 'Vendor Re-applied',
      reviewedAt: new Date(),
      notes: 'Vendor submitted updated KYC documents & details for verification review.',
    });
    await user.save();

    // Notify user
    await notifyUser({
      userId: targetUserId,
      title: 'KYC Documents Submitted 📄',
      message: 'Your verification documents have been received and are under review by EzzyGo Admin.',
      type: 'KYC_UPDATE',
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notifyUser({
        userId: admin._id,
        title: 'KYC Verification Submitted 📄',
        message: `Vendor "${user.businessName || user.name}" submitted updated KYC documents for review.`,
        type: 'KYC_UPDATE',
      });
    }

    res.json({
      success: true,
      message: 'KYC documents submitted successfully. Admin review is pending.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Vendor request for priority review / reminder ("double request")
export const requestVerificationReview = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'Your account is already verified! You can bid and accept event bookings.',
        data: user,
      });
    }

    const note = req.body.message || 'Vendor requested priority review of verification documents.';
    user.verificationAudit = user.verificationAudit || [];
    user.verificationAudit.unshift({
      status: 'PENDING',
      reviewedByName: 'Vendor Reminder',
      reviewedAt: new Date(),
      notes: note,
    });
    user.kycDocuments = user.kycDocuments || {};
    user.kycDocuments.submittedAt = user.kycDocuments.submittedAt || new Date();
    user.kycDocuments.reviewRequestedAt = new Date();
    user.kycDocuments.reviewRequestedMessage = note;
    await user.save();

    // Log admin audit event
    await logAudit({
      req,
      action: 'PROVIDER_REVIEW_REMINDER',
      targetType: 'User',
      targetId: user._id,
      details: `Vendor "${user.businessName || user.name}" sent a priority review reminder for verification.`,
      metadata: {
        phone: user.phone,
        note,
        reviewRequestedAt: user.kycDocuments.reviewRequestedAt,
      },
      status: 'INFO',
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notifyUser({
        userId: admin._id,
        title: 'Priority KYC Review Reminder ⚡',
        message: `Vendor "${user.businessName || user.name}" (+91 ${user.phone}) requested a review reminder for their KYC verification: "${note}"`,
        type: 'KYC_UPDATE',
      });
    }

    res.json({
      success: true,
      message: 'Verification review reminder sent to EzzyGo admin team.',
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
