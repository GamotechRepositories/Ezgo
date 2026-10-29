import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../providers/bookings_provider.dart';
import '../../widgets/pull_refresh.dart';
import '../../widgets/shell_bottom_insets.dart';
import '../../widgets/vendor_ui.dart';
import '../host/vendor_profile_screen.dart';

class VendorBookingsScreen extends StatefulWidget {
  const VendorBookingsScreen({super.key});

  @override
  State<VendorBookingsScreen> createState() => _VendorBookingsScreenState();
}

class _VendorBookingsScreenState extends State<VendorBookingsScreen> {
  static final _pretty = DateFormat('EEE, d MMM yyyy');
  String _filter = 'ALL';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<BookingsProvider>().loadData();
    });
  }

  String _label(String status) {
    switch (status.toUpperCase()) {
      case 'AWAITING_PAYMENT':
        return 'Waiting for pay';
      case 'ACTIVE':
        return 'Confirmed';
      case 'COMPLETED':
      case 'PAYOUT_RELEASED':
        return 'Completed';
      case 'DISPUTED':
        return 'Under review';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  Color _color(String status) {
    switch (status.toUpperCase()) {
      case 'AWAITING_PAYMENT':
        return AppTheme.amber;
      case 'ACTIVE':
        return AppTheme.emerald;
      case 'COMPLETED':
      case 'PAYOUT_RELEASED':
        return AppTheme.teal;
      case 'CANCELLED':
        return AppTheme.rose;
      default:
        return AppTheme.primary;
    }
  }

  String _fmtDate(String raw) {
    final parsed = DateTime.tryParse(raw) ??
        DateTime.tryParse(raw.length >= 10 ? raw.substring(0, 10) : raw);
    if (parsed == null) return raw.isEmpty ? 'Date TBA' : raw;
    return _pretty.format(parsed.toLocal());
  }

  bool _isDone(BookingModel b) {
    final s = b.status.toUpperCase();
    return s == 'COMPLETED' || s == 'PAYOUT_RELEASED';
  }

  List<BookingModel> _filtered(List<BookingModel> bookings) {
    switch (_filter) {
      case 'PAY':
        return bookings.where((b) => b.status.toUpperCase() == 'AWAITING_PAYMENT').toList();
      case 'ACTIVE':
        return bookings.where((b) => b.status.toUpperCase() == 'ACTIVE').toList();
      case 'DONE':
        return bookings.where(_isDone).toList();
      default:
        return bookings;
    }
  }

  int get _segmentIndex {
    switch (_filter) {
      case 'PAY':
        return 1;
      case 'ACTIVE':
        return 2;
      case 'DONE':
        return 3;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BookingsProvider>();
    final bookings = provider.bookings;
    final loading = provider.isLoading && bookings.isEmpty;
    final waiting = bookings.where((b) => b.status.toUpperCase() == 'AWAITING_PAYMENT').toList();
    final confirmed = bookings.where((b) => b.status.toUpperCase() == 'ACTIVE').toList();
    final done = bookings.where(_isDone).toList();
    final visible = _filtered(bookings);
    final earned = done.fold<int>(0, (sum, b) => sum + b.bidAmount);
    final pipeline = [...waiting, ...confirmed].fold<int>(0, (sum, b) => sum + b.bidAmount);

    return PullRefresh(
      onRefresh: () => context.read<BookingsProvider>().loadData(),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: ShellBottomInsets.listPadding(context),
        children: [
          VendorInkHero(
            eyebrow: 'Confirmed work',
            title: 'My jobs',
            subtitle: 'Host name, phone and WhatsApp unlock after they pay escrow.',
            stats: [
              VendorHeroStat(value: VendorMoney.of(pipeline), label: 'In pipeline'),
              VendorHeroStat(value: VendorMoney.of(earned), label: 'Earned'),
              VendorHeroStat(value: '${confirmed.length}', label: 'Live jobs'),
            ],
          ),
          const SizedBox(height: 16),
          VendorSegmentBar(
            selectedIndex: _segmentIndex,
            items: [
              VendorSegmentItem(label: 'All', count: bookings.length),
              VendorSegmentItem(label: 'Waiting', count: waiting.length),
              VendorSegmentItem(label: 'Live', count: confirmed.length),
              VendorSegmentItem(label: 'Done', count: done.length),
            ],
            onChanged: (index) {
              setState(() {
                _filter = const ['ALL', 'PAY', 'ACTIVE', 'DONE'][index];
              });
            },
          ),
          const SizedBox(height: 16),
          if (loading)
            const Padding(
              padding: EdgeInsets.only(top: 80),
              child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
            )
          else if (bookings.isEmpty)
            const VendorEmptyState(
              icon: LucideIcons.briefcase,
              title: 'No accepted jobs yet',
              message: 'When a host selects your reverse bid, the job lands here instantly.',
            )
          else if (visible.isEmpty)
            VendorEmptyState(
              icon: LucideIcons.filter,
              title: 'Nothing in this filter',
              message: 'Switch back to All to see every accepted job.',
              actionLabel: 'Show all jobs',
              onAction: () => setState(() => _filter = 'ALL'),
            )
          else
            ...visible.map((b) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: _JobCard(
                    booking: b,
                    statusLabel: _label(b.status),
                    statusColor: _color(b.status),
                    dateLabel: _fmtDate(b.eventDate),
                  ),
                )),
        ],
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  final BookingModel booking;
  final String statusLabel;
  final Color statusColor;
  final String dateLabel;

  const _JobCard({
    required this.booking,
    required this.statusLabel,
    required this.statusColor,
    required this.dateLabel,
  });

  @override
  Widget build(BuildContext context) {
    final b = booking;
    final paid = b.isEscrowPaid;
    return VendorSurface(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              VendorStatusPill(label: statusLabel, color: statusColor),
              const Spacer(),
              Text(
                VendorMoney.of(b.bidAmount),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.ink,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          const Align(
            alignment: Alignment.centerRight,
            child: Text(
              'You receive 100%',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate500),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            b.requirementTitle,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.ink),
          ),
          if (b.category.trim().isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              b.category,
              style: TextStyle(
                fontSize: 12,
                color: vendorCategoryColor(b.category),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(LucideIcons.calendar, size: 14, color: AppTheme.slate400),
              const SizedBox(width: 6),
              Text(
                dateLabel,
                style: const TextStyle(fontSize: 12, color: AppTheme.slate600, fontWeight: FontWeight.w600),
              ),
              if (b.locationText.trim().isNotEmpty && b.locationText.trim() != ',') ...[
                const SizedBox(width: 12),
                const Icon(LucideIcons.mapPin, size: 14, color: AppTheme.primary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    b.locationText,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, color: AppTheme.slate600),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: paid ? AppTheme.emeraldLight : AppTheme.amberLight,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: paid
                    ? AppTheme.emerald.withValues(alpha: 0.22)
                    : AppTheme.amber.withValues(alpha: 0.28),
              ),
            ),
            child: paid ? _HostUnlocked(booking: b) : const _HostLocked(),
          ),
        ],
      ),
    );
  }
}

class _HostLocked extends StatelessWidget {
  const _HostLocked();

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: Colors.white,
          child: Icon(LucideIcons.lock, size: 16, color: AppTheme.amber),
        ),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Host contact locked',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.ink),
              ),
              SizedBox(height: 2),
              Text(
                'Name, phone and WhatsApp unlock after escrow payment.',
                style: TextStyle(fontSize: 12, height: 1.35, color: AppTheme.slate600),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HostUnlocked extends StatelessWidget {
  final BookingModel booking;
  const _HostUnlocked({required this.booking});

  @override
  Widget build(BuildContext context) {
    final b = booking;
    final initial = b.hostName.isNotEmpty ? b.hostName[0].toUpperCase() : 'H';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: Colors.white,
              backgroundImage: b.hostAvatar.isNotEmpty ? NetworkImage(b.hostAvatar) : null,
              child: b.hostAvatar.isEmpty
                  ? Text(initial, style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.emerald))
                  : null,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'HOST UNLOCKED',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.emerald, letterSpacing: 0.6),
                  ),
                  Text(b.hostName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  if (b.hostPhone.isNotEmpty)
                    Text(b.hostPhone, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.slate700)),
                ],
              ),
            ),
          ],
        ),
        if (b.hostPhone.isNotEmpty) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => launchVendorCall(b.hostPhone),
                  icon: const Icon(LucideIcons.phone, size: 16),
                  label: const Text('Call'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.emerald,
                    side: BorderSide(color: AppTheme.emerald.withValues(alpha: 0.4)),
                    minimumSize: const Size.fromHeight(44),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => launchVendorWhatsApp(
                    b.hostPhone,
                    vendorName: b.hostName,
                    eventTitle: b.requirementTitle,
                  ),
                  icon: const Icon(LucideIcons.messageSquare, size: 16),
                  label: const Text('WhatsApp'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.emerald,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(44),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ],
        if (b.hostEmail.isNotEmpty) ...[
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => launchVendorEmail(b.hostEmail),
              icon: const Icon(LucideIcons.mail, size: 16),
              label: Text(b.hostEmail, overflow: TextOverflow.ellipsis),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.slate700,
                minimumSize: const Size.fromHeight(42),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
