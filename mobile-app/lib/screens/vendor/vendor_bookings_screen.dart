import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../providers/bookings_provider.dart';
import '../../widgets/shell_bottom_insets.dart';
import '../host/vendor_profile_screen.dart';

class VendorBookingsScreen extends StatefulWidget {
  const VendorBookingsScreen({super.key});

  @override
  State<VendorBookingsScreen> createState() => _VendorBookingsScreenState();
}

class _VendorBookingsScreenState extends State<VendorBookingsScreen> {
  static final _rupees = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

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
        return 'Waiting for host payment';
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
        return const Color(0xFFD97706);
      case 'ACTIVE':
        return AppTheme.emerald;
      case 'COMPLETED':
      case 'PAYOUT_RELEASED':
        return AppTheme.slate600;
      case 'CANCELLED':
        return AppTheme.rose;
      default:
        return AppTheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BookingsProvider>();
    final bookings = provider.bookings;
    final loading = provider.isLoading && bookings.isEmpty;

    return RefreshIndicator(
      color: AppTheme.primary,
      onRefresh: () => context.read<BookingsProvider>().loadData(),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(16, 16, 16, ShellBottomInsets.of(context)),
        children: [
          const Text(
            'My Vendor Jobs',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.slate900),
          ),
          const SizedBox(height: 6),
          const Text(
            'After the host pays, their name, phone, WhatsApp and email unlock here.',
            style: TextStyle(color: AppTheme.slate600, fontSize: 13, height: 1.35),
          ),
          const SizedBox(height: 16),
          if (loading)
            const Padding(
              padding: EdgeInsets.only(top: 80),
              child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
            )
          else if (bookings.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 72),
              child: Column(
                children: [
                  Icon(LucideIcons.briefcase, size: 40, color: AppTheme.primary.withValues(alpha: 0.7)),
                  const SizedBox(height: 12),
                  const Text(
                    'No accepted jobs yet',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'When a host selects your bid, it will show here instantly.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: AppTheme.slate500, height: 1.4),
                  ),
                ],
              ),
            )
          else
            ...bookings.map((b) => _jobCard(b)),
        ],
      ),
    );
  }

  Widget _jobCard(BookingModel b) {
    final color = _color(b.status);
    final paid = b.isEscrowPaid;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _label(b.status),
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: color),
                ),
              ),
              const Spacer(),
              Text(
                'You get ${_rupees.format(b.bidAmount)}',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(b.requirementTitle, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
          if (b.locationText.trim().isNotEmpty && b.locationText.trim() != ',') ...[
            const SizedBox(height: 4),
            Text(b.locationText, style: const TextStyle(fontSize: 12, color: AppTheme.slate600)),
          ],
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: paid ? AppTheme.emeraldLight : AppTheme.amberLight,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: paid ? AppTheme.emerald.withValues(alpha: 0.25) : AppTheme.amber.withValues(alpha: 0.3)),
            ),
            child: paid ? _hostUnlocked(b) : _hostLocked(),
          ),
        ],
      ),
    );
  }

  Widget _hostLocked() {
    return const Row(
      children: [
        Icon(LucideIcons.lock, size: 18, color: AppTheme.amber),
        SizedBox(width: 10),
        Expanded(
          child: Text(
            'Host contact unlocks after they pay escrow.',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.slate700, height: 1.35),
          ),
        ),
      ],
    );
  }

  Widget _hostUnlocked(BookingModel b) {
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
                  const Text('HOST DETAILS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.emerald)),
                  Text(b.hostName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  if (b.hostPhone.isNotEmpty)
                    Text(b.hostPhone, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.slate700)),
                  if (b.hostEmail.isNotEmpty)
                    Text(b.hostEmail, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.slate700)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            if (b.hostPhone.isNotEmpty) ...[
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => launchVendorCall(b.hostPhone),
                  icon: const Icon(LucideIcons.phone, size: 16),
                  label: const Text('Call'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.emerald,
                    side: BorderSide(color: AppTheme.emerald.withValues(alpha: 0.4)),
                    minimumSize: const Size.fromHeight(42),
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
                    minimumSize: const Size.fromHeight(42),
                  ),
                ),
              ),
            ],
          ],
        ),
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
              ),
            ),
          ),
        ],
      ],
    );
  }
}
