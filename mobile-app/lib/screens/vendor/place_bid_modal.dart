import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/custom_button.dart';

class PlaceBidModal extends StatefulWidget {
  final RequirementModel requirement;

  const PlaceBidModal({super.key, required this.requirement});

  @override
  State<PlaceBidModal> createState() => _PlaceBidModalState();
}

class _PlaceBidModalState extends State<PlaceBidModal> {
  late TextEditingController _bidController;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final defaultBid = widget.requirement.lowestBid != null
        ? (widget.requirement.lowestBid! - 1000)
        : widget.requirement.maxAcceptableBid;
    _bidController = TextEditingController(text: defaultBid.toString());
  }

  @override
  void dispose() {
    _bidController.dispose();
    super.dispose();
  }

  int get _bidAmount => int.tryParse(_bidController.text) ?? 0;
  bool get _isValid => _bidAmount > 1000 && _bidAmount <= widget.requirement.maxAcceptableBid;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        top: false,
        child: Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Place a Bid', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.close)),
            ],
          ),
          Text(widget.requirement.title, style: const TextStyle(color: AppTheme.slate600, fontSize: 13)),
          const SizedBox(height: 16),

          // Ceilings Info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.slate50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.slate200),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    const Text('Host Budget', style: TextStyle(fontSize: 11, color: AppTheme.slate500)),
                    Text('₹${widget.requirement.budget}', style: const TextStyle(fontWeight: FontWeight.w700)),
                  ],
                ),
                Column(
                  children: [
                    const Text('Bid Up To (85%)', style: TextStyle(fontSize: 11, color: AppTheme.primary, fontWeight: FontWeight.w700)),
                    Text('₹${widget.requirement.maxAcceptableBid}', style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.primary)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          TextField(
            controller: _bidController,
            keyboardType: TextInputType.number,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              prefixText: '₹ ',
              labelText: 'Your Bid Price',
              helperText: _isValid
                  ? 'Eligible bid. You will receive 100% of this amount.'
                  : 'Bid must be ≤ ₹${widget.requirement.maxAcceptableBid}',
              helperStyle: TextStyle(color: _isValid ? AppTheme.emerald : AppTheme.rose),
            ),
          ),

          const SizedBox(height: 20),

          CustomButton(
            text: 'Submit Reverse Bid',
            isLoading: _isSubmitting,
            onPressed: _isValid && !_isSubmitting
                ? () async {
                    final auth = context.read<AuthProvider>();
                    final providerId = auth.user?.id ?? '';
                    if (providerId.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Please log in as a vendor to bid.'),
                          backgroundColor: AppTheme.rose,
                        ),
                      );
                      return;
                    }
                    setState(() => _isSubmitting = true);
                    try {
                      await context.read<RequirementsProvider>().placeBid(
                            requirementId: widget.requirement.id,
                            amount: _bidAmount,
                            providerId: providerId,
                          );
                      if (!mounted) return;
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Bid submitted. Host notified.'),
                          backgroundColor: AppTheme.emerald,
                        ),
                      );
                    } catch (e) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(e.toString()),
                          backgroundColor: AppTheme.rose,
                        ),
                      );
                    } finally {
                      if (mounted) setState(() => _isSubmitting = false);
                    }
                  }
                : null,
          ),
        ],
      ),
    ),
      ),
    );
  }
}
