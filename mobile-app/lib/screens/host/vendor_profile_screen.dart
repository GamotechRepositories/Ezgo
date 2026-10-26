import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../widgets/shell_bottom_insets.dart';

Future<void> openVendorProfile(BuildContext context, BookingModel booking) {
  if (!booking.isEscrowPaid) return Future.value();
  return Navigator.of(context).push(
    MaterialPageRoute(builder: (_) => VendorProfileScreen(booking: booking)),
  );
}

String vendorDialDigits(String phone) {
  var digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
  if (digits.startsWith('0') && digits.length == 11) {
    digits = digits.substring(1);
  }
  return digits;
}

Future<void> launchVendorCall(String phone) async {
  final digits = vendorDialDigits(phone);
  if (digits.isEmpty) return;
  await launchUrl(Uri.parse('tel:$digits'));
}

Future<void> launchVendorWhatsApp(String phone, {String? vendorName, String? eventTitle}) async {
  var digits = vendorDialDigits(phone);
  if (digits.length == 10) digits = '91$digits';
  if (digits.isEmpty) return;
  final name = vendorName?.trim().isNotEmpty == true ? vendorName!.trim() : 'there';
  final event = eventTitle?.trim().isNotEmpty == true ? eventTitle!.trim() : 'my event';
  final text = Uri.encodeComponent('Hi $name, this is regarding my EzzyGo booking for $event.');
  await launchUrl(
    Uri.parse('https://wa.me/$digits?text=$text'),
    mode: LaunchMode.externalApplication,
  );
}

Future<void> launchVendorEmail(String email) async {
  final value = email.trim();
  if (value.isEmpty) return;
  await launchUrl(Uri.parse('mailto:$value'));
}

class VendorProfileScreen extends StatelessWidget {
  final BookingModel booking;

  const VendorProfileScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    final b = booking;
    final unlocked = b.isEscrowPaid;
    final initial = b.vendorName.isNotEmpty ? b.vendorName[0].toUpperCase() : 'V';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Vendor profile'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, size: 22),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: ListView(
        padding: ShellBottomInsets.listPadding(context).copyWith(top: 16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 42,
                  backgroundColor: AppTheme.primaryLight,
                  backgroundImage: b.vendorAvatar.isNotEmpty ? NetworkImage(b.vendorAvatar) : null,
                  child: b.vendorAvatar.isEmpty
                      ? Text(
                          initial,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primary,
                          ),
                        )
                      : null,
                ),
                const SizedBox(height: 14),
                Text(
                  b.vendorName,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                ),
                if (b.vendorBusinessName.isNotEmpty && b.vendorBusinessName != b.vendorName) ...[
                  const SizedBox(height: 4),
                  Text(
                    b.vendorBusinessName,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.slate600),
                  ),
                ],
                const SizedBox(height: 10),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (b.vendorVerified)
                      _Badge(
                        icon: LucideIcons.badgeCheck,
                        label: 'Verified vendor',
                        color: AppTheme.emerald,
                        bg: AppTheme.emeraldLight,
                      ),
                    if (b.vendorServiceArea.isNotEmpty)
                      _Badge(
                        icon: LucideIcons.mapPin,
                        label: b.vendorServiceArea,
                        color: AppTheme.primary,
                        bg: AppTheme.primaryLight,
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _StatTile(
                  value: '${b.vendorCompletedJobs}',
                  label: 'Events done',
                  icon: LucideIcons.calendarCheck,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _StatTile(
                  value: b.vendorRating.toStringAsFixed(1),
                  label: 'Rating',
                  icon: LucideIcons.star,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _StatTile(
                  value: '${b.vendorReviewCount}',
                  label: 'Reviews',
                  icon: LucideIcons.messageCircle,
                ),
              ),
            ],
          ),
          if (b.vendorCategories.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text(
              'Services',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.slate900),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: b.vendorCategories
                  .map(
                    (cat) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: AppTheme.slate200),
                      ),
                      child: Text(
                        cat,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.slate700),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ],
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: unlocked ? AppTheme.emerald.withValues(alpha: 0.35) : AppTheme.slate200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      unlocked ? LucideIcons.shieldCheck : LucideIcons.lock,
                      size: 18,
                      color: unlocked ? AppTheme.emerald : AppTheme.amber,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      unlocked ? 'Contact unlocked' : 'Contact locked until payment',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        color: unlocked ? AppTheme.emerald : AppTheme.slate900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  unlocked
                      ? 'Share event time and venue with this vendor. EzzyGo still holds your payment in escrow.'
                      : 'Pay escrow to see phone, WhatsApp and email for this vendor.',
                  style: const TextStyle(fontSize: 13, color: AppTheme.slate600, height: 1.35),
                ),
                if (unlocked) ...[
                  const SizedBox(height: 14),
                  _ContactRow(icon: LucideIcons.phone, label: 'Phone', value: b.vendorPhone.isNotEmpty ? b.vendorPhone : 'Not added'),
                  const SizedBox(height: 8),
                  _ContactRow(icon: LucideIcons.mail, label: 'Email', value: b.vendorEmail.isNotEmpty ? b.vendorEmail : 'Not added'),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: b.vendorPhone.isEmpty ? null : () => launchVendorCall(b.vendorPhone),
                          icon: const Icon(LucideIcons.phone, size: 16),
                          label: const Text('Call'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.slate900,
                            foregroundColor: Colors.white,
                            minimumSize: const Size.fromHeight(46),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: b.vendorPhone.isEmpty
                              ? null
                              : () => launchVendorWhatsApp(
                                    b.vendorPhone,
                                    vendorName: b.vendorName,
                                    eventTitle: b.requirementTitle,
                                  ),
                          icon: const Icon(LucideIcons.messageCircle, size: 16),
                          label: const Text('WhatsApp'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.emerald,
                            foregroundColor: Colors.white,
                            minimumSize: const Size.fromHeight(46),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (b.vendorEmail.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => launchVendorEmail(b.vendorEmail),
                        icon: const Icon(LucideIcons.mail, size: 16),
                        label: const Text('Email vendor'),
                      ),
                    ),
                  ],
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              children: [
                _InfoRow(label: 'Booked for', value: b.requirementTitle),
                const Divider(height: 18, color: AppTheme.borderSubtle),
                _InfoRow(label: 'Event date', value: b.eventDate.isNotEmpty ? b.eventDate : '—'),
                const Divider(height: 18, color: AppTheme.borderSubtle),
                _InfoRow(label: 'Venue', value: b.locationText.isNotEmpty ? b.locationText : '—'),
                const Divider(height: 18, color: AppTheme.borderSubtle),
                _InfoRow(label: 'Agreed bid', value: '₹${b.bidAmount}'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;

  const _StatTile({required this.value, required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Column(
        children: [
          Icon(icon, size: 16, color: AppTheme.primary),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.slate900)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.slate500)),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final Color bg;

  const _Badge({required this.icon, required this.label, required this.color, required this.bg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ContactRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.slate500),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.slate500)),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.slate900)),
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
          ),
        ),
      ],
    );
  }
}
