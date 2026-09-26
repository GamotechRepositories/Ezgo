import Booking from '../models/Booking.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';

export const getAdminMetrics = async (req, res, next) => {
  try {
    const totalRequirements = await Requirement.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'ACTIVE' });
    const completedBookings = await Booking.countDocuments({ status: 'COMPLETED' });

    const providers = await User.find({ role: 'provider' });
    const pendingVerificationCount = providers.filter((p) => !p.isVerified).length;

    // Calculate Financials
    const completedBookingsList = await Booking.find({ status: 'COMPLETED' });
    const totalGMV = completedBookingsList.reduce((acc, b) => acc + (b.totalPaid || 0), 0);
    const totalCommissionEarned = completedBookingsList.reduce((acc, b) => acc + (b.platformFee || 0), 0);
    const totalPayoutsReleased = completedBookingsList.reduce((acc, b) => acc + (b.bidAmount || 0), 0);

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('fromUser', 'name')
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
        totalPayoutsReleased,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyProvider = async (req, res, next) => {
  try {
    const { providerId, isVerified } = req.body;
    const provider = await User.findByIdAndUpdate(
      providerId,
      { isVerified, 'bankDetails.isKycCompleted': isVerified },
      { new: true }
    );
    res.json({
      success: true,
      message: isVerified ? 'Provider verified and approved to bid!' : 'Provider verification updated',
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};
