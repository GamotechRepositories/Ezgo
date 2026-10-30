import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/bid_model.dart';
import '../../models/booking_model.dart';
import '../../models/requirement_model.dart';
import '../../providers/bookings_provider.dart';
import '../../providers/requirements_provider.dart';
import 'bids_comparison_screen.dart';
import 'escrow_payment_sheet.dart';

class RequirementDetailSheet extends StatelessWidget {
  final RequirementModel requirement;

  const RequirementDetailSheet({
    super.key,
    required this.requirement,
  });

  Future<void> _onAcceptBid(BuildContext context, RequirementModel req, BidModel bid) async {
    await acceptBidAndOpenEscrow(
      context: context,
      requirement: req,
      bid: bid,
    );
  }

  @override
  Widget build(BuildContext context) {
    final live = context.watch<RequirementsProvider>().allRequirements.where((r) => r.id == requirement.id);
    final req = live.isNotEmpty ? live.first : requirement;
    final bookings = context.watch<BookingsProvider>().bookings;
    BookingModel? booking;
    for (final b in bookings) {
      if (b.requirementId == req.id && b.status != 'CANCELLED') {
        booking = b;
        break;
      }
    }
    final hasBids = req.bids.isNotEmpty;

    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 12),
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.slate200,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(LucideIcons.arrowLeft, size: 20, color: AppTheme.slate700),
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const Expanded(
                    child: Text(
                      'Event details',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.slate900),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 18, color: AppTheme.slate500),
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                ],
              ),
            ),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                children: [
                  // Badges
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          req.category,
                          style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.w800),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.emeraldLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${req.bids.length} Live Bids',
                          style: const TextStyle(color: AppTheme.emerald, fontSize: 11, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Title
                  Text(
                    req.title,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.slate900, height: 1.25),
                  ),

                  const SizedBox(height: 12),

                  // Event Metadata Grid
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.slate50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.slate200),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(LucideIcons.calendar, size: 16, color: AppTheme.slate500),
                            const SizedBox(width: 8),
                            Text(req.eventDate, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                            const Spacer(),
                            const Icon(LucideIcons.users, size: 16, color: AppTheme.slate500),
                            const SizedBox(width: 8),
                            Text('${req.guestCount} Guests', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(LucideIcons.mapPin, size: 16, color: AppTheme.slate500),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '${req.area}, ${req.city} ${req.venueAddress != null ? '(${req.venueAddress})' : ''}',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // 15% Rule & Budget Ceiling Card
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          hasBids ? AppTheme.emeraldLight : AppTheme.primaryLight,
                          hasBids ? Colors.teal.shade50 : Colors.orange.shade50,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: hasBids
                            ? AppTheme.emerald.withValues(alpha: 0.3)
                            : AppTheme.primary.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Your Budget Ceiling', style: TextStyle(fontSize: 11, color: AppTheme.slate600, fontWeight: FontWeight.w600)),
                                Text('₹${req.budget}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.slate900)),
                              ],
                            ),
                            Container(width: 1, height: 32, color: (hasBids ? AppTheme.emerald : AppTheme.primary).withValues(alpha: 0.3)),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  hasBids ? 'Lowest Active Bid' : 'Guaranteed Max Bid (15% OFF)',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: hasBids ? AppTheme.emerald : AppTheme.primaryDark,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  hasBids
                                      ? '₹${req.lowestBid ?? (req.bids.isNotEmpty ? req.bids.map((b) => b.amount).reduce((a, b) => a < b ? a : b) : req.maxAcceptableBid)}'
                                      : '₹${req.maxAcceptableBid}',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: hasBids ? AppTheme.emerald : AppTheme.primary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        if (hasBids) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(LucideIcons.sparkles, size: 13, color: AppTheme.emerald),
                                const SizedBox(width: 5),
                                Text(
                                  'Live Savings: ₹${req.budget - (req.lowestBid ?? req.bids.map((b) => b.amount).reduce((a, b) => a < b ? a : b))} (${req.budget > 0 ? (((req.budget - (req.lowestBid ?? req.bids.map((b) => b.amount).reduce((a, b) => a < b ? a : b))) / req.budget) * 100).round() : 0}% OFF)',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.emerald),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  if (req.description.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    const Text('Details & Specifics', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text(req.description, style: const TextStyle(color: AppTheme.slate600, fontSize: 13, height: 1.35)),
                  ],

                  if (req.equipmentNeeded.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    const Text('Required Gear & Services', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: req.equipmentNeeded.map((eq) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.slate100,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.slate200),
                        ),
                        child: Text(eq, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate700)),
                      )).toList(),
                    ),
                  ],

                  const Divider(height: 32),

                  // Incoming Bids Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Live Vendor Proposals',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                      ),
                      Row(
                        children: [
                          Text(
                            '${req.bids.length} Received',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textSecondary),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () {
                              Navigator.of(context).pop();
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => BidsComparisonScreen(requirement: req),
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.primary,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Compare',
                                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (!hasBids) ...[
                    Container(
                      padding: const EdgeInsets.all(24),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppTheme.slate50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.slate200),
                      ),
                      child: Column(
                        children: [
                          Icon(LucideIcons.clock, size: 36, color: AppTheme.primary.withValues(alpha: 0.6)),
                          const SizedBox(height: 10),
                          const Text(
                            'Waiting for Vendor Bids',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Verified sound, stage, and photo teams in your city have been notified. Live bids will start coming in below your ceiling.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 12, color: AppTheme.slate500, height: 1.35),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    ...req.bids.map((bid) => _buildBidCard(context, req, bid, booking)),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBidCard(BuildContext context, RequirementModel req, BidModel bid, BookingModel? booking) {
    final thisAccepted = bid.isAccepted ||
        (booking != null &&
            ((booking.bidId.isNotEmpty && booking.bidId == bid.id) ||
                booking.vendorName == bid.vendorName));
    final otherChosen = req.isBooked && !thisAccepted;
    final awaitingPay = thisAccepted && (booking == null || booking.isAwaitingPayment);
    final canSelect = bid.isEligibleForAccept || bid.amount <= req.maxAcceptableBid;
    final label = thisAccepted
        ? (awaitingPay ? 'Pay now to lock escrow' : 'Selected')
        : otherChosen
            ? 'Not selected'
            : (canSelect ? 'Accept Bid (₹${bid.amount}) & Lock Escrow' : 'Need 15%+ off to accept');

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.slate200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vendor Row
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppTheme.primaryLight,
                child: Text(
                  bid.businessName.isNotEmpty ? bid.businessName[0] : 'V',
                  style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primary),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            bid.businessName,
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (bid.isVerified) ...[
                          const SizedBox(width: 4),
                          const Icon(LucideIcons.badgeCheck, size: 14, color: AppTheme.emerald),
                        ],
                      ],
                    ),
                    Row(
                      children: [
                        const Icon(LucideIcons.star, size: 12, color: AppTheme.amber),
                        const SizedBox(width: 3),
                        Text(
                          '${bid.providerRating} · ${bid.completedJobs} jobs done',
                          style: const TextStyle(fontSize: 11, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹${bid.amount}',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.emerald),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.emeraldLight,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${bid.discountPercent.toStringAsFixed(1)}% OFF',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.emerald),
                    ),
                  ),
                ],
              ),
            ],
          ),

          if (bid.proposalNotes.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              bid.proposalNotes,
              style: const TextStyle(fontSize: 12, color: AppTheme.slate600, height: 1.3),
            ),
          ],

          if (bid.equipmentDetails.isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(LucideIcons.package, size: 12, color: AppTheme.slate400),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    bid.equipmentDetails,
                    style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 12),

          ElevatedButton(
            onPressed: thisAccepted && awaitingPay && booking != null
                ? () {
                    showEscrowPaymentSheet(context: context, booking: booking);
                  }
                : (!thisAccepted && !otherChosen && canSelect ? () => _onAcceptBid(context, req, bid) : null),
            style: ElevatedButton.styleFrom(
              backgroundColor: thisAccepted ? AppTheme.emerald : AppTheme.primary,
              foregroundColor: Colors.white,
              disabledBackgroundColor: AppTheme.slate100,
              disabledForegroundColor: AppTheme.slate500,
              minimumSize: const Size.fromHeight(42),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(thisAccepted ? LucideIcons.shieldCheck : LucideIcons.checkCircle2, size: 16),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    label,
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
