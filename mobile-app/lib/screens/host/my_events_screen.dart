import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bookings_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/event_request_card.dart';
import '../../widgets/pull_refresh.dart';
import '../../widgets/shell_bottom_insets.dart';
import '../../widgets/tab_scroll_registry.dart';
import 'bids_comparison_screen.dart';
import 'post_requirement_screen.dart';

class MyEventsScreen extends StatefulWidget {
  const MyEventsScreen({super.key});

  @override
  State<MyEventsScreen> createState() => _MyEventsScreenState();
}

class _MyEventsScreenState extends State<MyEventsScreen> {
  int _selectedFilterIndex = 0;
  final List<String> _filters = ['All', 'Open', 'With bids', 'Booked', 'Closed'];
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    TabScrollRegistry.instance.register(1, _scrollController);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _refresh();
    });
  }

  @override
  void dispose() {
    TabScrollRegistry.instance.unregister(1, _scrollController);
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    final auth = context.read<AuthProvider>();
    await Future.wait([
      context.read<RequirementsProvider>().loadData(requesterId: auth.user?.id),
      context.read<BookingsProvider>().loadData(),
    ]);
  }

  void _open(RequirementModel req) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => BidsComparisonScreen(requirement: req)),
    ).then((_) {
      if (mounted) _refresh();
    });
  }

  void _openPost() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
    ).then((_) {
      if (mounted) _refresh();
    });
  }

  List<RequirementModel> _applyFilter(List<RequirementModel> all) {
    switch (_selectedFilterIndex) {
      case 1:
        return all.where((r) => r.isOpen).toList();
      case 2:
        return all.where((r) => r.isOpen && r.hasBids).toList();
      case 3:
        return all.where((r) => r.isBooked).toList();
      case 4:
        return all.where((r) => r.isClosed).toList();
      default:
        return all;
    }
  }

  int _countFor(int index, List<RequirementModel> all) {
    switch (index) {
      case 1:
        return all.where((r) => r.isOpen).length;
      case 2:
        return all.where((r) => r.isOpen && r.hasBids).length;
      case 3:
        return all.where((r) => r.isBooked).length;
      case 4:
        return all.where((r) => r.isClosed).length;
      default:
        return all.length;
    }
  }

  @override
  Widget build(BuildContext context) {
    final reqProvider = context.watch<RequirementsProvider>();
    final auth = context.watch<AuthProvider>();
    final allReqs = reqProvider.mine(auth.user?.id);
    final filteredReqs = _applyFilter(allReqs);
    final loading = reqProvider.isLoading && allReqs.isEmpty;
    final failed = !reqProvider.isLoading && allReqs.isEmpty && (reqProvider.error?.isNotEmpty ?? false);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('My Events'),
        centerTitle: false,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus, size: 20),
            onPressed: _openPost,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  allReqs.isEmpty
                      ? 'Posted requests and vendor bids'
                      : '${allReqs.length} event${allReqs.length == 1 ? '' : 's'} posted',
                  style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _filters.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final isSelected = _selectedFilterIndex == index;
                      final count = _countFor(index, allReqs);
                      return GestureDetector(
                        onTap: () => setState(() => _selectedFilterIndex = index),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? AppTheme.primary : AppTheme.slate50,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.borderSubtle),
                          ),
                          child: Center(
                            child: Text(
                              '${_filters[index]} ($count)',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? Colors.white : AppTheme.textPrimary,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: PullRefresh(
              onRefresh: _refresh,
              child: loading
                  ? ListView(
                      controller: _scrollController,
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        SizedBox(height: 120),
                        Center(child: CircularProgressIndicator(color: AppTheme.primary)),
                      ],
                    )
                  : failed
                      ? ListView(
                          controller: _scrollController,
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: EdgeInsets.fromLTRB(24, 80, 24, ShellBottomInsets.of(context)),
                          children: [
                            const Icon(LucideIcons.wifiOff, size: 44, color: AppTheme.slate400),
                            const SizedBox(height: 12),
                            Text('Could not load events', textAlign: TextAlign.center, style: AppTheme.headingFont(fontSize: 16)),
                            const SizedBox(height: 6),
                            Text(
                              reqProvider.error ?? 'Pull down to try again.',
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                            ),
                            const SizedBox(height: 16),
                            Center(
                              child: ElevatedButton(
                                onPressed: _refresh,
                                child: const Text('Retry'),
                              ),
                            ),
                          ],
                        )
                      : filteredReqs.isEmpty
                          ? ListView(
                              controller: _scrollController,
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: EdgeInsets.fromLTRB(24, 80, 24, ShellBottomInsets.of(context)),
                              children: [
                                const Icon(LucideIcons.clipboardList, size: 44, color: AppTheme.primary),
                                const SizedBox(height: 12),
                                Text(
                                  allReqs.isEmpty ? 'No events posted yet' : 'No events in this tab',
                                  textAlign: TextAlign.center,
                                  style: AppTheme.headingFont(fontSize: 16),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  allReqs.isEmpty
                                      ? 'Post a request with your budget. Verified vendors bid at least 15% below it.'
                                      : 'Try another filter, or post a new event request.',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                                ),
                                const SizedBox(height: 16),
                                Center(
                                  child: ElevatedButton.icon(
                                    onPressed: _openPost,
                                    icon: const Icon(LucideIcons.plus, size: 16),
                                    label: const Text('Post Event Request'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primary,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                  ),
                                ),
                              ],
                            )
                          : ListView.separated(
                              controller: _scrollController,
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: EdgeInsets.fromLTRB(16, 12, 16, ShellBottomInsets.of(context)),
                              itemCount: filteredReqs.length,
                              separatorBuilder: (_, _) => const SizedBox(height: 14),
                              itemBuilder: (context, index) {
                                final req = filteredReqs[index];
                                return EventRequestCard(
                                  requirement: req,
                                  onTap: () => _open(req),
                                );
                              },
                            ),
            ),
          ),
        ],
      ),
    );
  }
}
