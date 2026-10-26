import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/bid_model.dart';
import '../../models/booking_model.dart';
import '../../models/requirement_model.dart';
import '../../providers/bookings_provider.dart';
import '../../providers/requirements_provider.dart';
import 'booking_detail_screen.dart';
import 'escrow_payment_sheet.dart';
import '../../widgets/shell_bottom_insets.dart';

class BidsComparisonScreen extends StatefulWidget {
  final RequirementModel requirement;

  const BidsComparisonScreen({
    super.key,
    required this.requirement,
  });

  @override
  State<BidsComparisonScreen> createState() => _BidsComparisonScreenState();
}

class _BidsComparisonScreenState extends State<BidsComparisonScreen> {
  int _selectedTab = 0; // 0: All Bids, 1: Lowest Price, 2: Top Rated
  bool _accepting = false;

  final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RequirementsProvider>().fetchRequirement(widget.requirement.id);
    });
  }

  Future<void> _openPay(BookingModel booking) async {
    await showEscrowPaymentSheet(context: context, booking: booking);
  }

  Future<void> _onAcceptBid(RequirementModel req, BidModel bid) async {
    if (_accepting) return;
    setState(() => _accepting = true);
    try {
      await acceptBidAndOpenEscrow(
        context: context,
        requirement: req,
        bid: bid,
        onPaid: (booking) {
          if (!booking.isEscrowPaid) return;
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => BookingDetailScreen(booking: booking),
            ),
          );
        },
      );
    } finally {
      if (mounted) setState(() => _accepting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final live = context.watch<RequirementsProvider>().allRequirements.where((r) => r.id == widget.requirement.id);
    final req = live.isNotEmpty ? live.first : widget.requirement;
    final bookings = context.watch<BookingsProvider>().bookings;
    BookingModel? booking;
    for (final b in bookings) {
      if (b.requirementId == req.id && b.status != 'CANCELLED') {
        booking = b;
        break;
      }
    }
    final bids = List<BidModel>.from(req.bids);
    if (_selectedTab == 1) {
      bids.sort((a, b) => a.amount.compareTo(b.amount));
    } else if (_selectedTab == 2) {
      bids.sort((a, b) => b.providerRating.compareTo(a.providerRating));
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Vendor Bids'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, size: 22),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.share2, size: 18),
            onPressed: () {},
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: Column(
        children: [
          // Sub-tabs: All Bids, Messages, Details
          Container(
            width: double.infinity,
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF1EA),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              req.isBooked
                  ? (booking?.status == 'AWAITING_PAYMENT'
                      ? 'Vendor selected. Pay now to lock ${booking?.vendorName ?? 'this vendor'} in escrow.'
                      : 'This event is booked with ${booking?.vendorName ?? 'your selected vendor'}.')
                  : bids.isEmpty
                      ? 'Waiting for vendor bids.\nVerified vendors in ${req.city} can send prices below your ₹${req.maxAcceptableBid} ceiling.'
                      : '${bids.length} vendor${bids.length == 1 ? '' : 's'} have submitted bids. Accept only bids at least 15% below budget.',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, height: 1.35, color: AppTheme.textPrimary),
            ),
          ),
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildSubTab(0, 'All Bids'),
                const SizedBox(width: 10),
                _buildSubTab(1, 'Lowest Price'),
                const SizedBox(width: 10),
                _buildSubTab(2, 'Top Rated'),
              ],
            ),
          ),

          const SizedBox(height: 10),

          Expanded(
            child: RefreshIndicator(
              color: AppTheme.primary,
              onRefresh: () async {
                final reqs = context.read<RequirementsProvider>();
                final books = context.read<BookingsProvider>();
                await reqs.fetchRequirement(widget.requirement.id);
                await books.loadData();
              },
              child: bids.isEmpty ? _buildEmptyBids() : _buildBidsList(bids, req, booking),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubTab(int index, String label) {
    final isSelected = _selectedTab == index;

    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : AppTheme.slate600,
          ),
        ),
      ),
    );
  }

  Widget _buildBidsList(List<BidModel> bids, RequirementModel req, BookingModel? booking) {
    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: EdgeInsets.fromLTRB(16, 10, 16, ShellBottomInsets.of(context)),
      itemCount: bids.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final bid = bids[index];
        final benchmarkBudget = req.budget > 0 ? req.budget : 120000;
        final savingsPercent = bid.discountPercent > 0
            ? bid.discountPercent.round()
            : (((benchmarkBudget - bid.amount) / benchmarkBudget) * 100).round();

        final thisAccepted = bid.isAccepted ||
            (booking != null &&
                ((booking.bidId.isNotEmpty && booking.bidId == bid.id) ||
                    (booking.vendorName.isNotEmpty && booking.vendorName == bid.vendorName)));
        final otherChosen = req.isBooked && !thisAccepted;
        final awaitingPay = thisAccepted && (booking == null || booking.isAwaitingPayment);

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: thisAccepted ? AppTheme.emerald : AppTheme.borderSubtle,
              width: thisAccepted ? 1.6 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Vendor header: Avatar, Name, Rating
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 44,
                      height: 44,
                      color: AppTheme.slate100,
                      child: Image.asset(
                        'assets/images/vendor_avatar.png',
                        fit: BoxFit.cover,
                        filterQuality: FilterQuality.high,
                        errorBuilder: (context, error, stackTrace) => Container(
                          color: AppTheme.pastelAmber,
                          alignment: Alignment.center,
                          child: Text(
                            bid.vendorName.isNotEmpty ? bid.vendorName[0] : 'V',
                            style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFFD97706), fontSize: 18),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          bid.vendorName,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, size: 15, color: Color(0xFFFF9500)),
                            const SizedBox(width: 3),
                            Text(
                              '${bid.rating.toStringAsFixed(1)} ',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                            ),
                            Text(
                              '(${bid.completedJobsCount} reviews)',
                              style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Price & Discount Pill (Screen 9)
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    formatCurrency.format(bid.amount),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    formatCurrency.format(benchmarkBudget),
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppTheme.slate400,
                      decoration: TextDecoration.lineThrough,
                    ),
                  ),
                  const Spacer(),
                  if (savingsPercent > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F8F0),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '$savingsPercent% lower',
                        style: const TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 10),

              // Deliverables Bullets (Screen 9)
              ...bid.deliverables.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      children: [
                        const Icon(Icons.check, size: 14, color: Color(0xFF10B981)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            item,
                            style: const TextStyle(fontSize: 12, color: AppTheme.slate600, fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                  )),

              const SizedBox(height: 14),

              // Action Buttons: View Profile & Accept Bid (Screen 9)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${bid.vendorName}: Verified EzzyGo Partner with 100% Escrow Protection.'),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFFFFD1D1), width: 1.2),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        elevation: 0,
                      ),
                      child: const Text('View Profile', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: thisAccepted
                          ? (awaitingPay && booking != null && !_accepting
                              ? () => _openPay(booking)
                              : null)
                          : otherChosen
                              ? null
                              : (!_accepting && (bid.isEligibleForAccept || bid.amount <= req.maxAcceptableBid)
                                  ? () => _onAcceptBid(req, bid)
                                  : null),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: thisAccepted ? AppTheme.emerald : AppTheme.primary,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: AppTheme.slate100,
                        disabledForegroundColor: AppTheme.slate500,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: Text(
                        thisAccepted
                            ? (awaitingPay ? 'Pay now' : 'Selected')
                            : otherChosen
                                ? 'Not selected'
                                : ((bid.isEligibleForAccept || bid.amount <= req.maxAcceptableBid) ? 'Select' : 'Need 15%+'),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyBids() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(32, 80, 32, 32),
      children: [
        const Icon(LucideIcons.clock, size: 40, color: AppTheme.slate400),
        const SizedBox(height: 12),
        Text('No bids yet', textAlign: TextAlign.center, style: AppTheme.headingFont(fontSize: 16)),
        const SizedBox(height: 6),
        const Text(
          'Vendors will bid lower than your budget. Pull down to refresh after they submit.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
        ),
      ],
    );
  }
}
