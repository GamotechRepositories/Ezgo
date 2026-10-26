import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';

import '../../providers/requirements_provider.dart';
import '../../widgets/requirement_card.dart';
import '../../widgets/shell_bottom_insets.dart';
import 'place_bid_modal.dart';

class LiveAuctionsScreen extends StatelessWidget {
  const LiveAuctionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final reqProvider = context.watch<RequirementsProvider>();

    return ListView(
      padding: ShellBottomInsets.listPadding(context),
      children: [
        // Vendor Winning Rules Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.slate200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(LucideIcons.flame, color: AppTheme.primary, size: 18),
                  SizedBox(width: 8),
                  Text('How to win jobs', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Bid at or below the "Bid Up To" ceiling. Host picks a bid and EzzyGo holds 100% payment in escrow.',
                style: TextStyle(fontSize: 13, color: AppTheme.slate600, height: 1.3),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Live Reverse Auctions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.slate900),
            ),
            Text(
              '${reqProvider.requirements.length} Open',
              style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.slate500, fontSize: 12),
            ),
          ],
        ),

        const SizedBox(height: 12),

        ...reqProvider.requirements.map(
          (req) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: RequirementCard(
              requirement: req,
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => PlaceBidModal(requirement: req),
                );
              },
              actionText: 'Place Reverse Bid',
            ),
          ),
        ),
      ],
    );
  }
}
