import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../models/requirement_model.dart';

class EventRequestCard extends StatelessWidget {
  final RequirementModel requirement;
  final VoidCallback onTap;
  final bool compact;

  const EventRequestCard({
    super.key,
    required this.requirement,
    required this.onTap,
    this.compact = false,
  });

  static final _rupees = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  @override
  Widget build(BuildContext context) {
    return compact ? _compact() : _full();
  }

  Widget _full() {
    final req = requirement;
    final bids = req.liveBidsCount;
    final lowest = req.lowestBid;
    final savePct = lowest != null && req.budget > 0
        ? (((req.budget - lowest) / req.budget) * 100).round()
        : 0;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.borderSubtle),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
              child: Stack(
                children: [
                  _cover(height: 148, width: double.infinity),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: _statusPill(req.displayStatus, open: req.isOpen),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _chip(req.category),
                      if (req.occasion != null && req.occasion!.trim().isNotEmpty)
                        _chip(req.occasion!),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    req.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                      height: 1.25,
                    ),
                  ),
                  if (req.description.trim().isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      req.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: AppTheme.slate500, height: 1.35),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 12,
                    runSpacing: 6,
                    children: [
                      _meta(LucideIcons.mapPin, req.displayPlace),
                      _meta(LucideIcons.calendar, '${req.displayDate} · ${req.timeStart}–${req.timeEnd}'),
                      _meta(LucideIcons.users, '${req.guestCount} guests'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _statBox(
                          label: 'Your budget',
                          value: _rupees.format(req.budget),
                          sub: 'Accept ${_rupees.format(req.maxAcceptableBid)} or less',
                          subColor: AppTheme.primary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _statBox(
                          label: 'Lowest bid',
                          value: lowest != null ? _rupees.format(lowest) : 'No bids yet',
                          sub: lowest != null ? '$savePct% lower' : '$bids bid${bids == 1 ? '' : 's'}',
                          filled: true,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: onTap,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: Text(
                        bids > 0 ? 'See bids ($bids)' : 'View request',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
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

  Widget _compact() {
    final req = requirement;
    final bids = req.liveBidsCount;
    final lowest = req.lowestBid;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(12),
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: _cover(width: 86, height: 86),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(child: _chip(req.category)),
                      const SizedBox(width: 6),
                      _statusPill(req.displayStatus, open: req.isOpen, small: true),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    req.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${req.displayDate} · ${req.displayPlace} · ${req.guestCount} guests',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        _rupees.format(req.budget),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          lowest != null ? 'Low ${_rupees.format(lowest)}' : '$bids bid${bids == 1 ? '' : 's'}',
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.emerald),
                        ),
                      ),
                      const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate400),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _cover({double? width, required double height}) {
    final url = requirement.imageUrl;
    final hasNet = url != null && url.startsWith('http');
    return hasNet
        ? Image.network(
            url,
            width: width,
            height: height,
            fit: BoxFit.cover,
            errorBuilder: (_, _, _) => Image.asset(
              requirement.coverAsset,
              width: width,
              height: height,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => _fallback(width, height),
            ),
          )
        : Image.asset(
            requirement.coverAsset,
            width: width,
            height: height,
            fit: BoxFit.cover,
            errorBuilder: (_, _, _) => _fallback(width, height),
          );
  }

  Widget _fallback(double? width, double height) {
    return Container(
      width: width,
      height: height,
      color: AppTheme.slate100,
      child: const Icon(LucideIcons.calendar, color: AppTheme.slate400),
    );
  }

  Widget _chip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppTheme.slate100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate700),
      ),
    );
  }

  Widget _statusPill(String label, {required bool open, bool small = false}) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: small ? 7 : 10, vertical: small ? 3 : 5),
      decoration: BoxDecoration(
        color: open ? const Color(0xFFFFF7ED) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: open ? const Color(0xFFFFD7C2) : AppTheme.slate200),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: small ? 9 : 11,
          fontWeight: FontWeight.w800,
          color: open ? AppTheme.primary : AppTheme.slate700,
        ),
      ),
    );
  }

  Widget _meta(IconData icon, String text) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 220),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppTheme.slate400),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statBox({
    required String label,
    required String value,
    required String sub,
    Color subColor = AppTheme.emerald,
    bool filled = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: filled ? const Color(0xFFEAFAf1) : AppTheme.slate50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: filled ? const Color(0xFFBBF0D2) : AppTheme.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: filled ? AppTheme.emerald : AppTheme.slate500)),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: filled ? AppTheme.emerald : AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            sub,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: subColor),
          ),
        ],
      ),
    );
  }
}
