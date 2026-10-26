import 'package:flutter/material.dart';

/// PageView synced to the shell tab index. Full-screen swipe between tabs is off;
/// only the floating bar tap / drag changes pages.
class TabSwipeShell extends StatefulWidget {
  final int currentIndex;
  final List<Widget> children;

  const TabSwipeShell({
    super.key,
    required this.currentIndex,
    required this.children,
  });

  @override
  State<TabSwipeShell> createState() => _TabSwipeShellState();
}

class _TabSwipeShellState extends State<TabSwipeShell> {
  late final PageController _controller;

  @override
  void initState() {
    super.initState();
    _controller = PageController(initialPage: widget.currentIndex);
  }

  @override
  void didUpdateWidget(TabSwipeShell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentIndex == widget.currentIndex) return;
    if (!_controller.hasClients) return;
    _controller.animateToPage(
      widget.currentIndex,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageView.builder(
      controller: _controller,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: widget.children.length,
      itemBuilder: (context, index) {
        return _KeepAlivePage(child: widget.children[index]);
      },
    );
  }
}

class _KeepAlivePage extends StatefulWidget {
  final Widget child;
  const _KeepAlivePage({required this.child});

  @override
  State<_KeepAlivePage> createState() => _KeepAlivePageState();
}

class _KeepAlivePageState extends State<_KeepAlivePage> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return widget.child;
  }
}
