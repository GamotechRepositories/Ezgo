import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/api_config.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/bookings_provider.dart';
import '../providers/requirements_provider.dart';
import '../utils/app_nav.dart';
import '../widgets/pull_refresh.dart';
import '../widgets/rule_explainer_sheet.dart';
import '../widgets/shell_bottom_insets.dart';
import '../widgets/tab_scroll_registry.dart';
import 'host/payment_history_screen.dart';
import 'role_selection_screen.dart';

class ProfileScreen extends StatefulWidget {
  final VoidCallback? onNavigateToEvents;
  final VoidCallback? onNavigateToBookings;

  const ProfileScreen({
    super.key,
    this.onNavigateToEvents,
    this.onNavigateToBookings,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _uploading = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    TabScrollRegistry.instance.register(3, _scrollController);
    TabScrollRegistry.instance.register(4, _scrollController);
  }

  @override
  void dispose() {
    TabScrollRegistry.instance.unregister(3, _scrollController);
    TabScrollRegistry.instance.unregister(4, _scrollController);
    _scrollController.dispose();
    super.dispose();
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'H';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  String _formatPhone(String raw) {
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    if (digits.length >= 10) {
      final last10 = digits.substring(digits.length - 10);
      return '+91 ${last10.substring(0, 5)} ${last10.substring(5)}';
    }
    return raw.isEmpty ? 'Add phone in account' : raw;
  }

  Future<void> _pickAvatar() async {
    final auth = context.read<AuthProvider>();
    final file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1200,
      maxHeight: 1200,
      imageQuality: 85,
    );
    if (file == null || !mounted) return;
    setState(() => _uploading = true);
    try {
      await auth.uploadAvatar(file.path);
      if (!mounted) return;
      _toast('Photo updated', ok: true);
    } catch (e) {
      if (!mounted) return;
      _toast(e.toString());
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _openUrl(String url) async {
    final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    if (!ok && mounted) _toast('Could not open this on your phone.');
  }

  void _toast(String message, {bool ok = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: ok ? AppTheme.emerald : AppTheme.rose,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _confirmLogout() async {
    final should = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Log out?', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('You can sign in again anytime with the same number.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.rose, foregroundColor: Colors.white),
            child: const Text('Log out'),
          ),
        ],
      ),
    );
    if (should != true || !mounted) return;
    context.read<AuthProvider>().logout();
    AppNav.openRoot(context, const RoleSelectionScreen());
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final bookings = context.watch<BookingsProvider>();
    final reqs = context.watch<RequirementsProvider>();
    final user = auth.user;
    final name = (user?.name.trim().isNotEmpty == true) ? user!.name : 'Event Host';
    final events = reqs.mine(user?.id).length;
    final active = bookings.upcomingBookings.length + bookings.awaitingPaymentBookings.length;
    final done = bookings.completedBookings.length;
    final city = reqs.selectedCity;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: PullRefresh(
        onRefresh: _refreshProfile,
        child: ListView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(16, 8, 16, ShellBottomInsets.of(context)),
        children: [
          const Text(
            'My Account',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 4),
          const Text(
            'Your details, events and bookings.',
            style: TextStyle(fontSize: 13, color: AppTheme.slate500),
          ),
          const SizedBox(height: 16),
          _accountCard(
            name: name,
            phone: _formatPhone(user?.phone ?? ''),
            email: user?.displayEmail ?? '',
            city: city,
            avatarUrl: user?.avatar,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _countBox('$events', 'Events'),
              const SizedBox(width: 10),
              _countBox('$active', 'Bookings'),
              const SizedBox(width: 10),
              _countBox('$done', 'Completed'),
            ],
          ),
          const SizedBox(height: 16),
          _menuCard([
            _MenuRow(LucideIcons.userRoundPen, 'Edit profile', 'Name, email, city and photo', () => _openEditSheet()),
            _MenuRow(LucideIcons.calendar, 'My events', 'See posted events and vendor bids', () => widget.onNavigateToEvents?.call()),
            _MenuRow(LucideIcons.shieldCheck, 'My bookings', 'Pay, track and complete bookings', () => widget.onNavigateToBookings?.call()),
            _MenuRow(LucideIcons.creditCard, 'Payment history', 'Escrow payments, refunds and receipts', () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()),
              );
            }),
            _MenuRow(LucideIcons.circleHelp, 'How EzzyGo works', '15% bids, 10% fee, escrow until event done', () {
              showAppBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => const RuleExplainerSheet(),
              );
            }),
            _MenuRow(LucideIcons.headset, 'Help & support', 'WhatsApp, call or email us', _openHelpSheet),
            _MenuRow(LucideIcons.briefcase, 'Vendor portal', 'If you sell event services', () => _openUrl(ApiConfig.vendorPortalUrl)),
          ]),
          const SizedBox(height: 12),
          TextButton.icon(
            onPressed: _confirmLogout,
            icon: const Icon(LucideIcons.logOut, size: 16),
            label: const Text('Log out'),
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.rose,
              minimumSize: const Size.fromHeight(46),
            ),
          ),
        ],
      ),
      ),
    );
  }

  Future<void> _refreshProfile() async {
    final auth = context.read<AuthProvider>();
    await Future.wait([
      auth.ensureSession(),
      context.read<BookingsProvider>().loadData(),
      context.read<RequirementsProvider>().loadData(
        requesterId: auth.isHost ? auth.user?.id : null,
        marketplace: !auth.isHost,
      ),
    ]);
  }

  Widget _accountCard({
    required String name,
    required String phone,
    required String email,
    required String city,
    required String? avatarUrl,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: _uploading ? null : _pickAvatar,
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: AppTheme.primaryLight,
                  backgroundImage: (avatarUrl != null && avatarUrl.isNotEmpty) ? NetworkImage(avatarUrl) : null,
                  child: (avatarUrl == null || avatarUrl.isEmpty)
                      ? Text(
                          _initials(name),
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.primary),
                        )
                      : null,
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: CircleAvatar(
                    radius: 11,
                    backgroundColor: AppTheme.primary,
                    child: _uploading
                        ? const SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 1.6, color: Colors.white))
                        : const Icon(LucideIcons.camera, size: 11, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
                const SizedBox(height: 2),
                Text(phone, style: const TextStyle(fontSize: 13, color: AppTheme.slate600)),
                if (email.isNotEmpty)
                  Text(email, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: AppTheme.slate500)),
                Text(city, style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          TextButton(
            onPressed: _openEditSheet,
            child: const Text('Edit', style: TextStyle(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  Widget _countBox(String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderSubtle),
        ),
        child: Column(
          children: [
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.textPrimary)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _menuCard(List<_MenuRow> rows) {
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppTheme.borderSubtle),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++) ...[
            if (i > 0) const Divider(height: 1, indent: 58, color: AppTheme.borderSubtle),
            ListTile(
              onTap: rows[i].onTap,
              leading: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(color: AppTheme.slate100, borderRadius: BorderRadius.circular(12)),
                child: Icon(rows[i].icon, size: 18, color: AppTheme.ink),
              ),
              title: Text(rows[i].title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              subtitle: Text(rows[i].subtitle, style: const TextStyle(fontSize: 12, color: AppTheme.slate500)),
              trailing: const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate400),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _openEditSheet() async {
    final auth = context.read<AuthProvider>();
    final reqs = context.read<RequirementsProvider>();
    final serviceCity = (auth.user?.serviceArea ?? '').split(',').first.trim();
    await showAppBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EditProfileSheet(
        name: auth.user?.name ?? '',
        email: auth.user?.displayEmail ?? '',
        city: serviceCity.isNotEmpty ? serviceCity : reqs.selectedCity,
      ),
    );
  }

  void _openHelpSheet() {
    showAppBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: AppTheme.slate200, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 14),
              const Text('Need help?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              const SizedBox(height: 4),
              const Text('We reply on WhatsApp fastest.', style: TextStyle(fontSize: 13, color: AppTheme.slate500)),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(LucideIcons.messageCircle, color: AppTheme.emerald),
                title: const Text('WhatsApp', style: TextStyle(fontWeight: FontWeight.w700)),
                subtitle: const Text('+91 93220 54199'),
                onTap: () {
                  Navigator.pop(ctx);
                  _openUrl(ApiConfig.supportWhatsApp);
                },
              ),
              ListTile(
                leading: const Icon(LucideIcons.phone, color: AppTheme.primary),
                title: const Text('Call', style: TextStyle(fontWeight: FontWeight.w700)),
                subtitle: const Text('+91 93220 54199 · 9 AM – 9 PM'),
                onTap: () {
                  Navigator.pop(ctx);
                  _openUrl(ApiConfig.supportPhone);
                },
              ),
              ListTile(
                leading: const Icon(LucideIcons.mail, color: AppTheme.slate700),
                title: const Text('Email', style: TextStyle(fontWeight: FontWeight.w700)),
                subtitle: const Text('support@ezzygo.in'),
                onTap: () {
                  Navigator.pop(ctx);
                  _openUrl(ApiConfig.supportEmail);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuRow {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  const _MenuRow(this.icon, this.title, this.subtitle, this.onTap);
}

class _EditProfileSheet extends StatefulWidget {
  final String name;
  final String email;
  final String city;

  const _EditProfileSheet({
    required this.name,
    required this.email,
    required this.city,
  });

  @override
  State<_EditProfileSheet> createState() => _EditProfileSheetState();
}

class _EditProfileSheetState extends State<_EditProfileSheet> {
  static const _cities = [
    'Pune',
    'Mumbai',
    'Bengaluru',
    'Hyderabad',
    'Delhi',
    'Nagpur',
    'Nashik',
    'Jaipur',
    'Goa',
    'Ahmedabad',
    'Kolkata',
    'Chennai',
  ];

  late final TextEditingController _name;
  late final TextEditingController _email;
  late String _city;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.name);
    _email = TextEditingController(text: widget.email);
    _city = _cities.contains(widget.city) ? widget.city : 'Pune';
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your name.'), backgroundColor: AppTheme.rose),
      );
      return;
    }
    final messenger = ScaffoldMessenger.of(context);
    final reqs = context.read<RequirementsProvider>();
    final auth = context.read<AuthProvider>();
    setState(() => _saving = true);
    try {
      reqs.setSelectedCity(_city);
      if (auth.isVendor) reqs.setMarketplaceCity(_city);
      await auth.updateProfile(
        name: name,
        email: _email.text.trim(),
        serviceArea: _city,
      );
      if (!mounted) return;
      Navigator.pop(context);
      messenger.showSnackBar(
        const SnackBar(content: Text('Profile saved.'), backgroundColor: AppTheme.emerald, behavior: SnackBarBehavior.floating),
      );
    } catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: AppTheme.rose),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: AppTheme.slate200, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 14),
              const Text('Edit profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              const SizedBox(height: 4),
              const Text('Phone number cannot be changed.', style: TextStyle(fontSize: 12, color: AppTheme.slate500)),
              const SizedBox(height: 16),
              TextField(
                controller: _name,
                textCapitalization: TextCapitalization.words,
                decoration: _dec('Full name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: _dec('Email (optional)'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                key: ValueKey(_city),
                initialValue: _city,
                items: _cities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _city = v);
                },
                decoration: _dec('City'),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _saving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Save', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _dec(String label) {
    return InputDecoration(
      labelText: label,
      filled: true,
      fillColor: AppTheme.slate50,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppTheme.slate200)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppTheme.slate200)),
    );
  }
}
