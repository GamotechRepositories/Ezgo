import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/pull_refresh.dart';
import '../../widgets/shell_bottom_insets.dart';
import '../../widgets/vendor_ui.dart';

class AvailabilityScreen extends StatefulWidget {
  const AvailabilityScreen({super.key});

  @override
  State<AvailabilityScreen> createState() => _AvailabilityScreenState();
}

class _AvailabilityScreenState extends State<AvailabilityScreen> {
  bool _busy = false;
  late DateTime _month;
  static final _pretty = DateFormat('EEE, d MMM yyyy');
  static final _monthTitle = DateFormat('MMMM yyyy');
  static const _weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _month = DateTime(now.year, now.month);
  }

  String _iso(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  String _today() => _iso(DateTime.now());

  String _label(String iso) {
    try {
      return _pretty.format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  Set<String> _blockedSet(List<BlockedDate> dates) {
    return dates.map((d) => d.date.length >= 10 ? d.date.substring(0, 10) : d.date).toSet();
  }

  Future<void> _blockIso(String dateStr) async {
    final auth = context.read<AuthProvider>();
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _busy = true);
    try {
      await auth.blockDate(dateStr);
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text('${_label(dateStr)} blocked'), backgroundColor: AppTheme.emerald),
      );
    } catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppTheme.rose));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _unblock(BlockedDate item) async {
    final auth = context.read<AuthProvider>();
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _busy = true);
    try {
      await auth.unblockDate(item.date);
    } catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppTheme.rose));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _onDayTap(DateTime day, bool blocked, BlockedDate? item) async {
    if (_busy) return;
    final today = DateTime.now();
    final start = DateTime(today.year, today.month, today.day);
    if (day.isBefore(start)) return;
    if (blocked && item != null) {
      await _unblock(item);
      return;
    }
    await _blockIso(_iso(day));
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      helpText: 'Block a date',
    );
    if (picked == null || !mounted) return;
    await _blockIso(_iso(picked));
  }

  @override
  Widget build(BuildContext context) {
    final dates = context.watch<AuthProvider>().user?.unavailableDates ?? const <BlockedDate>[];
    final today = _today();
    final upcoming = dates.where((d) => d.date.compareTo(today) >= 0).toList()
      ..sort((a, b) => a.date.compareTo(b.date));
    final blocked = _blockedSet(dates);
    final daysInMonth = DateTime(_month.year, _month.month + 1, 0).day;
    final leading = DateTime(_month.year, _month.month, 1).weekday - 1;
    final cells = leading + daysInMonth;

    return PullRefresh(
      onRefresh: () => context.read<AuthProvider>().ensureSession(),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: ShellBottomInsets.listPadding(context),
        children: [
          VendorPageHeader(
            title: 'Calendar',
            subtitle: 'Block dates with offline gigs. Hosts will not get your bid on those days.',
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.tealLight,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '${upcoming.length} blocked',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.teal,
                ),
              ),
            ),
          ),
          VendorSurface(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 16),
            child: Column(
              children: [
                Row(
                  children: [
                    IconButton(
                      onPressed: () => setState(() {
                        _month = DateTime(_month.year, _month.month - 1);
                      }),
                      icon: const Icon(LucideIcons.chevronLeft, size: 18),
                    ),
                    Expanded(
                      child: Text(
                        _monthTitle.format(_month),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.ink,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => setState(() {
                        _month = DateTime(_month.year, _month.month + 1);
                      }),
                      icon: const Icon(LucideIcons.chevronRight, size: 18),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: _weekdays
                      .map(
                        (d) => Expanded(
                          child: Text(
                            d,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.slate400,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 8),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: cells,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 7,
                    mainAxisSpacing: 6,
                    crossAxisSpacing: 6,
                    childAspectRatio: 1,
                  ),
                  itemBuilder: (context, index) {
                    if (index < leading) return const SizedBox.shrink();
                    final day = index - leading + 1;
                    final date = DateTime(_month.year, _month.month, day);
                    final iso = _iso(date);
                    final start = DateTime.now();
                    final todayStart = DateTime(start.year, start.month, start.day);
                    final isToday = iso == today;
                    final isPast = date.isBefore(todayStart);
                    final isBlocked = blocked.contains(iso);
                    BlockedDate? item;
                    for (final d in dates) {
                      final key = d.date.length >= 10 ? d.date.substring(0, 10) : d.date;
                      if (key == iso) {
                        item = d;
                        break;
                      }
                    }

                    return GestureDetector(
                      onTap: isPast || _busy ? null : () => _onDayTap(date, isBlocked, item),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 160),
                        decoration: BoxDecoration(
                          color: isBlocked
                              ? AppTheme.rose
                              : isToday
                                  ? AppTheme.primaryLight
                                  : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isToday && !isBlocked
                                ? AppTheme.primary
                                : isBlocked
                                    ? AppTheme.rose
                                    : AppTheme.slate100,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '$day',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: isBlocked
                                ? Colors.white
                                : isPast
                                    ? AppTheme.slate300
                                    : isToday
                                        ? AppTheme.primary
                                        : AppTheme.ink,
                          ),
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: const [
                    _LegendDot(color: AppTheme.rose, label: 'Blocked'),
                    SizedBox(width: 14),
                    _LegendDot(color: AppTheme.primary, label: 'Today'),
                    SizedBox(width: 14),
                    _LegendDot(color: AppTheme.slate300, label: 'Open'),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: _busy ? null : _pickDate,
              icon: const Icon(LucideIcons.calendarPlus, size: 18),
              label: Text(_busy ? 'Saving…' : 'Block a date'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.ink,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
          const SizedBox(height: 22),
          Text(
            upcoming.isEmpty ? 'No blocked dates' : 'Upcoming blocked dates',
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.ink),
          ),
          const SizedBox(height: 10),
          if (upcoming.isEmpty)
            const VendorEmptyState(
              icon: LucideIcons.calendarCheck,
              iconColor: AppTheme.teal,
              title: 'You are open for bids',
              message: 'Tap a date on the calendar if you already have a wedding or gig booked outside EzzyGo.',
            )
          else
            ...upcoming.map(
              (d) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: VendorSurface(
                  padding: const EdgeInsets.fromLTRB(14, 10, 6, 10),
                  radius: 16,
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppTheme.redLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(LucideIcons.calendarX, color: AppTheme.rose, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _label(d.date),
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                            ),
                            Text(
                              d.reason.isNotEmpty ? d.reason : 'Offline gig · hidden from hosts',
                              style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: _busy ? null : () => _unblock(d),
                        child: const Text('Unblock', style: TextStyle(fontWeight: FontWeight.w800)),
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

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.slate500),
        ),
      ],
    );
  }
}
