import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/notifications_provider.dart';
import '../screens/notifications_screen.dart';

class NotificationBellButton extends StatelessWidget {
  final double size;
  final double iconSize;

  const NotificationBellButton({
    super.key,
    this.size = 36,
    this.iconSize = 18,
  });

  @override
  Widget build(BuildContext context) {
    final unread = context.select<NotificationsProvider, int>((p) => p.unreadCount);
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const NotificationsScreen()),
        );
      },
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          clipBehavior: Clip.none,
          children: [
            Icon(LucideIcons.bell, size: iconSize, color: AppTheme.textPrimary),
            if (unread > 0)
              Positioned(
                top: 4,
                right: 4,
                child: Container(
                  constraints: BoxConstraints(
                    minWidth: unread > 9 ? 16 : 8,
                    minHeight: unread > 9 ? 16 : 8,
                  ),
                  padding: unread > 9 ? const EdgeInsets.symmetric(horizontal: 3) : EdgeInsets.zero,
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(99),
                  ),
                  alignment: Alignment.center,
                  child: unread > 9
                      ? Text(
                          unread > 99 ? '99+' : '$unread',
                          style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w800),
                        )
                      : null,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
