import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bookings_provider.dart';
import '../../providers/payments_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/event_request_card.dart';
import '../../widgets/shell_bottom_insets.dart';
import '../../widgets/tab_scroll_registry.dart';
import 'bids_comparison_screen.dart';
import 'booking_detail_screen.dart';
import 'escrow_payment_sheet.dart';
import 'payment_history_screen.dart';
import 'post_requirement_screen.dart';
import 'vendor_profile_screen.dart';

class HostBookingsScreen extends StatefulWidget {
  const HostBookingsScreen({super.key});

  @override
  State<HostBookingsScreen> createState() => _HostBookingsScreenState();
}

class _HostBookingsScreenState extends State<HostBookingsScreen> {
  int _selectedTabIndex = 0; // 0: Upcoming (Escrow), 1: Awaiting Payment, 2: Completed
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    TabScrollRegistry.instance.register(3, _scrollController);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<BookingsProvider>().loadData();
        context.read<PaymentsProvider>().load();
        context.read<RequirementsProvider>().loadData(
              requesterId: context.read<AuthProvider>().user?.id,
            );
      }
    });
  }

  @override
  void dispose() {
    TabScrollRegistry.instance.unregister(3, _scrollController);
    _scrollController.dispose();
    super.dispose();
  }

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
              onPressed: () async {
                try {
                  await context.read<BookingsProvider>().completeBooking(booking.id);
                  if (!context.mounted) return;
                  Navigator.of(ctx).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Review submitted. Escrow funds released to vendor.'),
                      backgroundColor: AppTheme.emerald,
                    ),
                  );
                } catch (e) {
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(e.toString()),
                      backgroundColor: AppTheme.rose,
                    ),
                  );
                }
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
    final payments = context.watch<PaymentsProvider>();
    final auth = context.watch<AuthProvider>();
    final events = context.watch<RequirementsProvider>().mine(auth.user?.id);

    final all = bookingsProvider.bookings;
    final upcoming = bookingsProvider.upcomingBookings;
    final awaiting = bookingsProvider.awaitingPaymentBookings;
    final completed = bookingsProvider.completedBookings;
    final cancelled = all.where((b) => b.status == 'CANCELLED').toList();

    List<BookingModel> displayedBookings;
    switch (_selectedTabIndex) {
      case 2:
        displayedBookings = upcoming;
        break;
      case 3:
        displayedBookings = awaiting;
        break;
      case 4:
        displayedBookings = completed;
        break;
      case 5:
        displayedBookings = cancelled;
        break;
      case 1:
        displayedBookings = all;
        break;
      default:
        displayedBookings = all;
    }

    final showPayments = _selectedTabIndex == 6;
    final showEvents = !showPayments && (_selectedTabIndex == 0 || _selectedTabIndex == 1);
    final showBookings = !showPayments && _selectedTabIndex != 1;

    final totalEscrowHeld = upcoming.fold<int>(0, (sum, b) => sum + b.totalPaid);

    return ListView(
      controller: _scrollController,
      padding: EdgeInsets.fromLTRB(16, 14, 16, ShellBottomInsets.of(context)),
      children: [
        // Title & Summary
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'My Events & Bookings',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Posted events, vendor bids, payments and escrow.',
                    style: TextStyle(color: AppTheme.slate500, fontSize: 12),
                  ),
                ],
              ),
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
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildTabChip(0, 'All', events.length + all.length),
              _buildTabChip(1, 'Events', events.length),
              _buildTabChip(2, 'Confirmed', upcoming.length),
              _buildTabChip(3, 'To Pay', awaiting.length),
              _buildTabChip(4, 'Completed', completed.length),
              _buildTabChip(5, 'Cancelled', cancelled.length),
              _buildTabChip(6, 'Payments', payments.items.length),
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

        if (showPayments)
          const PaymentHistoryScreen(embedded: true)
        else if (showEvents && events.isNotEmpty) ...[
          if (showBookings)
            const Padding(
              padding: EdgeInsets.only(bottom: 10),
              child: Text('Posted Events', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
            ),
          ...events.map(
            (req) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: EventRequestCard(
                requirement: req,
                compact: true,
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => BidsComparisonScreen(requirement: req)),
                  );
                },
              ),
            ),
          ),
          if (showBookings && displayedBookings.isNotEmpty) ...[
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.only(bottom: 10),
              child: Text('Bookings', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
            ),
          ],
        ],

        if (showBookings && displayedBookings.isNotEmpty)
          ...displayedBookings.map((b) => _buildBookingCard(context, b)),

        if (!showPayments && (showEvents ? events.isEmpty : true) && (showBookings ? displayedBookings.isEmpty : true))
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
                  _selectedTabIndex == 1 ? 'No events posted yet' : 'Nothing here yet',
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                ),
                const SizedBox(height: 6),
                Text(
                  _selectedTabIndex == 1
                      ? 'Post an event to receive vendor bids.'
                      : 'Post an event, then accept a bid to create a booking.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.slate500, fontSize: 13),
                ),
                const SizedBox(height: 14),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
                    );
                  },
                  icon: const Icon(LucideIcons.plus, size: 16),
                  label: const Text('Post Event'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),

        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildTabChip(int index, String label, int count) {
    final isSelected = _selectedTabIndex == index;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () => setState(() => _selectedTabIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.slate900 : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isSelected ? AppTheme.slate900 : AppTheme.slate200),
          ),
          child: Text(
            '$label ($count)',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: isSelected ? Colors.white : AppTheme.slate600,
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
                          ? 'Confirmed • Escrow Protected'
                          : (isCompleted ? 'Completed • Payout Released' : 'Action Needed: Pay to Lock Vendor'),
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

          InkWell(
            onTap: b.isEscrowPaid ? () => openVendorProfile(context, b) : null,
            borderRadius: BorderRadius.circular(16),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.primaryLight,
                  backgroundImage: b.isEscrowPaid && b.vendorAvatar.isNotEmpty ? NetworkImage(b.vendorAvatar) : null,
                  child: !b.isEscrowPaid || b.vendorAvatar.isEmpty
                      ? Icon(
                          b.isEscrowPaid ? LucideIcons.user : LucideIcons.lock,
                          color: AppTheme.primary,
                          size: 18,
                        )
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        b.isEscrowPaid ? b.vendorName : 'Vendor locked until payment',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                      ),
                      Text(
                        b.isEscrowPaid
                            ? '${b.vendorCompletedJobs} events done · ${b.vendorPhone}'
                            : 'Pay escrow to see vendor profile and contact',
                        style: TextStyle(
                          color: b.isEscrowPaid ? AppTheme.emerald : AppTheme.slate400,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (b.isEscrowPaid)
                        const Padding(
                          padding: EdgeInsets.only(top: 2),
                          child: Text(
                            'View profile',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primary),
                          ),
                        ),
                    ],
                  ),
                ),
                if (b.isEscrowPaid) ...[
                  IconButton(
                    icon: const Icon(LucideIcons.phone, color: AppTheme.emerald, size: 20),
                    onPressed: () => launchVendorCall(b.vendorPhone),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.messageSquare, color: AppTheme.primary, size: 20),
                    onPressed: () => launchVendorWhatsApp(
                      b.vendorPhone,
                      vendorName: b.vendorName,
                      eventTitle: b.requirementTitle,
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Action Buttons
          if (isAwaiting) ...[
            ElevatedButton(
              onPressed: () {
                showEscrowPaymentSheet(
                  context: context,
                  booking: b,
                  onPaymentSuccess: () => setState(() {}),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.emerald,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                'Pay ₹${b.totalPaid} & Confirm',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
              ),
            ),
          ] else if (isPaid) ...[
            OutlinedButton.icon(
              onPressed: () => openVendorProfile(context, b),
              icon: const Icon(LucideIcons.user, size: 16),
              label: const Text(
                'View vendor profile',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
              ),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(44),
                foregroundColor: AppTheme.slate900,
                side: const BorderSide(color: AppTheme.slate200),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () => _showReviewModal(context, b),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(LucideIcons.checkCheck, size: 18),
              label: const Text(
                'Event Done • Release Payout',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
              ),
            ),
          ] else if (isCompleted) ...[
            OutlinedButton.icon(
              onPressed: () => openVendorProfile(context, b),
              icon: const Icon(LucideIcons.user, size: 16),
              label: const Text(
                'View vendor profile',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
              ),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(44),
                foregroundColor: AppTheme.slate900,
                side: const BorderSide(color: AppTheme.slate200),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 8),
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
