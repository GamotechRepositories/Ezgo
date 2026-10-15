import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../providers/bookings_provider.dart';
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
    if (_selectedRole == UserRole.host) {
      _phoneController = TextEditingController(text: '9876543210');
      _passwordController = TextEditingController(text: 'host123');
    } else {
      _phoneController = TextEditingController(text: '9823145678');
      _passwordController = TextEditingController(text: 'vendor123');
    }
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

  void _onRoleChanged(UserRole role) {
    setState(() {
      _selectedRole = role;
      _errorMessage = null;
      if (role == UserRole.host) {
        _phoneController.text = '9876543210';
        _passwordController.text = 'host123';
      } else {
        _phoneController.text = '9823145678';
        _passwordController.text = 'vendor123';
      }
    });
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
      // Refresh providers with new auth context
      context.read<RequirementsProvider>().loadData();
      context.read<BookingsProvider>().loadData();

      if (widget.navigateToLocation) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LocationOnboardingScreen()),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        );
      }
    } else {
      setState(() {
        _errorMessage = auth.errorMessage ?? 'Authentication failed. Please check your credentials.';
      });
    }
  }

  void _applyDemo(String name, String phone, String password) {
    setState(() {
      _phoneController.text = phone.replaceAll(RegExp(r'\D'), '');
      _passwordController.text = password;
      _errorMessage = null;
    });
    _handleAuth();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isHost = _selectedRole == UserRole.host;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Top Bar with Back and Skip Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (Navigator.of(context).canPop())
                    IconButton(
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
                  else
                    const SizedBox(width: 40),

                  TextButton(
                    onPressed: () {
                      if (widget.navigateToLocation) {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => const LocationOnboardingScreen()),
                        );
                      } else {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
                        );
                      }
                    },
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Skip for now',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.slate600,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate600),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),

              // App Logo
              const EzzyGoLogo(size: 36),
              const SizedBox(height: 8),
              const Text(
                'Reverse-Bidding Event Marketplace',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.slate500,
                ),
              ),

              const SizedBox(height: 24),

              // Step 1: ROLE SELECTION (User / Host vs Vendor)
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.slate200),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _onRoleChanged(UserRole.host),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: isHost ? AppTheme.primaryLight : Colors.transparent,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isHost ? AppTheme.primary : Colors.transparent,
                              width: 1.5,
                            ),
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    LucideIcons.user,
                                    size: 18,
                                    color: isHost ? AppTheme.primary : AppTheme.slate600,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Event Host',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 15,
                                      color: isHost ? AppTheme.primary : AppTheme.slate700,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Customer / User',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isHost ? AppTheme.primaryDark : AppTheme.slate500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _onRoleChanged(UserRole.vendor),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: !isHost ? AppTheme.slate900 : Colors.transparent,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: !isHost ? AppTheme.slate800 : Colors.transparent,
                              width: 1.5,
                            ),
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    LucideIcons.briefcase,
                                    size: 18,
                                    color: !isHost ? Colors.white : AppTheme.slate600,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Service Vendor',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 15,
                                      color: !isHost ? Colors.white : AppTheme.slate700,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Pro / Agency',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: !isHost ? Colors.white70 : AppTheme.slate500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
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
                          ? (isHost ? 'Log in as Event Host' : 'Log in to Vendor Desk')
                          : (isHost ? 'Create Host Account' : 'Register Vendor Business'),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.slate900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isHost
                          ? 'Post event needs and vendors will bid down under your budget.'
                          : 'Submit competitive bids in real-time auctions across your city.',
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
                        backgroundColor: isHost ? AppTheme.primary : AppTheme.slate900,
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
                                  ? (isHost ? 'Sign In as Event Host' : 'Sign In as Verified Vendor')
                                  : (isHost ? 'Create Host Account' : 'Register Vendor Account'),
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                            ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Quick One-Tap Demo Accounts (Matching Web)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.slate200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.zap, size: 16, color: isHost ? AppTheme.primary : AppTheme.slate900),
                        const SizedBox(width: 8),
                        Text(
                          isHost ? 'Quick Demo Host Accounts' : 'Quick Demo Vendor Accounts',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.slate900),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (isHost) ...[
                      _buildDemoChip(
                        name: 'Ananya Sharma (Host)',
                        phone: '9876543210',
                        password: 'host123',
                        roleSubtitle: 'Active events in Baner & Kothrud',
                        icon: LucideIcons.userCheck,
                      ),
                      const SizedBox(height: 8),
                      _buildDemoChip(
                        name: 'Pooja Deshmukh (Host)',
                        phone: '9890112345',
                        password: 'host123',
                        roleSubtitle: 'Sangeet sound requirements',
                        icon: LucideIcons.userCheck,
                      ),
                    ] else ...[
                      _buildDemoChip(
                        name: 'Rajesh Sound & FX Pro (Vendor)',
                        phone: '9823145678',
                        password: 'vendor123',
                        roleSubtitle: 'JBL Pro Audio · 64 completed jobs',
                        icon: LucideIcons.badgeCheck,
                      ),
                      const SizedBox(height: 8),
                      _buildDemoChip(
                        name: 'BeatDrop Audio Works (Vendor)',
                        phone: '9765432100',
                        password: 'vendor123',
                        roleSubtitle: 'RCF Active Line Array & Moving Heads',
                        icon: LucideIcons.badgeCheck,
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDemoChip({
    required String name,
    required String phone,
    required String password,
    required String roleSubtitle,
    required IconData icon,
  }) {
    final isHost = _selectedRole == UserRole.host;
    return InkWell(
      onTap: () => _applyDemo(name, phone, password),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isHost ? AppTheme.primaryLight.withValues(alpha: 0.5) : AppTheme.slate100,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isHost ? AppTheme.primary.withValues(alpha: 0.2) : AppTheme.slate300,
          ),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: isHost ? AppTheme.primary : AppTheme.slate900,
              child: Icon(icon, size: 16, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.slate900),
                  ),
                  Text(
                    roleSubtitle,
                    style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isHost ? AppTheme.primary : AppTheme.slate900,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                '1-Tap Login',
                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
