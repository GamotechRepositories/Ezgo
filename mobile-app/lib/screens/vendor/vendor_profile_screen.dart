import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../models/booking_model.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bookings_provider.dart';
import '../../providers/requirements_provider.dart';
import '../../utils/app_nav.dart';
import '../../widgets/pull_refresh.dart';
import '../../widgets/rule_explainer_sheet.dart';
import '../../widgets/shell_bottom_insets.dart';
import '../../widgets/tab_scroll_registry.dart';
import '../../widgets/vendor_ui.dart';
import '../auth/login_screen.dart';
import '../role_selection_screen.dart';

class VendorProfileScreen extends StatefulWidget {
  final VoidCallback? onNavigateToLeads;
  final VoidCallback? onNavigateToJobs;
  final VoidCallback? onNavigateToCalendar;

  const VendorProfileScreen({
    super.key,
    this.onNavigateToLeads,
    this.onNavigateToJobs,
    this.onNavigateToCalendar,
  });

  @override
  State<VendorProfileScreen> createState() => _VendorProfileScreenState();
}

class _VendorProfileScreenState extends State<VendorProfileScreen> {
  bool _uploading = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    TabScrollRegistry.instance.register(4, _scrollController);
  }

  @override
  void dispose() {
    TabScrollRegistry.instance.unregister(4, _scrollController);
    _scrollController.dispose();
    super.dispose();
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'V';
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

  String _cityOf(UserModel? user, RequirementsProvider reqs) {
    final fromUser = (user?.serviceArea ?? '').split(',').first.trim();
    if (fromUser.isNotEmpty) return fromUser;
    if (reqs.marketplaceCity == 'ALL') return 'All Cities';
    return reqs.marketplaceCity;
  }

  bool _isDone(BookingModel b) {
    final s = b.status.toUpperCase();
    return s == 'COMPLETED' || s == 'PAYOUT_RELEASED';
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

  Future<void> _openUrl(String url) async {
    final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    if (!ok && mounted) _toast('Could not open this on your phone.');
  }

  Future<void> _refresh() async {
    await Future.wait([
      context.read<AuthProvider>().ensureSession(),
      context.read<BookingsProvider>().loadData(),
      context.read<RequirementsProvider>().loadData(marketplace: true),
    ]);
  }

  Future<void> _pickAvatar() async {
    final source = await showAppBottomSheet<ImageSource>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: AppTheme.slate200, borderRadius: BorderRadius.circular(2)),
              ),
              const SizedBox(height: 14),
              const Text('Update photo', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              ListTile(
                leading: const Icon(LucideIcons.image, color: AppTheme.ink),
                title: const Text('Choose from gallery', style: TextStyle(fontWeight: FontWeight.w700)),
                onTap: () => Navigator.pop(ctx, ImageSource.gallery),
              ),
              ListTile(
                leading: const Icon(LucideIcons.camera, color: AppTheme.primary),
                title: const Text('Take a photo', style: TextStyle(fontWeight: FontWeight.w700)),
                onTap: () => Navigator.pop(ctx, ImageSource.camera),
              ),
            ],
          ),
        ),
      ),
    );
    if (source == null || !mounted) return;
    final file = await ImagePicker().pickImage(source: source, maxWidth: 1200, maxHeight: 1200, imageQuality: 85);
    if (file == null || !mounted) return;
    setState(() => _uploading = true);
    try {
      await context.read<AuthProvider>().uploadAvatar(file.path);
      if (!mounted) return;
      _toast('Photo updated', ok: true);
    } catch (e) {
      if (!mounted) return;
      _toast(e.toString());
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
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
    if (!auth.isLoggedIn) return _signedOut();

    final bookings = context.watch<BookingsProvider>().bookings;
    final reqs = context.watch<RequirementsProvider>();
    final user = auth.user;
    final business = user?.businessName?.trim() ?? '';
    final owner = user?.name.trim() ?? '';
    final displayName = business.isNotEmpty
        ? business
        : (owner.isNotEmpty ? owner : 'Event Vendor');
    final vendorId = user?.id ?? '';
    final myBids = vendorId.isEmpty
        ? 0
        : reqs.allRequirements.where((r) => r.bids.any((b) => b.providerId == vendorId)).length;
    final jobs = bookings.length;
    final doneList = bookings.where(_isDone).toList();
    final waiting = bookings.where((b) => b.status.toUpperCase() == 'AWAITING_PAYMENT');
    final live = bookings.where((b) => b.status.toUpperCase() == 'ACTIVE');
    int sum(Iterable<BookingModel> items) => items.fold<int>(0, (s, b) => s + b.bidAmount);
    final pipeline = sum([...waiting, ...live]);
    final earned = sum(doneList);
    final city = _cityOf(user, reqs);
    final verified = user?.isVerified == true;

    return PullRefresh(
      onRefresh: _refresh,
      child: ListView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: ShellBottomInsets.listPadding(context),
        children: [
          _HeroCard(
            greeting: vendorGreeting(),
            businessName: displayName,
            ownerName: business.isNotEmpty && owner.isNotEmpty && owner.toLowerCase() != business.toLowerCase()
                ? owner
                : null,
            phone: _formatPhone(user?.phone ?? ''),
            email: user?.displayEmail ?? '',
            city: city,
            avatarUrl: user?.avatar,
            initials: _initials(displayName),
            verified: verified,
            rating: user?.rating ?? 4.9,
            completedJobs: user?.completedJobs ?? doneList.length,
            uploading: _uploading,
            onEdit: _openEditSheet,
            onPhoto: _pickAvatar,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _StatTap(
                value: '$myBids',
                label: 'Bids',
                onTap: widget.onNavigateToLeads,
              ),
              const SizedBox(width: 8),
              _StatTap(
                value: '$jobs',
                label: 'Jobs',
                onTap: widget.onNavigateToJobs,
              ),
              const SizedBox(width: 8),
              _StatTap(
                value: '${doneList.length}',
                label: 'Completed',
                onTap: widget.onNavigateToJobs,
              ),
            ],
          ),
          const SizedBox(height: 14),
          _EarningsCard(
            pipeline: pipeline,
            earned: earned,
            onOpen: () => _openEarnings(waiting.toList(), live.toList(), doneList),
          ),
          const SizedBox(height: 18),
          _section('Work'),
          _menu([
            _Row(LucideIcons.flame, AppTheme.primary, 'Open leads', 'Bid on live reverse auctions', widget.onNavigateToLeads),
            _Row(LucideIcons.briefcase, AppTheme.ink, 'My jobs', 'Accepted bids and host contact', widget.onNavigateToJobs),
            _Row(LucideIcons.calendarOff, AppTheme.teal, 'Availability', 'Block dates with offline gigs', widget.onNavigateToCalendar),
          ]),
          const SizedBox(height: 16),
          _section('Business'),
          _menu([
            _Row(LucideIcons.userRoundPen, AppTheme.ink, 'Edit profile', 'Business name, email, city and photo', _openEditSheet),
            _Row(
              verified ? LucideIcons.badgeCheck : LucideIcons.shield,
              verified ? AppTheme.emerald : AppTheme.amber,
              'Verification',
              verified ? 'Verified vendor · hosts trust your bids' : 'Complete KYC to win jobs faster',
              () => _openVerification(verified),
            ),
          ]),
          const SizedBox(height: 16),
          _section('Support'),
          _menu([
            _Row(LucideIcons.circleHelp, AppTheme.ink, 'How EzzyGo works', 'Bid 15% below budget. You get 100%', () {
              showAppBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => const RuleExplainerSheet(),
              );
            }),
            _Row(LucideIcons.headset, AppTheme.emerald, 'Help & support', 'WhatsApp, call or email us', _openHelp),
            _Row(LucideIcons.globe, AppTheme.ink, 'Host website', 'See the customer booking site', () => _openUrl(ApiConfig.hostPortalUrl)),
          ]),
          const SizedBox(height: 12),
          TextButton.icon(
            onPressed: _confirmLogout,
            icon: const Icon(LucideIcons.logOut, size: 16),
            label: const Text('Log out'),
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.rose,
              minimumSize: const Size.fromHeight(48),
            ),
          ),
        ],
      ),
    );
  }

  Widget _signedOut() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: ShellBottomInsets.listPadding(context),
      children: [
        VendorEmptyState(
          icon: LucideIcons.userRound,
          title: 'Sign in as a partner',
          message: 'See your jobs, reverse bids and payouts in one place.',
          actionLabel: 'Log in',
          onAction: () {
            Navigator.of(context, rootNavigator: true).push(
              MaterialPageRoute(
                builder: (_) => const LoginScreen(navigateToLocation: false, initialRole: UserRole.vendor),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _section(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.1,
          color: AppTheme.slate400,
        ),
      ),
    );
  }

  Widget _menu(List<_Row> rows) {
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(22),
        side: const BorderSide(color: AppTheme.borderSubtle),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++) ...[
            if (i > 0) const Divider(height: 1, indent: 62, color: AppTheme.borderSubtle),
            ListTile(
              onTap: rows[i].onTap,
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: rows[i].color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(rows[i].icon, size: 18, color: rows[i].color),
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
    await showAppBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _VendorEditSheet(
        name: auth.user?.name ?? '',
        businessName: auth.user?.businessName ?? '',
        email: auth.user?.displayEmail ?? '',
        city: _cityOf(auth.user, reqs),
      ),
    );
  }

  void _openEarnings(List<BookingModel> waiting, List<BookingModel> live, List<BookingModel> done) {
    int sum(Iterable<BookingModel> items) => items.fold<int>(0, (s, b) => s + b.bidAmount);
    showAppBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 24),
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
              const SizedBox(height: 16),
              const Text('Earnings', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.ink)),
              const SizedBox(height: 4),
              const Text(
                'You receive 100% of every accepted bid after the event. EzzyGo fee is paid by the host.',
                style: TextStyle(fontSize: 13, color: AppTheme.slate500, height: 1.35),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  _earnTile('Waiting pay', VendorMoney.of(sum(waiting)), AppTheme.amber),
                  const SizedBox(width: 8),
                  _earnTile('Live jobs', VendorMoney.of(sum(live)), AppTheme.emerald),
                  const SizedBox(width: 8),
                  _earnTile('Completed', VendorMoney.of(sum(done)), AppTheme.teal),
                ],
              ),
              if (done.isNotEmpty) ...[
                const SizedBox(height: 16),
                const Text('Completed payouts', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                const SizedBox(height: 8),
                ...done.take(4).map(
                      (b) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                b.requirementTitle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ),
                            Text(
                              VendorMoney.of(b.bidAmount),
                              style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.teal),
                            ),
                          ],
                        ),
                      ),
                    ),
              ],
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    widget.onNavigateToJobs?.call();
                  },
                  child: const Text('Open my jobs'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _earnTile(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: color)),
            const SizedBox(height: 4),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate600)),
          ],
        ),
      ),
    );
  }

  void _openVerification(bool verified) {
    showAppBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
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
              const SizedBox(height: 16),
              Row(
                children: [
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: verified ? AppTheme.emeraldLight : AppTheme.amberLight,
                    child: Icon(
                      verified ? LucideIcons.badgeCheck : LucideIcons.shield,
                      color: verified ? AppTheme.emerald : AppTheme.amber,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      verified ? 'You are a verified partner' : 'Verification pending',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.ink),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                verified
                    ? 'Hosts see a verified badge on your bids. Keep your city and business name up to date.'
                    : 'Upload Aadhaar, PAN and bank details on the vendor portal. Verified partners get accepted faster.',
                style: const TextStyle(fontSize: 13, color: AppTheme.slate500, height: 1.4),
              ),
              const SizedBox(height: 16),
              if (!verified) ...[
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _openUrl(ApiConfig.vendorPortalUrl);
                    },
                    child: const Text('Open vendor portal for KYC'),
                  ),
                ),
                const SizedBox(height: 8),
              ],
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _openUrl(ApiConfig.supportWhatsApp);
                  },
                  icon: const Icon(LucideIcons.messageCircle, size: 16),
                  label: const Text('WhatsApp support'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openHelp() {
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

class _Row {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  const _Row(this.icon, this.color, this.title, this.subtitle, this.onTap);
}

class _HeroCard extends StatelessWidget {
  final String greeting;
  final String businessName;
  final String? ownerName;
  final String phone;
  final String email;
  final String city;
  final String? avatarUrl;
  final String initials;
  final bool verified;
  final double rating;
  final int completedJobs;
  final bool uploading;
  final VoidCallback onEdit;
  final VoidCallback onPhoto;

  const _HeroCard({
    required this.greeting,
    required this.businessName,
    required this.ownerName,
    required this.phone,
    required this.email,
    required this.city,
    required this.avatarUrl,
    required this.initials,
    required this.verified,
    required this.rating,
    required this.completedJobs,
    required this.uploading,
    required this.onEdit,
    required this.onPhoto,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1C2A48), Color(0xFF121A2E)],
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.ink.withValues(alpha: 0.22),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$greeting · PARTNER STUDIO',
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: uploading ? null : onPhoto,
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 34,
                      backgroundColor: Colors.white.withValues(alpha: 0.12),
                      backgroundImage: (avatarUrl != null && avatarUrl!.isNotEmpty) ? NetworkImage(avatarUrl!) : null,
                      child: (avatarUrl == null || avatarUrl!.isEmpty)
                          ? Text(initials, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white))
                          : null,
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: CircleAvatar(
                        radius: 12,
                        backgroundColor: AppTheme.primary,
                        child: uploading
                            ? const SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 1.6, color: Colors.white))
                            : const Icon(LucideIcons.camera, size: 12, color: Colors.white),
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
                    Text(
                      businessName,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white, height: 1.15),
                    ),
                    if (ownerName != null) ...[
                      const SizedBox(height: 3),
                      Text(ownerName!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFFCBD5E1))),
                    ],
                    const SizedBox(height: 6),
                    Text(phone, style: const TextStyle(fontSize: 13, color: Color(0xFFCBD5E1))),
                    if (email.isNotEmpty)
                      Text(email, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _chip(verified ? LucideIcons.badgeCheck : LucideIcons.shield, verified ? 'Verified' : 'KYC pending'),
              _chip(LucideIcons.mapPin, city),
              _chip(LucideIcons.star, rating.toStringAsFixed(1)),
              if (completedJobs > 0) _chip(LucideIcons.briefcase, '$completedJobs jobs'),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: onEdit,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppTheme.ink,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Edit profile', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppTheme.primaryLight),
          const SizedBox(width: 5),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
        ],
      ),
    );
  }
}

