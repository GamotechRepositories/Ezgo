import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../utils/app_bootstrap.dart';
import '../../utils/app_nav.dart';
import '../../widgets/ezzygo_logo.dart';
import '../main_navigation_screen.dart';
import '../location_onboarding_screen.dart';

class LoginScreen extends StatefulWidget {
  final UserRole initialRole;
  final bool navigateToLocation;

  const LoginScreen({
    super.key,
    this.initialRole = UserRole.host,
    this.navigateToLocation = true,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late UserRole _selectedRole;
  bool _isLogin = true;
  bool _obscurePassword = true;
  String? _errorMessage;

  late final TextEditingController _phoneController;
  late final TextEditingController _passwordController;
  final _nameController = TextEditingController();
  final _businessNameController = TextEditingController();
  final _cityController = TextEditingController(text: 'Pune');

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.initialRole;
    _phoneController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _businessNameController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Future<void> _openAfterAuth() async {
    AppBootstrap.reset();
    try {
      await AppBootstrap.start(context).timeout(const Duration(seconds: 5));
    } catch (_) {}
    if (!mounted) return;
    final auth = context.read<AuthProvider>();
    if (auth.isVendor) {
      final city = (auth.user?.serviceArea ?? '').split(',').first.trim();
      if (city.isNotEmpty) {
        context.read<RequirementsProvider>().setMarketplaceCity(city);
      }
      AppNav.openRoot(context, const MainNavigationScreen());
      return;
    }
    final alreadyChoseCity = context.read<RequirementsProvider>().hasChosenCity;
    final goToLocation = widget.navigateToLocation && !alreadyChoseCity;
    if (goToLocation) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LocationOnboardingScreen()),
      );
      return;
    }
    AppNav.openRoot(context, const MainNavigationScreen());
  }

  Future<void> _handleAuth() async {
    setState(() => _errorMessage = null);
    final auth = context.read<AuthProvider>();

    final phone = _phoneController.text.trim();
    final password = _passwordController.text.trim();

    if (phone.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please enter mobile number and password.');
      return;
    }
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.length != 10) {
      setState(() => _errorMessage = 'Please enter a 10-digit mobile number.');
      return;
    }

    bool success = false;
    if (_isLogin) {
      success = await auth.login(
        phone: phone,
        password: password,
        role: _selectedRole,
      );
    } else {
      final name = _nameController.text.trim();
      if (name.isEmpty) {
        setState(() => _errorMessage = 'Please enter your name.');
        return;
      }
      if (_selectedRole == UserRole.vendor && _businessNameController.text.trim().isEmpty) {
        setState(() => _errorMessage = 'Please enter your business name.');
        return;
      }
      success = await auth.register(
        name: name,
        phone: phone,
        password: password,
        role: _selectedRole,
        businessName: _selectedRole == UserRole.vendor ? _businessNameController.text.trim() : null,
        serviceArea: _cityController.text.trim(),
      );
    }

    if (!mounted) return;

    if (success) {
      await _openAfterAuth();
    } else {
      setState(() {
        _errorMessage = auth.errorMessage ?? 'Authentication failed. Please check your credentials.';
      });
    }
  }

  Future<void> _handleGoogleAuth() async {
    setState(() => _errorMessage = null);
    final auth = context.read<AuthProvider>();

    final success = await auth.loginWithGoogle(role: _selectedRole);

    if (!mounted) return;

    if (success) {
      await _openAfterAuth();
    } else {
      if (auth.errorMessage != null) {
        setState(() {
          _errorMessage = auth.errorMessage;
        });
      }
    }
  }

  Widget _buildGoogleIcon() {
    return SizedBox(
      width: 22,
      height: 22,
      child: CustomPaint(
        painter: _GoogleLogoPainter(),
      ),
    );
  }

  Widget _loginBenefitChip(IconData icon, String title, String subtitle) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFFFFCF9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFFFEDD5)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: AppTheme.ink),
            const SizedBox(height: 6),
            Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate900)),
            Text(subtitle, style: const TextStyle(fontSize: 10, color: AppTheme.slate500)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isHost = _selectedRole == UserRole.host;

    return PopScope(
      canPop: Navigator.of(context).canPop(),
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        AppNav.backOrExit(context);
      },
      child: Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: Navigator.of(context).canPop()
                    ? IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(LucideIcons.arrowLeft, size: 20, color: AppTheme.slate700),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: const BorderSide(color: AppTheme.slate200),
                          ),
                        ),
                      )
                    : const SizedBox(height: 40),
              ),

              const SizedBox(height: 8),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const EzzyGoLogo(size: 32),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: isHost ? AppTheme.primaryLight : AppTheme.ink,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isHost ? AppTheme.primary.withValues(alpha: 0.25) : AppTheme.ink,
                      ),
                    ),
                    child: Text(
                      isHost ? 'Host Portal' : 'Partner Portal',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: isHost ? AppTheme.primary : Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (isHost)
                const Text(
                  'Your Event, Your Budget. Vendors Compete Under Your Price.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.slate500,
                    height: 1.35,
                  ),
                )
              else
                const Text(
                  'Win event jobs by bidding 15% below the host budget. You keep 100% of your bid.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.slate500,
                    height: 1.35,
                  ),
                ),

              const SizedBox(height: 20),

              // Mode Switcher (Log in / Register)
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.slate100,
                  borderRadius: BorderRadius.circular(14),
                ),
                padding: const EdgeInsets.all(4),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isLogin = true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _isLogin ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: _isLogin
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.05),
                                      blurRadius: 4,
                                      offset: const Offset(0, 1),
                                    )
                                  ]
                                : null,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'Log In',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: _isLogin ? AppTheme.slate900 : AppTheme.slate500,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isLogin = false),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: !_isLogin ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: !_isLogin
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.05),
                                      blurRadius: 4,
                                      offset: const Offset(0, 1),
                                    )
                                  ]
                                : null,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'Create Account',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: !_isLogin ? AppTheme.slate900 : AppTheme.slate500,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Form Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppTheme.slate200),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _isLogin
                          ? (isHost ? 'Log in to EzzyGo' : 'Log in as Service Provider')
                          : (isHost ? 'Create a customer account' : 'Create a vendor account'),
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.slate900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isHost
                          ? 'Continue with Google or your mobile number. Post events and get reverse-bids.'
                          : 'See live event leads and send a reverse bid under the host budget.',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.slate600,
                        height: 1.3,
                      ),
                    ),

                    if (_errorMessage != null) ...[
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.red50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.rose.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.alertCircle, color: AppTheme.rose, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: AppTheme.rose,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 18),

                    if (!_isLogin) ...[
                      const Text('Full Name', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.slate700)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          hintText: 'Enter your name',
                          prefixIcon: Icon(LucideIcons.user, size: 18, color: AppTheme.slate400),
                        ),
                      ),
                      const SizedBox(height: 14),
                      if (!isHost) ...[
                        const Text('Business / Crew Name', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.slate700)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _businessNameController,
                          decoration: const InputDecoration(
                            hintText: 'e.g. Pune Sound & Stage Pros',
                            prefixIcon: Icon(LucideIcons.building, size: 18, color: AppTheme.slate400),
                          ),
                        ),
                        const SizedBox(height: 14),
                        const Text('Operating City', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.slate700)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _cityController,
                          decoration: const InputDecoration(
                            hintText: 'e.g. Pune, MH',
                            prefixIcon: Icon(LucideIcons.mapPin, size: 18, color: AppTheme.slate400),
                          ),
                        ),
                        const SizedBox(height: 14),
                      ],
                    ],

                    const Text('Mobile Number', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.slate700)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        hintText: '10-digit mobile number',
                        prefixIcon: Icon(LucideIcons.phone, size: 18, color: AppTheme.slate400),
                      ),
                    ),

                    const SizedBox(height: 14),

                    const Text('Password', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.slate700)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        hintText: 'Enter password',
                        prefixIcon: const Icon(LucideIcons.lock, size: 18, color: AppTheme.slate400),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                            size: 18,
                            color: AppTheme.slate400,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    ElevatedButton(
                      onPressed: auth.isLoading ? null : _handleAuth,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: auth.isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text(
                              _isLogin
                                  ? (isHost ? 'Sign in' : 'Sign in as partner')
                                  : (isHost ? 'Create customer account' : 'Create partner account'),
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                            ),
                    ),

                    const SizedBox(height: 16),

                    Row(
                      children: const [
                        Expanded(child: Divider(color: AppTheme.slate200, thickness: 1)),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            'or',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.slate400,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                        Expanded(child: Divider(color: AppTheme.slate200, thickness: 1)),
                      ],
                    ),

                    const SizedBox(height: 16),

                    OutlinedButton(
                      onPressed: auth.isLoading ? null : _handleGoogleAuth,
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.slate800,
                        side: const BorderSide(color: AppTheme.slate300, width: 1.2),
                        minimumSize: const Size.fromHeight(50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildGoogleIcon(),
                          const SizedBox(width: 12),
                          const Text(
                            'Continue with Google',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              color: AppTheme.slate800,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: isHost
                          ? [
                              _loginBenefitChip(LucideIcons.zap, '1-Click', 'Sign-in'),
                              const SizedBox(width: 8),
                              _loginBenefitChip(LucideIcons.shieldCheck, '100%', 'Escrow Safe'),
                              const SizedBox(width: 8),
                              _loginBenefitChip(LucideIcons.trendingUp, 'Min. 15%', 'Savings'),
                            ]
                          : [
                              _loginBenefitChip(LucideIcons.flame, 'Live', 'Leads'),
                              const SizedBox(width: 8),
                              _loginBenefitChip(LucideIcons.banknote, 'Keep', '100% bid'),
                              const SizedBox(width: 8),
                              _loginBenefitChip(LucideIcons.shieldCheck, 'Escrow', 'Unlock'),
                            ],
                    ),
                    const SizedBox(height: 14),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.shieldCheck, size: 14, color: AppTheme.emerald),
                        SizedBox(width: 6),
                        Text(
                          'Official Google Auth · 256-bit SSL encrypted',
                          style: TextStyle(fontSize: 11, color: AppTheme.slate500),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
      ),
    );
  }

}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;
    final center = Offset(w / 2, h / 2);
    final radius = w / 2;
    const strokeWidthRatio = 0.22;
    final strokeWidth = w * strokeWidthRatio;

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    final rect = Rect.fromCircle(center: center, radius: radius - strokeWidth / 2);

    // Blue arc (bottom right to right middle)
    paint.color = const Color(0xFF4285F4);
    canvas.drawArc(rect, -0.4, 1.2, false, paint);

    // Green arc (bottom)
    paint.color = const Color(0xFF34A853);
    canvas.drawArc(rect, 0.8, 1.6, false, paint);

    // Yellow arc (left)
    paint.color = const Color(0xFFFBBC05);
    canvas.drawArc(rect, 2.4, 1.5, false, paint);

    // Red arc (top)
    paint.color = const Color(0xFFEA4335);
    canvas.drawArc(rect, 3.9, 1.8, false, paint);

    // Horizontal bar of the 'G'
    final barPaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill;

    final barRect = Rect.fromLTWH(
      center.dx - strokeWidth * 0.2,
      center.dy - strokeWidth / 2,
      radius + strokeWidth * 0.2,
      strokeWidth,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(barRect, Radius.circular(strokeWidth * 0.2)),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
