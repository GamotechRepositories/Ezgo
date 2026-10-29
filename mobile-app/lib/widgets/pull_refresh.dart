import 'package:flutter/material.dart';
import '../config/theme.dart';

/// Pull-down refresh, plus a refresh when the user overscrolls at the bottom.
class PullRefresh extends StatefulWidget {
  final Future<void> Function() onRefresh;
  final Widget child;

  const PullRefresh({
    super.key,
    required this.onRefresh,
    required this.child,
  });

  @override
  State<PullRefresh> createState() => _PullRefreshState();
}

class _PullRefreshState extends State<PullRefresh> {
  DateTime? _lastBottom;
  bool _busy = false;

  Future<void> _run() async {
    if (_busy) return;
    _busy = true;
    try {
      await widget.onRefresh();
    } finally {
      _busy = false;
    }
  }

  bool _onScroll(ScrollNotification n) {
    if (_busy) return false;
    if (n.metrics.maxScrollExtent <= 0) return false;
    if (n is! OverscrollNotification || n.overscroll <= 10) return false;
    if (n.metrics.pixels < n.metrics.maxScrollExtent - 8) return false;
    final now = DateTime.now();
    if (_lastBottom != null && now.difference(_lastBottom!) < const Duration(seconds: 5)) {
      return false;
    }
    _lastBottom = now;
    _run();
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: _onScroll,
      child: RefreshIndicator(
        color: AppTheme.primary,
        displacement: 48,
        onRefresh: _run,
        child: widget.child,
      ),
    );
  }
}