class _StatTap extends StatelessWidget {
  final String value;
  final String label;
  final VoidCallback? onTap;
  const _StatTap({required this.value, required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Ink(
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Column(
              children: [
                Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.ink)),
                const SizedBox(height: 2),
                Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _EarningsCard extends StatelessWidget {
  final int pipeline;
  final int earned;
  final VoidCallback onOpen;
  const _EarningsCard({required this.pipeline, required this.earned, required this.onOpen});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(22),
        child: Ink(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(color: AppTheme.tealLight, borderRadius: BorderRadius.circular(14)),
                child: const Icon(LucideIcons.banknote, color: AppTheme.teal, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('You keep 100% of your bid', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                    const SizedBox(height: 2),
                    Text(
                      '${VendorMoney.of(pipeline)} in pipeline  ·  ${VendorMoney.of(earned)} earned',
                      style: const TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate400),
            ],
          ),
        ),
      ),
    );
  }
}

class _VendorEditSheet extends StatefulWidget {
  final String name;
  final String businessName;
  final String email;
  final String city;

  const _VendorEditSheet({
    required this.name,
    required this.businessName,
    required this.email,
    required this.city,
  });

  @override
  State<_VendorEditSheet> createState() => _VendorEditSheetState();
}

class _VendorEditSheetState extends State<_VendorEditSheet> {
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
  late final TextEditingController _business;
  late final TextEditingController _email;
  late String _city;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.name);
    _business = TextEditingController(text: widget.businessName);
    _email = TextEditingController(text: widget.email);
    _city = _cities.contains(widget.city) ? widget.city : 'Pune';
  }

  @override
  void dispose() {
    _name.dispose();
    _business.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    final business = _business.text.trim();
    if (business.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your business or crew name.'), backgroundColor: AppTheme.rose),
      );
      return;
    }
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
      reqs.setMarketplaceCity(_city);
      await auth.updateProfile(
        name: name,
        email: _email.text.trim(),
        serviceArea: _city,
        businessName: business,
      );
      if (!mounted) return;
      Navigator.pop(context);
      messenger.showSnackBar(
        const SnackBar(content: Text('Profile saved.'), backgroundColor: AppTheme.emerald, behavior: SnackBarBehavior.floating),
      );
    } catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppTheme.rose));
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
          child: SingleChildScrollView(
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
                const Text('Edit partner profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                const Text('Phone number cannot be changed.', style: TextStyle(fontSize: 12, color: AppTheme.slate500)),
                const SizedBox(height: 16),
                TextField(
                  controller: _business,
                  textCapitalization: TextCapitalization.words,
                  decoration: _dec('Business / crew name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _name,
                  textCapitalization: TextCapitalization.words,
                  decoration: _dec('Your name'),
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
                  decoration: _dec('Operating city'),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _saving ? null : _save,
                    child: _saving
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Save', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  ),
                ),
              ],
            ),
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
