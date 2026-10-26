import 'package:flutter/material.dart';

/// Lets the shell scroll a tab’s main list to top when that tab is tapped again.
class TabScrollRegistry {
  TabScrollRegistry._();
  static final TabScrollRegistry instance = TabScrollRegistry._();

  final Map<int, ScrollController> _controllers = {};

  void register(int index, ScrollController controller) {
    _controllers[index] = controller;
  }

  void unregister(int index, ScrollController controller) {
    if (identical(_controllers[index], controller)) {
      _controllers.remove(index);
    }
  }

  void scrollToTop(int index) {
    final controller = _controllers[index];
    if (controller == null || !controller.hasClients) return;
    controller.animateTo(
      0,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
    );
  }
}
