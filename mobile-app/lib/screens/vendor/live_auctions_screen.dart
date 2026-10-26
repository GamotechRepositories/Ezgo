import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/requirement_card.dart';
import '../../widgets/shell_bottom_insets.dart';
import 'place_bid_modal.dart';

const _kCities = [
  'Pune',
  'Mumbai',
  'Hyderabad',
  'Bengaluru',
  'Delhi NCR',
  'Nagpur',
  'Goa',
  'Jaipur',
];

class LiveAuctionsScreen extends StatefulWidget {
  const LiveAuctionsScreen({super.key});

  @override
  State<LiveAuctionsScreen> createState() => _LiveAuctionsScreenState();
}

class _LiveAuctionsScreenState extends State<LiveAuctionsScreen> {
  final _search = TextEditingController();
  String _tab = 'ALL';
  String _city = 'ALL';
  String _category = 'ALL';
  bool _autoCityDone = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RequirementsProvider>().loadData(marketplace: true);
    });
  }

  @override
  void dispose() {
    _search.dispose();
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
    if (!hasLocal) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      setState(() {
        _city = vendorCity;
        _tab = 'MY_CITY';
      });
    });
  }

  bool _isMyBid(RequirementModel req, String vendorId) {
    if (vendorId.isEmpty) return false;
    return req.bids.any((b) => b.providerId == vendorId);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final reqProvider = context.watch<RequirementsProvider>();
    final vendorCity = _vendorCity(auth);
    final vendorId = auth.user?.id ?? '';

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
      if (_tab == 'MY_CITY' && _normCity(req.city) != _normCity(vendorCity)) {
        return false;
      }
      if (_tab == 'MY_BIDS' && !_isMyBid(req, vendorId)) return false;
      if (_city != 'ALL' && _normCity(req.city) != _normCity(_city)) return false;
      if (_category != 'ALL' && req.category != _category) return false;
      if (q.isNotEmpty) {
        final hay = '${req.title} ${req.description} ${req.city} ${req.area} ${req.occasion ?? ''} ${req.category}'
            .toLowerCase();
        if (!hay.contains(q)) return false;
      }
      return true;
    }).toList();

    final scoped = openReqs.where((r) {
      if (_city == 'ALL') return true;
      return _normCity(r.city) == _normCity(_city);
    }).toList();
    final categories = <String>{
      'ALL',
      ...scoped.map((r) => r.category).where((c) => c.trim().isNotEmpty),
    }.toList();

    final cityChips = <String>{
      'ALL',
      if (vendorCity.isNotEmpty) vendorCity,
      ..._kCities,
      ...openReqs.map((r) => r.city).where((c) => c.trim().isNotEmpty),
    }.toList();
    final seen = <String>{};
    final uniqueCities = cityChips.where((c) {
      final key = c == 'ALL' ? 'ALL' : _normCity(c);
      if (seen.contains(key)) return false;
      seen.add(key);
      return true;
    }).toList();

    return RefreshIndicator(
      color: AppTheme.primary,
      onRefresh: () => context.read<RequirementsProvider>().loadData(marketplace: true),
      child: ListView(
        padding: ShellBottomInsets.listPadding(context),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.slate200),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.flame, color: AppTheme.primary, size: 18),
                    SizedBox(width: 8),
                    Text('How to win jobs', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  ],
                ),
                SizedBox(height: 6),
                Text(
                  'Bid at or below the "Bid Up To" ceiling. Host picks a bid and EzzyGo holds 100% payment in escrow.',
                  style: TextStyle(fontSize: 13, color: AppTheme.slate600, height: 1.3),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _FilterTab(
                label: 'All Open Leads',
                count: openReqs.length,
                selected: _tab == 'ALL',
                selectedColor: AppTheme.slate900,
                onTap: () => setState(() {
                  _tab = 'ALL';
                  _city = 'ALL';
                }),
              ),
              if (vendorCity.isNotEmpty)
                _FilterTab(
                  label: 'In $vendorCity',
                  count: myCityReqs.length,
                  selected: _tab == 'MY_CITY',
                  selectedColor: AppTheme.primary,
                  icon: LucideIcons.mapPin,
                  onTap: () => setState(() {
                    _tab = 'MY_CITY';
                    _city = vendorCity;
                  }),
                ),
              _FilterTab(
                label: 'My Placed Bids',
                count: myBidReqs.length,
                selected: _tab == 'MY_BIDS',
                selectedColor: const Color(0xFF2563EB),
                onTap: () => setState(() => _tab = 'MY_BIDS'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _search,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Search by event title, area, city or occasion',
              hintStyle: const TextStyle(fontSize: 13, color: AppTheme.slate400),
              prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppTheme.slate400),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(999),
                borderSide: const BorderSide(color: AppTheme.slate200),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(999),
                borderSide: const BorderSide(color: AppTheme.slate200),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(999),
                borderSide: const BorderSide(color: AppTheme.primary),
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: uniqueCities.length + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return const Row(
                    children: [
                      Icon(LucideIcons.mapPin, size: 14, color: AppTheme.primary),
                      SizedBox(width: 4),
                      Text('City:', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppTheme.slate500)),
                    ],
                  );
                }
                final city = uniqueCities[index - 1];
                final selected = city == 'ALL'
                    ? _city == 'ALL'
                    : _normCity(city) == _normCity(_city);
                final isMine = vendorCity.isNotEmpty &&
                    city != 'ALL' &&
                    _normCity(city) == _normCity(vendorCity);
                return _Chip(
                  label: city == 'ALL' ? 'All Cities' : city,
                  badge: isMine ? 'MY CITY' : null,
                  selected: selected,
                  onTap: () => setState(() {
                    _city = city;
                    if (isMine) {
                      _tab = 'MY_CITY';
                    } else if (city == 'ALL') {
                      _tab = 'ALL';
                    } else if (_tab == 'MY_CITY') {
                      _tab = 'ALL';
                    }
                  }),
                );
              },
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = categories[index];
                final count = cat == 'ALL'
                    ? scoped.length
                    : scoped.where((r) => r.category == cat).length;
                return _Chip(
                  label: cat == 'ALL' ? 'All Categories' : cat,
                  count: count,
                  selected: _category == cat,
                  dark: true,
                  onTap: () => setState(() => _category = cat),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Live Reverse Auctions',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.slate900),
              ),
              Text(
                '${filtered.length} Open',
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
            _EmptyLeads(
              city: _city == 'ALL' ? null : _city,
              openCount: openReqs.length,
              onShowAll: () => setState(() {
                _tab = 'ALL';
                _city = 'ALL';
                _category = 'ALL';
                _search.clear();
              }),
            )
          else
            ...filtered.map(
              (req) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: RequirementCard(
                  requirement: req,
                  onTap: () {
                    showAppBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => PlaceBidModal(requirement: req),
                    );
                  },
                  actionText: 'Place Reverse Bid',
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _FilterTab extends StatelessWidget {
  final String label;
  final int count;
  final bool selected;
  final Color selectedColor;
  final IconData? icon;
  final VoidCallback onTap;

  const _FilterTab({
    required this.label,
    required this.count,
    required this.selected,
    required this.selectedColor,
    required this.onTap,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? selectedColor : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: selected ? null : Border.all(color: AppTheme.slate200),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: selected ? Colors.white : AppTheme.slate600),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: selected ? Colors.white : AppTheme.slate700,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: selected ? Colors.white.withValues(alpha: 0.2) : AppTheme.slate100,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: selected ? Colors.white : AppTheme.slate600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final String? badge;
  final int? count;
  final bool selected;
  final bool dark;
  final VoidCallback onTap;

  const _Chip({
    required this.label,
    required this.selected,
    required this.onTap,
    this.badge,
    this.count,
    this.dark = false,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = dark ? AppTheme.slate900 : AppTheme.primary;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? activeColor : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: selected ? null : Border.all(color: AppTheme.slate200),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: selected ? Colors.white : AppTheme.slate700,
              ),
            ),
            if (badge != null) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: selected ? Colors.white.withValues(alpha: 0.2) : const Color(0xFFFFEDD5),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  badge!,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: selected ? Colors.white : AppTheme.primary,
                  ),
                ),
              ),
            ],
            if (count != null) ...[
              const SizedBox(width: 6),
              Text(
                '$count',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: selected ? Colors.white : AppTheme.slate500,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _EmptyLeads extends StatelessWidget {
  final String? city;
  final int openCount;
  final VoidCallback onShowAll;

  const _EmptyLeads({
    required this.city,
    required this.openCount,
    required this.onShowAll,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Column(
        children: [
          const Icon(LucideIcons.mapPin, size: 32, color: AppTheme.primary),
          const SizedBox(height: 12),
          Text(
            city != null ? 'No open requests in $city right now' : 'No matching open requests right now',
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.slate900),
          ),
          const SizedBox(height: 8),
          Text(
            city != null
                ? 'There are $openCount open leads in other cities. Switch to All Cities to bid.'
                : 'Pull to refresh, or post a host request to fill the marketplace.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: AppTheme.slate500, height: 1.35),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onShowAll,
            child: Text(city != null ? 'View All Leads Across India ($openCount)' : 'Reset Filters'),
          ),
        ],
      ),
    );
  }
}
