import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:audioplayers/audioplayers.dart';
import '../config/theme.dart';
import '../providers/banners_provider.dart';
import '../providers/requirements_provider.dart';
import '../utils/app_nav.dart';
import '../widgets/ezzygo_logo.dart';
import 'main_navigation_screen.dart';

class LocationOnboardingScreen extends StatefulWidget {
  const LocationOnboardingScreen({super.key});

  @override
  State<LocationOnboardingScreen> createState() => _LocationOnboardingScreenState();
}

class _LocationOnboardingScreenState extends State<LocationOnboardingScreen>
    with SingleTickerProviderStateMixin {
  String _selectedCity = 'Pune';
  final TextEditingController _searchController = TextEditingController();
  AudioPlayer? _audioPlayer;
  AnimationController? _pulseController;
  bool _isDetectingLocation = false;

  final List<Map<String, dynamic>> _cities = [
    {
      'name': 'Pune',
      'state': 'Maharashtra',
      'landmark': 'Shaniwar Wada',
      'image': 'assets/images/city_pune.png',
      'fallbackIcon': LucideIcons.landmark,
      'color': Color(0xFFFFECEB),
    },
    {
      'name': 'Mumbai',
      'state': 'Maharashtra',
      'landmark': 'Gateway of India',
      'image': 'assets/images/city_mumbai.png',
      'fallbackIcon': LucideIcons.building2,
      'color': Color(0xFFE8F4FD),
    },
    {
      'name': 'Bengaluru',
      'state': 'Karnataka',
      'landmark': 'Vidhana Soudha',
      'image': 'assets/images/city_bengaluru.png',
      'fallbackIcon': LucideIcons.trees,
      'color': Color(0xFFE8F8F0),
    },
    {
      'name': 'Hyderabad',
      'state': 'Telangana',
      'landmark': 'Charminar',
      'image': 'assets/images/city_hyderabad.png',
      'fallbackIcon': LucideIcons.castle,
      'color': Color(0xFFFFF0F5),
    },
    {
      'name': 'Delhi',
      'state': 'NCR',
      'landmark': 'India Gate',
      'image': 'assets/images/city_delhi.png',
      'fallbackIcon': LucideIcons.landmark,
      'color': Color(0xFFFFF4E8),
    },
    {
      'name': 'Nagpur',
      'state': 'Maharashtra',
      'landmark': 'Zero Mile Stone',
      'image': 'assets/images/city_nagpur.png',
      'fallbackIcon': LucideIcons.mapPin,
      'color': Color(0xFFF0ECFC),
    },
    {
      'name': 'Goa',
      'state': 'Goa Coast',
      'landmark': 'Panaji Church & Palms',
      'image': 'assets/images/city_goa.png',
      'fallbackIcon': LucideIcons.palmtree,
      'color': Color(0xFFE8F4FD),
    },
    {
      'name': 'Jaipur',
      'state': 'Rajasthan',
      'landmark': 'Hawa Mahal Palace',
      'image': 'assets/images/city_jaipur.png',
      'fallbackIcon': LucideIcons.castle,
      'color': Color(0xFFFFF1EB),
    },
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    try {
      _audioPlayer = AudioPlayer();
    } catch (_) {}
  }

  @override
  void dispose() {
    _searchController.dispose();
    _pulseController?.dispose();
    _audioPlayer?.dispose();
    super.dispose();
  }

  void _playPopSound() {
    HapticFeedback.selectionClick();
    try {
      _audioPlayer?.stop();
      _audioPlayer?.play(AssetSource('audio/service_pop.wav')).catchError((_) {});
    } catch (_) {}
  }

  void _onCitySelect(String cityName) {
    _playPopSound();
    setState(() {
      _selectedCity = cityName;
    });
  }

  void _detectLocation() async {
    setState(() => _isDetectingLocation = true);
    HapticFeedback.lightImpact();

    await Future.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;

    setState(() {
      _selectedCity = 'Pune';
      _isDetectingLocation = false;
    });
    _playPopSound();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(LucideIcons.mapPin, color: Colors.white, size: 18),
            const SizedBox(width: 10),
            Text(
              'Location set to Pune, Maharashtra (Current)',
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1F2937),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _onContinue() {
    HapticFeedback.mediumImpact();
    try {
      final p = AudioPlayer();
      p.play(AssetSource('audio/service_pop.wav')).then((_) => p.dispose()).catchError((_) {});
    } catch (_) {}

    context.read<RequirementsProvider>().setSelectedCity(_selectedCity);
    context.read<BannersProvider>().loadForCity(_selectedCity);
    AppNav.openRoot(context, const MainNavigationScreen());
  }

  void _onBack() => AppNav.backOrExit(context);

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.trim().toLowerCase();
    final filteredCities = _cities.where((c) {
      final name = (c['name'] as String).toLowerCase();
      final state = (c['state'] as String).toLowerCase();
      return query.isEmpty || name.contains(query) || state.contains(query);
    }).toList();

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        _onBack();
      },
      child: Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, size: 20, color: AppTheme.slate700),
          onPressed: _onBack,
        ),
        titleSpacing: 8,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Exact EzzyGo Branding with ribbon bow monogram
            const EzzyGoLogo(size: 24),
            const SizedBox(height: 3),
            // Active Tab Indicator Under Logo matching Screen 2 Mockup
            Container(
              width: 38,
              height: 3,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
        actions: const [
          SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),

            // Main Question Headline (Matching Screen 2 Typography)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Where are you\nplanning your event?',
                style: GoogleFonts.poppins(
                  fontSize: 27,
                  fontWeight: FontWeight.w800,
                  height: 1.18,
                  letterSpacing: -0.6,
                  color: const Color(0xFF111827),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Modern Pill Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  style: GoogleFonts.poppins(
                    fontSize: 14.5,
                    color: const Color(0xFF1F2937),
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Search city...',
                    hintStyle: GoogleFonts.poppins(
                      color: const Color(0xFF9CA3AF),
                      fontSize: 14.5,
                      fontWeight: FontWeight.w400,
                    ),
                    prefixIcon: const Icon(
                      LucideIcons.search,
                      size: 19,
                      color: Color(0xFF9CA3AF),
                    ),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(
                              Icons.close_rounded,
                              size: 18,
                              color: Color(0xFF9CA3AF),
                            ),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {});
                            },
                          )
                        : null,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 13, horizontal: 16),
                  ),
                ),
              ),
            ),

            // Quick Auto-Detect Location Button
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 6),
              child: InkWell(
                onTap: _isDetectingLocation ? null : _detectLocation,
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight.withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _isDetectingLocation
                          ? const SizedBox(
                              width: 13,
                              height: 13,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppTheme.primary,
                              ),
                            )
                          : const Icon(
                              LucideIcons.navigation,
                              size: 13,
                              color: AppTheme.primary,
                            ),
                      const SizedBox(width: 6),
                      Text(
                        _isDetectingLocation ? 'Detecting GPS...' : 'Use Current Location',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 6),

            // City Grid Section (2-Column Grid / 2*2 Layout)
            Expanded(
              child: filteredCities.isEmpty
                  ? _buildEmptyState(query)
                  : GridView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      physics: const BouncingScrollPhysics(),
                      itemCount: filteredCities.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1.12,
                      ),
                      itemBuilder: (context, index) {
                        final city = filteredCities[index];
                        final cityName = city['name'] as String;
                        final cityState = city['state'] as String;
                        final landmark = city['landmark'] as String? ?? cityState;
                        final isSelected =
                            _selectedCity.toLowerCase() == cityName.toLowerCase();

                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () => _onCitySelect(cityName),
                            borderRadius: BorderRadius.circular(16),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              curve: Curves.easeOutCubic,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                // Soft Coral/Peach Background when selected (#FFF0EE)
                                color: isSelected
                                    ? const Color(0xFFFFF0EE)
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isSelected
                                      ? AppTheme.primary
                                      : const Color(0xFFE5E7EB),
                                  width: isSelected ? 1.6 : 1.0,
                                ),
                                boxShadow: [
                                  if (isSelected)
                                    BoxShadow(
                                      color: AppTheme.primary.withValues(alpha: 0.12),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    )
                                  else
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.03),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                ],
                              ),
                              child: Stack(
                                children: [
                                  // Selected checkmark indicator badge at top-right
                                  if (isSelected)
                                    Positioned(
                                      top: 0,
                                      right: 0,
                                      child: Container(
                                        width: 22,
                                        height: 22,
                                        decoration: const BoxDecoration(
                                          color: AppTheme.primary,
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.check_rounded,
                                          color: Colors.white,
                                          size: 14,
                                        ),
                                      ),
                                    ),

                                  // Main content: Landmark + City Name + Landmark / Region
                                  Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        // High-Definition Architectural Landmark Illustration
                                        SizedBox(
                                          width: 56,
                                          height: 48,
                                          child: Image.asset(
                                            city['image'] as String,
                                            fit: BoxFit.contain,
                                            errorBuilder: (_, _, _) => Container(
                                              decoration: BoxDecoration(
                                                color: (city['color'] as Color?) ?? const Color(0xFFFFECEB),
                                                borderRadius: BorderRadius.circular(12),
                                              ),
                                              child: Icon(
                                                (city['fallbackIcon'] as IconData?) ?? LucideIcons.mapPin,
                                                color: isSelected
                                                    ? AppTheme.primary
                                                    : AppTheme.textPrimary,
                                                size: 24,
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 8),

                                        // City Name
                                        Text(
                                          cityName,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.poppins(
                                            fontSize: 15.5,
                                            fontWeight: isSelected
                                                ? FontWeight.w800
                                                : FontWeight.w700,
                                            color: isSelected
                                                ? const Color(0xFF1F2937)
                                                : const Color(0xFF374151),
                                          ),
                                        ),
                                        const SizedBox(height: 2),

                                        // Landmark / State Subtitle
                                        Text(
                                          landmark,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          textAlign: TextAlign.center,
                                          style: GoogleFonts.poppins(
                                            fontSize: 11.5,
                                            fontWeight: FontWeight.w500,
                                            color: isSelected
                                                ? AppTheme.primary.withValues(alpha: 0.9)
                                                : const Color(0xFF9CA3AF),
                                          ),
                                        ),
                                      ],
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

            // Bottom CTA "Continue ->" with Gentle Breathing Pulse Effect
            _buildBottomCTA(),
          ],
        ),
      ),
      ),
    );
  }

  // Friendly Empty State when search has no direct match
  Widget _buildEmptyState(String query) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.mapPinOff,
                size: 26,
                color: Color(0xFF9CA3AF),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'No city found for "$query"',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'You can still select "$query" as your custom event location.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: const Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                _onCitySelect(_searchController.text.trim());
              },
              icon: const Icon(LucideIcons.plus, size: 16),
              label: Text('Select "$query"'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Bottom Sticky CTA matching Screen 2 Mockup with Breathing Pulse
  Widget _buildBottomCTA() {
    return Container(
      padding: EdgeInsets.fromLTRB(
        20,
        12,
        20,
        14 + MediaQuery.of(context).padding.bottom,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFF3F4F6), width: 1)),
      ),
      child: AnimatedBuilder(
        animation: _pulseController ?? const AlwaysStoppedAnimation(0.0),
        builder: (context, _) {
          final t = _pulseController?.value ?? 0.0;
          final arrowNudge = t * 4.5;
          final glowBlur = 8.0 + (t * 10.0);

          return Container(
            width: double.infinity,
            height: 52,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primary.withValues(alpha: 0.32),
                  blurRadius: glowBlur,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: _onContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 20),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Explore Vendors in $_selectedCity',
                    style: GoogleFonts.poppins(
                      fontSize: 16.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Transform.translate(
                    offset: Offset(arrowNudge, 0),
                    child: const Icon(LucideIcons.arrowRight, size: 19),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
