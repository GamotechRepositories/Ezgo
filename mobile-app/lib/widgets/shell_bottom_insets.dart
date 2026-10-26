import 'package:flutter/material.dart';

/// Bottom space so lists / sticky CTAs sit above the floating pill nav.
class ShellBottomInsets {
  static const double barHeight = 64;
  static const double barBottomMargin = 14;
  static const double buffer = 12;
  static const double barOverlap = barHeight + barBottomMargin + buffer;

  static double of(BuildContext context) {
    return MediaQuery.viewPaddingOf(context).bottom + barOverlap;
  }

  static EdgeInsets listPadding(
    BuildContext context, {
    EdgeInsets extra = const EdgeInsets.fromLTRB(16, 16, 16, 0),
  }) {
    return extra.copyWith(bottom: extra.bottom + of(context));
  }
}
