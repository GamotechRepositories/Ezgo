import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/bookings_provider.dart';
import '../widgets/rule_explainer_sheet.dart';
import 'auth/login_screen.dart';
import 'host/host_bookings_screen.dart';
import 'host/my_events_screen.dart';
import 'host/service_catalog_screen.dart';

class ProfileScreen extends StatelessWidget {
  final VoidCallback? onNavigateToEvents;
  final VoidCallback? onNavigateToBookings;

  const ProfileScreen({
    super.key,
    this.onNavigateToEvents,
    this.onNavigateToBookings,
  });

  void _handleLogout(BuildContext context) {
    context.read<AuthProvider>().logout();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final userName = user?.name ?? 'Roshan Chaudhari';
    final userEmail = user?.email ?? 'roshan@gmail.com';

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // User Header Card (Screen 12)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.borderSubtle),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Photo Avatar
                  ClipOval(
                    child: SizedBox(
                      width: 56,
                      height: 56,
                      child: Image.asset(
                        'assets/images/user_avatar.png',
                        fit: BoxFit.cover,
                        filterQuality: FilterQuality.high,
                        errorBuilder: (context, error, stackTrace) => Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppTheme.primaryGradient,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            userName.isNotEmpty ? userName[0].toUpperCase() : 'R',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),

                  // Name & Email
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          userName,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          userEmail,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Edit Button
                  OutlinedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Edit Profile coming in next update.'),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.textPrimary,
                      side: const BorderSide(color: AppTheme.borderSubtle),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    ),
                    child: const Text('Edit', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Gold Premium Banner (Screen 12)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFF7E6), Color(0xFFFFECC2)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFFFD580)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.amber.withValues(alpha: 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Row(
                children: [
                  Icon(LucideIcons.crown, color: Color(0xFFB45309), size: 28),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Premium Member',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF78350F),
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Get exclusive benefits and faster support',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF92400E),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(LucideIcons.chevronRight, size: 18, color: Color(0xFF92400E)),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Profile Menu List Card (Screen 12)
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
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
                children: [
                  _buildMenuItem(
                    icon: LucideIcons.user,
                    title: 'My Profile',
                    onTap: () {},
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.calendar,
                    title: 'My Events',
                    onTap: () {
                      if (onNavigateToEvents != null) {
                        onNavigateToEvents!();
                      } else {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const MyEventsScreen()),
                        );
                      }
                    },
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.shieldCheck,
                    title: 'My Bookings',
                    onTap: () {
                      if (onNavigateToBookings != null) {
                        onNavigateToBookings!();
                      } else {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const HostBookingsScreen()),
                        );
                      }
                    },
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.heart,
                    title: 'Saved Services',
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const ServiceCatalogScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.receipt,
                    title: 'Payment History',
                    onTap: () {
                      final bProvider = context.read<BookingsProvider>();
                      final firstBooking = bProvider.bookings.isNotEmpty ? bProvider.bookings.first : null;
                      if (firstBooking != null) {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => HostBookingsScreen()),
                        );
                      }
                    },
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.bell,
                    title: 'Notifications',
                    badgeText: '3',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('You have 3 new bids on your Wedding requirement!'),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.helpCircle,
                    title: 'Help Center',
                    onTap: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (_) => const RuleExplainerSheet(),
                      );
                    },
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.settings,
                    title: 'Settings',
                    onTap: () {},
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.repeat,
                    title: auth.isHost ? 'Switch to Vendor Desk' : 'Switch to Host Mode',
                    onTap: () {
                      auth.switchRole();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(auth.isHost ? 'Host Mode Active' : 'Vendor Mode Active'),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                  const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  _buildMenuItem(
                    icon: LucideIcons.logOut,
                    title: 'Logout',
                    iconColor: AppTheme.primary,
                    textColor: AppTheme.primary,
                    showChevron: false,
                    onTap: () => _handleLogout(context),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    String? badgeText,
    Color? iconColor,
    Color? textColor,
    bool showChevron = true,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 20, color: iconColor ?? AppTheme.slate700),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textColor ?? AppTheme.textPrimary,
                ),
              ),
            ),
            if (badgeText != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: const BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  badgeText,
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(width: 8),
            ],
            if (showChevron)
              const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.slate400),
          ],
        ),
      ),
    );
  }
}
