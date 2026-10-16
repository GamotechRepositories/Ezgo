import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../models/requirement_model.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/ezzygo_logo.dart';
import '../../widgets/rule_explainer_sheet.dart';
import 'bids_comparison_screen.dart';
import 'post_requirement_screen.dart';
import 'service_catalog_screen.dart';

class HostHomeScreen extends StatefulWidget {
  final ScrollController? scrollController;
  final VoidCallback? onScrollToFeed;
  final VoidCallback? onOpenCityPicker;

  const HostHomeScreen({
    super.key,
    this.scrollController,
    this.onScrollToFeed,
    this.onOpenCityPicker,
  });

  @override
  State<HostHomeScreen> createState() => HostHomeScreenState();
}

class HostHomeScreenState extends State<HostHomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  void scrollToFeed() {
    if (widget.scrollController != null && widget.scrollController!.hasClients) {
      widget.scrollController!.animateTo(
        320,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }

  // Occasions with pastel tiles (Screen 3)
  final List<Map<String, dynamic>> _occasionShortcuts = [
    {
      'name': 'Wedding',
      'icon': LucideIcons.heartHandshake,
      'bg': Color(0xFFFFECEB),
      'color': Color(0xFFFF5148),
    },
    {
      'name': 'Sangeet',
      'icon': LucideIcons.music,
      'bg': Color(0xFFE8F4FD),
      'color': Color(0xFF2F80ED),
    },
    {
      'name': 'Birthday',
      'icon': LucideIcons.cake,
      'bg': Color(0xFFE8F8F0),
      'color': Color(0xFF27AE60),
    },
    {
      'name': 'Corporate',
      'icon': LucideIcons.briefcase,
      'bg': Color(0xFFF0ECFC),
      'color': Color(0xFF7B61FF),
    },
    {
      'name': 'More',
      'icon': LucideIcons.moreHorizontal,
      'bg': Color(0xFFFFF4E8),
      'color': Color(0xFFF2994A),
    },
  ];

  // Popular Services for horizontal scroll (Screen 3)
  final List<Map<String, dynamic>> _popularServices = [
    {
      'title': 'Catering',
      'price': 'From ₹300',
      'asset': 'assets/images/service_catering.jpg',
      'image': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&auto=format&fit=crop&q=80',
      'icon': LucideIcons.utensils,
      'color': const Color(0xFFEF4444),
    },
    {
      'title': 'Photography',
      'price': 'From ₹5,000',
      'asset': 'assets/images/occasion_parties.jpg',
      'image': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80',
      'icon': LucideIcons.camera,
      'color': const Color(0xFF3B82F6),
    },
    {
      'title': 'Decoration',
      'price': 'From ₹10,000',
      'asset': 'assets/images/occasion_weddings.jpg',
      'image': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
      'icon': LucideIcons.sparkles,
      'color': const Color(0xFFEC4899),
    },
    {
      'title': 'Venue',
      'price': 'From ₹20,000',
      'asset': 'assets/images/occasion_corporate.jpg',
      'image': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&auto=format&fit=crop&q=80',
      'icon': LucideIcons.building2,
      'color': const Color(0xFF8B5CF6),
    },
    {
      'title': 'Makeup Artist',
      'price': 'From ₹3,000',
      'asset': 'assets/images/occasion_birthdays.jpg',
      'image': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=80',
      'icon': LucideIcons.palette,
      'color': const Color(0xFFF59E0B),
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onOccasionTap(String occasion) {
    if (occasion == 'More') {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const ServiceCatalogScreen()),
      );
    } else {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => PostRequirementScreen(
            initialCategory: occasion == 'Wedding' ? 'Decoration & Stage Setup' : null,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final reqProvider = context.watch<RequirementsProvider>();
    final myRequirements = reqProvider.requirements;

    return ListView(
      controller: widget.scrollController,
      padding: EdgeInsets.zero,
      children: [
        // 1. Immersive Full-Bleed Top Hero Header (Reaches all the way to top edge of screen)
        _buildImmersiveTopHero(reqProvider.selectedCity),

        const SizedBox(height: 16),

        // 2. Occasion Shortcuts (Directly beneath hero, matching Screen 3 Mockup)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildOccasionShortcuts(),
        ),

        const SizedBox(height: 18),

        // 3. Popular Services Section (Matching Screen 3 Mockup)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildPopularServicesSection(),
        ),

        const SizedBox(height: 20),

        // 4. Quick Search Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildSearchBar(),
        ),

        const SizedBox(height: 24),

        // 5. Interactive "How Reverse-Bidding Works" Banner
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildHowReverseBiddingWorks(),
        ),

        const SizedBox(height: 24),

        // 6. Explore All Categories (2-Column Grid)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildAllCategoriesGrid(),
        ),

        const SizedBox(height: 24),

        // 7. Activity / My Event Requests (Screen 3)
        if (myRequirements.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _buildActivitySection(myRequirements),
          ),
          const SizedBox(height: 24),
        ],

