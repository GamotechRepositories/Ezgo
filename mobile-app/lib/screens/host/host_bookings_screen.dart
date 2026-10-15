import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../providers/bookings_provider.dart';
import 'booking_detail_screen.dart';
import 'escrow_payment_sheet.dart';

class HostBookingsScreen extends StatefulWidget {
  const HostBookingsScreen({super.key});

  @override
  State<HostBookingsScreen> createState() => _HostBookingsScreenState();
}

class _HostBookingsScreenState extends State<HostBookingsScreen> {
  int _selectedTabIndex = 0; // 0: Upcoming (Escrow), 1: Awaiting Payment, 2: Completed

  void _showReviewModal(BuildContext context, BookingModel booking) {
    int rating = 5;
    final reviewController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Row(
            children: [
              Icon(LucideIcons.star, color: AppTheme.amber, size: 22),
              SizedBox(width: 8),
              Text('Rate Your Experience', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'How was ${booking.vendorName}\'s setup for ${booking.requirementTitle}?',
                style: const TextStyle(fontSize: 13, color: AppTheme.slate600),
              ),
              const SizedBox(height: 16),
              Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(5, (index) {
                    final starNum = index + 1;
                    return IconButton(
                      icon: Icon(
                        starNum <= rating ? Icons.star_rounded : Icons.star_outline_rounded,
                        color: AppTheme.amber,
                        size: 34,
                      ),
                      onPressed: () => setModalState(() => rating = starNum),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: reviewController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Share feedback on equipment quality, timeliness and crew behavior...',
                  hintStyle: const TextStyle(fontSize: 12),
                  filled: true,
                  fillColor: AppTheme.slate50,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppTheme.slate200),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                context.read<BookingsProvider>().completeBooking(booking.id);
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Review submitted & Escrow funds released to vendor!'),
                    backgroundColor: AppTheme.emerald,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Release Escrow & Submit'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bookingsProvider = context.watch<BookingsProvider>();

    final upcoming = bookingsProvider.upcomingBookings;
    final awaiting = bookingsProvider.awaitingPaymentBookings;
    final completed = bookingsProvider.completedBookings;

    List<BookingModel> displayedBookings;
    if (_selectedTabIndex == 0) {
      displayedBookings = upcoming;
    } else if (_selectedTabIndex == 1) {
      displayedBookings = awaiting;
    } else {
      displayedBookings = completed;
    }

    final totalEscrowHeld = upcoming.fold<int>(0, (sum, b) => sum + b.totalPaid);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      children: [
        // Title & Summary
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'My Bookings & Escrow',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                ),
                Text(
                  'Track event status & released payments',
                  style: TextStyle(color: AppTheme.slate500, fontSize: 12),
                ),
              ],
            ),
            if (totalEscrowHeld > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.emeraldLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('HELD IN ESCROW', style: TextStyle(color: AppTheme.emerald, fontSize: 9, fontWeight: FontWeight.w800)),
                    Text(
                      '₹$totalEscrowHeld',
                      style: const TextStyle(color: AppTheme.emerald, fontSize: 14, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
          ],
        ),

        const SizedBox(height: 14),

        // Tabs matching web
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: AppTheme.slate100,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              _buildTabItem(0, 'Upcoming (${upcoming.length})'),
              _buildTabItem(1, 'To Pay (${awaiting.length})'),
              _buildTabItem(2, 'Completed (${completed.length})'),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Escrow Safety Callout
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppTheme.primaryLight.withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
          ),
          child: const Row(
            children: [
              Icon(LucideIcons.shieldCheck, color: AppTheme.primary, size: 18),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Your payment is securely held by EzzyGo. Vendor receives payout only after event is successfully executed.',
                  style: TextStyle(fontSize: 11, color: AppTheme.slate700, fontWeight: FontWeight.w600, height: 1.3),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        if (displayedBookings.isEmpty) ...[
          Container(
            padding: const EdgeInsets.all(36),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.slate200),
            ),
            child: Column(
              children: [
                const Icon(LucideIcons.calendarCheck, size: 40, color: AppTheme.slate400),
                const SizedBox(height: 12),
                Text(
                  _selectedTabIndex == 0
                      ? 'No upcoming events'
                      : (_selectedTabIndex == 1 ? 'No pending payments' : 'No completed events yet'),
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Accept bids on your event needs to lock vendors in escrow.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.slate500, fontSize: 13),
                ),
              ],
            ),
          ),
        ] else ...[
          ...displayedBookings.map((b) => _buildBookingCard(context, b)),
        ],

        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildTabItem(int index, String label) {
    final isSelected = _selectedTabIndex == index;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => setState(() => _selectedTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    )
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              color: isSelected ? AppTheme.slate900 : AppTheme.slate500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBookingCard(BuildContext context, BookingModel b) {
    final isPaid = b.status == 'ACTIVE';
    final isAwaiting = b.status == 'AWAITING_PAYMENT';
    final isCompleted = b.status == 'COMPLETED';

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => BookingDetailScreen(booking: b),
          ),
        );
      },
      borderRadius: BorderRadius.circular(22),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.borderSubtle),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isPaid
                      ? AppTheme.emeraldLight
                      : (isCompleted ? AppTheme.slate100 : AppTheme.amberLight),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isPaid
                          ? LucideIcons.shieldCheck
                          : (isCompleted ? LucideIcons.checkCheck : LucideIcons.clock),
                      size: 13,
                      color: isPaid
                          ? AppTheme.emerald
                          : (isCompleted ? AppTheme.slate700 : AppTheme.amber),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isPaid
                          ? 'Escrow Held · Active'
                          : (isCompleted ? 'Event Completed' : 'Awaiting Payment'),
                      style: TextStyle(
                        color: isPaid
                            ? AppTheme.emerald
                            : (isCompleted ? AppTheme.slate700 : AppTheme.amber),
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '₹${b.totalPaid}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.slate900),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Text(
            b.requirementTitle,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.slate900),
          ),

          const SizedBox(height: 6),

          Row(
            children: [
              const Icon(LucideIcons.calendar, size: 13, color: AppTheme.slate500),
              const SizedBox(width: 4),
              Text(b.eventDate, style: const TextStyle(fontSize: 12, color: AppTheme.slate600, fontWeight: FontWeight.w600)),
              const SizedBox(width: 12),
              const Icon(LucideIcons.mapPin, size: 13, color: AppTheme.slate500),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  b.locationText,
                  style: const TextStyle(fontSize: 12, color: AppTheme.slate600),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),

          const Divider(height: 24),

          // Vendor Profile Card
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppTheme.primaryLight,
                child: Text(
                  b.vendorName.isNotEmpty ? b.vendorName[0] : 'V',
                  style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w900),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(b.vendorName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    Text(
                      b.isContactRevealed ? b.vendorPhone : 'Contact unlocks upon escrow payment',
                      style: TextStyle(
                        color: b.isContactRevealed ? AppTheme.emerald : AppTheme.slate400,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              if (b.isContactRevealed) ...[
                IconButton(
                  icon: const Icon(LucideIcons.phone, color: AppTheme.emerald, size: 20),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Calling vendor at ${b.vendorPhone}...')),
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(LucideIcons.messageSquare, color: AppTheme.primary, size: 20),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Opening WhatsApp with ${b.vendorPhone}...')),
                    );
                  },
                ),
              ],
            ],
          ),

          const SizedBox(height: 14),

          // Action Buttons
          if (isAwaiting) ...[
            ElevatedButton(
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => EscrowPaymentSheet(
                    booking: b,
                    onPaymentSuccess: () => setState(() {}),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                'Deposit ₹${b.totalPaid} in Escrow',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
              ),
            ),
          ] else if (isPaid) ...[
            OutlinedButton.icon(
              onPressed: () => _showReviewModal(context, b),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.emerald,
                side: const BorderSide(color: AppTheme.emerald, width: 1.5),
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(LucideIcons.checkCheck, size: 18),
              label: const Text(
                'Event Done? Release Escrow & Rate',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
              ),
            ),
          ] else if (isCompleted) ...[
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppTheme.slate50,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.star, color: AppTheme.amber, size: 14),
                  SizedBox(width: 4),
                  Text(
                    'Rated 5.0 · 100% Payout Released to Vendor',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: AppTheme.slate700),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    ),
  );
}
}
