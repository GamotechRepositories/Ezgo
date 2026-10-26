import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../widgets/shell_bottom_insets.dart';

class PaymentEscrowScreen extends StatelessWidget {
  final BookingModel booking;

  const PaymentEscrowScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    final eventAmount = booking.agreedAmount > 0 ? booking.agreedAmount : 85000;
    final platformFee = (eventAmount * 0.10).round();
    final totalAmount = eventAmount + platformFee;
    final advancePaid = (totalAmount * 0.30).round();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Payment Details'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, size: 22),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: EdgeInsets.fromLTRB(16, 16, 16, ShellBottomInsets.of(context)),
          children: [
            // Green Escrow Protection Card (Screen 11)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F8F0),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.2)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(LucideIcons.shieldCheck, size: 20, color: Colors.white),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Your payment is protected by EzzyGo Escrow',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF065F46),
                          ),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Released to vendor after event completion.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF047857),
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Financial Breakdown (Screen 11)
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
                  _buildPriceRow('Event Amount', formatCurrency.format(eventAmount)),
                  const SizedBox(height: 10),
                  _buildPriceRow('Platform Fee (10%)', formatCurrency.format(platformFee)),
                  const Divider(height: 24, color: AppTheme.borderSubtle),
                  _buildPriceRow(
                    'Total Amount',
                    formatCurrency.format(totalAmount),
                    isBold: true,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Payment Milestones Timeline (Screen 11)
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
                  _buildEscrowTimelineItem(
                    isDone: true,
                    icon: Icons.check,
                    iconColor: Colors.white,
                    bgColor: const Color(0xFF10B981),
                    lineColor: const Color(0xFFF59E0B),
                    title: 'Payment Initiated',
                    amountSubtitle: '${formatCurrency.format(advancePaid)} (30%)',
                    dateSubtitle: '12 Nov 2024, 02:30 PM',
                    isFirst: true,
                  ),
                  _buildEscrowTimelineItem(
                    isDone: false,
                    isPending: true,
                    icon: Icons.lock_outline_rounded,
                    iconColor: Colors.white,
                    bgColor: const Color(0xFFF59E0B),
                    lineColor: AppTheme.borderSubtle,
                    title: 'In Escrow',
                    amountSubtitle: 'Held securely with EzzyGo',
                  ),
                  _buildEscrowTimelineItem(
                    isDone: false,
                    icon: Icons.add,
                    iconColor: AppTheme.slate400,
                    bgColor: const Color(0xFFF1F5F9),
                    lineColor: AppTheme.borderSubtle,
                    title: 'Event Completed',
                    amountSubtitle: 'Pending',
                  ),
                  _buildEscrowTimelineItem(
                    isDone: false,
                    icon: Icons.add,
                    iconColor: AppTheme.slate400,
                    bgColor: const Color(0xFFF1F5F9),
                    lineColor: AppTheme.borderSubtle,
                    title: 'Released to Vendor',
                    amountSubtitle: 'After event completion',
                    isLast: true,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Need Help Box (Screen 11)
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
                  const Row(
                    children: [
                      Icon(LucideIcons.helpCircle, size: 18, color: AppTheme.textPrimary),
                      SizedBox(width: 8),
                      Text(
                        'Need Help?',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  const Text(
                    'Contact our support team for any queries.',
                    style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Connecting to EzzyGo Concierge Support (support@ezzygo.in)...'),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFFFFD1D1), width: 1.2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        elevation: 0,
                      ),
                      child: const Text('Contact Support', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
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

  Widget _buildPriceRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isBold ? 14 : 13,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w500,
            color: isBold ? AppTheme.textPrimary : AppTheme.textSecondary,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isBold ? 16 : 13,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: isBold ? AppTheme.primary : AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildEscrowTimelineItem({
    required bool isDone,
    bool isPending = false,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required Color lineColor,
    required String title,
    required String amountSubtitle,
    String? dateSubtitle,
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
                color: bgColor,
              ),
              child: Center(
                child: Icon(icon, size: 13, color: iconColor),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 44,
                color: lineColor,
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
                    color: isDone || isPending ? AppTheme.textPrimary : AppTheme.slate600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  amountSubtitle,
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
                ),
                if (dateSubtitle != null) ...[
                  const SizedBox(height: 1),
                  Text(
                    dateSubtitle,
                    style: const TextStyle(fontSize: 11, color: AppTheme.slate400),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}
