import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

enum ToastType { success, info, warning, error }

class AppToast {
  static void show(
    BuildContext context,
    String message, {
    ToastType type = ToastType.info,
    Duration duration = const Duration(seconds: 3),
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    final scaffold = ScaffoldMessenger.maybeOf(context);
    if (scaffold == null) return;

    scaffold.hideCurrentSnackBar();

    Color bg;
    Color fg = Colors.white;
    IconData icon;

    switch (type) {
      case ToastType.success:
        bg = const Color(0xFF10B981);
        icon = LucideIcons.circleCheck;
        break;
      case ToastType.warning:
        bg = const Color(0xFFF59E0B);
        icon = LucideIcons.alertTriangle;
        break;
      case ToastType.error:
        bg = const Color(0xFFEF4444);
        icon = LucideIcons.alertCircle;
        break;
      case ToastType.info:
        bg = const Color(0xFF1E293B);
        icon = LucideIcons.info;
        break;
    }

    scaffold.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: fg, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        backgroundColor: bg,
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        action: (onAction != null && actionLabel != null)
            ? SnackBarAction(
                label: actionLabel,
                textColor: Colors.white,
                onPressed: onAction,
              )
            : null,
      ),
    );
  }
}
