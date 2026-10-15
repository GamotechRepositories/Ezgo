import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../providers/bookings_provider.dart';

class EscrowPaymentSheet extends StatefulWidget {
  final BookingModel booking;
  final VoidCallback onPaymentSuccess;

  const EscrowPaymentSheet({
    super.key,
    required this.booking,
    required this.onPaymentSuccess,
  });

  @override
  State<EscrowPaymentSheet> createState() => _EscrowPaymentSheetState();
}

class _EscrowPaymentSheetState extends State<EscrowPaymentSheet> {
  String _selectedMethod = 'upi';
  bool _isProcessing = false;

  void _processPayment() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 1200));

    if (!mounted) return;
    context.read<BookingsProvider>().payEscrow(widget.booking.id);
    setState(() => _isProcessing = false);

    widget.onPaymentSuccess();
    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(LucideIcons.shieldCheck, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                '₹${widget.booking.totalPaid} held in EzzyGo Escrow! Vendor contact unlocked.',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        backgroundColor: AppTheme.emerald,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final b = widget.booking;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
            const SizedBox(height: 16),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Lock in Escrow',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                    ),
                    Text(
                      'EzzyGo 100% Protected Payment',
                      style: TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.emeraldLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      Icon(LucideIcons.shieldCheck, size: 14, color: AppTheme.emerald),
                      SizedBox(width: 4),
                      Text(
                        'Escrow Protected',
                        style: TextStyle(color: AppTheme.emerald, fontSize: 11, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Booking Summary Box
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.slate50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.slate200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    b.requirementTitle,
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.slate900),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Vendor: ${b.vendorName}',
                    style: const TextStyle(color: AppTheme.slate600, fontSize: 12),
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Agreed Bid Amount', style: TextStyle(color: AppTheme.slate600, fontSize: 13)),
                      Text('₹${b.bidAmount}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('EzzyGo Escrow & Guarantee (10%)', style: TextStyle(color: AppTheme.slate600, fontSize: 13)),
                      Text('₹${b.platformFee}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                    ],
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total to Deposit in Escrow', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                      Text(
                        '₹${b.totalPaid}',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.primary),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Escrow Guarantee Notice
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.amberLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.amber.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(LucideIcons.lock, size: 18, color: AppTheme.amber),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Your money is held in escrow and ONLY released after you confirm the event is complete.',
                      style: TextStyle(color: AppTheme.slate800, fontSize: 11, fontWeight: FontWeight.w600, height: 1.3),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            const Text('Choose Payment Method', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
            const SizedBox(height: 10),

            // Payment Options
            _buildPaymentOption(
              id: 'upi',
              title: 'UPI (Google Pay / PhonePe / Paytm)',
              subtitle: 'Instant authorization & instant vendor reveal',
              icon: LucideIcons.smartphone,
            ),
            const SizedBox(height: 8),
            _buildPaymentOption(
              id: 'card',
              title: 'Credit / Debit Card',
              subtitle: 'Visa, MasterCard, RuPay',
              icon: LucideIcons.creditCard,
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: _isProcessing ? null : _processPayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: _isProcessing
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(
                      'Authorize & Lock ₹${b.totalPaid} in Escrow',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedMethod == id;
    return InkWell(
      onTap: () => setState(() => _selectedMethod = id),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryLight : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppTheme.primary : AppTheme.slate200,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppTheme.primary : AppTheme.slate600, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: isSelected ? AppTheme.primaryDark : AppTheme.slate900)),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.slate500)),
                ],
              ),
            ),
            Icon(
              isSelected ? LucideIcons.checkCircle2 : LucideIcons.circle,
              color: isSelected ? AppTheme.primary : AppTheme.slate300,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
