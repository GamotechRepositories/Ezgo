import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../data/event_services.dart';

class EventServiceCard extends StatelessWidget {
  final EventService service;
  final VoidCallback onTap;
  final bool compact;

  const EventServiceCard({
    super.key,
    required this.service,
    required this.onTap,
    this.compact = false,
  });

  Color get _accent {
    switch (service.filterKey) {
      case 'dj':
        return const Color(0xFF7C3AED);
      case 'decor':
        return const Color(0xFFE11D48);
      case 'photography':
        return const Color(0xFF2563EB);
      case 'catering':
        return const Color(0xFFDC2626);
      case 'lighting':
        return const Color(0xFFD97706);
      case 'priest':
        return const Color(0xFFB45309);
      case 'mehendi':
        return const Color(0xFF059669);
      case 'makeup':
        return const Color(0xFFDB2777);
      case 'tent':
        return const Color(0xFF0F766E);
      default:
        return AppTheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return compact ? _buildCompact() : _buildWide();
  }

  Widget _image({required double height, BorderRadius? radius}) {
    final accent = _accent;
    return ClipRRect(
      borderRadius: radius ?? BorderRadius.circular(14),
      child: SizedBox(
        width: double.infinity,
        height: height,
        child: Image.asset(
          service.asset,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => Image.network(
            service.image,
            fit: BoxFit.cover,
            errorBuilder: (_, _, _) => ColoredBox(
              color: accent.withValues(alpha: 0.12),
              child: Icon(service.icon, color: accent, size: 28),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCompact() {
    final accent = _accent;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.borderSubtle),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.045),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  _image(
                    height: 108,
                    radius: const BorderRadius.vertical(top: Radius.circular(17)),
                  ),
                  Positioned(
                    left: 8,
                    top: 8,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.14),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                      child: Icon(service.icon, size: 12, color: accent),
                    ),
                  ),
                  Positioned(
                    right: 8,
                    top: 8,
                    child: _chip('Save 15%+', const Color(0xFFE4F7EA), const Color(0xFF18794E)),
                  ),
                ],
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(10, 9, 10, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        service.shortName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.15,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        service.priceRange,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11.5,
                          height: 1.15,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 7),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Get Bids',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(LucideIcons.arrowRight, size: 12, color: Colors.white),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWide() {
    final accent = _accent;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.borderSubtle),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.045),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              children: [
                Stack(
                  children: [
                    SizedBox(
                      width: 92,
                      child: _image(height: 92),
                    ),
                    Positioned(
                      left: 6,
                      bottom: 6,
                      child: Container(
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.16),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                        child: Icon(service.icon, size: 13, color: accent),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 92,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          service.shortName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 15.5,
                            height: 1.15,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          service.priceRange,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12.5,
                            height: 1.15,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            _chip('Save 15%+', const Color(0xFFE4F7EA), const Color(0xFF18794E)),
                            const SizedBox(width: 6),
                            _chip('Reverse Bids', AppTheme.tealLight, AppTheme.teal),
                          ],
                        ),
                        const Spacer(),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Get Bids',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                SizedBox(width: 4),
                                Icon(LucideIcons.arrowRight, size: 12, color: Colors.white),
                              ],
                            ),
                          ),
                        ),
                      ],
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

  Widget _chip(String label, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: fg, height: 1.1),
      ),
    );
  }
}
