import 'package:flutter/material.dart';

/// Marks the main tab shell so nested screens know the floating nav is already reserved.
class ShellNavScope extends InheritedWidget {
  const ShellNavScope({super.key, required super.child});

  static bool active(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ShellNavScope>() != null;
  }

  @override
  bool updateShouldNotify(ShellNavScope oldWidget) => false;
}

/// Bottom space so lists / sticky CTAs sit above the floating pill nav.
class ShellBottomInsets {
  static const double barHeight = 64;
  static const double barBottomMargin = 14;
  static const double buffer = 12;
  static const double barOverlap = barHeight + barBottomMargin + buffer;

  static double reserved(BuildContext context) {
    return MediaQuery.viewPaddingOf(context).bottom + barOverlap;
  }

  static double of(BuildContext context) {
    if (ShellNavScope.active(context)) return buffer;
    return reserved(context);
  }

  static EdgeInsets listPadding(
    BuildContext context, {
    EdgeInsets extra = const EdgeInsets.fromLTRB(16, 16, 16, 0),
  }) {
    return extra.copyWith(bottom: extra.bottom + of(context));
  }
}

/// Bottom sheets that overlay the floating nav instead of sliding under it.
Future<T?> showAppBottomSheet<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  bool isScrollControlled = false,
  Color? backgroundColor,
  Color? barrierColor,
  ShapeBorder? shape,
}) {
  return showModalBottomSheet<T>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: isScrollControlled,
    backgroundColor: backgroundColor,
    barrierColor: barrierColor,
    shape: shape,
    builder: builder,
  );
}
