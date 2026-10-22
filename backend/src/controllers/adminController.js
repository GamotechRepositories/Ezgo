import { logAudit } from '../services/auditService.js';
import AuditLog from '../models/AuditLog.js';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { notifyUser } from '../services/notificationService.js';

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
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProviders = async (req, res, next) => {
  try {
    const providerQuery = {
      $or: [
        { role: 'provider' },
        { roles: 'provider' },
        { businessName: { $exists: true, $ne: '' } },
      ],
    };
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
    const { search, role } = req.query;
    const filter = {};
    if (role && role !== 'ALL') {
      filter.$or = [{ role }, { roles: role }];
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { businessName: regex },
      ];
    }
    const users = await User.find(filter)
      .select('name email phone role roles isVerified businessName createdAt avatar rating completedJobs')
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
