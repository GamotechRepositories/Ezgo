import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';

class VendorMoney {
  static final NumberFormat _inr = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static String of(num amount) => _inr.format(amount);
}

String vendorGreeting() {
  final hour = DateTime.now().hour;
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

Color vendorCategoryColor(String category) {
  final key = category.toLowerCase();
  if (key.contains('dj') || key.contains('sound')) return const Color(0xFF7C3AED);
  if (key.contains('photo') || key.contains('film') || key.contains('video')) {
    return const Color(0xFF2563EB);
  }
  if (key.contains('cater') || key.contains('food')) return const Color(0xFFD97706);
  if (key.contains('decor') || key.contains('mandap') || key.contains('stage') || key.contains('floral')) {
    return const Color(0xFFDB2777);
  }
  if (key.contains('light') || key.contains('truss')) return AppTheme.teal;
  if (key.contains('tent') || key.contains('venue')) return const Color(0xFF0F766E);
  return AppTheme.primary;
}

IconData vendorCategoryIcon(String category) {
  final key = category.toLowerCase();
  if (key.contains('dj') || key.contains('sound')) return LucideIcons.audioLines;
  if (key.contains('photo') || key.contains('film') || key.contains('video')) return LucideIcons.camera;
  if (key.contains('cater') || key.contains('food')) return LucideIcons.utensilsCrossed;
  if (key.contains('decor') || key.contains('mandap') || key.contains('stage')) return LucideIcons.sparkles;
  if (key.contains('light') || key.contains('truss')) return LucideIcons.lamp;
  return LucideIcons.partyPopper;
}

class VendorSurface extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final Color? borderColor;
  final double radius;
  final VoidCallback? onTap;

  const VendorSurface({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color,
    this.borderColor,
    this.radius = 22,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final body = Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? Colors.white,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor ?? AppTheme.borderSubtle),
        boxShadow: [
          BoxShadow(
            color: AppTheme.ink.withValues(alpha: 0.04),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: child,
    );
    if (onTap == null) return body;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius),
        child: body,
      ),
    );
  }
}

class VendorPageHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget? trailing;

  const VendorPageHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTheme.displayFont(fontSize: 24, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: AppTheme.bodyFont(fontSize: 13, height: 1.4),
                ),
              ],
            ),
          ),
          if (trailing != null) ...[const SizedBox(width: 12), trailing!],
        ],
      ),
    );
  }
}

class VendorHeroStat {
  final String value;
  final String label;
  const VendorHeroStat({required this.value, required this.label});
}

class VendorInkHero extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String subtitle;
  final List<VendorHeroStat> stats;

  const VendorInkHero({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    required this.stats,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1C2A48), Color(0xFF121A2E)],
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.ink.withValues(alpha: 0.22),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF34D399),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                eyebrow.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              height: 1.15,
              letterSpacing: -0.4,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: const TextStyle(
              color: Color(0xFFB8C2D6),
              fontSize: 13,
              height: 1.4,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (stats.isNotEmpty) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                for (var i = 0; i < stats.length; i++) ...[
                  if (i > 0) const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            stats[i].value,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            stats[i].label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class VendorSegmentItem {
  final String label;
  final int count;
  final IconData? icon;
  const VendorSegmentItem({required this.label, required this.count, this.icon});
}

class VendorSegmentBar extends StatelessWidget {
  final List<VendorSegmentItem> items;
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  const VendorSegmentBar({
    super.key,
    required this.items,
    required this.selectedIndex,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Row(
        children: [
          for (var i = 0; i < items.length; i++)
            Expanded(
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.selectionClick();
                  onChanged(i);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                  decoration: BoxDecoration(
                    color: selectedIndex == i ? AppTheme.ink : Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (items[i].icon != null) ...[
                            Icon(
                              items[i].icon,
                              size: 13,
                              color: selectedIndex == i ? Colors.white : AppTheme.slate500,
                            ),
                            const SizedBox(width: 4),
                          ],
                          Flexible(
                            child: Text(
                              items[i].label,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: selectedIndex == i ? Colors.white : AppTheme.slate600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${items[i].count}',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: selectedIndex == i ? AppTheme.primaryLight : AppTheme.ink,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class VendorChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final String? badge;
  final int? count;
  final Color? selectedColor;

  const VendorChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.badge,
    this.count,
    this.selectedColor,
  });

  @override
  Widget build(BuildContext context) {
    final active = selectedColor ?? AppTheme.ink;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? active : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: selected ? active : AppTheme.borderSubtle),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: selected ? Colors.white : AppTheme.slate700,
              ),
            ),
            if (badge != null) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: selected ? Colors.white.withValues(alpha: 0.18) : AppTheme.primaryLight,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  badge!,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: selected ? Colors.white : AppTheme.primary,
                  ),
                ),
              ),
            ],
            if (count != null) ...[
              const SizedBox(width: 6),
              Text(
                '$count',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: selected ? Colors.white70 : AppTheme.slate500,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class VendorSearchField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final ValueChanged<String>? onChanged;

  const VendorSearchField({
    super.key,
    required this.controller,
    required this.hint,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(fontSize: 13, color: AppTheme.slate400),
        prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppTheme.slate400),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: AppTheme.borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: AppTheme.borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: AppTheme.primary, width: 1.4),
        ),
      ),
    );
  }
}

class VendorEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Color iconColor;

  const VendorEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
    this.iconColor = AppTheme.primary,
  });

  @override
  Widget build(BuildContext context) {
    return VendorSurface(
      padding: const EdgeInsets.fromLTRB(24, 32, 24, 28),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 28, color: iconColor),
          ),
          const SizedBox(height: 14),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.ink),
          ),
          const SizedBox(height: 6),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: AppTheme.slate500, height: 1.4),
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class VendorStatusPill extends StatelessWidget {
  final String label;
  final Color color;
  final Color? background;

  const VendorStatusPill({
    super.key,
    required this.label,
    required this.color,
    this.background,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: background ?? color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: color),
      ),
    );
  }
}
