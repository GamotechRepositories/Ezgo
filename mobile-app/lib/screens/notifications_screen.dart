import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/notification_model.dart';
import '../providers/auth_provider.dart';
import '../providers/notifications_provider.dart';
import '../providers/requirements_provider.dart';
import '../widgets/shell_bottom_insets.dart';
import 'host/bids_comparison_screen.dart';
import 'host/host_bookings_screen.dart';
import 'vendor/vendor_bookings_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationsProvider>().load();
    });
  }

  IconData _iconFor(String type) {
    switch (type) {
      case 'BID_RECEIVED':
        return LucideIcons.tag;
      case 'BID_ACCEPTED':
        return LucideIcons.checkCircle2;
      case 'PAYMENT_CONFIRMED':
        return LucideIcons.shieldCheck;
      case 'PAYOUT_RELEASED':
        return LucideIcons.banknote;
      case 'BOOKING_CANCELLED':
        return LucideIcons.circleX;
      default:
        return LucideIcons.bell;
    }
  }

  Future<void> _open(AppNotification item) async {
    await context.read<NotificationsProvider>().markRead(item.id);
    if (!mounted) return;
    if (item.type == 'BID_RECEIVED' && (item.requirementId ?? '').isNotEmpty) {
      final req = await context.read<RequirementsProvider>().fetchRequirement(item.requirementId!);
      if (!mounted) return;
      if (req != null) {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => BidsComparisonScreen(requirement: req)),
        );
        return;
      }
    }
    if (item.type == 'BID_ACCEPTED' ||
        item.type == 'PAYMENT_CONFIRMED' ||
        item.type == 'PAYOUT_RELEASED' ||
        item.type == 'BOOKING_CANCELLED' ||
        (item.bookingId ?? '').isNotEmpty) {
      final isVendor = context.read<AuthProvider>().isVendor;
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (ctx) => Scaffold(
            backgroundColor: AppTheme.background,
            appBar: AppBar(
              title: Text(isVendor ? 'My jobs' : 'Bookings'),
              centerTitle: false,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_rounded, size: 22),
                onPressed: () => Navigator.of(ctx).maybePop(),
              ),
            ),
            body: isVendor ? const VendorBookingsScreen() : const HostBookingsScreen(),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NotificationsProvider>();
    final items = provider.items;
    final time = DateFormat('d MMM, h:mm a');

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Notifications'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, size: 22),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        actions: [
          if (provider.unreadCount > 0)
            TextButton(
              onPressed: provider.markAllRead,
              child: const Text('Mark all read', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
        ],
      ),
      body: RefreshIndicator(
        color: AppTheme.primary,
        onRefresh: provider.load,
        child: items.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.fromLTRB(24, 80, 24, ShellBottomInsets.of(context)),
                children: [
                  const Icon(LucideIcons.bell, size: 44, color: AppTheme.slate400),
                  const SizedBox(height: 12),
                  Text('No notifications yet', textAlign: TextAlign.center, style: AppTheme.headingFont(fontSize: 16)),
                  const SizedBox(height: 6),
                  const Text(
                    'Bids, acceptances and payments will show up here.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                  ),
                ],
              )
            : ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.fromLTRB(16, 12, 16, ShellBottomInsets.of(context)),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = items[index];
                  return InkWell(
                    onTap: () => _open(item),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: item.isRead ? Colors.white : const Color(0xFFFFF6F1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: item.isRead ? AppTheme.borderSubtle : AppTheme.primary.withValues(alpha: 0.28),
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryLight,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(_iconFor(item.type), size: 18, color: AppTheme.primary),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.title,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: item.isRead ? FontWeight.w700 : FontWeight.w800,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item.message,
                                  style: const TextStyle(fontSize: 12, color: AppTheme.slate600, height: 1.35),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  time.format(item.createdAt.toLocal()),
                                  style: const TextStyle(fontSize: 11, color: AppTheme.slate400, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                          if (!item.isRead)
                            Container(
                              width: 8,
                              height: 8,
                              margin: const EdgeInsets.only(top: 6, left: 8),
                              decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
