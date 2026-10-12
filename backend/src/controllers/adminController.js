import { logAudit } from '../services/auditService.js';
import AuditLog from '../models/AuditLog.js';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const getAdminMetrics = async (req, res, next) => {
  try {
    const totalRequirements = await Requirement.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'ACTIVE' });
    const completedBookings = await Booking.countDocuments({ status: { $in: ['COMPLETED', 'PAYOUT_RELEASED'] } });

    const providers = await User.find({ role: 'provider' });
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
    const providers = await User.find({ role: 'provider' }).sort({ createdAt: -1 });
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

    let provider = null;
    if (mongoose.isValidObjectId(providerId)) {
      provider = await User.findByIdAndUpdate(
        providerId,
        { isVerified, 'bankDetails.isKycCompleted': isVerified },
        { new: true }
      );
    } else {
      provider = await User.findOneAndUpdate(
        { $or: [{ _id: providerId }, { phone: providerId }] },
        { isVerified, 'bankDetails.isKycCompleted': isVerified },
        { new: true }
      );
    }

    if (!provider) {
      return res.json({
        success: true,
        message: isVerified ? 'Provider verified and approved' : 'Provider verification revoked',
        data: { _id: providerId, isVerified, bankDetails: { isKycCompleted: isVerified } },
      });
    }

    // Record verification audit history
    const auditNote = req.body.notes || (isVerified ? 'Vendor KYC documents and bank details verified and approved.' : 'Vendor verification revoked.');
    provider.verificationAudit = provider.verificationAudit || [];
    provider.verificationAudit.unshift({
      status: isVerified ? 'APPROVED' : 'REVOKED',
      reviewedBy: req.user?._id || null,
      reviewedByName: req.user?.name || 'Administrator',
      reviewedAt: new Date(),
      notes: auditNote,
    });
    await provider.save();

    await logAudit({
      req,
      action: isVerified ? 'PROVIDER_KYC_APPROVED' : 'PROVIDER_KYC_REVOKED',
      targetType: 'User',
      targetId: provider._id,
      details: isVerified
        ? `Verified KYC documents and approved vendor "${provider.businessName || provider.name}"`
        : `Revoked verification status for vendor "${provider.businessName || provider.name}"`,
      metadata: {
        phone: provider.phone,
        notes: auditNote,
      },
      status: isVerified ? 'SUCCESS' : 'WARNING',
    });

    res.json({
      success: true,
      message: isVerified ? 'Provider verified and approved' : 'Provider verification revoked',
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
