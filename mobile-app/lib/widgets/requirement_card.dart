import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../models/requirement_model.dart';
import 'vendor_ui.dart';

class RequirementCard extends StatelessWidget {
  final RequirementModel requirement;
  final VoidCallback onTap;
  final String actionText;
  final VoidCallback? onAction;
  final int? yourBid;
  final bool compact;

  const RequirementCard({
    super.key,
    required this.requirement,
    required this.onTap,
    this.actionText = 'View Bids',
    this.onAction,
    this.yourBid,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (compact) return _compactCard(context);
    final req = requirement;
    final accent = vendorCategoryColor(req.category);
    final hasLowest = req.lowestBid != null;
    final cover = req.imageUrl;

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppTheme.borderSubtle),
            boxShadow: [
              BoxShadow(
                color: AppTheme.ink.withValues(alpha: 0.05),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: SizedBox(
                  height: 128,
                  width: double.infinity,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (cover != null && cover.isNotEmpty)
                        Image.network(
                          cover,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => Image.asset(req.coverAsset, fit: BoxFit.cover),
                        )
                      else
                        Image.asset(
                          req.coverAsset,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => Container(color: AppTheme.slate100),
                        ),
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Colors.transparent, Color(0xAA121A2E)],
                          ),
                        ),
                      ),
                      Positioned(
                        top: 12,
                        left: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Row(
                            children: [
                              Icon(vendorCategoryIcon(req.category), size: 12, color: accent),
                              const SizedBox(width: 5),
                              Text(
                                req.category,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.ink,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.62),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                req.bidCountdown,
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                              ),
                            ),
                            if (yourBid != null) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1D4ED8),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  'Your bid ${VendorMoney.of(yourBid!)}',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      Positioned(
                        left: 14,
                        right: 14,
                        bottom: 12,
                        child: Row(
                          children: [
                            const Icon(LucideIcons.mapPin, size: 13, color: Colors.white),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                req.displayPlace,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const Icon(LucideIcons.users, size: 13, color: Colors.white70),
                            const SizedBox(width: 4),
                            Text(
                              '${req.guestCount}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      req.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.ink,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(LucideIcons.calendar, size: 13, color: AppTheme.slate400),
                        const SizedBox(width: 4),
                        Text(
                          req.eventSoonLabel,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.slate600,
                          ),
                        ),
                        if (req.timeStart.isNotEmpty) ...[
                          const Text('  ·  ', style: TextStyle(color: AppTheme.slate400)),
                          Text(
                            '${req.timeStart}–${req.timeEnd}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.slate600,
                            ),
                          ),
                        ],
                        if ((req.occasion ?? '').trim().isNotEmpty) ...[
                          const Spacer(),
                          Text(
                            req.occasion!,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.slate500,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF7F8FB),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          _MoneyCol(label: 'Host budget', value: VendorMoney.of(req.budget)),
                          _vline(),
                          _MoneyCol(
                            label: 'Bid up to',
                            value: VendorMoney.of(req.maxAcceptableBid),
                            accent: AppTheme.primary,
                          ),
                          _vline(),
                          _MoneyCol(
                            label: hasLowest ? 'Lowest bid' : 'Bids in',
                            value: hasLowest
                                ? VendorMoney.of(req.lowestBid!)
                                : '${req.liveBidsCount}',
                            accent: hasLowest ? AppTheme.emerald : AppTheme.ink,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: ElevatedButton(
                        onPressed: onAction ?? onTap,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: yourBid != null ? AppTheme.ink : AppTheme.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(yourBid != null ? LucideIcons.refreshCw : LucideIcons.gavel, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              actionText,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                            ),
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
      ),
    );
  }

  Widget _compactCard(BuildContext context) {
    final req = requirement;
    final accent = vendorCategoryColor(req.category);
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(vendorCategoryIcon(req.category), color: accent, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      req.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.ink),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${req.displayPlace} · ${req.eventSoonLabel}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    VendorMoney.of(req.maxAcceptableBid),
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.primary),
                  ),
                  Text(
                    yourBid != null ? 'Your bid' : 'Bid up to',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate400),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _vline() => Container(
        width: 1,
        height: 28,
        margin: const EdgeInsets.symmetric(horizontal: 8),
        color: AppTheme.slate200,
      );
}

class _MoneyCol extends StatelessWidget {
  final String label;
  final String value;
  final Color accent;

  const _MoneyCol({
    required this.label,
    required this.value,
    this.accent = AppTheme.ink,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: accent == AppTheme.ink ? AppTheme.slate500 : accent,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: accent),
          ),
        ],
      ),
    );
  }
}
