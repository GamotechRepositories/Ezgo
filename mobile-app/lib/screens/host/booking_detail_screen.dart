import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../widgets/shell_bottom_insets.dart';
import 'payment_escrow_screen.dart';

class BookingDetailScreen extends StatelessWidget {
  final BookingModel booking;

  const BookingDetailScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Booking Details'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, size: 22),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.moreVertical, size: 20),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Vendor Card (Screen 10)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.borderSubtle),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            width: 48,
                            height: 48,
                            color: AppTheme.slate100,
                            child: Image.asset(
                              'assets/images/vendor_avatar.png',
                              fit: BoxFit.cover,
                              filterQuality: FilterQuality.high,
                              errorBuilder: (context, error, stackTrace) => Container(
                                color: AppTheme.pastelAmber,
                                alignment: Alignment.center,
                                child: Text(
                                  booking.vendorName.isNotEmpty ? booking.vendorName[0] : 'V',
                                  style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFFD97706), fontSize: 18),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                booking.vendorName,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                booking.requirementTitle.isNotEmpty ? booking.requirementTitle : 'Wedding Photography',
                                style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                              ),
                              const SizedBox(height: 4),
                              const Row(
                                children: [
                                  Icon(Icons.star_rounded, size: 14, color: Color(0xFFFF9500)),
                                  SizedBox(width: 3),
                                  Text('4.8 (120)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE8F8F0),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                booking.status.toUpperCase() == 'COMPLETED' ? 'Completed' : 'Confirmed',
                                style: const TextStyle(
                                  color: Color(0xFF10B981),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'View Profile',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.primary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Milestone Timeline (Screen 10)
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildTimelineItem(
                          isCompleted: true,
                          icon: Icons.check,
                          title: 'Requirement Created',
                          subtitle: '10 Nov 2024, 10:30 AM',
                          isFirst: true,
                        ),
                        _buildTimelineItem(
                          isCompleted: true,
                          icon: Icons.assignment_turned_in_outlined,
                          title: 'Vendor Selected',
                          subtitle: '12 Nov 2024, 02:15 PM',
                        ),
                        _buildTimelineItem(
                          isCompleted: true,
                          icon: Icons.check,
                          title: 'Advance Payment',
                          subtitle: '₹25,500 paid (30%)',
                        ),
                        _buildTimelineItem(
                          isCompleted: true,
                          icon: Icons.sync,
                          title: 'Event Preparation',
                          subtitle: 'In progress',
                        ),
                        _buildTimelineItem(
                          isCompleted: false,
                          icon: Icons.image_outlined,
                          title: 'Event Completed',
                          subtitle: 'Pending',
                        ),
                        _buildTimelineItem(
                          isCompleted: false,
                          icon: Icons.account_balance_wallet_outlined,
                          title: 'Final Payment & Release',
                          subtitle: 'After event completion',
                          isLast: true,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Event Quick Summary
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Column(
                      children: [
                        _buildInfoRow('Event Date', booking.eventDate.isNotEmpty ? booking.eventDate : '24 Nov 2024'),
                        const Divider(height: 16, color: AppTheme.borderSubtle),
                        _buildInfoRow('Location', booking.locationText.isNotEmpty ? booking.locationText : 'JW Marriott, Pune'),
                        const Divider(height: 16, color: AppTheme.borderSubtle),
                        _buildInfoRow('Total Agreed Amount', formatCurrency.format(booking.agreedAmount > 0 ? booking.agreedAmount : 85000)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Actions (Screen 10)
            Container(
              padding: EdgeInsets.fromLTRB(16, 16, 16, ShellBottomInsets.of(context)),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Calling vendor: ${booking.vendorPhone.isNotEmpty ? booking.vendorPhone : "+91 98765 11111"}'),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFFFFD1D1), width: 1.2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                      ),
                      child: const Text('Contact Vendor', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => PaymentEscrowScreen(booking: booking),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                      ),
                      child: const Text('View Invoice', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineItem({
    required bool isCompleted,
    bool isInProgress = false,
    required IconData icon,
    required String title,
    required String subtitle,
    bool isFirst = false,
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCompleted ? const Color(0xFF10B981) : const Color(0xFFF1F5F9),
              ),
              child: Center(
                child: Icon(
                  icon,
                  size: 13,
                  color: isCompleted ? Colors.white : AppTheme.slate400,
                ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 38,
                color: isCompleted ? const Color(0xFF10B981) : AppTheme.borderSubtle,
              ),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isCompleted || isInProgress ? AppTheme.textPrimary : AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
      ],
    );
  }
}
