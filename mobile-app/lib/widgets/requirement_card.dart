import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../models/requirement_model.dart';

class RequirementCard extends StatelessWidget {
  final RequirementModel requirement;
  final VoidCallback onTap;
  final String actionText;
  final VoidCallback? onAction;

  const RequirementCard({
    super.key,
    required this.requirement,
    required this.onTap,
    this.actionText = 'View Bids',
    this.onAction,
  });

  String _formatCurrency(int amount) {
    final format = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    return format.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final hasLowest = requirement.lowestBid != null;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.slate200.withValues(alpha: 0.8)),
        boxShadow: [
          BoxShadow(
            color: AppTheme.slate900.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Banner
            if (requirement.imageUrl != null)
              Stack(
                children: [
                  Image.network(
                    requirement.imageUrl!,
                    height: 140,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 140,
                      color: AppTheme.slate100,
                      child: const Center(
                        child: Icon(LucideIcons.image, color: AppTheme.slate400, size: 36),
                      ),
                    ),
                  ),
                  Positioned.fill(
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.black54, Colors.transparent],
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.95),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        requirement.category,
                        style: const TextStyle(
                          color: AppTheme.slate900,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 10,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(LucideIcons.users, color: Colors.white, size: 12),
                          const SizedBox(width: 4),
                          Text(
                            '${requirement.guestCount} Guests',
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    requirement.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.slate900,
                      height: 1.25,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // Location & Date Row
                  Row(
                    children: [
                      const Icon(LucideIcons.mapPin, size: 13, color: AppTheme.primary),
                      const SizedBox(width: 4),
                      Text(
                        '${requirement.area}, ${requirement.city}',
                        style: const TextStyle(color: AppTheme.slate600, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      const Spacer(),
                      const Icon(LucideIcons.calendar, size: 13, color: AppTheme.slate400),
                      const SizedBox(width: 4),
                      Text(
                        requirement.eventDate,
                        style: const TextStyle(color: AppTheme.slate600, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Benchmark & Bidding Stats Container
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.slate50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.slate200.withValues(alpha: 0.6)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Budget',
                              style: TextStyle(fontSize: 10, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                            ),
                            Text(
                              _formatCurrency(requirement.budget),
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.slate800),
                            ),
                          ],
                        ),
                        Container(width: 1, height: 26, color: AppTheme.slate200),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Bid Up To (Max)',
                              style: TextStyle(fontSize: 10, color: AppTheme.primary, fontWeight: FontWeight.w700),
                            ),
                            Text(
                              _formatCurrency(requirement.maxAcceptableBid),
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.primary),
                            ),
                          ],
                        ),
                        Container(width: 1, height: 26, color: AppTheme.slate200),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              hasLowest ? 'Lowest Bid' : 'Bids',
                              style: TextStyle(
                                fontSize: 10,
                                color: hasLowest ? AppTheme.emerald : AppTheme.slate500,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              hasLowest ? _formatCurrency(requirement.lowestBid!) : '${requirement.bidsCount} bids',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: hasLowest ? AppTheme.emerald : AppTheme.slate700,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Action Button
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: onAction ?? onTap,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            actionText,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                          ),
                          const SizedBox(width: 6),
                          const Icon(LucideIcons.arrowRight, size: 16),
                        ],
                      ),
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
}
