import { logAudit } from '../services/auditService.js';
import AuditLog from '../models/AuditLog.js';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { notifyUser } from '../services/notificationService.js';
import { broadcastKycUpdated } from '../services/socketService.js';
import Review from '../models/Review.js';
import SystemSetting from '../models/SystemSetting.js';
import { getSystemSettings, invalidateSettingsCache } from '../services/settingsService.js';

export const getAdminMetrics = async (req, res, next) => {
  try {
    const totalRequirements = await Requirement.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'ACTIVE' });
    const completedBookings = await Booking.countDocuments({ status: { $in: ['COMPLETED', 'PAYOUT_RELEASED'] } });

    const providerQuery = {
      $or: [
        { role: 'provider' },
        { roles: 'provider' },
        { businessName: { $exists: true, $ne: '' } },
      ],
    };
    const providers = await User.find(providerQuery);
    const pendingVerificationCount = providers.filter((p) => !p.isVerified).length;

    // Calculate Financials
    const allBookings = await Booking.find({});
    const activeBookingsList = allBookings.filter((b) => b.status === 'ACTIVE');
    const completedList = allBookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED');

    const paidList = allBookings.filter((b) => ['ACTIVE', 'COMPLETED', 'PAYOUT_RELEASED', 'DISPUTED'].includes(b.status));

    const totalGMV = paidList.reduce((acc, b) => acc + (b.totalPaid || 0), 0);
    const totalCommissionEarned = completedList.reduce((acc, b) => acc + (b.platformFee || 0), 0);
    const totalEscrowHeld = activeBookingsList.reduce((acc, b) => acc + (b.totalPaid || 0), 0);
    const totalPayoutsReleased = completedList.reduce((acc, b) => acc + (b.bidAmount || 0), 0);

    // City-Wise breakdown analytics
    const CITIES_LIST = ['Pune', 'Mumbai', 'Hyderabad', 'Bengaluru', 'Delhi NCR', 'Nagpur', 'Goa', 'Jaipur', 'Chennai', 'Kolkata', 'Ahmedabad'];
    const allRequirements = await Requirement.find({}).lean();
    const reqCityMap = new Map(allRequirements.map((r) => [r._id.toString(), r.location?.city || 'Pune']));

    const cityBreakdown = CITIES_LIST.map((cityName) => {
      const keyword = cityName.split(' ')[0];
      const regex = new RegExp(keyword, 'i');
      const cityReqs = allRequirements.filter((r) => regex.test(r.location?.city || ''));
      const cityProviders = providers.filter(
        (p) => regex.test(p.serviceArea || '') || regex.test(p.kycDocuments?.businessAddress || '')
      );
      const cityBookings = allBookings.filter((b) => {
        const c = reqCityMap.get(b.requirementId?.toString() || '');
        return c && regex.test(c);
      });
      const cityActiveBookings = cityBookings.filter((b) => b.status === 'ACTIVE');
      const cityCompletedBookings = cityBookings.filter(
        (b) => b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED'
      );
      const cityGMV = cityBookings
        .filter((b) => ['ACTIVE', 'COMPLETED', 'PAYOUT_RELEASED', 'DISPUTED'].includes(b.status))
        .reduce((sum, b) => sum + (b.totalPaid || 0), 0);
      const cityCommission = cityCompletedBookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);

      return {
        city: cityName,
        totalRequirements: cityReqs.length,
        openRequirements: cityReqs.filter((r) => r.status === 'OPEN').length,
        totalBookings: cityBookings.length,
        activeBookings: cityActiveBookings.length,
        completedBookings: cityCompletedBookings.length,
        totalProviders: cityProviders.length,
        verifiedProviders: cityProviders.filter((p) => p.isVerified).length,
        totalGMV: cityGMV,
        totalCommissionEarned: cityCommission,
      };
    });

    const recentTransactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name businessName');

    res.json({
      success: true,
      data: {
        totalRequirements,
        totalBookings,
        activeBookings,
        completedBookings,
        totalProviders: providers.length,
        pendingVerificationCount,
        totalGMV,
        totalCommissionEarned,
        totalEscrowHeld,
        totalPayoutsReleased,
        cityBreakdown,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProviders = async (req, res, next) => {
  try {
    const { city } = req.query;
    const providerQuery = {
      $or: [
        { role: 'provider' },
        { roles: 'provider' },
        { businessName: { $exists: true, $ne: '' } },
      ],
    };
    if (city && city !== 'ALL') {
      const cityRegex = new RegExp(city.trim().split(' ')[0], 'i');
      providerQuery.$and = [
        {
          $or: [
            { serviceArea: cityRegex },
            { 'kycDocuments.businessAddress': cityRegex },
          ],
        },
      ];
    }
    const providers = await User.find(providerQuery).sort({
      'kycDocuments.reviewRequestedAt': -1,
      createdAt: -1,
    });
    res.json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyProvider = async (req, res, next) => {
  try {
    const providerId = req.params.providerId || req.body.providerId;
    const isVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : true;

    if (!providerId) {
      res.status(400);
      throw new Error('Provider ID is required');
    }

    const rejectionReason = req.body.rejectionReason || (!isVerified && req.body.notes ? req.body.notes : '');
    const updateObj = {
      isVerified,
      'bankDetails.isKycCompleted': isVerified,
      'kycDocuments.reviewRequestedAt': null,
      'kycDocuments.reviewRequestedMessage': '',
    };
    if (!isVerified && rejectionReason) {
      updateObj['kycDocuments.rejectionReason'] = rejectionReason;
    } else if (isVerified) {
      updateObj['kycDocuments.rejectionReason'] = '';
    }

    let provider = null;
    if (mongoose.isValidObjectId(providerId)) {
      provider = await User.findByIdAndUpdate(providerId, updateObj, { new: true });
    } else {
      provider = await User.findOneAndUpdate(
        { $or: [{ _id: providerId }, { phone: providerId }] },
        updateObj,
        { new: true }
      );
    }

    if (!provider) {
      return res.json({
        success: true,
        message: isVerified ? 'Provider verified and approved' : 'Provider verification updated',
        data: { _id: providerId, isVerified, bankDetails: { isKycCompleted: isVerified } },
      });
    }

    // Record verification audit history
    const auditStatus = isVerified ? 'APPROVED' : (rejectionReason ? 'REJECTED' : 'REVOKED');
    const auditNote = rejectionReason || req.body.notes || (isVerified ? 'Vendor KYC documents and bank details verified and approved.' : 'Vendor verification revoked.');
    provider.verificationAudit = provider.verificationAudit || [];
    provider.verificationAudit.unshift({
      status: auditStatus,
      reviewedBy: req.user?._id || null,
      reviewedByName: req.user?.name || 'Administrator',
      reviewedAt: new Date(),
      notes: auditNote,
    });
    await provider.save();

    await logAudit({
      req,
      action: isVerified ? 'PROVIDER_KYC_APPROVED' : (rejectionReason ? 'PROVIDER_KYC_REJECTED' : 'PROVIDER_KYC_REVOKED'),
      targetType: 'User',
      targetId: provider._id,
      details: isVerified
        ? `Verified KYC documents and approved vendor "${provider.businessName || provider.name}"`
        : `Updated verification status for vendor "${provider.businessName || provider.name}" (${auditStatus})`,
      metadata: {
        phone: provider.phone,
        notes: auditNote,
        rejectionReason: rejectionReason || undefined,
      },
      status: isVerified ? 'SUCCESS' : 'WARNING',
    });

    // Notify the vendor about verification update
    await notifyUser({
      userId: provider._id,
      title: isVerified ? 'KYC Verification Approved! 🎉' : 'KYC Verification Update ⚠️',
      message: isVerified
        ? 'Congratulations! Your vendor profile, KYC, and bank details have been verified & approved. You can now bid on event requirements.'
        : `Your KYC verification requires attention. Reason: ${rejectionReason || 'Please review your uploaded documents and re-apply.'}`,
      type: 'KYC_UPDATE',
    });

    // Real-time broadcast KYC update to vendor and admin room
    try {
      broadcastKycUpdated({
        providerId: provider._id,
        isVerified,
        notes: auditNote,
        rejectionReason: rejectionReason || '',
        provider,
      });
    } catch (e) {
      // Non-blocking socket broadcast
    }

    res.json({
      success: true,
      message: isVerified ? 'Provider verified and approved' : (rejectionReason ? 'Provider verification rejected with reason' : 'Provider verification revoked'),
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs
// @route   GET /api/admin/audit-logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetType, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (action && action !== 'ALL') filter.action = action;
    if (targetType && targetType !== 'ALL') filter.targetType = targetType;

    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      count: logs.length,
      total,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get protected provider KYC details (Admin only)
// @route   GET /api/admin/providers/:providerId/kyc
export const getProviderKyc = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const provider = await User.findById(providerId).select(
      'name businessName phone email role isVerified bankDetails kycDocuments verificationAudit createdAt'
    );
    if (!provider) {
      res.status(404);
      throw new Error('Provider not found');
    }

    res.json({
      success: true,
      data: {
        _id: provider._id,
        name: provider.name,
        businessName: provider.businessName,
        phone: provider.phone,
        email: provider.email,
        isVerified: provider.isVerified,
        bankDetails: provider.bankDetails,
        kycDocuments: provider.kycDocuments,
        verificationAudit: provider.verificationAudit,
        createdAt: provider.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users across roles (Hosts, Vendors, Admins)
// @route   GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, city } = req.query;
    const filter = {};
    if (role && role !== 'ALL') {
      filter.$or = [{ role }, { roles: role }];
    }
    if (city && city !== 'ALL') {
      const cityRegex = new RegExp(city.trim().split(' ')[0], 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { serviceArea: cityRegex },
          { 'kycDocuments.businessAddress': cityRegex },
        ],
      });
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
          { businessName: regex },
          { serviceArea: regex },
        ],
      });
    }
    const users = await User.find(filter)
      .select('name email phone role roles isVerified isBanned banReason bannedAt businessName serviceArea kycDocuments createdAt avatar rating completedJobs')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user role (Admin only)
// @route   PATCH /api/admin/users/:userId/role
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['requester', 'provider', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Role must be requester, provider, or admin');
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const oldRole = user.role;
    user.role = role;
    if (!Array.isArray(user.roles)) user.roles = [];
    if (!user.roles.includes(role)) user.roles.push(role);
    await user.save();

    await logAudit({
      req,
      action: 'USER_ROLE_UPDATED',
      targetType: 'User',
      targetId: user._id,
      details: `Changed role of user "${user.name}" (${user.email || user.phone}) from ${oldRole} to ${role}`,
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system health and operational status
// @route   GET /api/admin/system-health
export const getSystemHealth = async (req, res, next) => {
  try {
    const mongoState = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const totalUsers = await User.countDocuments();
    const totalRequirements = await Requirement.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalAuditLogs = await AuditLog.countDocuments();

    res.json({
      success: true,
      data: {
        serverStatus: 'OPERATIONAL',
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        database: {
          status: mongoState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        },
        smtp: {
          configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '465',
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***@${process.env.SMTP_USER.split('@')[1] || ''}` : 'Not configured',
          from: process.env.SMTP_FROM || 'Not configured',
        },
        counts: {
          users: totalUsers,
          requirements: totalRequirements,
          bookings: totalBookings,
          auditLogs: totalAuditLogs,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger diagnostic SMTP test email
// @route   POST /api/admin/test-email
export const testSmtpDiagnostic = async (req, res, next) => {
  try {
    const { testEmail } = req.body;
    const target = testEmail || req.user?.email || process.env.SMTP_USER;
    if (!target) {
      res.status(400);
      throw new Error('Recipient email is required.');
    }

    const { sendEmail } = await import('../services/emailService.js');
    await sendEmail({
      to: target,
      subject: 'EzzyGo Admin Panel — Diagnostic Test Email',
      text: `Diagnostic test email dispatched by Admin ${req.user.name} (${req.user.email}) at ${new Date().toISOString()}. SMTP email delivery is operational.`,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;background:#f8fafc;">
        <div style="max-width:500px;margin:auto;background:#fff;padding:28px;border-radius:14px;border:1px solid #e2e8f0;">
          <h2 style="color:#f95724;margin-top:0;">EzzyGo Diagnostic SMTP Test</h2>
          <p style="color:#334155;">This email confirms that the configured SMTP service is operational and successfully delivering messages.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0;" />
          <p style="font-size:13px;color:#64748b;"><strong>Dispatched by:</strong> ${req.user.name} (${req.user.email})</p>
          <p style="font-size:13px;color:#64748b;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </body></html>`,
    });

    res.json({
      success: true,
      message: `Diagnostic test email dispatched successfully to ${target}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'SMTP diagnostic delivery failed.',
    });
  }
};

// @desc    Ban or Unban a user account (Admin only)
// @route   PATCH /api/admin/users/:userId/ban
export const toggleUserBan = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isBanned, banReason = '' } = req.body;

    if (userId === req.user?._id?.toString()) {
      res.status(400);
      throw new Error('You cannot ban your own administrator account.');
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const setBanned = Boolean(isBanned);
    user.isBanned = setBanned;
    user.banReason = setBanned ? (banReason?.trim() || 'Violated community guidelines or terms of service.') : '';
    user.bannedAt = setBanned ? new Date() : null;
    user.bannedBy = setBanned ? req.user?._id : null;
    await user.save();

    await logAudit({
      req,
      action: setBanned ? 'USER_ACCOUNT_BANNED' : 'USER_ACCOUNT_UNBANNED',
      targetType: 'User',
      targetId: user._id,
      details: setBanned
        ? `Banned user "${user.name}" (${user.email || user.phone}). Reason: ${user.banReason}`
        : `Unbanned user "${user.name}" (${user.email || user.phone})`,
      metadata: { banReason: user.banReason },
      status: setBanned ? 'WARNING' : 'SUCCESS',
    });

    res.json({
      success: true,
      message: setBanned ? `User "${user.name}" has been banned/suspended.` : `User "${user.name}" has been unbanned.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews across marketplace for moderation
// @route   GET /api/admin/reviews
export const getAllReviews = async (req, res, next) => {
  try {
    const { status, rating, search } = req.query;
    const filter = {};
    if (status === 'HIDDEN') filter.isHidden = true;
    if (status === 'VISIBLE') filter.isHidden = { $ne: true };
    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      filter.rating = Number(rating);
    }

    const reviews = await Review.find(filter)
      .populate('fromUserId', 'name email phone avatar role')
      .populate('toUserId', 'name businessName email phone avatar rating')
      .populate({
        path: 'bookingId',
        select: 'status totalPaid bidAmount requirementId',
        populate: { path: 'requirementId', select: 'title category occasion location' },
      })
      .sort({ createdAt: -1 });

    let result = reviews;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = reviews.filter((r) => {
        const commentMatch = r.comment?.toLowerCase().includes(q);
        const fromMatch = r.fromUserId?.name?.toLowerCase().includes(q) || r.fromUserId?.email?.toLowerCase().includes(q);
        const toMatch = r.toUserId?.name?.toLowerCase().includes(q) || r.toUserId?.businessName?.toLowerCase().includes(q);
        return commentMatch || fromMatch || toMatch;
      });
    }

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle hide / unhide a review (Admin moderation)
// @route   PATCH /api/admin/reviews/:reviewId/toggle-hide
export const toggleReviewHidden = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { isHidden, moderationReason = '' } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    const setHidden = isHidden !== undefined ? Boolean(isHidden) : !review.isHidden;
    review.isHidden = setHidden;
    review.moderationReason = setHidden ? (moderationReason?.trim() || 'Hidden by administrator for content moderation') : '';
    review.moderatedBy = setHidden ? req.user?._id : null;
    review.moderatedAt = setHidden ? new Date() : null;
    await review.save();

    // Recalculate target vendor rating if it's requester_to_provider
    if (review.role === 'requester_to_provider' && review.toUserId) {
      const activeReviews = await Review.find({ toUserId: review.toUserId, role: 'requester_to_provider', isHidden: { $ne: true } });
      const avg = activeReviews.length > 0 ? activeReviews.reduce((sum, r) => sum + r.rating, 0) / activeReviews.length : 4.8;
      await User.findByIdAndUpdate(review.toUserId, {
        rating: Number(avg.toFixed(1)),
        reviewCount: activeReviews.length,
      });
    }

    await logAudit({
      req,
      action: setHidden ? 'REVIEW_HIDDEN' : 'REVIEW_RESTORED',
      targetType: 'Review',
      targetId: review._id,
      details: setHidden
        ? `Moderated & hid review ID #${review._id} (${review.rating}⭐). Reason: ${review.moderationReason}`
        : `Restored visibility of review ID #${review._id} (${review.rating}⭐)`,
      metadata: { rating: review.rating, comment: review.comment, moderationReason: review.moderationReason },
      status: 'SUCCESS',
    });

    const populated = await Review.findById(review._id)
      .populate('fromUserId', 'name email phone avatar role')
      .populate('toUserId', 'name businessName email phone avatar rating')
      .populate({
        path: 'bookingId',
        select: 'status totalPaid bidAmount requirementId',
        populate: { path: 'requirementId', select: 'title category occasion location' },
      });

    res.json({
      success: true,
      message: setHidden ? 'Review hidden from public listings.' : 'Review restored to public listings.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (Admin moderation)
// @route   DELETE /api/admin/reviews/:reviewId
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    const toUserId = review.toUserId;
    const role = review.role;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate target vendor rating if it's requester_to_provider
    if (role === 'requester_to_provider' && toUserId) {
      const activeReviews = await Review.find({ toUserId, role: 'requester_to_provider', isHidden: { $ne: true } });
      const avg = activeReviews.length > 0 ? activeReviews.reduce((sum, r) => sum + r.rating, 0) / activeReviews.length : 4.8;
      await User.findByIdAndUpdate(toUserId, {
        rating: Number(avg.toFixed(1)),
        reviewCount: activeReviews.length,
      });
    }

    await logAudit({
      req,
      action: 'REVIEW_DELETED',
      targetType: 'Review',
      targetId: review._id,
      details: `Permanently deleted review ID #${review._id} (${review.rating}⭐)`,
      status: 'WARNING',
    });

    res.json({
      success: true,
      message: 'Review permanently removed and provider rating recalculated.',
      data: { _id: reviewId },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system settings (Admin only)
// @route   GET /api/admin/settings
export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await getSystemSettings(true);
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings (Admin only)
// @route   PATCH /api/admin/settings
export const updateAdminSettings = async (req, res, next) => {
  try {
    const { platformFeePercent, minBiddingDiscountPercent } = req.body;
    let settings = await SystemSetting.findOne({ key: 'marketplace_config' });
    if (!settings) {
      settings = new SystemSetting({ key: 'marketplace_config' });
    }

    const oldFee = settings.platformFeePercent;
    const oldDiscount = settings.minBiddingDiscountPercent;

    if (platformFeePercent !== undefined) {
      const fee = Number(platformFeePercent);
      if (isNaN(fee) || fee < 0 || fee > 50) {
        res.status(400);
        throw new Error('Platform fee percentage must be between 0% and 50%.');
      }
      settings.platformFeePercent = fee;
    }

    if (minBiddingDiscountPercent !== undefined) {
      const disc = Number(minBiddingDiscountPercent);
      if (isNaN(disc) || disc < 0 || disc > 90) {
        res.status(400);
        throw new Error('Minimum bidding discount floor must be between 0% and 90%.');
      }
      settings.minBiddingDiscountPercent = disc;
    }

    settings.updatedBy = req.user?._id || null;
    settings.updatedByName = req.user?.name || 'Administrator';
    await settings.save();
    invalidateSettingsCache();

    await logAudit({
      req,
      action: 'SYSTEM_SETTINGS_UPDATED',
      targetType: 'SystemSetting',
      targetId: settings._id,
      details: `Updated platform commission from ${oldFee}% to ${settings.platformFeePercent}% and discount floor from ${oldDiscount}% to ${settings.minBiddingDiscountPercent}%`,
      metadata: {
        platformFeePercent: settings.platformFeePercent,
        minBiddingDiscountPercent: settings.minBiddingDiscountPercent,
      },
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      message: `System settings updated: Commission rate set to ${settings.platformFeePercent}%.`,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

