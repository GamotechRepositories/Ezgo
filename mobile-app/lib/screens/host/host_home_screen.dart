import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../data/event_services.dart';
import '../../data/occasion_cards.dart';
import '../../models/banner_model.dart';
import '../../models/requirement_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/banners_provider.dart';
import '../../providers/bookings_provider.dart';
import '../../providers/notifications_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/event_service_card.dart';
import '../../widgets/ezzygo_logo.dart';
import '../../widgets/image_poster_card.dart';
import '../../widgets/event_request_card.dart';
import '../../widgets/notification_bell.dart';
import '../../widgets/promo_ad_banner.dart';
import '../../widgets/pull_refresh.dart';
import '../../widgets/rule_explainer_sheet.dart';
import '../../widgets/shell_bottom_insets.dart';
import 'bids_comparison_screen.dart';
import 'occasion_catalog_screen.dart';
import 'post_requirement_screen.dart';
import 'service_catalog_screen.dart';
import 'service_detail_screen.dart';

class HostHomeScreen extends StatefulWidget {
  final ScrollController? scrollController;
  final VoidCallback? onScrollToFeed;
  final VoidCallback? onOpenCityPicker;
  final VoidCallback? onOpenMyEvents;

  const HostHomeScreen({
    super.key,
    this.scrollController,
    this.onScrollToFeed,
    this.onOpenCityPicker,
    this.onOpenMyEvents,
  });

  @override
  State<HostHomeScreen> createState() => HostHomeScreenState();
}

