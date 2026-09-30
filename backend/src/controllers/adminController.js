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

    const totalGMV = allBookings.reduce((acc, b) => acc + (b.totalPaid || 0), 0);
    const totalCommissionEarned = allBookings.reduce((acc, b) => acc + (b.platformFee || 0), 0);
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
    const isVerified = req.body.isVerified !== undefined ? req.body.isVerified : true;

    const provider = await User.findByIdAndUpdate(
      providerId,
      { isVerified, 'bankDetails.isKycCompleted': isVerified },
      { new: true }
    );

    if (!provider) {
      res.status(404);
      throw new Error('Provider not found');
    }

    res.json({
      success: true,
      message: isVerified ? 'Provider verified and approved' : 'Provider verification revoked',
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};
