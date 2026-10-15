import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/bookings_provider.dart';
import '../providers/requirements_provider.dart';
import '../widgets/ezzygo_logo.dart';
import 'host/host_bookings_screen.dart';
import 'host/host_home_screen.dart';
import 'host/my_events_screen.dart';
import 'host/post_requirement_screen.dart';
import 'profile_screen.dart';
import 'vendor/availability_screen.dart';
import 'vendor/live_auctions_screen.dart';
import 'vendor/vendor_bookings_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  final int initialIndex;
  const MainNavigationScreen({super.key, this.initialIndex = 0});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late int _currentIndex;
  final ScrollController _hostScrollController = ScrollController();
  final GlobalKey<HostHomeScreenState> _hostHomeKey = GlobalKey<HostHomeScreenState>();

  static const List<String> navbarCities = [
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

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  void dispose() {
    _hostScrollController.dispose();
    super.dispose();
  }

  void _scrollToFeed() {
    if (_hostHomeKey.currentState != null) {
      _hostHomeKey.currentState!.scrollToFeed();
    }
  }

  void _showCityPicker(BuildContext context) {
    final reqProvider = context.read<RequirementsProvider>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.7,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 10, bottom: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.slate300,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Text(
                  'Select Operating City',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: AppTheme.textPrimary),
                ),
              ),
              const Divider(height: 1, color: AppTheme.borderSubtle),
              Expanded(
                child: ListView.separated(
                  itemCount: navbarCities.length,
                  separatorBuilder: (_, _) => const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  itemBuilder: (_, index) {
                    final city = navbarCities[index];
                    final isSelected = reqProvider.selectedCity.toLowerCase().startsWith(city.toLowerCase());

                    return ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.primaryLight : AppTheme.slate100,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          LucideIcons.mapPin,
                          size: 16,
                          color: isSelected ? AppTheme.primary : AppTheme.textSecondary,
                        ),
                      ),
                      title: Text(
                        city,
                        style: TextStyle(
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? AppTheme.primary : AppTheme.textPrimary,
                        ),
                      ),
                      trailing: isSelected ? const Icon(Icons.check, color: AppTheme.primary, size: 20) : null,
                      onTap: () {
                        reqProvider.setSelectedCity(city);
                        Navigator.of(ctx).pop();
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final bookingsProvider = context.watch<BookingsProvider>();
    final reqProvider = context.watch<RequirementsProvider>();
    final isHost = auth.isHost;

    final activeBookingsCount = bookingsProvider.upcomingBookings.length + bookingsProvider.awaitingPaymentBookings.length;

    // 5-Item Navigation Pages for Host (Approved Design)
    final List<Widget> hostPages = [
      HostHomeScreen(
        key: _hostHomeKey,
        scrollController: _hostScrollController,
        onScrollToFeed: _scrollToFeed,
        onOpenCityPicker: () => _showCityPicker(context),
      ),
      const MyEventsScreen(),
      const SizedBox.shrink(), // Dummy for center Post action
      const HostBookingsScreen(),
      ProfileScreen(
        onNavigateToEvents: () => setState(() => _currentIndex = 1),
        onNavigateToBookings: () => setState(() => _currentIndex = 3),
      ),
    ];

    // Vendor Pages
    final List<Widget> vendorPages = [
      const LiveAuctionsScreen(),
      const VendorBookingsScreen(),
      const SizedBox.shrink(),
      const AvailabilityScreen(),
      ProfileScreen(
        onNavigateToEvents: () {},
        onNavigateToBookings: () => setState(() => _currentIndex = 1),
      ),
    ];

    final pages = isHost ? hostPages : vendorPages;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: isHost
          ? null
          : AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              scrolledUnderElevation: 0,
        titleSpacing: 16,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const EzzyGoLogo(size: 24),
            const SizedBox(width: 8),
            // City Selector Dropdown (Screen 3)
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => _showCityPicker(context),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.slate50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.borderSubtle),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(LucideIcons.mapPin, size: 12, color: AppTheme.primary),
                    const SizedBox(width: 4),
                    Text(
                      reqProvider.selectedCity.split(',')[0].trim(),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 2),
                    const Icon(LucideIcons.chevronDown, size: 12, color: AppTheme.slate600),
                  ],
                ),
              ),
            ),
          ],
        ),
        actions: [
          // Notification Bell with Red Badge (Screen 3)
          IconButton(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(LucideIcons.bell, size: 20, color: AppTheme.textPrimary),
                Positioned(
                  top: -2,
                  right: -2,
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
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('You have 3 active updates on your events & bids.'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),

          // Role Switch Pill
          GestureDetector(
            onTap: () {
              auth.switchRole();
              setState(() => _currentIndex = 0);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(auth.isHost ? 'Switched to Event Host mode' : 'Switched to Vendor mode'),
                  duration: const Duration(seconds: 2),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isHost ? AppTheme.primaryLight : AppTheme.slate900,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isHost ? AppTheme.primary.withValues(alpha: 0.3) : AppTheme.slate700,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    isHost ? LucideIcons.user : LucideIcons.briefcase,
                    size: 11,
                    color: isHost ? AppTheme.primary : Colors.white,
                  ),
                  const SizedBox(width: 3),
                  Text(
                    isHost ? 'Host' : 'Vendor',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: isHost ? AppTheme.primary : Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),

      body: pages[_currentIndex >= pages.length ? 0 : _currentIndex],

      // 5-ITEM MOBILE BOTTOM NAVIGATION (Approved Design)
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: AppTheme.borderSubtle)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // 1. Home
                _buildNavItem(
                  icon: LucideIcons.home,
                  label: 'Home',
                  isSelected: _currentIndex == 0,
                  onTap: () {
                    setState(() => _currentIndex = 0);
                    if (_hostScrollController.hasClients) {
                      _hostScrollController.animateTo(0, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
                    }
                  },
                ),

                // 2. My Events
                _buildNavItem(
                  icon: LucideIcons.calendar,
                  label: 'My Events',
                  isSelected: _currentIndex == 1,
                  onTap: () => setState(() => _currentIndex = 1),
                ),

                // 3. Central Post Action (+) (Approved Design Screen 3, 8, 12)
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
                    );
                  },
                  child: Container(
                    width: 48,
                    height: 48,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primary.withValues(alpha: 0.35),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: const Icon(LucideIcons.plus, color: Colors.white, size: 24),
                  ),
                ),

                // 4. Bookings
                _buildNavItem(
                  icon: LucideIcons.shieldCheck,
                  label: 'Bookings',
                  badgeCount: activeBookingsCount > 0 ? activeBookingsCount : null,
                  isSelected: _currentIndex == 3,
                  onTap: () => setState(() => _currentIndex = 3),
                ),

                // 5. Profile
                _buildNavItem(
                  icon: LucideIcons.user,
                  label: 'Profile',
                  isSelected: _currentIndex == 4,
                  onTap: () => setState(() => _currentIndex = 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    int? badgeCount,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: isSelected ? AppTheme.primary : AppTheme.slate500,
                ),
                if (badgeCount != null)
                  Positioned(
                    top: -4,
                    right: -8,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: AppTheme.emerald,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                      child: Text(
                        '$badgeCount',
                        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? AppTheme.primary : AppTheme.slate600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