        // 8. EzzyGo Trust & Escrow Guarantee
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildTrustAndAssuranceSection(),
        ),

        const SizedBox(height: 24),

        // 9. Real Host Testimonials & Reviews
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildHostTestimonialsCard(),
        ),

        const SizedBox(height: 28),

        // 10. Clean App Branding Footer
        _buildFooterBranding(),

        // 11. Proper Bottom Clearance for Floating Navigation Bar
        const SizedBox(height: 100),
      ],
    );
  }

  // 1. Full-Bleed Top Hero Header (No Box, Extends to Top Edge of Screen)
  Widget _buildImmersiveTopHero(String rawCity) {
    final topPadding = MediaQuery.of(context).padding.top;
    final displayCity = rawCity.split(',')[0].trim();
    // Taller, expansive hero header so the 4K palace mandap is prominently showcased
    final heroHeight = 350.0 + topPadding;

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
            // 4K Background Image Extending to Top Edge, Mandap on Right
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

            // Light Theme Horizontal Gradient: Focused white on left for text legibility, transparent on right for full 4K clarity
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

            // Light Theme Top Sky Vignette to ensure status bar & top navigation are crystal clear
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

            // Integrated Top Bar (EzzyGo Logo, City Picker Pill, Notification Bell)
            Positioned(
              top: topPadding + 6,
              left: 16,
              right: 16,
              child: Row(
                children: [
                  // Official EzzyGo Branding in Dark Serif with Coral Monogram (Light Theme)
                  const EzzyGoLogo(size: 24, isLight: false),
                  const SizedBox(width: 8),

                  // City Selector Dropdown Pill matching Screen 3 Mockup
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

                  // Notification Bell Pill
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

            // Hero Content matching Screen 3 Mockup (Light Theme)
            Positioned(
              left: 20,
              right: 20,
              bottom: 22,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Tag: WEDDINGS
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF5148), // Vibrant Coral Tag
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'WEDDINGS',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 0.7,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Heading: "Plan Your Dream\nWedding" (Dark Charcoal on Light Background)
                  Text(
                    'Plan Your Dream\nWedding',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 22.5,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF111827),
                      height: 1.15,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Subtitle
                  Text(
                    'Get competitive bids from verified vendors',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF4B5563),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Row with "Post Your Requirement →" button & "1/3" badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      InkWell(
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
                          );
                        },
                        borderRadius: BorderRadius.circular(24),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFF5148), // Vibrant Coral Button
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFFF5148).withValues(alpha: 0.35),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Post Your Requirement',
                                style: GoogleFonts.plusJakartaSans(
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

                      // "1/3" Badge (Light Theme)
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

  // 3. Occasion Shortcuts (Screen 3)
  Widget _buildOccasionShortcuts() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: _occasionShortcuts.map((occ) {
        final name = occ['name'] as String;
        return GestureDetector(
          onTap: () => _onOccasionTap(name),
          child: Column(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: occ['bg'] as Color,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  occ['icon'] as IconData,
                  color: occ['color'] as Color,
                  size: 24,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                name,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  // 3. Popular Services Horizontally Scrollable Cards (Screen 3)
  Widget _buildPopularServicesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Popular Services',
              style: AppTheme.headingFont(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ServiceCatalogScreen()),
                );
              },
              child: const Text(
                'See All',
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
        SizedBox(
          height: 148,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _popularServices.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final service = _popularServices[index];
              return GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ServiceCatalogScreen(
                        initialCategory: service['title'] as String,
                      ),
                    ),
                  );
                },
                child: Container(
                  width: 116,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderSubtle),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                        child: Image.asset(
                          service['asset'] as String,
                          width: 116,
                          height: 86,
                          fit: BoxFit.cover,
                          filterQuality: FilterQuality.high,
                          errorBuilder: (context, error, stackTrace) => Image.network(
                            service['image'] as String,
                            width: 116,
                            height: 86,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              width: 116,
                              height: 86,
                              color: (service['color'] as Color).withValues(alpha: 0.12),
                              child: Icon(
                                service['icon'] as IconData,
                                size: 26,
                                color: service['color'] as Color,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              service['title'] as String,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              service['price'] as String,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.textSecondary,
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
        ),
      ],
    );
  }

  // 5. Activity / My Event Requests (Screen 3)
  Widget _buildActivitySection(List<RequirementModel> requirements) {
    if (requirements.isEmpty) return const SizedBox.shrink();

    final recentReqs = requirements.take(2).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'My Event Requests',
              style: AppTheme.headingFont(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
                );
              },
              child: const Text(
                '+ New Event',
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
        ...recentReqs.map((req) {
          final bidsCount = req.bids.isNotEmpty ? req.bids.length : (req.bidsCount > 0 ? req.bidsCount : 3);

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => BidsComparisonScreen(requirement: req),
                  ),
                );
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderSubtle),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        req.imageUrl ?? 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
                        width: 70,
                        height: 70,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Container(
                          width: 70,
                          height: 70,
                          color: AppTheme.slate100,
                          child: const Icon(LucideIcons.calendar, size: 20, color: AppTheme.slate400),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            req.title,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${req.eventDate} · ${req.city}',
                            style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.successBg,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  '$bidsCount Bids Received',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.successText,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate400),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
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

  // 8. EzzyGo Trust & Escrow Guarantee
  Widget _buildTrustAndAssuranceSection() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF86EFAC).withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.shieldCheck, size: 18, color: Colors.white),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'EzzyGo Trust & Escrow Guarantee',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF065F46)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildTrustPoint(
            icon: LucideIcons.lock,
            title: '100% Escrow Protection',
            desc: 'Your advance is held safely with EzzyGo and released only after event completion.',
          ),
          const SizedBox(height: 10),
          _buildTrustPoint(
            icon: LucideIcons.badgeCheck,
            title: 'Verified Partner Vendors',
            desc: 'KYC verified, portfolio inspected, and rated by real host reviews.',
          ),
          const SizedBox(height: 10),
          _buildTrustPoint(
            icon: LucideIcons.trendingDown,
            title: '15% Lowest Price Guarantee',
            desc: 'Vendors must bid at least 15% below your target budget.',
          ),
          const SizedBox(height: 10),
          _buildTrustPoint(
            icon: LucideIcons.phoneCall,
            title: '24/7 Dedicated Concierge Support',
            desc: 'Personal event manager on call for dispute resolution & coordination.',
          ),
        ],
      ),
    );
  }

  Widget _buildTrustPoint({required IconData icon, required String title, required String desc}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF059669)),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF064E3B)),
              ),
              const SizedBox(height: 1),
              Text(
                desc,
                style: const TextStyle(fontSize: 11, color: Color(0xFF047857), height: 1.3),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // 9. Real Host Testimonials & Reviews
  Widget _buildHostTestimonialsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderSubtle),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
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
              const Row(
                children: [
                  Icon(Icons.star_rounded, size: 18, color: Color(0xFFFF9500)),
                  Icon(Icons.star_rounded, size: 18, color: Color(0xFFFF9500)),
                  Icon(Icons.star_rounded, size: 18, color: Color(0xFFFF9500)),
                  Icon(Icons.star_rounded, size: 18, color: Color(0xFFFF9500)),
                  Icon(Icons.star_rounded, size: 18, color: Color(0xFFFF9500)),
                ],
              ),
              const SizedBox(width: 8),
              const Text(
                '4.9 / 5 Rating',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.slate100,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  '1,200+ Events',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            '“We posted our wedding catering & stage decoration requirement on EzzyGo. Received 4 vendor bids within 3 hours and saved ₹38,000! Escrow made it completely risk-free.”',
            style: TextStyle(
              fontSize: 12,
              color: AppTheme.slate700,
              fontStyle: FontStyle.italic,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              ClipOval(
                child: Image.asset(
                  'assets/images/user_avatar.png',
                  width: 32,
                  height: 32,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 32,
                    height: 32,
                    color: AppTheme.pastelAmber,
                    child: const Icon(LucideIcons.user, size: 16, color: Color(0xFFD97706)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Priya & Amit S.',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                  ),
                  Text(
                    'Pune Wedding Host · Verified Booking',
                    style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
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
