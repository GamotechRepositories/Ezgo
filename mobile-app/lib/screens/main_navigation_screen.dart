import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/bookings_provider.dart';
import '../providers/requirements_provider.dart';
import '../utils/app_nav.dart';
import '../widgets/ezzygo_logo.dart';
import '../widgets/flipkart_bottom_nav.dart';
import '../widgets/tab_scroll_registry.dart';
import '../widgets/tab_swipe_shell.dart';
import 'auth/login_screen.dart';
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
  final GlobalKey<NavigatorState> _homeNavKey = GlobalKey<NavigatorState>();
  final GlobalKey<NavigatorState> _eventsNavKey = GlobalKey<NavigatorState>();
  final GlobalKey<NavigatorState> _bookingsNavKey = GlobalKey<NavigatorState>();
  final GlobalKey<NavigatorState> _profileNavKey = GlobalKey<NavigatorState>();
  final GlobalKey _bookingsIconKey = GlobalKey();

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

  static const _tabs = [
    FlipkartNavItem(
      label: 'Home',
      outlinedIcon: LucideIcons.home400,
      filledIcon: LucideIcons.home600,
    ),
    FlipkartNavItem(
      label: 'My Events',
      outlinedIcon: LucideIcons.calendarDays400,
      filledIcon: LucideIcons.calendarDays600,
    ),
    FlipkartNavItem(
      label: 'Post',
      outlinedIcon: LucideIcons.plus,
      filledIcon: LucideIcons.plus,
      isAction: true,
      accent: true,
    ),
    FlipkartNavItem(
      label: 'Bookings',
      outlinedIcon: LucideIcons.ticket400,
      filledIcon: LucideIcons.ticket600,
      showBadge: true,
    ),
    FlipkartNavItem(
      label: 'Profile',
      outlinedIcon: LucideIcons.userRound400,
      filledIcon: LucideIcons.userRound600,
      isAccount: true,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex == 2 ? 0 : widget.initialIndex;
    TabScrollRegistry.instance.register(0, _hostScrollController);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      context.read<RequirementsProvider>().loadData(
        requesterId: auth.isHost ? auth.user?.id : null,
      );
      context.read<BookingsProvider>().loadData();
    });
  }

  @override
  void dispose() {
    TabScrollRegistry.instance.unregister(0, _hostScrollController);
    _hostScrollController.dispose();
    super.dispose();
  }

  void _scrollToFeed() {
    _hostHomeKey.currentState?.scrollToFeed();
  }

  int get _stackIndex {
    switch (_currentIndex) {
      case 1:
        return 1;
      case 3:
        return 2;
      case 4:
        return 3;
      default:
        return 0;
    }
  }

  GlobalKey<NavigatorState> _navKeyFor(int index) {
    switch (index) {
      case 1:
        return _eventsNavKey;
      case 3:
        return _bookingsNavKey;
      case 4:
        return _profileNavKey;
      default:
        return _homeNavKey;
    }
  }

  void _openPost() {
    _navKeyFor(_currentIndex).currentState?.push(
      MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
    );
  }

  void _openLogin() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Login required',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              const Text(
                'Sign in to see your events and bookings.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppTheme.slate600),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.of(context, rootNavigator: true).push(
                      MaterialPageRoute(
                        builder: (_) => const LoginScreen(navigateToLocation: false),
                      ),
                    );
                  },
                  child: const Text('Login'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _onTabTap(int index) {
    if (index == 2) {
      _openPost();
      return;
    }

    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn && (index == 1 || index == 3)) {
      _openLogin();
      return;
    }

    if (index == 3) {
      context.read<BookingsProvider>().loadData();
    }

    if (_currentIndex == index) {
      _navKeyFor(index).currentState?.popUntil((route) => route.isFirst);
      TabScrollRegistry.instance.scrollToTop(index);
      if (index == 0 && _hostScrollController.hasClients) {
        _hostScrollController.animateTo(0, duration: const Duration(milliseconds: 280), curve: Curves.easeOutCubic);
      }
      return;
    }

    setState(() => _currentIndex = index);
  }

  void _selectTab(int index) {
    if (index == 2) {
      _openPost();
      return;
    }
    _onTabTap(index);
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
    final reqProvider = context.watch<RequirementsProvider>();
    final isHost = auth.isHost;

    final homePage = isHost
        ? HostHomeScreen(
            key: _hostHomeKey,
            scrollController: _hostScrollController,
            onScrollToFeed: _scrollToFeed,
            onOpenCityPicker: () => _showCityPicker(context),
            onOpenMyEvents: () => _selectTab(1),
          )
        : const LiveAuctionsScreen();
    final eventsPage = isHost ? const MyEventsScreen() : const VendorBookingsScreen();
    final bookingsPage = isHost ? const HostBookingsScreen() : const AvailabilityScreen();
    final profilePage = ProfileScreen(
      onNavigateToEvents: isHost ? () => _selectTab(1) : () {},
      onNavigateToBookings: () => _selectTab(isHost ? 3 : 1),
    );

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.dark,
        systemNavigationBarContrastEnforced: false,
      ),
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, _) {
          if (didPop) return;
          final nested = _navKeyFor(_currentIndex).currentState;
          if (nested != null && nested.canPop()) {
            nested.maybePop();
            return;
          }
          if (_currentIndex != 0) {
            _selectTab(0);
            return;
          }
          AppNav.onRootBack(context);
        },
        child: Scaffold(
          extendBody: true,
          backgroundColor: const Color(0xFFF4F5F7),
          body: Stack(
            children: [
              Column(
                children: [
                  if (!isHost) _VendorHeader(onOpenCityPicker: () => _showCityPicker(context), city: reqProvider.selectedCity),
                  Expanded(
                    child: TabSwipeShell(
                      currentIndex: _stackIndex,
                      children: [
                        _TabNavigator(navigatorKey: _homeNavKey, root: homePage),
                        _TabNavigator(navigatorKey: _eventsNavKey, root: eventsPage),
                        _TabNavigator(navigatorKey: _bookingsNavKey, root: bookingsPage),
                        _TabNavigator(navigatorKey: _profileNavKey, root: profilePage),
                      ],
                    ),
                  ),
                ],
              ),
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: _ShellNavBar(
                  currentIndex: _currentIndex,
                  onTap: _onTabTap,
                  badgeIconKey: _bookingsIconKey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShellNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final GlobalKey badgeIconKey;

  const _ShellNavBar({
    required this.currentIndex,
    required this.onTap,
    required this.badgeIconKey,
  });

  @override
  Widget build(BuildContext context) {
    final badgeCount = context.select<BookingsProvider, int>(
      (p) => p.upcomingBookings.length + p.awaitingPaymentBookings.length,
    );
    final initial = context.select<AuthProvider, String?>((auth) {
      final name = auth.user?.name.trim() ?? '';
      if (!auth.isLoggedIn || name.isEmpty) return null;
      return name[0].toUpperCase();
    });

    return FlipkartBottomNav(
      currentIndex: currentIndex,
      items: _MainNavigationScreenState._tabs,
      onTap: onTap,
      badgeCount: badgeCount,
      accountInitial: initial,
      activeColor: AppTheme.primary,
      badgeIconKey: badgeIconKey,
    );
  }
}

class _VendorHeader extends StatelessWidget {
  final VoidCallback onOpenCityPicker;
  final String city;

  const _VendorHeader({required this.onOpenCityPicker, required this.city});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
        child: Row(
          children: [
            const EzzyGoLogo(size: 24),
            const SizedBox(width: 8),
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: onOpenCityPicker,
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
                      city.split(',')[0].trim(),
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
            const Spacer(),
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
                      decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
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
          ],
        ),
      ),
    );
  }
}

class _TabNavigator extends StatefulWidget {
  final GlobalKey<NavigatorState> navigatorKey;
  final Widget root;

  const _TabNavigator({required this.navigatorKey, required this.root});

  @override
  State<_TabNavigator> createState() => _TabNavigatorState();
}

class _TabNavigatorState extends State<_TabNavigator> {
  final HeroController _heroController = HeroController();

  @override
  Widget build(BuildContext context) {
    return HeroControllerScope(
      controller: _heroController,
      child: Navigator(
        key: widget.navigatorKey,
        onGenerateRoute: (settings) {
          return MaterialPageRoute<void>(
            settings: settings,
            builder: (_) => widget.root,
          );
        },
      ),
    );
  }
}
