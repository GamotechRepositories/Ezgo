import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bookings_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/pull_refresh.dart';
import '../../widgets/requirement_card.dart';
import '../../widgets/shell_bottom_insets.dart';
import '../../widgets/tab_scroll_registry.dart';
import '../../widgets/vendor_ui.dart';
import 'place_bid_modal.dart';

class VendorDashboardScreen extends StatefulWidget {
  final VoidCallback? onOpenLeads;
  final VoidCallback? onOpenJobs;
  final VoidCallback? onOpenCalendar;
  final VoidCallback? onOpenProfile;

  const VendorDashboardScreen({
    super.key,
    this.onOpenLeads,
    this.onOpenJobs,
    this.onOpenCalendar,
    this.onOpenProfile,
  });

  @override
  State<VendorDashboardScreen> createState() => _VendorDashboardScreenState();
}

class _VendorDashboardScreenState extends State<VendorDashboardScreen> {
  final ScrollController _scroll = ScrollController();
  static final _pretty = DateFormat('EEE, d MMM');

  @override
  void initState() {
    super.initState();
    TabScrollRegistry.instance.register(0, _scroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      context.read<RequirementsProvider>().loadData(marketplace: true);
      if (auth.isLoggedIn) context.read<BookingsProvider>().loadData();
    });
  }

  @override
  void dispose() {
    TabScrollRegistry.instance.unregister(0, _scroll);
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

  String _displayName(AuthProvider auth) {
    final business = auth.user?.businessName?.trim() ?? '';
    if (business.isNotEmpty) return business;
    final name = auth.user?.name.trim() ?? '';
    if (name.isNotEmpty) return name;
    return 'Partner';
  }

  bool _isDone(BookingModel b) {
    final s = b.status.toUpperCase();
    return s == 'COMPLETED' || s == 'PAYOUT_RELEASED';
  }

  String _fmtDate(String raw) {
    final parsed = DateTime.tryParse(raw) ??
        DateTime.tryParse(raw.length >= 10 ? raw.substring(0, 10) : raw);
    if (parsed == null) return raw.isEmpty ? 'Date TBA' : raw;
    return _pretty.format(parsed.toLocal());
  }

  Future<void> _refresh() async {
    final auth = context.read<AuthProvider>();
    await Future.wait([
      context.read<RequirementsProvider>().loadData(marketplace: true),
      if (auth.isLoggedIn) context.read<BookingsProvider>().loadData(),
      auth.ensureSession(),
    ]);
  }

  int? _bidOf(RequirementModel req, String vendorId) {
    for (final b in req.bids) {
      if (b.providerId == vendorId) return b.amount;
    }
    return null;
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
    final reqs = context.watch<RequirementsProvider>();
    final bookings = context.watch<BookingsProvider>().bookings;
    final vendorCity = _vendorCity(auth);
    final vendorId = auth.user?.id ?? '';
    final cityFilter = reqs.marketplaceCity == 'ALL' && vendorCity.isNotEmpty ? vendorCity : reqs.marketplaceCity;

    final open = reqs.allRequirements.where((r) => r.status.toUpperCase() == 'OPEN').toList();
    final cityLeads = vendorCity.isEmpty
        ? open
        : open.where((r) => _normCity(r.city) == _normCity(vendorCity)).toList();
    final myBids = vendorId.isEmpty
        ? const <RequirementModel>[]
        : open.where((r) => r.bids.any((b) => b.providerId == vendorId)).toList();
    cityLeads.sort((a, b) {
      final ad = a.parsedEventDate?.millisecondsSinceEpoch ?? 1 << 30;
      final bd = b.parsedEventDate?.millisecondsSinceEpoch ?? 1 << 30;
      return ad.compareTo(bd);
    });

    final waiting = bookings.where((b) => b.status.toUpperCase() == 'AWAITING_PAYMENT').toList();
    final live = bookings.where((b) => b.status.toUpperCase() == 'ACTIVE').toList();
    final done = bookings.where(_isDone).toList();
    int sum(Iterable<BookingModel> items) => items.fold<int>(0, (s, b) => s + b.bidAmount);
    final pipeline = sum([...waiting, ...live]);
    final earned = sum(done);
    final upcoming = [...live, ...waiting]..sort((a, b) => a.eventDate.compareTo(b.eventDate));
    final nextJob = upcoming.isEmpty ? null : upcoming.first;
    final blocked = (auth.user?.unavailableDates ?? const [])
        .where((d) => d.date.compareTo(DateFormat('yyyy-MM-dd').format(DateTime.now())) >= 0)
        .length;
    final verified = auth.user?.isVerified == true;
    final cityLabel = vendorCity.isEmpty
        ? (cityFilter == 'ALL' ? 'India' : cityFilter)
        : vendorCity;

    return PullRefresh(
      onRefresh: _refresh,
      child: ListView(
        controller: _scroll,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: ShellBottomInsets.listPadding(context),
        children: [
          VendorInkHero(
            eyebrow: verified ? 'Verified partner desk' : 'Partner desk',
            title: '${vendorGreeting()},\n${_displayName(auth)}',
            subtitle: 'Bid 15% below host budget. You receive 100% of your bid after the event.',
            stats: [
              VendorHeroStat(value: VendorMoney.of(pipeline), label: 'In pipeline'),
              VendorHeroStat(value: VendorMoney.of(earned), label: 'Earned'),
              VendorHeroStat(value: '${live.length}', label: 'Live jobs'),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _pulse('${open.length}', 'Open leads', AppTheme.primary, widget.onOpenLeads),
              const SizedBox(width: 8),
              _pulse('${cityLeads.length}', cityLabel, AppTheme.teal, widget.onOpenLeads),
              const SizedBox(width: 8),
              _pulse('${waiting.length}', 'Waiting pay', AppTheme.amber, widget.onOpenJobs),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Quick actions', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.ink)),
          const SizedBox(height: 10),
          Row(
            children: [
              _action(LucideIcons.flame, 'Leads', widget.onOpenLeads),
              const SizedBox(width: 8),
              _action(LucideIcons.briefcase, 'Jobs', widget.onOpenJobs),
              const SizedBox(width: 8),
              _action(LucideIcons.calendar, 'Calendar', widget.onOpenCalendar),
              const SizedBox(width: 8),
              _action(LucideIcons.userRound, 'Profile', widget.onOpenProfile),
            ],
          ),
          if (!verified || waiting.isNotEmpty) ...[
            const SizedBox(height: 16),
            if (!verified)
              _notice(
                icon: LucideIcons.shield,
                color: AppTheme.amber,
                title: 'Complete verification',
                body: 'Verified partners get accepted faster. Open Profile to start KYC.',
                onTap: widget.onOpenProfile,
              ),
            if (!verified && waiting.isNotEmpty) const SizedBox(height: 8),
            if (waiting.isNotEmpty)
              _notice(
                icon: LucideIcons.clock,
                color: AppTheme.amber,
                title: '${waiting.length} job${waiting.length == 1 ? '' : 's'} waiting for host payment',
                body: 'Host contact unlocks after escrow. Track them in My jobs.',
                onTap: widget.onOpenJobs,
              ),
          ],
          const SizedBox(height: 18),
          _section('Next job', 'Open jobs', widget.onOpenJobs),
          const SizedBox(height: 10),
          if (nextJob == null)
            VendorEmptyState(
              icon: LucideIcons.briefcase,
              title: 'No accepted jobs yet',
              message: 'When a host picks your reverse bid, it shows here with the event date and payout.',
              actionLabel: 'Bid on live leads',
              onAction: widget.onOpenLeads,
            )
          else
            _nextJobCard(nextJob),
          const SizedBox(height: 18),
          _section('Hot leads in $cityLabel', 'See all', widget.onOpenLeads),
          const SizedBox(height: 10),
          if (cityLeads.isEmpty)
            VendorEmptyState(
              icon: LucideIcons.flame,
              title: 'No open leads in $cityLabel',
              message: 'Switch city from the header, or open All leads to bid across India.',
              actionLabel: 'Browse all leads',
              onAction: widget.onOpenLeads,
            )
          else
            ...cityLeads.take(3).map(
                  (req) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: RequirementCard(
                      compact: true,
                      requirement: req,
                      yourBid: _bidOf(req, vendorId),
                      onTap: () => _openBid(req),
                    ),
                  ),
                ),
          if (myBids.isNotEmpty) ...[
            const SizedBox(height: 10),
            _section('Your live bids', '${myBids.length}', widget.onOpenLeads),
            const SizedBox(height: 10),
            ...myBids.take(3).map(
                  (req) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: RequirementCard(
                      compact: true,
                      requirement: req,
                      yourBid: _bidOf(req, vendorId),
                      onTap: () => _openBid(req),
                    ),
                  ),
                ),
          ],
          const SizedBox(height: 18),
          VendorSurface(
            onTap: widget.onOpenCalendar,
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: AppTheme.tealLight, borderRadius: BorderRadius.circular(14)),
                  child: const Icon(LucideIcons.calendarCheck, color: AppTheme.teal, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Availability', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                      Text(
                        blocked == 0
                            ? 'You are open for bids on upcoming dates.'
                            : '$blocked blocked date${blocked == 1 ? '' : 's'} coming up.',
                        style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate400),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _pulse(String value, String label, Color color, VoidCallback? onTap) {
    return Expanded(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Ink(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              children: [
                Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: color)),
                const SizedBox(height: 2),
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.slate500),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _action(IconData icon, String label, VoidCallback? onTap) {
    return Expanded(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              children: [
                Icon(icon, size: 18, color: AppTheme.ink),
                const SizedBox(height: 6),
                Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.ink)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _section(String title, String action, VoidCallback? onTap) {
    return Row(
      children: [
        Expanded(
          child: Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.ink)),
        ),
        GestureDetector(
          onTap: onTap,
          child: Text(action, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppTheme.primary)),
        ),
      ],
    );
  }

  Widget _notice({
    required IconData icon,
    required Color color,
    required String title,
    required String body,
    VoidCallback? onTap,
  }) {
    return Material(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.ink)),
                    const SizedBox(height: 2),
                    Text(body, style: const TextStyle(fontSize: 12, color: AppTheme.slate600, height: 1.3)),
                  ],
                ),
              ),
              const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate400),
            ],
          ),
        ),
      ),
    );
  }

  Widget _nextJobCard(BookingModel b) {
    final paid = b.isEscrowPaid;
    return VendorSurface(
      onTap: widget.onOpenJobs,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              VendorStatusPill(
                label: paid ? 'Confirmed' : 'Waiting for pay',
                color: paid ? AppTheme.emerald : AppTheme.amber,
              ),
              const Spacer(),
              Text(
                VendorMoney.of(b.bidAmount),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.ink),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(b.requirementTitle, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(LucideIcons.calendar, size: 13, color: AppTheme.slate400),
              const SizedBox(width: 4),
              Text(_fmtDate(b.eventDate), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.slate600)),
              if (b.locationText.trim().isNotEmpty) ...[
                const SizedBox(width: 10),
                const Icon(LucideIcons.mapPin, size: 13, color: AppTheme.primary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    b.locationText,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, color: AppTheme.slate600),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          Text(
            paid ? 'Host contact is unlocked in My jobs.' : 'Host contact unlocks after they pay escrow.',
            style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
