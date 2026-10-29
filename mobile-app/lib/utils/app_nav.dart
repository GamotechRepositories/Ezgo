import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppNav {
  static DateTime? _lastExitTap;

  static void openRoot(BuildContext context, Widget page) {
    Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
      PageRouteBuilder(
        pageBuilder: (_, _, _) => page,
        transitionDuration: const Duration(milliseconds: 320),
        reverseTransitionDuration: const Duration(milliseconds: 220),
        transitionsBuilder: (_, animation, _, child) {
          final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
          return FadeTransition(
            opacity: curved,
            child: SlideTransition(
              position: Tween<Offset>(begin: const Offset(0.04, 0), end: Offset.zero).animate(curved),
              child: child,
            ),
          );
        },
      ),
      (route) => false,
    );
  }

  static Future<void> pop(BuildContext context) async {
    await Navigator.of(context).maybePop();
  }

  static void backOrExit(BuildContext context) {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
      return;
    }
    onRootBack(context);
  }

  /// Home/role root: first back shows a hint, second back leaves the app.
  static void onRootBack(BuildContext context) {
    final now = DateTime.now();
    if (_lastExitTap != null && now.difference(_lastExitTap!) < const Duration(seconds: 2)) {
      SystemNavigator.pop();
      return;
    }
    _lastExitTap = now;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Press back again to exit'),
        duration: Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
