import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/event_request_card.dart';
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
  final List<String> _filters = ['All', 'Open for Bids', 'Bids Received', 'Booked'];
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    TabScrollRegistry.instance.register(1, _scrollController);
  }

  @override
  void dispose() {
    TabScrollRegistry.instance.unregister(1, _scrollController);
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    final auth = context.read<AuthProvider>();
    await context.read<RequirementsProvider>().loadData(requesterId: auth.user?.id);
  }

  void _open(RequirementModel req) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => BidsComparisonScreen(requirement: req)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final reqProvider = context.watch<RequirementsProvider>();
    final auth = context.watch<AuthProvider>();
    final allReqs = reqProvider.mine(auth.user?.id);

    List<RequirementModel> filteredReqs = allReqs;
    if (_selectedFilterIndex == 1) {
      filteredReqs = allReqs.where((r) => r.status.toUpperCase() == 'OPEN').toList();
    } else if (_selectedFilterIndex == 2) {
      filteredReqs = allReqs.where((r) => r.liveBidsCount > 0).toList();
    } else if (_selectedFilterIndex == 3) {
      filteredReqs = allReqs.where((r) {
        final s = r.status.toUpperCase();
        return s == 'ACCEPTED' || s == 'ACTIVE' || s == 'BOOKED' || s == 'COMPLETED';
      }).toList();
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('My Event Requests'),
        centerTitle: false,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus, size: 20),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
            child: SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _filters.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final isSelected = _selectedFilterIndex == index;
                  final count = index == 0
                      ? allReqs.length
                      : index == 1
                          ? allReqs.where((r) => r.isOpen).length
                          : index == 2
                              ? allReqs.where((r) => r.liveBidsCount > 0).length
                              : allReqs.where((r) {
                                  final s = r.status.toUpperCase();
                                  return s == 'ACCEPTED' || s == 'ACTIVE' || s == 'BOOKED' || s == 'COMPLETED';
                                }).length;
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
          ),
          Expanded(
            child: RefreshIndicator(
              color: AppTheme.primary,
              onRefresh: _refresh,
              child: filteredReqs.isEmpty
                  ? ListView(
                      controller: _scrollController,
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: EdgeInsets.fromLTRB(24, 80, 24, ShellBottomInsets.of(context)),
                      children: [
                        const Icon(LucideIcons.clipboardList, size: 44, color: AppTheme.primary),
                        const SizedBox(height: 12),
                        Text(
                          allReqs.isEmpty ? 'No event requests yet' : 'No events in this tab',
                          textAlign: TextAlign.center,
                          style: AppTheme.headingFont(fontSize: 16),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Post a request with your budget. Verified vendors bid at least 15% below it.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        Center(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
                              );
                            },
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
