import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/user_model.dart';
import 'auth/login_screen.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen>
    with SingleTickerProviderStateMixin {
  UserRole _selectedRole = UserRole.host;
  AnimationController? _pulseController;
  AudioPlayer? _audioPlayer;

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

  void _onRoleSelect(UserRole role) {
    _playPopSound();
    setState(() {
      _selectedRole = role;
    });
  }

  void _proceedToLogin(UserRole role) {
    HapticFeedback.mediumImpact();
    try {
      final p = AudioPlayer();
      p.play(AssetSource('audio/service_pop.wav')).then((_) => p.dispose()).catchError((_) {});
    } catch (_) {}

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => LoginScreen(
          initialRole: role,
          navigateToLocation: true,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final bottomPadding = mediaQuery.padding.bottom;
    final isHost = _selectedRole == UserRole.host;
    final isVendor = _selectedRole == UserRole.vendor;

    final screenWidth = mediaQuery.size.width;
    final bannerHeight = screenWidth * (830.0 / 1152.0);

    return Scaffold(
      backgroundColor: const Color(0xFFFCF9F6),
      body: Stack(
        children: [
          // Background soft warm tint
          Positioned.fill(
            child: Container(
              color: const Color(0xFFFCF9F6),
            ),
          ),

          // Scrollable content area extending full to top edge
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                // 1. TOP BANNER SECTION (Full Edge-to-Edge Wedding Banner from top 0)
                SizedBox(
                  width: double.infinity,
                  height: bannerHeight,
                  child: Image.asset(
                    'assets/images/role_wedding_banner.png',
                    fit: BoxFit.fill,
                    alignment: Alignment.topCenter,
                    errorBuilder: (_, _, _) => Container(
                      height: 280,
                      color: const Color(0xFFFFECEB),
                    ),
                  ),
                ),

                  // 2. MAIN TITLE & SUBTITLE
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 22),
                    child: Column(
                      children: [
                        const SizedBox(height: 14),

                        // "How will you use EzzyGo?"
                        RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: 'How will you use ',
                                style: GoogleFonts.poppins(
                                  fontSize: 25,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF0F172A),
                                  letterSpacing: -0.5,
                                ),
                              ),
                              TextSpan(
                                text: 'EzzyGo?',
                                style: GoogleFonts.poppins(
                                  fontSize: 25,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFFFF3838),
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 6),

                        // "Choose one to continue. You can switch later."
                        Text(
                          'Choose one to continue. You can switch later.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFF64748B),
                          ),
                        ),

                        const SizedBox(height: 18),

                        // "SELECT ONE ROLE" Divider
                        Row(
                          children: [
                            Text(
                              'SELECT ONE ROLE',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF94A3B8),
                                letterSpacing: 1.1,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Container(
                                height: 1,
                                color: const Color(0xFFE2E8F0),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 14),

                        // 3. CARD 1: CUSTOMER
                        _buildRoleCard(
                          isSelected: isHost,
                          title: 'Customer',
                          subtitle: 'Plan events, compare bids\n& book vendors',
                          activeBorderColor: const Color(0xFFFF453A),
                          activeBgColor: const Color(0xFFFFF5F4),
                          iconBgColor: const Color(0xFFFFECEB),
                          iconWidget: _buildCalendarCheckIcon(),
                          onTap: () => _onRoleSelect(UserRole.host),
                        ),

                        const SizedBox(height: 14),

                        // 4. CARD 2: SERVICE PROVIDER
                        _buildRoleCard(
                          isSelected: isVendor,
                          title: 'Service Provider',
                          subtitle: 'Find event leads, submit bids\n& grow your business',
                          activeBorderColor: const Color(0xFF10B981),
                          activeBgColor: const Color(0xFFF0FDF4),
                          iconBgColor: const Color(0xFFE8F8F0),
                          iconWidget: _buildStorefrontIcon(),
                          onTap: () => _onRoleSelect(UserRole.vendor),
                        ),

                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      bottomNavigationBar: Container(
        color: const Color(0xFFFCF9F6),
        padding: EdgeInsets.fromLTRB(
          22,
          8,
          22,
          12 + bottomPadding,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Continue Button pinned at bottom
            _buildContinueButton(isHost: isHost),

            const SizedBox(height: 10),

            // Helper Footer Text
            Text(
              'You can change your role anytime in Profile.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Role Card matching user's exact mockup
  Widget _buildRoleCard({
    required bool isSelected,
    required String title,
    required String subtitle,
    required Color activeBorderColor,
    required Color activeBgColor,
    required Color iconBgColor,
    required Widget iconWidget,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? activeBgColor : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? activeBorderColor : const Color(0xFFF1F5F9),
              width: isSelected ? 1.6 : 1.0,
            ),
            boxShadow: [
              if (isSelected)
                BoxShadow(
                  color: activeBorderColor.withValues(alpha: 0.12),
                  blurRadius: 16,
                  offset: const Offset(0, 5),
                )
              else
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
            ],
          ),
          child: Row(
            children: [
              // Left Rounded-Square Icon
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(child: iconWidget),
              ),

              const SizedBox(width: 16),

              // Title & Subtitle
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 17.5,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFF64748B),
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),

              // Right Selection Badge
              if (isSelected)
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: activeBorderColor,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_rounded,
                    color: Colors.white,
                    size: 16,
                  ),
                )
              else
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFFCBD5E1),
                      width: 2.0,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // Exact Calendar Check Icon matching user mockup
  Widget _buildCalendarCheckIcon() {
    return SizedBox(
      width: 38,
      height: 38,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Calendar Body Box
          Container(
            width: 34,
            height: 34,
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: const Color(0xFFFF3838),
                width: 2.2,
              ),
            ),
            child: Column(
              children: [
                // Solid Coral Top Header Bar
                Container(
                  height: 9,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFF3838),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(5)),
                  ),
                ),
                // White Center with Checkmark
                const Expanded(
                  child: Center(
                    child: Icon(
                      Icons.check_rounded,
                      size: 18,
                      color: Color(0xFFFF3838),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Two Binder Loops on Top
          Positioned(
            top: 0,
            left: 9,
            child: Container(
              width: 3.5,
              height: 6,
              decoration: BoxDecoration(
                color: const Color(0xFFFF3838),
                borderRadius: BorderRadius.circular(1.5),
              ),
            ),
          ),
          Positioned(
            top: 0,
            right: 9,
            child: Container(
              width: 3.5,
              height: 6,
              decoration: BoxDecoration(
                color: const Color(0xFFFF3838),
                borderRadius: BorderRadius.circular(1.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Exact Storefront Icon matching user mockup
  Widget _buildStorefrontIcon() {
    return SizedBox(
      width: 40,
      height: 36,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Storefront Awning with Scalloped Lobes
          Container(
            height: 17,
            decoration: const BoxDecoration(
              color: Color(0xFF00C853),
              borderRadius: BorderRadius.vertical(top: Radius.circular(7)),
            ),
            child: Row(
              children: List.generate(
                4,
                (i) => Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 0.5),
                    decoration: BoxDecoration(
                      color: i % 2 == 0
                          ? const Color(0xFF00C853)
                          : const Color(0xFF059669),
                      borderRadius: const BorderRadius.vertical(
                        bottom: Radius.circular(5),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 2),

          // Shop Front Body with Window & Door
          Container(
            height: 15,
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
            decoration: const BoxDecoration(
              color: Color(0xFF00C853),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(5)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Door
                Container(
                  width: 8,
                  height: 10,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                // Window
                Container(
                  width: 14,
                  height: 7,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Continue Button matching user mockup
  Widget _buildContinueButton({required bool isHost}) {
    return AnimatedBuilder(
      animation: _pulseController ?? const AlwaysStoppedAnimation(0.0),
      builder: (context, _) {
        final t = _pulseController?.value ?? 0.0;
        final arrowNudge = t * 3.5;
        final glowBlur = 8.0 + (t * 8.0);

        return Container(
          width: double.infinity,
          height: 54,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFFF3838).withValues(alpha: 0.32),
                blurRadius: glowBlur,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: ElevatedButton(
            onPressed: () => _proceedToLogin(_selectedRole),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF3838),
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
                  isHost
                      ? 'Continue as Customer'
                      : 'Continue as Service Provider',
                  style: GoogleFonts.poppins(
                    fontSize: 16.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.2,
                  ),
                ),
                const SizedBox(width: 8),
                Transform.translate(
                  offset: Offset(arrowNudge, 0),
                  child: const Icon(LucideIcons.arrowRight, size: 20),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

