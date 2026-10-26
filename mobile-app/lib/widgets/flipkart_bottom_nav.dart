import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'shell_bottom_insets.dart';

class FlipkartNavItem {
  final String label;
  final IconData outlinedIcon;
  final IconData filledIcon;
  final bool isAction;
  final bool isAccount;
  final bool showBadge;
  final bool accent;

  const FlipkartNavItem({
    required this.label,
    required this.outlinedIcon,
    required this.filledIcon,
    this.isAction = false,
    this.isAccount = false,
    this.showBadge = false,
    this.accent = false,
  });
}

class FlipkartBottomNav extends StatefulWidget {
  final int currentIndex;
  final List<FlipkartNavItem> items;
  final ValueChanged<int> onTap;
  final int badgeCount;
  final String? accountInitial;
  final Color activeColor;
  final GlobalKey? badgeIconKey;

  const FlipkartBottomNav({
    super.key,
    required this.currentIndex,
    required this.items,
    required this.onTap,
    this.badgeCount = 0,
    this.accountInitial,
    this.activeColor = const Color(0xFFFF7A00),
    this.badgeIconKey,
  });

  @override
  State<FlipkartBottomNav> createState() => _FlipkartBottomNavState();
}

class _FlipkartBottomNavState extends State<FlipkartBottomNav> {
  static const Color _inactive = Color(0xFF878787);

  double _indicatorIndex = 0;
  bool _dragging = false;
  int _hoverIndex = -1;

  @override
  void initState() {
    super.initState();
    _indicatorIndex = widget.currentIndex.toDouble();
  }

