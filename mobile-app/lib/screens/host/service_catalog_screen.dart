import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../data/event_services.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/event_service_card.dart';
import '../../widgets/other_request_card.dart';
import '../../widgets/shell_bottom_insets.dart';
import 'post_requirement_screen.dart';
import 'service_detail_screen.dart';

class ServiceCatalogScreen extends StatefulWidget {
  final String? initialCategory;
  const ServiceCatalogScreen({super.key, this.initialCategory});

  @override
  State<ServiceCatalogScreen> createState() => _ServiceCatalogScreenState();
}

class _ServiceCatalogScreenState extends State<ServiceCatalogScreen> {
  late String _selectedCategory;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final initial = widget.initialCategory;
    _selectedCategory = (initial != null && EventServices.filters.contains(initial))
        ? initial
        : 'All';
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openService(EventService service) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ServiceDetailScreen(service: service.detailMap),
      ),
    );
  }

  void _openOtherRequest() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PostRequirementScreen(
          initialCategory: 'Other',
          initialCity: context.read<RequirementsProvider>().selectedCity,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = EventServices.filter(
      category: _selectedCategory,
      query: _searchController.text,
    );

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Event Services'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, size: 22),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Search DJ, Mandap, Photography, Catering...',
                  hintStyle: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                  prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppTheme.textSecondary),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {});
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 13, horizontal: 14),
                ),
              ),
            ),
          ),
          SizedBox(
            height: 38,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: EventServices.filters.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = EventServices.filters[index];
                final isSelected = _selectedCategory == cat;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = cat),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.primary : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? AppTheme.primary : AppTheme.borderSubtle,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        cat,
                        style: TextStyle(
                          fontSize: 13,
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
          const SizedBox(height: 12),
          Expanded(
            child: GridView.builder(
              padding: EdgeInsets.fromLTRB(16, 4, 16, ShellBottomInsets.of(context)),
              itemCount: filtered.length + 1,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                mainAxisExtent: 218,
              ),
              itemBuilder: (context, index) {
                if (index == filtered.length) {
                  return OtherRequestCard(
                    title: 'Other Services',
                    subtitle: 'Need something else? Request any service and get vendor bids.',
                    onTap: _openOtherRequest,
                  );
                }
                final service = filtered[index];
                return EventServiceCard(
                  service: service,
                  compact: true,
                  onTap: () => _openService(service),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
