import 'dart:async';
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:audioplayers/audioplayers.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../widgets/ezzygo_logo.dart';
import 'role_selection_screen.dart';
import 'main_navigation_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  AnimationController? _fadeController;
  Animation<double>? _fadeAnimation;

  AnimationController? _serviceController;
  Animation<double>? _serviceScaleAnimation;
  Animation<double>? _serviceFadeAnimation;

  AnimationController? _pulseController;
  Animation<double>? _pulseAnimation;

  AnimationController? _petalController;

  Timer? _serviceTimer;
  int _activeServiceIndex = 0;
  bool _isMuted = false;

  AudioPlayer? _splashAudioPlayer;
  AudioPlayer? _sfxAudioPlayer;

  final List<Map<String, dynamic>> _services = [
    {
      'title': 'Decoration',
      'tagline': 'Floral Mandap, Grand Arches & Fairy Lights',
      'benchmark': 'From ₹10,000',
      'icon': LucideIcons.sparkles,
      'color': const Color(0xFFE11D48),
      'bg': const Color(0xFFFFE4E6),
      'tag': '15% Off Bids',
      'image': 'assets/images/occasion_weddings.jpg',
    },
    {
      'title': 'Photography',
      'tagline': '4K Cinematic, Candid Drone & Pre-Wedding',
      'benchmark': 'From ₹5,000',
      'icon': LucideIcons.camera,
      'color': const Color(0xFFD97706),
      'bg': const Color(0xFFFEF3C7),
      'tag': 'Verified Pros',
      'image': 'assets/images/hero_wedding_bg.jpg',
    },
    {
      'title': 'Catering',
      'tagline': 'Royal Feasts, Chaat Counters & Live Desserts',
      'benchmark': 'From ₹300 / plate',
      'icon': LucideIcons.utensilsCrossed,
      'color': const Color(0xFFFF5148),
      'bg': const Color(0xFFFFF0EE),
      'tag': 'Tasting Available',
      'image': 'assets/images/occasion_birthdays.jpg',
    },
    {
      'title': 'Venues & Banquets',
      'tagline': 'Luxury Resorts, AC Banquets & Open Lawns',
      'benchmark': 'Direct Wholesale',
      'icon': LucideIcons.building2,
      'color': const Color(0xFF4F46E5),
      'bg': const Color(0xFFEEF2FF),
      'tag': 'Best Price',
      'image': 'assets/images/occasion_corporate.jpg',
    },
    {
      'title': 'Bridal Makeup',
      'tagline': 'Airbrush HD Styling, Draping & Mehendi',
      'benchmark': 'Top-Rated',
      'icon': LucideIcons.palette,
      'color': const Color(0xFFDB2777),
      'bg': const Color(0xFFFCE7F3),
      'tag': 'Certified Artists',
      'image': 'assets/images/occasion_festivals.jpg',
    },
    {
      'title': 'DJ & Live Sound',
      'tagline': 'Live Acoustic, DJ Stage & Ambient Lasers',
      'benchmark': 'Party Ready',
      'icon': LucideIcons.music,
      'color': const Color(0xFF7C3AED),
      'bg': const Color(0xFFF3E8FF),
      'tag': 'High Energy',
      'image': 'assets/images/occasion_parties.jpg',
    },
  ];

  @override
  void initState() {
    super.initState();
    _initAnimations();
    _initAudioAndPlayChime();

    _serviceTimer = Timer.periodic(const Duration(milliseconds: 2800), (_) {
      _cycleToNextService();
    });
  }

  @override
  void reassemble() {
    super.reassemble();
    _initAnimations();
  }

  void _initAnimations() {
    _fadeController ??= AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnimation ??= CurvedAnimation(parent: _fadeController!, curve: Curves.easeOut);
    if (!_fadeController!.isAnimating && !_fadeController!.isCompleted) {
      _fadeController!.forward();
    }

    _serviceController ??= AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    );
    _serviceScaleAnimation ??= Tween<double>(begin: 0.94, end: 1.0).animate(
      CurvedAnimation(
        parent: _serviceController!,
        curve: const Interval(0.0, 0.20, curve: Curves.easeOutBack),
      ),
    );
    _serviceFadeAnimation ??= Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _serviceController!,
        curve: const Interval(0.0, 0.15, curve: Curves.easeIn),
      ),
    );
    if (!_serviceController!.isAnimating) {
      _serviceController!.forward(from: 0.0);
    }

    _pulseController ??= AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 950),
    );
    _pulseAnimation ??= Tween<double>(begin: 1.0, end: 1.04).animate(
      CurvedAnimation(parent: _pulseController!, curve: Curves.easeInOut),
    );
    if (!_pulseController!.isAnimating) {
      _pulseController!.repeat(reverse: true);
    }

    // Festive Floating Petals
    _petalController ??= AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
  }

  Future<void> _initAudioAndPlayChime() async {
    try {
      _splashAudioPlayer ??= AudioPlayer();
      _sfxAudioPlayer ??= AudioPlayer();
      await _splashAudioPlayer?.setVolume(0.85);
      await _sfxAudioPlayer?.setVolume(0.65);

      // Play introductory splash chime after brief entrance delay
      Future.delayed(const Duration(milliseconds: 300), () async {
        if (!mounted || _isMuted) return;
        try {
          await _splashAudioPlayer?.play(AssetSource('audio/splash_chime.wav'));
        } catch (_) {
          // Graceful fallback
        }
      });
    } catch (_) {
      // Audio driver not available
    }
  }

  void _cycleToNextService() {
    if (!mounted) return;
    setState(() {
      _activeServiceIndex = (_activeServiceIndex + 1) % _services.length;
    });
    _serviceController?.forward(from: 0.0);
    _playServicePopSound();
  }

  void _selectService(int index) {
    if (_activeServiceIndex == index) return;
    HapticFeedback.lightImpact();
    setState(() {
      _activeServiceIndex = index;
    });
    _serviceController?.forward(from: 0.0);
    _playServicePopSound();

    _serviceTimer?.cancel();
    _serviceTimer = Timer.periodic(const Duration(milliseconds: 2800), (_) {
      _cycleToNextService();
    });
  }

  void _playServicePopSound() {
    if (_isMuted) return;
    try {
      HapticFeedback.selectionClick();
      _sfxAudioPlayer?.stop();
      _sfxAudioPlayer?.play(AssetSource('audio/service_pop.wav')).catchError((_) {});
    } catch (_) {
      HapticFeedback.selectionClick();
    }
  }

  void _toggleMute() {
    setState(() {
      _isMuted = !_isMuted;
    });
    if (_isMuted) {
      _splashAudioPlayer?.stop();
      _sfxAudioPlayer?.stop();
    } else {
      _playServicePopSound();
    }
  }

  @override
  void dispose() {
    _serviceTimer?.cancel();
    _fadeController?.dispose();
    _serviceController?.dispose();
    _pulseController?.dispose();
    _petalController?.dispose();
    _splashAudioPlayer?.dispose();
    _sfxAudioPlayer?.dispose();
    super.dispose();
  }

  void _onGetStarted() {
    HapticFeedback.mediumImpact();
    _splashAudioPlayer?.stop();
    _sfxAudioPlayer?.stop();

    try {
      final p = AudioPlayer();
      p.play(AssetSource('audio/service_pop.wav')).then((_) => p.dispose()).catchError((_) {});
    } catch (_) {}

    final auth = context.read<AuthProvider>();
    if (auth.isLoggedIn) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const RoleSelectionScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    _initAnimations();
    final activeService = _services[_activeServiceIndex];

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // 1. 4K High-Detail Floral Wedding Mandap Wallpaper
          Positioned.fill(
            child: Image.asset(
              'assets/images/splash_wedding_bg.jpg',
              fit: BoxFit.cover,
              alignment: Alignment.center,
              errorBuilder: (_, _, _) => Image.asset(
                'assets/images/hero_wedding_bg.jpg',
                fit: BoxFit.cover,
                alignment: Alignment.center,
              ),
            ),
          ),

          // 2. High-clarity gradient overlay: transparent center, soft readable top & bottom
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.white.withValues(alpha: 0.96),
                    Colors.white.withValues(alpha: 0.82),
                    Colors.white.withValues(alpha: 0.25),
                    Colors.transparent,
                    Colors.white.withValues(alpha: 0.35),
                    Colors.white.withValues(alpha: 0.88),
                    Colors.white.withValues(alpha: 0.98),
                    Colors.white,
                  ],
                  stops: const [0.0, 0.12, 0.22, 0.38, 0.58, 0.74, 0.88, 1.0],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // 3. Floating Celebration Petals Particle Overlay
          if (_petalController != null)
            Positioned.fill(
              child: IgnorePointer(
                child: AnimatedBuilder(
                  animation: _petalController!,
                  builder: (context, _) => CustomPaint(
                    painter: _FloatingPetalsPainter(progress: _petalController!.value),
                  ),
                ),
              ),
            ),

          // 4. Foreground Interactive Content
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnimation ?? const AlwaysStoppedAnimation(1.0),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Column(
                  children: [
                    // Top Bar: Minimal Mute/Unmute Icon in Corner
                    Align(
                      alignment: Alignment.topRight,
                      child: GestureDetector(
                        onTap: _toggleMute,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.92),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.borderSubtle),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Icon(
                            _isMuted ? LucideIcons.volumeX : LucideIcons.volume2,
                            size: 17,
                            color: _isMuted ? AppTheme.textMuted : AppTheme.primary,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 4),

                    // Centered Branding (Refined Serif Typography & Official Royal 3D Emblem)
                    const EzzyGoLogo(
                      size: 40,
                      isVertical: true,
                      subtitle: 'Your Events. Our Priority.',
                    ),

                    const Spacer(),

                    // Animated Services Showcase Section
                    _buildAnimatedServicesSection(activeService),

                    const Spacer(),

                    // 3 Value Badges (Screen 1 from design)
                    Row(
                      children: [
                        _buildFeatureBadge(
                          icon: LucideIcons.shieldCheck,
                          label: 'Verified\nVendors',
                        ),
                        const SizedBox(width: 8),
                        _buildFeatureBadge(
                          icon: LucideIcons.badgePercent,
                          label: 'Better\nPrices',
                        ),
                        const SizedBox(width: 8),
                        _buildFeatureBadge(
                          icon: LucideIcons.lock,
                          label: 'Secure\nPayments',
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Primary Coral Button "Get Started ->" with Pulse/Blink Hint Effect
                    _buildGetStartedButton(),
                    const SizedBox(height: 6),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Pulsating Glowing "Get Started" CTA Button with Animated Arrow & Tap Hint
  Widget _buildGetStartedButton() {
    if (_pulseController == null) {
      return SizedBox(
        width: double.infinity,
        height: 54,
        child: ElevatedButton(
          onPressed: _onGetStarted,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text('Get Started'),
        ),
      );
    }

    return AnimatedBuilder(
      animation: _pulseController!,
      builder: (context, _) {
        final t = _pulseController!.value;
        // Breathing scale: 1.0 to 1.036
        final scale = 1.0 + (t * 0.036);
        // Expanding glowing aura: blur 8 to 22, spread 0 to 4
        final glowBlur = 8.0 + (t * 16.0);
        final glowSpread = t * 3.5;
        final glowAlpha = 0.35 + (t * 0.38);
        // Arrow nudging to the right: 0 to 5.5px
        final arrowNudge = t * 5.5;

        return Transform.scale(
          scale: scale,
          child: Container(
            width: double.infinity,
            height: 54,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primary.withValues(alpha: glowAlpha),
                  blurRadius: glowBlur,
                  spreadRadius: glowSpread,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: _onGetStarted,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 20),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Get Started',
                        style: TextStyle(
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.25,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Transform.translate(
                        offset: Offset(arrowNudge, 0),
                        child: const Icon(LucideIcons.arrowRight, size: 19),
                      ),
                    ],
                  ),

                  // Pulsating "TAP" Hint Pill on right
                  Positioned(
                    right: 4,
                    child: Opacity(
                      opacity: (0.35 + 0.65 * t).clamp(0.0, 1.0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.4),
                            width: 1,
                          ),
                        ),
                        child: const Text(
                          'TAP',
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.8,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // Animated Services Spotlight Card & Interactive Service Pills
  Widget _buildAnimatedServicesSection(Map<String, dynamic> activeService) {
    final srvColor = activeService['color'] as Color;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Headline
        Text(
          'BOOK ANY EVENT SERVICE IN 1 TAP',
          textAlign: TextAlign.center,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: AppTheme.textPrimary.withValues(alpha: 0.78),
            letterSpacing: 0.8,
          ),
        ),

        const SizedBox(height: 10),

        // Animated Main Service Spotlight Card (Frosted Glassmorphism)
        ScaleTransition(
          scale: _serviceScaleAnimation ?? const AlwaysStoppedAnimation(1.0),
          child: FadeTransition(
            opacity: _serviceFadeAnimation ?? const AlwaysStoppedAnimation(1.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.86),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: srvColor.withValues(alpha: 0.38),
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: srvColor.withValues(alpha: 0.16),
                        blurRadius: 22,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Story-style Timer Progress Bar at top of card
                      if (_serviceController != null)
                        AnimatedBuilder(
                          animation: _serviceController!,
                          builder: (context, _) => LinearProgressIndicator(
                            value: _serviceController!.value,
                            backgroundColor: srvColor.withValues(alpha: 0.12),
                            valueColor: AlwaysStoppedAnimation<Color>(srvColor),
                            minHeight: 3,
                          ),
                        ),

                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        child: Row(
                          children: [
                            // Real Event Photo Thumbnail with Floating Icon Badge Overlay
                            Stack(
                              clipBehavior: Clip.none,
                              children: [
                                Container(
                                  width: 54,
                                  height: 54,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(16),
                                    boxShadow: [
                                      BoxShadow(
                                        color: srvColor.withValues(alpha: 0.28),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: Image.asset(
                                      activeService['image'] as String,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, _, _) => Container(
                                        color: activeService['bg'] as Color,
                                        child: Icon(
                                          activeService['icon'] as IconData,
                                          size: 26,
                                          color: srvColor,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                // Vibrant Mini Icon Badge Overlay
                                Positioned(
                                  right: -4,
                                  bottom: -4,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: srvColor,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.15),
                                          blurRadius: 4,
                                        ),
                                      ],
                                    ),
                                    child: Icon(
                                      activeService['icon'] as IconData,
                                      size: 11,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(width: 14),

                            // Service Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        activeService['title'] as String,
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800,
                                          color: AppTheme.textPrimary,
                                        ),
                                      ),
                                      const Spacer(),
                                      // Highlight tag
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: AppTheme.successBg,
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Text(
                                          activeService['tag'] as String,
                                          style: GoogleFonts.inter(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                            color: AppTheme.successText,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    activeService['tagline'] as String,
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      color: AppTheme.textSecondary,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 5),
                                  Row(
                                    children: [
                                      Icon(LucideIcons.tag, size: 12, color: srvColor),
                                      const SizedBox(width: 4),
                                      Text(
                                        activeService['benchmark'] as String,
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: srvColor,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        '• 15% discount limit',
                                        style: GoogleFonts.inter(
                                          fontSize: 10,
                                          color: AppTheme.textMuted,
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
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),

        const SizedBox(height: 12),

        // Interactive Service Pills Scroll / Selector
        SizedBox(
          height: 34,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _services.length,
            separatorBuilder: (_, _) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final isSelected = index == _activeServiceIndex;
              final srv = _services[index];
              final itemColor = srv['color'] as Color;

              return GestureDetector(
                onTap: () => _selectService(index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? itemColor
                        : Colors.white.withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isSelected ? itemColor : AppTheme.borderSubtle,
                      width: isSelected ? 1.5 : 1.0,
                    ),
                    boxShadow: [
                      if (isSelected)
                        BoxShadow(
                          color: itemColor.withValues(alpha: 0.35),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        srv['icon'] as IconData,
                        size: 14,
                        color: isSelected ? Colors.white : itemColor,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        srv['title'] as String,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? Colors.white : AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 10),

        // Mini Pagination Indicator Dots
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_services.length, (index) {
            final isSelected = index == _activeServiceIndex;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 2.5),
              height: 4,
              width: isSelected ? 18 : 5,
              decoration: BoxDecoration(
                color: isSelected ? srvColor : AppTheme.borderSubtle,
                borderRadius: BorderRadius.circular(4),
              ),
            );
          }),
        ),
      ],
    );
  }

  // Pixel-Perfect Value Badge Matching Screen 1 Reference (Seamless without clunky borders)
  Widget _buildFeatureBadge({
    required IconData icon,
    required String label,
  }) {
    return Expanded(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Circular Tan/Amber Emblem Circle from Screen 1
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(
              color: Color(0xFFFBEADB), // Exact tan/golden circular badge from mockup
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Icon(
                icon,
                size: 20,
                color: const Color(0xFF8D5B28), // Golden-brown shield icon from mockup
              ),
            ),
          ),
          const SizedBox(height: 7),
          // Clean 2-line title directly underneath
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF202124),
              height: 1.25,
            ),
          ),
        ],
      ),
    );
  }
}

// Gentle Floating Festive Petals & Twinkling Sparkles Custom Painter
class _FloatingPetalsPainter extends CustomPainter {
  final double progress;
  _FloatingPetalsPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final petalCount = 12;
    final randomSeeds = [
      0.12, 0.38, 0.62, 0.82, 0.22, 0.52, 0.72, 0.92, 0.18, 0.42, 0.68, 0.88
    ];

    for (int i = 0; i < petalCount; i++) {
      final seed = randomSeeds[i % randomSeeds.length];
      final y = ((progress + seed) % 1.0) * size.height;
      final x = (seed * size.width) + 20 * (i.isEven ? 1 : -1) * (progress * 6.28).clamp(-1.0, 1.0);

      final petalPaint = Paint()
        ..color = (i % 3 == 0)
            ? const Color(0xFFFFB4AB).withValues(alpha: 0.38) // Rose petal
            : (i % 3 == 1)
                ? const Color(0xFFFFE082).withValues(alpha: 0.32) // Golden shimmer
                : const Color(0xFFFFCCBC).withValues(alpha: 0.30) // Soft coral
        ..style = PaintingStyle.fill;

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate((progress * 3.14 + i) * 0.9);
      // Soft natural curved petal
      final petalPath = Path();
      petalPath.moveTo(0, -8);
      petalPath.cubicTo(-6, -4, -6, 6, 0, 10);
      petalPath.cubicTo(6, 6, 6, -4, 0, -8);
      canvas.drawPath(petalPath, petalPaint);
      canvas.restore();
    }

    // Twinkling celebration 4-point golden star sparkles
    final starCount = 6;
    final starSeeds = [0.20, 0.70, 0.35, 0.85, 0.15, 0.55];
    for (int j = 0; j < starCount; j++) {
      final seedX = starSeeds[j];
      final seedY = (starSeeds[(j + 2) % starCount] + progress * 0.2) % 0.6;
      final sx = seedX * size.width;
      final sy = seedY * size.height * 0.6; // Upper sky region
      final twinkle = (0.5 + 0.5 * (progress * 8.0 + j).abs().remainder(1.0)).clamp(0.2, 0.8);

      final starPaint = Paint()
        ..color = const Color(0xFFFFD54F).withValues(alpha: twinkle * 0.5)
        ..strokeWidth = 1.2
        ..style = PaintingStyle.stroke;

      // Draw mini 4-point star
      final starSize = 5.0 * twinkle;
      canvas.drawLine(Offset(sx - starSize, sy), Offset(sx + starSize, sy), starPaint);
      canvas.drawLine(Offset(sx, sy - starSize), Offset(sx, sy + starSize), starPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _FloatingPetalsPainter oldDelegate) => true;
}
