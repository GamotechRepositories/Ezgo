import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/payment_model.dart';
import '../../providers/payments_provider.dart';
import '../../widgets/shell_bottom_insets.dart';

class PaymentHistoryScreen extends StatefulWidget {
  final bool embedded;
  const PaymentHistoryScreen({super.key, this.embedded = false});

  @override
  State<PaymentHistoryScreen> createState() => _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends State<PaymentHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PaymentsProvider>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final payments = context.watch<PaymentsProvider>();
    final money = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    final list = ListView(
      shrinkWrap: widget.embedded,
      physics: widget.embedded ? const NeverScrollableScrollPhysics() : const AlwaysScrollableScrollPhysics(),
      padding: widget.embedded
          ? const EdgeInsets.fromLTRB(0, 8, 0, 8)
          : ShellBottomInsets.listPadding(context),
      children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppTheme.slate200),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.creditCard, color: AppTheme.primary, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Payment history', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                      Text(
                        '${payments.items.length} saved payments',
                        style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                Text(
                  money.format(payments.totalPaid),
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.slate900),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          if (payments.isLoading && payments.items.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 48),
              child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
            )
          else if (payments.items.isEmpty)
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.slate200),
              ),
              child: const Column(
                children: [
                  Icon(LucideIcons.creditCard, size: 32, color: AppTheme.slate400),
                  SizedBox(height: 10),
                  Text('No payments yet', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  SizedBox(height: 6),
                  Text(
                    'When you complete escrow, every payment is saved here.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: AppTheme.slate500),
                  ),
                ],
              ),
            )
          else
            ...payments.items.map((item) => _PaymentTile(item: item, money: money)),
        ],
    );
    final body = widget.embedded
        ? list
        : RefreshIndicator(
            color: AppTheme.primary,
            onRefresh: () => context.read<PaymentsProvider>().load(),
            child: list,
          );

    if (widget.embedded) return body;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Payment history'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, size: 22),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: body,
    );
  }
}

class _PaymentTile extends StatelessWidget {
  final PaymentHistoryItem item;
  final NumberFormat money;

  const _PaymentTile({required this.item, required this.money});

  @override
  Widget build(BuildContext context) {
    DateTime? when;
    try {
      when = DateTime.tryParse(item.createdAt);
    } catch (_) {}
    final dateText = when == null
        ? item.createdAt
        : DateFormat('dd MMM yyyy, hh:mm a').format(when.toLocal());

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: item.isRefund ? AppTheme.amberLight : AppTheme.emeraldLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  item.isRefund
                      ? LucideIcons.rotateCcw
                      : item.isPayout
                          ? LucideIcons.banknote
                          : LucideIcons.shieldCheck,
                  size: 18,
                  color: item.isRefund ? AppTheme.amber : AppTheme.emerald,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.label, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                    Text(item.eventTitle, style: const TextStyle(fontSize: 12, color: AppTheme.slate600, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              Text(
                money.format(item.amount),
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppTheme.slate900),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(dateText, style: const TextStyle(fontSize: 11, color: AppTheme.slate500, fontWeight: FontWeight.w600)),
          if (item.vendorName.isNotEmpty && item.vendorName != 'Vendor locked') ...[
            const SizedBox(height: 4),
            Text('Vendor: ${item.vendorName}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.slate700)),
          ],
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _chip(item.status),
              if (item.method.isNotEmpty) _chip(item.method),
              if (item.escrowStatus.isNotEmpty) _chip(item.escrowStatus.replaceAll('_', ' ')),
              if (item.referenceId.isNotEmpty) _chip(item.referenceId),
            ],
          ),
        ],
      ),
    );
  }

  Widget _chip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppTheme.slate50,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.slate600)),
    );
  }
}
