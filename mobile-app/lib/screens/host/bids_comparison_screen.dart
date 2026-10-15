import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/bid_model.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bookings_provider.dart';
import 'booking_detail_screen.dart';
import 'escrow_payment_sheet.dart';

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
  int _selectedTab = 0; // 0: All Bids, 1: Messages, 2: Details

  final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  void _onAcceptBid(BidModel bid) {
    final auth = context.read<AuthProvider>();
    final hostName = auth.user?.name ?? 'Roshan Chaudhari';
    final hostPhone = auth.user?.phone ?? '+91 98765 43210';

    final booking = context.read<BookingsProvider>().createBookingFromAcceptedBid(
      requirement: widget.requirement,
      bid: bid,
      hostName: hostName,
      hostPhone: hostPhone,
    );

    // Open Escrow Payment Sheet
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => EscrowPaymentSheet(
        booking: booking,
        onPaymentSuccess: () {
          // Open Booking Details Screen
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (_) => BookingDetailScreen(booking: booking),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final req = widget.requirement;
    final bids = req.bids.isNotEmpty ? req.bids : _getSampleBids(req);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              req.title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Row(
              children: [
                Text(
                  '${bids.length} Bids Received',
                  style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: AppTheme.redLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    children: [
                      Icon(LucideIcons.clock, size: 10, color: AppTheme.primary),
                      SizedBox(width: 3),
                      Text(
                        '2d 5h left',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.primary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
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
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildSubTab(0, 'All Bids (${bids.length})'),
                const SizedBox(width: 10),
                _buildSubTab(1, 'Messages'),
                const SizedBox(width: 10),
                _buildSubTab(2, 'Details'),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Content
          Expanded(
            child: _selectedTab == 0
                ? _buildBidsList(bids, req)
                : _selectedTab == 1
                    ? _buildMessagesTab()
                    : _buildDetailsTab(req),
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

  Widget _buildBidsList(List<BidModel> bids, RequirementModel req) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: bids.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final bid = bids[index];
        final benchmarkBudget = req.budget > 0 ? req.budget : 120000;
        final savingsPercent = bid.discountPercent > 0
            ? bid.discountPercent.round()
            : (((benchmarkBudget - bid.amount) / benchmarkBudget) * 100).round();

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderSubtle),
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
                      onPressed: () => _onAcceptBid(bid),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Accept Bid', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
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

  Widget _buildMessagesTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(LucideIcons.messageSquare, size: 40, color: AppTheme.slate400),
          const SizedBox(height: 12),
          Text('No vendor inquiries yet', style: AppTheme.headingFont(fontSize: 16)),
          const SizedBox(height: 6),
          const Text('Vendors who bid can send clarifying questions here.', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildDetailsTab(RequirementModel req) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Event Overview', style: AppTheme.headingFont(fontSize: 16)),
              const SizedBox(height: 12),
              _buildDetailRow(LucideIcons.tag, 'Category', req.category),
              _buildDetailRow(LucideIcons.calendar, 'Event Date', req.eventDate),
              _buildDetailRow(LucideIcons.mapPin, 'Location', '${req.area}, ${req.city}'),
              _buildDetailRow(LucideIcons.users, 'Guest Count', '${req.guestCount} Guests'),
              _buildDetailRow(LucideIcons.indianRupee, 'Budget', formatCurrency.format(req.budget)),
              _buildDetailRow(LucideIcons.shieldCheck, 'Ceiling Cap', formatCurrency.format(req.maxAcceptableBid)),
              const Divider(height: 20, color: AppTheme.borderSubtle),
              Text('Description', style: AppTheme.headingFont(fontSize: 14)),
              const SizedBox(height: 6),
              Text(req.description, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.primary),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
        ],
      ),
    );
  }

  List<BidModel> _getSampleBids(RequirementModel req) {
    return [
      BidModel(
        id: 'bid_starlens',
        requirementId: req.id,
        providerId: 'v_starlens',
        providerName: 'StarLens Studio',
        businessName: 'StarLens Studio',
        providerPhone: '+91 98765 11111',
        providerRating: 4.8,
        completedJobs: 120,
        isVerified: true,
        amount: 85000,
        proposalNotes: 'Full day coverage;500+ edited photos;2 photographers',
        equipmentDetails: 'Sony A7IV, G-Master prime lenses, DJI Ronin RS3',
        discountPercent: 28.0,
        isEligibleForAccept: true,
        status: 'PENDING',
      ),
      BidModel(
        id: 'bid_memorymakers',
        requirementId: req.id,
        providerId: 'v_memory',
        providerName: 'Memory Makers',
        businessName: 'Memory Makers',
        providerPhone: '+91 98765 22222',
        providerRating: 4.6,
        completedJobs: 90,
        isVerified: true,
        amount: 95000,
        proposalNotes: 'Full day coverage;500+ edited photos;2 photographers',
        equipmentDetails: 'Canon R5, Cinema primes, DJI Mavic 3 Pro',
        discountPercent: 21.0,
        isEligibleForAccept: true,
        status: 'PENDING',
      ),
      BidModel(
        id: 'bid_clickcraft',
        requirementId: req.id,
        providerId: 'v_click',
        providerName: 'ClickCraft',
        businessName: 'ClickCraft',
        providerPhone: '+91 98765 33333',
        providerRating: 4.7,
        completedJobs: 110,
        isVerified: true,
        amount: 105000,
        proposalNotes: 'Full day photos;2 photographers',
        equipmentDetails: 'Sony FX3, GM II lenses, Godox lighting truss',
        discountPercent: 13.0,
        isEligibleForAccept: true,
        status: 'PENDING',
      ),
    ];
  }
}
