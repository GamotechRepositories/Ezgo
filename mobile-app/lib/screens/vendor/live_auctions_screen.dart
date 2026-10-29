import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/pull_refresh.dart';
import '../../widgets/requirement_card.dart';
import '../../widgets/shell_bottom_insets.dart';
import '../../widgets/tab_scroll_registry.dart';
import '../../widgets/vendor_ui.dart';
import 'place_bid_modal.dart';

class LiveAuctionsScreen extends StatefulWidget {
  const LiveAuctionsScreen({super.key});

  @override
  State<LiveAuctionsScreen> createState() => _LiveAuctionsScreenState();
}

class _LiveAuctionsScreenState extends State<LiveAuctionsScreen> {
  final _search = TextEditingController();
  final _scroll = ScrollController();
  String _tab = 'MY_CITY';
  String _category = 'ALL';
  String _sort = 'SOON';
  bool _autoCityDone = false;

  @override
  void initState() {
    super.initState();
    TabScrollRegistry.instance.register(1, _scroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RequirementsProvider>().loadData(marketplace: true);
    });
  }

  @override
  void dispose() {
    TabScrollRegistry.instance.unregister(1, _scroll);
    _search.dispose();
    _scroll.dispose();
    super.dispose();
  }

  String _normCity(String? value) {
    if (value == null) return '';
    final s = value.toLowerCase().trim();
    if (s.contains('bengaluru') || s.contains('bangalore')) return 'bengaluru';
    if (s.contains('delhi') || s.contains('ncr')) return 'delhi';
    return s.split(' ').first.replaceAll(RegExp(r'[^a-z]'), '');
  }

  String _vendorCity(AuthProvider auth) {
    final raw = auth.user?.serviceArea?.trim() ?? '';
    if (raw.isEmpty) return '';
    return raw.split(',').first.trim();
  }

  void _maybeAutoCity(String vendorCity, List<RequirementModel> open) {
    if (_autoCityDone || vendorCity.isEmpty || open.isEmpty) return;
    _autoCityDone = true;
    final hasLocal = open.any((r) => _normCity(r.city) == _normCity(vendorCity));
    if (!hasLocal) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        setState(() => _tab = 'ALL');
      });
      return;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<RequirementsProvider>().setMarketplaceCity(vendorCity);
      setState(() => _tab = 'MY_CITY');
    });
  }

  bool _isMyBid(RequirementModel req, String vendorId) {
    return _myBidAmount(req, vendorId) != null;
  }

  int? _myBidAmount(RequirementModel req, String vendorId) {
    if (vendorId.isEmpty) return null;
    for (final b in req.bids) {
      if (b.providerId == vendorId) return b.amount;
    }
    return null;
  }

  int _segmentIndex(String cityFilter, String vendorCity) {
    if (_tab == 'MY_BIDS') return 2;
    if (vendorCity.isNotEmpty && _normCity(cityFilter) == _normCity(vendorCity)) return 1;
    return 0;
  }

  void _sortList(List<RequirementModel> list) {
    list.sort((a, b) {
      switch (_sort) {
        case 'CEILING':
          return b.maxAcceptableBid.compareTo(a.maxAcceptableBid);
        case 'BIDS':
          return b.liveBidsCount.compareTo(a.liveBidsCount);
        default:
          final ad = a.parsedEventDate?.millisecondsSinceEpoch ?? 1 << 30;
          final bd = b.parsedEventDate?.millisecondsSinceEpoch ?? 1 << 30;
          return ad.compareTo(bd);
      }
    });
  }

  void _openBid(RequirementModel req) {
    showAppBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => PlaceBidModal(requirement: req),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final reqProvider = context.watch<RequirementsProvider>();
    final vendorCity = _vendorCity(auth);
    final vendorId = auth.user?.id ?? '';

    final cityFilter = reqProvider.marketplaceCity;
    final openReqs = reqProvider.allRequirements
        .where((r) => r.status.toUpperCase() == 'OPEN')
        .toList();
    _maybeAutoCity(vendorCity, openReqs);

    final myCityReqs = vendorCity.isEmpty
        ? const <RequirementModel>[]
        : openReqs.where((r) => _normCity(r.city) == _normCity(vendorCity)).toList();
    final myBidReqs = openReqs.where((r) => _isMyBid(r, vendorId)).toList();

    final q = _search.text.trim().toLowerCase();
    final filtered = openReqs.where((req) {
      if (_tab == 'MY_BIDS') {
        if (!_isMyBid(req, vendorId)) return false;
      } else if (cityFilter != 'ALL' && _normCity(req.city) != _normCity(cityFilter)) {
        return false;
      }
      if (_category != 'ALL' && req.category != _category) return false;
      if (q.isNotEmpty) {
        final hay =
            '${req.title} ${req.description} ${req.city} ${req.area} ${req.occasion ?? ''} ${req.category}'
                .toLowerCase();
        if (!hay.contains(q)) return false;
      }
      return true;
    }).toList();
    _sortList(filtered);

    final scoped = openReqs.where((r) {
      if (_tab == 'MY_BIDS') return true;
      if (cityFilter == 'ALL') return true;
      return _normCity(r.city) == _normCity(cityFilter);
    }).toList();

    final categories = <String>{
      'ALL',
      ...scoped.map((r) => r.category).where((c) => c.trim().isNotEmpty),
    }.toList();

    final cityLabel = cityFilter == 'ALL' ? 'India' : cityFilter.split(',').first.trim();

    return PullRefresh(
      onRefresh: () => context.read<RequirementsProvider>().loadData(marketplace: true),
      child: ListView(
        controller: _scroll,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: ShellBottomInsets.listPadding(context),
        children: [
          const Text('Live leads', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppTheme.ink)),
          const SizedBox(height: 4),
          const Text(
            'Bid under the host ceiling. You keep 100% of your reverse bid.',
            style: TextStyle(fontSize: 13, color: AppTheme.slate500, height: 1.35),
          ),
          const SizedBox(height: 14),
          VendorSegmentBar(
            selectedIndex: _segmentIndex(cityFilter, vendorCity),
            items: [
              VendorSegmentItem(label: 'All', count: openReqs.length, icon: LucideIcons.globe),
              VendorSegmentItem(
                label: vendorCity.isEmpty ? 'City' : vendorCity,
                count: myCityReqs.length,
                icon: LucideIcons.mapPin,
              ),
              VendorSegmentItem(label: 'My bids', count: myBidReqs.length, icon: LucideIcons.gavel),
            ],
            onChanged: (index) {
              if (index == 2) {
                setState(() => _tab = 'MY_BIDS');
                return;
              }
              if (index == 1 && vendorCity.isNotEmpty) {
                context.read<RequirementsProvider>().setMarketplaceCity(vendorCity);
                setState(() => _tab = 'MY_CITY');
                return;
              }
              context.read<RequirementsProvider>().setMarketplaceCity('ALL');
              setState(() => _tab = 'ALL');
            },
          ),
          const SizedBox(height: 12),
          VendorSearchField(
            controller: _search,
            hint: 'Search event, area or occasion',
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                VendorChip(label: 'Event soon', selected: _sort == 'SOON', onTap: () => setState(() => _sort = 'SOON')),
                const SizedBox(width: 8),
                VendorChip(label: 'Highest ceiling', selected: _sort == 'CEILING', onTap: () => setState(() => _sort = 'CEILING')),
                const SizedBox(width: 8),
                VendorChip(label: 'Most bids', selected: _sort == 'BIDS', onTap: () => setState(() => _sort = 'BIDS')),
              ],
            ),
          ),
          if (categories.length > 1) ...[
            const SizedBox(height: 10),
            SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final cat = categories[index];
                  final count = cat == 'ALL'
                      ? scoped.length
                      : scoped.where((r) => r.category == cat).length;
                  return VendorChip(
                    label: cat == 'ALL' ? 'All services' : cat,
                    count: count,
                    selected: _category == cat,
                    selectedColor: cat == 'ALL' ? AppTheme.ink : vendorCategoryColor(cat),
                    onTap: () => setState(() => _category = cat),
                  );
                },
              ),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Text(
                _tab == 'MY_BIDS' ? 'Bids you placed' : 'Leads in $cityLabel',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.ink),
              ),
              const Spacer(),
              Text(
                '${filtered.length} open',
                style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.slate500, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (reqProvider.isLoading && openReqs.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 48),
              child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
            )
          else if (filtered.isEmpty)
            VendorEmptyState(
              icon: _tab == 'MY_BIDS' ? LucideIcons.gavel : LucideIcons.mapPin,
              title: _tab == 'MY_BIDS'
                  ? 'No bids placed yet'
                  : (cityFilter == 'ALL' ? 'No matching open leads' : 'No open leads in $cityFilter'),
              message: _tab == 'MY_BIDS'
                  ? 'Open a live lead and send a reverse bid under the host budget.'
                  : (openReqs.isEmpty
                      ? 'Pull to refresh. New host requests appear here instantly.'
                      : 'There are ${openReqs.length} open leads in other cities.'),
              actionLabel: _tab == 'MY_BIDS' || openReqs.isNotEmpty ? 'View all leads (${openReqs.length})' : null,
              onAction: openReqs.isEmpty
                  ? null
                  : () {
                      context.read<RequirementsProvider>().setMarketplaceCity('ALL');
                      setState(() {
                        _tab = 'ALL';
                        _category = 'ALL';
                        _search.clear();
                      });
                    },
            )
          else
            ...filtered.map(
              (req) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: RequirementCard(
                  requirement: req,
                  yourBid: _myBidAmount(req, vendorId),
                  onTap: () => _openBid(req),
                  actionText: _isMyBid(req, vendorId) ? 'Revise your bid' : 'Place reverse bid',
                ),
              ),
            ),
        ],
      ),
    );
  }
}