  @override
  void didUpdateWidget(FlipkartBottomNav oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_dragging && oldWidget.currentIndex != widget.currentIndex) {
      _indicatorIndex = widget.currentIndex.toDouble();
    }
  }

  int _indexFromX(double x, double tabWidth, int count) {
    if (tabWidth <= 0) return 0;
    final raw = ((x / tabWidth) - 0.5).round();
    return raw.clamp(0, count - 1);
  }

  double _fractionFromX(double x, double tabWidth, int count) {
    if (tabWidth <= 0) return 0;
    return ((x / tabWidth) - 0.5).clamp(0, count - 1).toDouble();
  }

  void _commit(int index) {
    HapticFeedback.heavyImpact();
    widget.onTap(index);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _dragging) return;
      if (widget.currentIndex.toDouble() != _indicatorIndex) {
        setState(() => _indicatorIndex = widget.currentIndex.toDouble());
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final safeBottom = MediaQuery.viewPaddingOf(context).bottom;
    final count = widget.items.length;

    return Padding(
      padding: EdgeInsets.fromLTRB(22, 0, 22, 14 + safeBottom),
      child: RepaintBoundary(
        child: Container(
          height: ShellBottomInsets.barHeight,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(32),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: const Color(0xF5FFFFFF),
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: const Color(0xFFE5E5E5)),
              ),
              child: LayoutBuilder(
              builder: (context, constraints) {
                final width = constraints.maxWidth;
                final tabWidth = count == 0 ? width : width / count;
                final pillWidth = tabWidth * 0.78;
                final pillLeft = _indicatorIndex * tabWidth + (tabWidth - pillWidth) / 2;
                const pillHeight = 40.0;
                final pillTop = (ShellBottomInsets.barHeight - pillHeight) / 2;

                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTapUp: (details) {
                    _commit(_indexFromX(details.localPosition.dx, tabWidth, count));
                  },
                  onHorizontalDragStart: (_) {
                    setState(() {
                      _dragging = true;
                      _hoverIndex = _indicatorIndex.round();
                    });
                    HapticFeedback.heavyImpact();
                  },
                  onHorizontalDragUpdate: (details) {
                    final next = _fractionFromX(details.localPosition.dx, tabWidth, count);
                    final rounded = next.round();
                    if (rounded != _hoverIndex) {
                      _hoverIndex = rounded;
                      HapticFeedback.heavyImpact();
                    }
                    setState(() => _indicatorIndex = next);
                  },
                  onHorizontalDragEnd: (details) {
                    final velocity = details.primaryVelocity ?? 0;
                    int index;
                    if (velocity.abs() >= 280) {
                      final current = _indicatorIndex.round();
                      index = velocity > 0
                          ? (current + 1).clamp(0, count - 1)
                          : (current - 1).clamp(0, count - 1);
                    } else {
                      index = _indicatorIndex.round().clamp(0, count - 1);
                    }
                    setState(() {
                      _dragging = false;
                      _indicatorIndex = index.toDouble();
                      _hoverIndex = -1;
                    });
                    _commit(index);
                  },
                  onHorizontalDragCancel: () {
                    setState(() {
                      _dragging = false;
                      _indicatorIndex = widget.currentIndex.toDouble();
                      _hoverIndex = -1;
                    });
                  },
                  child: Stack(
                    children: [
                      AnimatedPositioned(
                        duration: _dragging ? Duration.zero : const Duration(milliseconds: 280),
                        curve: Curves.easeOutCubic,
                        left: pillLeft,
                        top: pillTop,
                        width: pillWidth,
                        height: pillHeight,
                        child: IgnorePointer(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.07),
                              borderRadius: BorderRadius.circular(22),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.06),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          for (var i = 0; i < count; i++)
                            Expanded(child: _buildTab(i)),
                        ],
                      ),
                    ],
                  ),
                );
              },
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTab(int index) {
    final item = widget.items[index];
    final selected = !_dragging && widget.currentIndex == index && !item.isAction;
    final hover = _dragging && _indicatorIndex.round() == index;
    final active = selected || hover;
    final color = item.accent
        ? widget.activeColor
        : (active ? widget.activeColor : _inactive);

    Widget icon;
    if (item.isAction) {
      icon = Container(
        width: 28,
        height: 28,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: widget.activeColor,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: widget.activeColor.withValues(alpha: 0.38),
              blurRadius: 7,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(item.filledIcon, size: 15, color: Colors.white),
      );
    } else if (item.isAccount && widget.accountInitial != null && widget.accountInitial!.isNotEmpty) {
      icon = _AccountAvatar(
        initial: widget.accountInitial!,
        selected: active,
        activeColor: widget.activeColor,
      );
    } else {
      icon = Icon(
        active ? item.filledIcon : item.outlinedIcon,
        size: 22,
        color: color,
      );
    }

    if (item.showBadge) {
      icon = KeyedSubtree(
        key: widget.badgeIconKey,
        child: _BadgeIcon(count: widget.badgeCount, child: icon),
      );
    }

    return Semantics(
      button: true,
      selected: selected,
      label: item.label,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon,
            const SizedBox(height: 2),
            Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.fade,
              softWrap: false,
              style: TextStyle(
                fontSize: 9,
                height: 1.1,
                fontWeight: active || item.accent ? FontWeight.w800 : FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BadgeIcon extends StatelessWidget {
  final int count;
  final Widget child;

  const _BadgeIcon({required this.count, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        if (count > 0)
          Positioned(
            top: -5,
            right: -7,
            child: Container(
              constraints: const BoxConstraints(minHeight: 16, minWidth: 16),
              padding: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFF4343),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.white, width: 1.2),
              ),
              alignment: Alignment.center,
              child: Text(
                count > 99 ? '99+' : '$count',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                  height: 1,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _AccountAvatar extends StatelessWidget {
  final String initial;
  final bool selected;
  final Color activeColor;

  const _AccountAvatar({
    required this.initial,
    required this.selected,
    required this.activeColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: selected ? activeColor.withValues(alpha: 0.14) : Colors.transparent,
        border: Border.all(
          color: selected ? activeColor : const Color(0xFF878787),
          width: selected ? 1.5 : 1,
        ),
      ),
      child: Text(
        initial,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: selected ? activeColor : const Color(0xFF878787),
        ),
      ),
    );
  }
}
