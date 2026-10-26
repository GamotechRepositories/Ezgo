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
import '../../providers/requirements_provider.dart';
import '../../widgets/event_service_card.dart';
import '../../widgets/ezzygo_logo.dart';
import '../../widgets/image_poster_card.dart';
import '../../widgets/event_request_card.dart';
import '../../widgets/promo_ad_banner.dart';
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

    return ListView(
      controller: widget.scrollController,
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
    );
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
                          const Icon(LucideIcons.mapPin, size: 13, color: AppTheme.primary),
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
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('You have 3 active updates on your events & bids.'),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          const Icon(LucideIcons.bell, size: 18, color: AppTheme.textPrimary),
                          Positioned(
                            top: 8,
                            right: 8,
                            child: Container(
                              width: 7,
                              height: 7,
                              decoration: const BoxDecoration(
                                color: AppTheme.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
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
                      color: AppTheme.primary,
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
                  const SizedBox(height: 6),
                  Text(
                    'A vendor can win only by bidding at least 15% below your budget.',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF4B5563),
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
            color: AppTheme.primary,
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Popular Services', style: AppTheme.headingFont(fontSize: 18, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 2),
                    const Text(
                      'From weddings to festivals, pick your occasion',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: _openAllOccasions,
                child: const Text('View All', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.primary)),
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
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1EA),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.sparkles, size: 12, color: AppTheme.primary),
                  SizedBox(width: 5),
                  Text(
                    'SERVICES & RATES',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.6,
                      color: AppTheme.primary,
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: _openCatalog,
              child: const Row(
                children: [
                  Text('View All', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.primary)),
                  SizedBox(width: 2),
                  Icon(LucideIcons.arrowRight, size: 14, color: AppTheme.primary),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text('Event Services', style: AppTheme.headingFont(fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 4),
        const Text(
          'Typical market rates. Post once — vendors bid lower.',
          style: TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.35),
        ),
        const SizedBox(height: 14),
        ...cards.map(
          (service) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: EventServiceCard(
              service: service,
              onTap: () => _openService(service),
            ),
          ),
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
                'My Event Requests',
                style: AppTheme.headingFont(fontSize: 17, fontWeight: FontWeight.w800),
              ),
            ),
            if (requirements.isNotEmpty)
              GestureDetector(
                onTap: () => widget.onOpenMyEvents?.call(),
                child: const Text(
                  'View All',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.primary),
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
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.primary),
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
                const Icon(LucideIcons.clipboardList, size: 32, color: AppTheme.primary),
                const SizedBox(height: 10),
                const Text(
                  'No event requests yet',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Post a request with your budget. Vendors will bid at least 15% below it.',
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
                    child: const Text('Post Event Request', style: TextStyle(fontWeight: FontWeight.w800)),
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
                child: const Icon(LucideIcons.helpCircle, size: 16, color: AppTheme.primary),
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
              showModalBottomSheet(
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
                color: const Color(0xFFFFF5F5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Learn more about the 15% Discount Rule & Escrow',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.primary),
                  ),
                  SizedBox(width: 4),
                  Icon(LucideIcons.chevronRight, size: 14, color: AppTheme.primary),
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
                  color: AppTheme.primary,
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
                              color: AppTheme.primary,
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
      (
        LucideIcons.indianRupee,
        'At least 15% below your budget',
        'You can only pick a vendor whose price is 15% or more below the budget you set.',
      ),
      (
        LucideIcons.shield,
        'Money held until the event is done',
        'EzzyGo keeps your payment safe. The vendor gets paid only after you click "Event done".',
      ),
      (
        LucideIcons.rotateCcw,
        'Full refund if cancelled',
        'If a paid booking is cancelled, you get back everything you paid, including the EzzyGo fee.',
      ),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Why hosts use EzzyGo',
          style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primary, letterSpacing: 0.6),
        ),
        const SizedBox(height: 4),
        Text('Book with no risk', style: AppTheme.headingFont(fontSize: 20, fontWeight: FontWeight.w800)),
        const SizedBox(height: 4),
        const Text('Three simple promises on every booking.', style: TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
        const SizedBox(height: 14),
        ...items.map((item) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFFDE68A).withValues(alpha: 0.7)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: const BoxDecoration(color: AppTheme.primaryLight, shape: BoxShape.circle),
                    child: Icon(item.$1, size: 18, color: AppTheme.primary),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.$2, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                        const SizedBox(height: 4),
                        Text(item.$3, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.35)),
                      ],
                    ),
                  ),
                ],
              ),
            )),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PostRequirementScreen()));
            },
            child: const Text('Post your requirement'),
          ),
        ),
      ],
    );
  }

  Widget _buildFaqSection() {
    const faqs = [
      ('How does the 15% rule help me?', 'You set a budget when you post. Vendors can bid any price below it, but you can only pick a bid that is at least 15% below your budget. So every booking saves you at least 15%.'),
      ('How is my money kept safe?', 'When you pick a vendor, you pay their price plus a 10% EzzyGo fee. EzzyGo holds this money. The vendor is paid only after you click "Event done".'),
      ('When do I get the vendor\'s phone number?', 'Right after you pay. You can then call or WhatsApp the vendor directly.'),
      ('What if the booking is cancelled?', 'If a paid booking is cancelled, you get back everything you paid, including the EzzyGo fee. Your request opens again so you can pick another vendor.'),
      ('Do vendors pay a commission?', 'No. Vendors get 100% of their bid after the event. The only fee is the 10% the host pays on top.'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('GOT QUESTIONS?', style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primary, letterSpacing: 0.6)),
        const SizedBox(height: 4),
        Text('Frequently Asked Questions', style: AppTheme.headingFont(fontSize: 20, fontWeight: FontWeight.w800)),
        const SizedBox(height: 4),
        const Text(
          'Everything you need to know about the 15% discount rule, escrow safety, and booking flow.',
          style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 12),
        ...List.generate(faqs.length, (i) {
          final open = _expandedFaq == i;
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: open ? AppTheme.primary.withValues(alpha: 0.4) : AppTheme.borderSubtle),
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
                        Text((i + 1).toString().padLeft(2, '0'), style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w800)),
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
          'Celebrate Without Stress',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
        ),
        const SizedBox(height: 2),
        const Text(
          "India's 1st Event Reverse-Bidding Platform",
          style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 4),
        const Text(
          '100% Escrow Protected · Made with ❤️ for Celebrations',
          style: TextStyle(fontSize: 10, color: AppTheme.slate400),
        ),
      ],
    );
  }
}
