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

        const SizedBox(height: 20),

        // 3. Modern Search Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildSearchBar(),
        ),

        const SizedBox(height: 22),

        // 4. Popular Services Section (Screen 3)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildPopularServicesSection(),
        ),

        const SizedBox(height: 24),

        // 5. Activity / My Event Requests (Screen 3)
        if (myRequirements.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _buildActivitySection(myRequirements),
          ),
          const SizedBox(height: 24),
        ],

        // 6. Compact Trust Section (Screen 3)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildCompactTrustSection(),
        ),

        const SizedBox(height: 32),
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

  // 4. Popular Services Horizontally Scrollable Cards (Screen 3)
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
          height: 145,
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
                  width: 110,
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                        child: Stack(
                          children: [
                            Image.asset(
                              service['asset'] as String,
                              width: 110,
                              height: 80,
                              fit: BoxFit.cover,
                              errorBuilder: (_, _, _) => Image.network(
                                service['image'] as String,
                                width: 110,
                                height: 80,
                                fit: BoxFit.cover,
                                errorBuilder: (_, _, _) => Container(
                                  width: 110,
                                  height: 80,
                                  color: (service['color'] as Color).withValues(alpha: 0.12),
                                  child: Icon(
                                    service['icon'] as IconData,
                                    size: 26,
                                    color: service['color'] as Color,
                                  ),
                                ),
                              ),
                            ),
                            Positioned(
                              top: 6,
                              right: 6,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.92),
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.1),
                                      blurRadius: 3,
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  service['icon'] as IconData,
                                  size: 11,
                                  color: service['color'] as Color,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              service['title'] as String,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              service['price'] as String,
                              style: const TextStyle(
                                fontSize: 10,
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

  // 6. Compact Trust Section
  Widget _buildCompactTrustSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _buildTrustItem(LucideIcons.shieldCheck, '100% Escrow', 'Protected payments'),
              Container(width: 1, height: 36, color: AppTheme.borderSubtle),
              _buildTrustItem(LucideIcons.badgePercent, 'Reverse Bids', 'Guaranteed savings'),
              Container(width: 1, height: 36, color: AppTheme.borderSubtle),
              _buildTrustItem(LucideIcons.checkCircle2, 'Verified', 'Top rated vendors'),
            ],
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => const RuleExplainerSheet(),
              );
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(LucideIcons.sparkles, size: 13, color: AppTheme.primary),
                SizedBox(width: 6),
                Text(
                  'How EzzyGo Reverse-Bidding Works',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustItem(IconData icon, String title, String subtitle) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, size: 18, color: AppTheme.primary),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
          ),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 9, color: AppTheme.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
