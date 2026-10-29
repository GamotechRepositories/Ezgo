import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/bid_model.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/vendor_ui.dart';

class PlaceBidModal extends StatefulWidget {
  final RequirementModel requirement;

  const PlaceBidModal({super.key, required this.requirement});

  @override
  State<PlaceBidModal> createState() => _PlaceBidModalState();
}

class _PlaceBidModalState extends State<PlaceBidModal> {
  late TextEditingController _bidController;
  late TextEditingController _notesController;
  bool _isSubmitting = false;
  BidModel? _existing;

  @override
  void initState() {
    super.initState();
    final vendorId = context.read<AuthProvider>().user?.id ?? '';
    for (final b in widget.requirement.bids) {
      if (b.providerId == vendorId) {
        _existing = b;
        break;
      }
    }
    final defaultBid = _existing?.amount ??
        (widget.requirement.lowestBid != null
            ? (widget.requirement.lowestBid! - 1000).clamp(1001, widget.requirement.maxAcceptableBid)
            : widget.requirement.maxAcceptableBid);
    _bidController = TextEditingController(text: '$defaultBid');
    _notesController = TextEditingController(
      text: (_existing?.proposalNotes.trim().isNotEmpty == true)
          ? _existing!.proposalNotes
          : 'Professional crew, on-time setup and event-day support included.',
    );
  }

  @override
  void dispose() {
    _bidController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  int get _bidAmount => int.tryParse(_bidController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
  bool get _isValid => _bidAmount > 1000 && _bidAmount <= widget.requirement.maxAcceptableBid;

  void _nudge(int delta) {
    final next = (_bidAmount + delta).clamp(1001, widget.requirement.maxAcceptableBid);
    setState(() => _bidController.text = '$next');
  }

  @override
  Widget build(BuildContext context) {
    final req = widget.requirement;
    final progress = req.maxAcceptableBid <= 0
        ? 0.0
        : (_bidAmount / req.maxAcceptableBid).clamp(0.0, 1.0);

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        top: false,
        child: Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.92),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(color: AppTheme.slate200, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        _existing == null ? 'Place a reverse bid' : 'Revise your bid',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.ink),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close),
                      style: IconButton.styleFrom(backgroundColor: AppTheme.slate50),
                    ),
                  ],
                ),
                Text(req.title, style: const TextStyle(color: AppTheme.ink, fontSize: 14, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(
                  '${req.displayPlace} · ${req.displayDate}',
                  style: const TextStyle(color: AppTheme.slate500, fontSize: 12),
                ),
                if (_existing != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Text(
                      'Current bid ${VendorMoney.of(_existing!.amount)}. Submit a new amount or keep it and update notes.',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF1D4ED8), height: 1.35),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F8FB),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Row(
                    children: [
                      _Ceil(label: 'Host budget', value: VendorMoney.of(req.budget)),
                      _Ceil(label: 'Max you can bid', value: VendorMoney.of(req.maxAcceptableBid), highlight: true),
                      _Ceil(
                        label: req.lowestBid != null ? 'Lowest bid' : 'Bids in',
                        value: req.lowestBid != null ? VendorMoney.of(req.lowestBid!) : '${req.liveBidsCount}',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Your reverse bid',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate500),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _StepButton(icon: LucideIcons.minus, onTap: () => _nudge(-1000)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _bidController,
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppTheme.ink),
                        onChanged: (_) => setState(() {}),
                        decoration: InputDecoration(
                          prefixText: '₹ ',
                          prefixStyle: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.primary),
                          filled: true,
                          fillColor: AppTheme.primaryLight,
                          contentPadding: const EdgeInsets.symmetric(vertical: 14),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: AppTheme.primary, width: 1.4),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    _StepButton(icon: LucideIcons.plus, onTap: () => _nudge(1000)),
                  ],
                ),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 6,
                    backgroundColor: AppTheme.slate100,
                    color: _isValid ? AppTheme.primary : AppTheme.rose,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _isValid
                      ? 'Eligible. You receive 100% of ${VendorMoney.of(_bidAmount)} after the event.'
                      : 'Bid must be ₹1,001 to ${VendorMoney.of(req.maxAcceptableBid)}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _isValid ? AppTheme.emerald : AppTheme.rose,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _notesController,
                  maxLines: 3,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(
                    labelText: 'What is included',
                    hintText: 'Crew, setup time, extra lights…',
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 10),
                const Row(
                  children: [
                    Icon(LucideIcons.shieldCheck, size: 14, color: AppTheme.teal),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Host contact unlocks only after they pay escrow.',
                        style: TextStyle(fontSize: 12, color: AppTheme.slate500, height: 1.3),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isValid && !_isSubmitting ? _submit : null,
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            _existing == null ? 'Submit reverse bid' : 'Update reverse bid',
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final auth = context.read<AuthProvider>();
    final providerId = auth.user?.id ?? '';
    if (providerId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in as a vendor to bid.'), backgroundColor: AppTheme.rose),
      );
      return;
    }
    final requirements = context.read<RequirementsProvider>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _isSubmitting = true);
    try {
      await requirements.placeBid(
        requirementId: widget.requirement.id,
        amount: _bidAmount,
        providerId: providerId,
        proposalNotes: _notesController.text.trim(),
      );
      if (!mounted) return;
      navigator.pop();
      messenger.showSnackBar(
        SnackBar(
          content: Text(_existing == null ? 'Bid submitted. Host notified.' : 'Bid updated. Host notified.'),
          backgroundColor: AppTheme.emerald,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppTheme.rose));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}

class _Ceil extends StatelessWidget {
  final String label;
  final String value;
  final bool highlight;

  const _Ceil({required this.label, required this.value, this.highlight = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: highlight ? AppTheme.primary : AppTheme.slate500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: highlight ? AppTheme.primary : AppTheme.ink,
            ),
          ),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _StepButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 46,
      height: 46,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          padding: EdgeInsets.zero,
          side: const BorderSide(color: AppTheme.borderSubtle),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        child: Icon(icon, size: 18, color: AppTheme.ink),
      ),
    );
  }
}