class HostHomeScreenState extends State<HostHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
  final GlobalKey _servicesKey = GlobalKey();
  String? _adsCity;

  void scrollToFeed() {
    if (widget.scrollController != null && widget.scrollController!.hasClients) {
      widget.scrollController!.animateTo(
        320,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }

  int? _expandedFaq;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final city = context.read<RequirementsProvider>().selectedCity;
    if (_adsCity != city) {
      _adsCity = city;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        context.read<BannersProvider>().loadForCity(city, force: true);
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _onAdAction(BannerModel ad) async {
    final url = ad.targetUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      final uri = Uri.tryParse(url);
      if (uri != null) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
      return;
    }
    if (url.startsWith('#')) {
      final target = _servicesKey.currentContext;
      if (target != null) {
        await Scrollable.ensureVisible(
          target,
          duration: const Duration(milliseconds: 450),
          curve: Curves.easeInOut,
        );
      }
      return;
    }
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PostRequirementScreen(initialCategory: ad.title),
      ),
    );
  }

  void _onOccasionTap(OccasionCard occ) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PostRequirementScreen(
          initialOccasion: occ.occasion,
          initialCity: context.read<RequirementsProvider>().selectedCity,
        ),
      ),
    );
  }

  void _openAllOccasions() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const OccasionCatalogScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final reqProvider = context.watch<RequirementsProvider>();
    final bannersProvider = context.watch<BannersProvider>();
    final auth = context.watch<AuthProvider>();
    final myRequirements = reqProvider.mine(auth.user?.id);

    return PullRefresh(
      onRefresh: _refreshHome,
      child: ListView(
      controller: widget.scrollController,
      physics: const AlwaysScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      children: [
        _buildImmersiveTopHero(reqProvider.selectedCity),
        PromoAdBanner(
          banners: bannersProvider.banners,
          currentCity: reqProvider.selectedCity,
          isLoading: bannersProvider.isLoading,
          onAction: _onAdAction,
        ),
        const SizedBox(height: 16),
        _buildPopularServicesSection(),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildEventServicesGrid(),
        ),
        const SizedBox(height: 24),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildActivitySection(myRequirements),
        ),
        const SizedBox(height: 24),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildLiveBiddingSection(myRequirements),
        ),
        const SizedBox(height: 24),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildPromisesSection(),
        ),

        const SizedBox(height: 24),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildFaqSection(),
        ),

        const SizedBox(height: 28),

        // 10. Clean App Branding Footer
        _buildFooterBranding(),

        SizedBox(height: ShellBottomInsets.of(context)),
      ],
    ),
    );
  }

  Future<void> _refreshHome() async {
    final auth = context.read<AuthProvider>();
    final reqs = context.read<RequirementsProvider>();
    await Future.wait([
      reqs.loadData(
        requesterId: auth.isHost ? auth.user?.id : null,
        marketplace: !auth.isHost,
      ),
      context.read<BookingsProvider>().loadData(),
      context.read<BannersProvider>().loadForCity(reqs.selectedCity, force: true),
      context.read<NotificationsProvider>().load(),
    ]);
  }

  void _openCreateEvent({String? category}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PostRequirementScreen(
          initialCategory: category,
          initialCity: context.read<RequirementsProvider>().selectedCity,
        ),
      ),
    );
  }

  void _openService(EventService service) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ServiceDetailScreen(service: service.detailMap),
      ),
    );
  }

  void _openCatalog({String? category}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ServiceCatalogScreen(initialCategory: category),
      ),
    );
  }

  Widget _buildImmersiveTopHero(String rawCity) {
    final displayCity = rawCity.split(',')[0].trim();
    final heroHeight = MediaQuery.sizeOf(context).height * 0.5;

    return Container(
      width: double.infinity,
      height: heroHeight,
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
        child: Stack(
          children: [
            Positioned.fill(
              child: Image.asset(
                'assets/images/hero_wedding_bg.jpg',
                fit: BoxFit.cover,
                alignment: Alignment.centerRight,
                filterQuality: FilterQuality.high,
                errorBuilder: (_, _, _) => Image.network(
                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.white.withValues(alpha: 0.95),
                      Colors.white.withValues(alpha: 0.85),
                      Colors.white.withValues(alpha: 0.30),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.28, 0.46, 0.68],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                ),
              ),
            ),
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.white.withValues(alpha: 0.85),
                      Colors.white.withValues(alpha: 0.30),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.15, 0.35],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),
            Positioned(
              top: 10,
              left: 16,
              right: 16,
              child: Row(
                children: [
                  const EzzyGoLogo(size: 24, isLight: false),
                  const SizedBox(width: 8),
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: widget.onOpenCityPicker,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(LucideIcons.mapPin, size: 13, color: AppTheme.ink),
                          const SizedBox(width: 4),
                          Text(
                            displayCity.isEmpty ? 'Pune' : displayCity,
                            style: const TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 3),
                          const Icon(LucideIcons.chevronDown, size: 12, color: AppTheme.slate600),
                        ],
                      ),
                    ),
                  ),
                  const Spacer(),
                  const NotificationBellButton(),
                ],
              ),
            ),
            Positioned(
              left: 20,
              right: 20,
              bottom: 22,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.ink,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'REVERSE BIDDING',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 0.7,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Post your budget.\nVendors bid lower.',
                    style: GoogleFonts.poppins(
                      fontSize: 22.5,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF111827),
                      height: 1.15,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'You pick the best one.',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      InkWell(
                        onTap: () => _openCreateEvent(),
                        borderRadius: BorderRadius.circular(24),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8.5),
                          decoration: BoxDecoration(
                            color: AppTheme.primary,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primary.withValues(alpha: 0.35),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Post Requirement',
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(LucideIcons.arrowRight, size: 15, color: Colors.white),
                            ],
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE5E7EB)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 4,
                              offset: const Offset(0, 1),
                            ),
                          ],
                        ),
                        child: const Text(
                          '1/3',
                          style: TextStyle(
                            color: Color(0xFF1F2937),
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 2. Search Bar
  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: TextField(
        controller: _searchController,
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const ServiceCatalogScreen()),
          );
        },
        readOnly: true,
        decoration: InputDecoration(
          hintText: 'Search services, vendors, or occasions...',
          hintStyle: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
          prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppTheme.textSecondary),
          suffixIcon: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.slate100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(LucideIcons.slidersHorizontal, size: 16, color: AppTheme.textPrimary),
          ),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 14),
        ),
      ),
    );
  }

  Widget _buildOccasionCarousel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'FOR EVERY OCCASION',
          style: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: AppTheme.ink,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Find the Right Professionals',
          style: AppTheme.headingFont(fontSize: 20, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 4),
        const Text(
          'From weddings to festivals, get the best deals from trusted local professionals.',
          style: TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.35),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 200,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: OccasionCards.all.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final occ = OccasionCards.all[index];
              return GestureDetector(
                onTap: () => _onOccasionTap(occ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: SizedBox(
                    width: 148,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.asset(
                          occ.image,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => Container(color: AppTheme.primaryLight),
                        ),
                        DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withValues(alpha: 0.05),
                                Colors.black.withValues(alpha: 0.65),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          left: 12,
                          right: 12,
                          bottom: 12,
                          child: Text(
                            occ.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPopularServicesSection() {
    return Column(
      key: _servicesKey,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Expanded(
                child: Text('Popular Services', style: AppTheme.headingFont(fontSize: 18, fontWeight: FontWeight.w800)),
              ),
              GestureDetector(
                onTap: _openAllOccasions,
                  child: const Text('View All', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.ink)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 268,
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            scrollDirection: Axis.horizontal,
            itemCount: OccasionCards.all.length,
            separatorBuilder: (_, _) => const SizedBox(width: 14),
            itemBuilder: (context, i) {
              final occ = OccasionCards.all[i];
              return ImagePosterCard(
                title: occ.name,
                asset: occ.image,
                iconWidget: occ.iconWidget,
                width: 176,
                onTap: () => _onOccasionTap(occ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEventServicesGrid() {
    final cards = EventServices.all;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text('Event Services', style: AppTheme.headingFont(fontSize: 18, fontWeight: FontWeight.w800)),
            ),
            GestureDetector(
              onTap: _openCatalog,
              child: const Text('View All', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.ink)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: cards.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            mainAxisExtent: 218,
          ),
          itemBuilder: (context, index) {
            final service = cards[index];
            return EventServiceCard(
              service: service,
              compact: true,
              onTap: () => _openService(service),
            );
          },
        ),
      ],
    );
  }

  Widget _buildActivitySection(List<RequirementModel> requirements) {
    final recentReqs = requirements.take(3).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'My Events',
                style: AppTheme.headingFont(fontSize: 17, fontWeight: FontWeight.w800),
              ),
            ),
            if (requirements.isNotEmpty)
              GestureDetector(
                onTap: () => widget.onOpenMyEvents?.call(),
                child: const Text(
                  'View All',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.ink),
                ),
              ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
                );
              },
              child: const Text(
                '+ New',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.ink),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (recentReqs.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              children: [
                const Icon(LucideIcons.clipboardList, size: 32, color: AppTheme.ink),
                const SizedBox(height: 10),
                const Text(
                  'No events yet',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Post your budget. Vendors bid lower.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppTheme.slate500, height: 1.35),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Post Event', style: TextStyle(fontWeight: FontWeight.w800)),
                  ),
                ),
              ],
            ),
          )
        else
          ...recentReqs.map((req) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: EventRequestCard(
                  requirement: req,
                  compact: true,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => BidsComparisonScreen(requirement: req)),
                    );
                  },
                ),
              )),
      ],
    );
  }

  Widget _buildLiveBiddingSection(List<RequirementModel> requirements) {
    final live = requirements.where((r) => r.isOpen).toList()
      ..sort((a, b) {
        final bidCmp = b.liveBidsCount.compareTo(a.liveBidsCount);
        if (bidCmp != 0) return bidCmp;
        return (b.lowestBid ?? 0).compareTo(a.lowestBid ?? 0);
      });
    final show = live.take(3).toList();
    final liveCount = live.where((r) => r.hasBids).length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const _LivePulseDot(),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Live Bidding',
                style: AppTheme.headingFont(fontSize: 17, fontWeight: FontWeight.w800),
              ),
            ),
            if (liveCount > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.tealLight,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '$liveCount live',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.teal),
                ),
              ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: () => widget.onOpenMyEvents?.call(),
              child: const Text(
                'View All',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.ink),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (show.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppTheme.tealLight,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(LucideIcons.radio, size: 22, color: AppTheme.teal),
                ),
                const SizedBox(height: 10),
                const Text(
                  'No live bids yet',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Bids will show here after you post.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: AppTheme.slate500, height: 1.35),
                ),
              ],
            ),
          )
        else
          ...show.map((req) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _liveBidCard(req),
              )),
      ],
    );
  }

  Widget _liveBidCard(RequirementModel req) {
    final bids = req.liveBidsCount;
    final lowest = req.lowestBid;
    final savePct = lowest != null && req.budget > 0
        ? (((req.budget - lowest) / req.budget) * 100).round()
        : 0;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => BidsComparisonScreen(requirement: req)),
          );
        },
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: req.hasBids ? const Color(0xFFBBF0D2) : AppTheme.borderSubtle,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: req.hasBids ? const Color(0xFFE8F8F0) : AppTheme.primaryLight,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          req.hasBids ? LucideIcons.radio : LucideIcons.clock,
                          size: 11,
                          color: req.hasBids ? AppTheme.teal : AppTheme.primary,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          req.hasBids ? 'LIVE' : 'WAITING',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.4,
                            color: req.hasBids ? AppTheme.teal : AppTheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    bids > 0 ? '$bids vendor${bids == 1 ? '' : 's'} bidding' : 'Vendors notified',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.slate600),
                  ),
                  const Spacer(),
                  const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate400),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                req.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary,
                  height: 1.25,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${req.category} · ${req.displayDate} · ${req.displayPlace}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppTheme.slate50,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Your budget',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate500),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            formatCurrency.format(req.budget),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F8F0),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFBBF0D2)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Lowest bid',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.teal),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            lowest != null ? formatCurrency.format(lowest) : 'No bids yet',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.emerald),
                          ),
                          if (lowest != null)
                            Text(
                              '$savePct% lower',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.emerald),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 42,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => BidsComparisonScreen(requirement: req)),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: req.hasBids ? AppTheme.primary : AppTheme.ink,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    req.hasBids ? 'See bids ($bids)' : 'View request',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 5. Interactive "How Reverse-Bidding Works" Banner
  Widget _buildHowReverseBiddingWorks() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderSubtle),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.redLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(LucideIcons.helpCircle, size: 16, color: AppTheme.ink),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'How Reverse-Bidding Works',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F8F0),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Save 15% - 30%',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF10B981)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildStepRow(
            number: '1',
            title: 'Post Event Requirement',
            desc: 'Choose services, date, venue city, and target budget in 60s.',
            color: const Color(0xFF2563EB),
          ),
          const SizedBox(height: 12),
          _buildStepRow(
            number: '2',
            title: 'Verified Vendors Bid Downward',
            desc: 'Top local vendors compete for your job by offering lower quotes.',
            color: const Color(0xFFD97706),
          ),
          const SizedBox(height: 12),
          _buildStepRow(
            number: '3',
            title: '100% Escrow Protection',
            desc: 'Advance is held safely with EzzyGo. Released only after event completion.',
            color: const Color(0xFF10B981),
            isLast: true,
          ),
          const SizedBox(height: 14),
          InkWell(
            onTap: () {
              showAppBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => const RuleExplainerSheet(),
              );
            },
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 10),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppTheme.slate100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Learn more about the 15% Discount Rule & Escrow',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.ink),
                  ),
                  SizedBox(width: 4),
                  Icon(LucideIcons.chevronRight, size: 14, color: AppTheme.ink),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepRow({
    required String number,
    required String title,
    required String desc,
    required Color color,
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            shape: BoxShape.circle,
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          alignment: Alignment.center,
          child: Text(
            number,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: color),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, height: 1.3),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // 6. Explore All Categories (2-Column Grid)
  Widget _buildAllCategoriesGrid() {
    final categories = [
      {
        'title': 'Catering & Food',
        'price': 'From ₹300 / plate',
        'asset': 'assets/images/service_catering.jpg',
      },
      {
        'title': 'Photography & Film',
        'price': 'From ₹5,000 / day',
        'asset': 'assets/images/occasion_parties.jpg',
      },
      {
        'title': 'Mandap & Decoration',
        'price': 'From ₹10,000',
        'asset': 'assets/images/occasion_weddings.jpg',
      },
      {
        'title': 'Banquet & Lawns',
        'price': 'From ₹20,000',
        'asset': 'assets/images/occasion_corporate.jpg',
      },
      {
        'title': 'DJ, Sound & Lights',
        'price': 'From ₹8,000',
        'asset': 'assets/images/occasion_festivals.jpg',
      },
      {
        'title': 'Bridal & Makeup',
        'price': 'From ₹3,000',
        'asset': 'assets/images/occasion_birthdays.jpg',
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Explore All Categories',
              style: AppTheme.headingFont(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ServiceCatalogScreen()),
                );
              },
              child: const Text(
                'View All',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.ink,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: categories.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.15,
          ),
          itemBuilder: (context, index) {
            final cat = categories[index];
            return GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ServiceCatalogScreen(
                      initialCategory: cat['title'] as String,
                    ),
                  ),
                );
              },
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderSubtle),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.asset(
                              cat['asset'] as String,
                              fit: BoxFit.cover,
                              filterQuality: FilterQuality.high,
                            ),
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.transparent,
                                    Colors.black.withValues(alpha: 0.40),
                                  ],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            cat['title'] as String,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            cat['price'] as String,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.teal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildPromisesSection() {
    const items = [
      (LucideIcons.indianRupee, '15% below your budget'),
      (LucideIcons.shield, 'Pay held until event done'),
      (LucideIcons.rotateCcw, 'Full refund if cancelled'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Why EzzyGo', style: AppTheme.headingFont(fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 12),
        ...items.map((item) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: const BoxDecoration(color: AppTheme.tealLight, shape: BoxShape.circle),
                    child: Icon(item.$1, size: 16, color: AppTheme.teal),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(item.$2, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                  ),
                ],
              ),
            )),
      ],
    );
  }

  Widget _buildFaqSection() {
    const faqs = [
      ('How does the 15% rule work?', 'You can only accept a bid that is at least 15% below your budget.'),
      ('Is my payment safe?', 'EzzyGo holds the money. The vendor is paid after you tap Event done.'),
      ('When do I get the vendor number?', 'Right after you pay.'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('FAQ', style: AppTheme.headingFont(fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 12),
        ...List.generate(faqs.length, (i) {
          final open = _expandedFaq == i;
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: open ? AppTheme.ink.withValues(alpha: 0.35) : AppTheme.borderSubtle),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => setState(() => _expandedFaq = open ? null : i),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text((i + 1).toString().padLeft(2, '0'), style: const TextStyle(color: AppTheme.ink, fontWeight: FontWeight.w800)),
                        const SizedBox(width: 10),
                        Expanded(child: Text(faqs[i].$1, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
                        Icon(open ? LucideIcons.chevronUp : LucideIcons.chevronDown, size: 16, color: AppTheme.slate500),
                      ],
                    ),
                    if (open) ...[
                      const SizedBox(height: 8),
                      Text(faqs[i].$2, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4)),
                    ],
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  // 10. Clean App Branding Footer
  Widget _buildFooterBranding() {
    return Column(
      children: [
        const EzzyGoLogo(size: 28),
        const SizedBox(height: 6),
        const Text(
          'Celebrate without stress',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
        ),
      ],
    );
  }
}

class _LivePulseDot extends StatefulWidget {
  const _LivePulseDot();

  @override
  State<_LivePulseDot> createState() => _LivePulseDotState();
}

class _LivePulseDotState extends State<_LivePulseDot> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1100))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: Tween<double>(begin: 0.85, end: 1.15).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
      ),
      child: Container(
        width: 9,
        height: 9,
        decoration: const BoxDecoration(
          color: Color(0xFF10B981),
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
