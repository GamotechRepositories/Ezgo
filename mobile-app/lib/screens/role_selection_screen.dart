import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../models/user_model.dart';
import '../utils/app_nav.dart';
import '../widgets/ezzygo_logo.dart';
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

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController?.dispose();
    super.dispose();
  }

  void _onRoleSelect(UserRole role) {
    HapticFeedback.selectionClick();
    setState(() => _selectedRole = role);
  }

  void _proceedToLogin(UserRole role) {
    HapticFeedback.mediumImpact();

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
    final media = MediaQuery.of(context);
    final bottomPadding = media.padding.bottom;
    final isHost = _selectedRole == UserRole.host;
    final heroHeight = (media.size.height * 0.34).clamp(220.0, 300.0);
    final cacheWidth = (media.size.width * media.devicePixelRatio).round();

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        AppNav.onRootBack(context);
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFFBF8F5),
        body: Column(
          children: [
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                physics: const BouncingScrollPhysics(),
                children: [
                  SizedBox(
                    height: heroHeight,
                    width: double.infinity,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        ClipPath(
                          clipper: const _HeroWaveClipper(),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.asset(
                                'assets/images/hero_wedding_bg.jpg',
                                fit: BoxFit.cover,
                                alignment: const Alignment(0, -0.18),
                                filterQuality: FilterQuality.high,
                                gaplessPlayback: true,
                                cacheWidth: cacheWidth,
                                errorBuilder: (_, _, _) => Image.asset(
                                  'assets/images/occasion_weddings.jpg',
                                  fit: BoxFit.cover,
                                  filterQuality: FilterQuality.high,
                                  cacheWidth: cacheWidth,
                                ),
                              ),
                              const DecoratedBox(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Color(0x66121A2E),
                                      Color(0x22121A2E),
                                      Color(0x00121A2E),
                                      Color(0xCC121A2E),
                                    ],
                                    stops: [0, 0.28, 0.55, 1],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        SafeArea(
                          bottom: false,
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 10, 20, 28),
                            child: Column(
                              children: [
                                const EzzyGoLogo(size: 30, isLight: true),
                                const Spacer(),
                                Text(
                                  'One app. Two roles.',
                                  style: GoogleFonts.poppins(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                    letterSpacing: 0.2,
                                    shadows: const [
                                      Shadow(color: Color(0x66000000), blurRadius: 8),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 18),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(22, 8, 22, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(
                                text: 'How will you use ',
                                style: GoogleFonts.poppins(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.ink,
                                  letterSpacing: -0.4,
                                  height: 1.2,
                                ),
                              ),
                              TextSpan(
                                text: 'EzzyGo',
                                style: GoogleFonts.poppins(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.primary,
                                  letterSpacing: -0.4,
                                  height: 1.2,
                                ),
                              ),
                              TextSpan(
                                text: '?',
                                style: GoogleFonts.poppins(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.ink,
                                  letterSpacing: -0.4,
                                  height: 1.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Choose one to continue. You can switch later.',
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppTheme.textSecondary,
                            height: 1.35,
                          ),
                        ),
                        const SizedBox(height: 20),
                        _RoleCard(
                          selected: isHost,
                          title: 'Customer',
                          subtitle: 'Plan events, compare reverse bids and book vendors.',
                          accent: AppTheme.primary,
                          tint: AppTheme.primaryLight,
                          icon: LucideIcons.calendarCheck,
                          onTap: () => _onRoleSelect(UserRole.host),
                        ),
                        const SizedBox(height: 12),
                        _RoleCard(
                          selected: !isHost,
                          title: 'Service Provider',
                          subtitle: 'Find live event leads, send reverse bids and grow your crew.',
                          accent: AppTheme.teal,
                          tint: AppTheme.tealLight,
                          icon: LucideIcons.store,
                          onTap: () => _onRoleSelect(UserRole.vendor),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: double.infinity,
              padding: EdgeInsets.fromLTRB(22, 10, 22, 12 + bottomPadding),
              decoration: const BoxDecoration(
                color: Color(0xFFFBF8F5),
                border: Border(top: BorderSide(color: Color(0xFFF0EBE6))),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _ContinueButton(
                    pulse: _pulseController,
                    isHost: isHost,
                    onPressed: () => _proceedToLogin(_selectedRole),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'You can change your role anytime in Profile.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final bool selected;
  final String title;
  final String subtitle;
  final Color accent;
  final Color tint;
  final IconData icon;
  final VoidCallback onTap;

  const _RoleCard({
    required this.selected,
    required this.title,
    required this.subtitle,
    required this.accent,
    required this.tint,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: selected ? tint : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: selected ? accent : AppTheme.borderSubtle,
              width: selected ? 1.8 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: selected ? Colors.white : tint,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: accent, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.ink,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.textSecondary,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: selected ? accent : Colors.transparent,
                  border: Border.all(
                    color: selected ? accent : const Color(0xFFCBD5E1),
                    width: 2,
                  ),
                ),
                child: selected
                    ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ContinueButton extends StatelessWidget {
  final AnimationController? pulse;
  final bool isHost;
  final VoidCallback onPressed;

  const _ContinueButton({
    required this.pulse,
    required this.isHost,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: pulse ?? const AlwaysStoppedAnimation(0.0),
      builder: (context, _) {
        final t = pulse?.value ?? 0.0;
        return SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: isHost ? AppTheme.primary : AppTheme.ink,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  isHost ? 'Continue as Customer' : 'Continue as Service Provider',
                  style: GoogleFonts.poppins(
                    fontSize: 15.5,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(width: 8),
                Transform.translate(
                  offset: Offset(t * 3, 0),
                  child: const Icon(LucideIcons.arrowRight, size: 18),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _HeroWaveClipper extends CustomClipper<Path> {
  const _HeroWaveClipper();

  @override
  Path getClip(Size size) {
    final path = Path()
      ..lineTo(0, size.height - 28)
      ..quadraticBezierTo(
        size.width * 0.28,
        size.height + 8,
        size.width * 0.55,
        size.height - 18,
      )
      ..quadraticBezierTo(
        size.width * 0.82,
        size.height - 42,
        size.width,
        size.height - 16,
      )
      ..lineTo(size.width, 0)
      ..close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
