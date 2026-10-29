import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/bookings_provider.dart';
import '../providers/notifications_provider.dart';
import '../providers/requirements_provider.dart';
import '../utils/app_nav.dart';
import '../widgets/ezzygo_logo.dart';
import '../widgets/flipkart_bottom_nav.dart';
import '../widgets/notification_bell.dart';
import '../widgets/shell_bottom_insets.dart';
import '../widgets/tab_scroll_registry.dart';
import '../widgets/tab_swipe_shell.dart';
import 'auth/login_screen.dart';
import 'host/host_bookings_screen.dart';
import 'host/host_home_screen.dart';
import 'host/my_events_screen.dart';
import 'host/post_requirement_screen.dart';
import '../models/user_model.dart';
import 'profile_screen.dart';
import 'vendor/availability_screen.dart';
import 'vendor/live_auctions_screen.dart';
import 'vendor/vendor_bookings_screen.dart';
import 'vendor/vendor_dashboard_screen.dart';
import 'vendor/vendor_profile_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  final int initialIndex;
  const MainNavigationScreen({super.key, this.initialIndex = 0});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late int _currentIndex;
  int _postFromIndex = 0;
  final ScrollController _hostScrollController = ScrollController();
  final GlobalKey<HostHomeScreenState> _hostHomeKey = GlobalKey<HostHomeScreenState>();
  final GlobalKey<NavigatorState> _homeNavKey = GlobalKey<NavigatorState>();
  final GlobalKey<NavigatorState> _eventsNavKey = GlobalKey<NavigatorState>();
  final GlobalKey<NavigatorState> _bookingsNavKey = GlobalKey<NavigatorState>();
  final GlobalKey<NavigatorState> _calendarNavKey = GlobalKey<NavigatorState>();
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

  static const _hostTabs = [
    FlipkartNavItem(
      label: 'Home',
      outlinedIcon: Icons.home_outlined,
      filledIcon: Icons.home_rounded,
    ),
    FlipkartNavItem(
      label: 'My Events',
      outlinedIcon: Icons.event_note_outlined,
      filledIcon: Icons.event_note_rounded,
    ),
    FlipkartNavItem(
      label: 'Post',
      outlinedIcon: Icons.add_rounded,
      filledIcon: Icons.add_rounded,
      isAction: true,
      accent: true,
    ),
    FlipkartNavItem(
      label: 'Bookings',
      outlinedIcon: Icons.receipt_long_outlined,
      filledIcon: Icons.receipt_long_rounded,
      showBadge: true,
    ),
    FlipkartNavItem(
      label: 'Profile',
      outlinedIcon: Icons.person_outline_rounded,
      filledIcon: Icons.person_rounded,
      isAccount: true,
    ),
  ];

  static const _vendorTabs = [
    FlipkartNavItem(
      label: 'Home',
      outlinedIcon: Icons.dashboard_outlined,
      filledIcon: Icons.dashboard_rounded,
    ),
    FlipkartNavItem(
      label: 'Leads',
      outlinedIcon: Icons.local_fire_department_outlined,
      filledIcon: Icons.local_fire_department_rounded,
    ),
    FlipkartNavItem(
      label: 'Jobs',
      outlinedIcon: Icons.work_outline_rounded,
      filledIcon: Icons.work_rounded,
      showBadge: true,
    ),
    FlipkartNavItem(
      label: 'Calendar',
      outlinedIcon: Icons.calendar_month_outlined,
      filledIcon: Icons.calendar_month_rounded,
    ),
    FlipkartNavItem(
      label: 'Profile',
      outlinedIcon: Icons.person_outline_rounded,
      filledIcon: Icons.person_rounded,
      isAccount: true,
    ),
  ];

  @override
  void initState() {
    super.initState();
    final isVendor = context.read<AuthProvider>().isVendor;
    _currentIndex = isVendor
        ? widget.initialIndex.clamp(0, 4)
        : (widget.initialIndex == 2 ? 0 : widget.initialIndex);
    TabScrollRegistry.instance.register(0, _hostScrollController);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      context.read<RequirementsProvider>().loadData(
        requesterId: auth.isHost ? auth.user?.id : null,
        marketplace: !auth.isHost,
      );
      context.read<BookingsProvider>().loadData();
      context.read<NotificationsProvider>().load();
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

  bool get _isVendor => context.read<AuthProvider>().isVendor;

  int get _visibleTabIndex => _isVendor
      ? _currentIndex
      : (_currentIndex == 2 ? _postFromIndex : _currentIndex);

  int get _stackIndex {
    if (_isVendor) return _currentIndex.clamp(0, 4);
    switch (_visibleTabIndex) {
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
    if (_isVendor) {
      switch (index) {
        case 1:
          return _eventsNavKey;
        case 2:
          return _bookingsNavKey;
        case 3:
          return _calendarNavKey;
        case 4:
          return _profileNavKey;
        default:
          return _homeNavKey;
      }
    }
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
    final fromIndex = _currentIndex == 2 ? _postFromIndex : _currentIndex;
    _postFromIndex = fromIndex;
    setState(() => _currentIndex = 2);
    _navKeyFor(fromIndex).currentState?.push(
      MaterialPageRoute(builder: (_) => const PostRequirementScreen()),
    ).then((posted) {
      if (!mounted || _currentIndex != 2) return;
      if (posted == true) {
        _selectTab(1);
      } else {
        setState(() => _currentIndex = fromIndex);
      }
    });
  }

  void _openLogin() {
    final vendor = context.read<AuthProvider>().isVendor;
    showAppBottomSheet<void>(
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
              Text(
                vendor
                    ? 'Sign in to see your jobs, leads and bookings.'
                    : 'Sign in to see your events and bookings.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppTheme.slate600),
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
                        builder: (_) => LoginScreen(
                          navigateToLocation: false,
                          initialRole: vendor ? UserRole.vendor : UserRole.host,
                        ),
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
    final auth = context.read<AuthProvider>();
    if (auth.isHost && index == 2) {
      _openPost();
      return;
    }

    if (!auth.isLoggedIn &&
        (auth.isVendor ? (index == 2 || index == 3 || index == 4) : (index == 1 || index == 3))) {
      _openLogin();
      return;
    }

    if (index == 0) {
      context.read<RequirementsProvider>().loadData(
        requesterId: auth.isHost ? auth.user?.id : null,
        marketplace: !auth.isHost,
      );
      if (auth.isVendor) context.read<BookingsProvider>().loadData();
    }
    if (auth.isVendor && index == 1) {
      context.read<RequirementsProvider>().loadData(marketplace: true);
    }
    if (auth.isVendor && index == 2) {
      context.read<BookingsProvider>().loadData();
      context.read<BookingsProvider>().markCurrentSeen();
    }
    if (auth.isVendor && index == 3) {
      context.read<AuthProvider>().ensureSession();
    }
    if (auth.isVendor && index == 4) {
      context.read<BookingsProvider>().loadData();
    }
    if (auth.isHost && index == 1) {
      context.read<NotificationsProvider>().markAllRead();
      context.read<RequirementsProvider>().loadData(requesterId: auth.user?.id);
    }
    if (auth.isHost && index == 3) {
      context.read<BookingsProvider>().loadData();
      context.read<BookingsProvider>().markCurrentSeen();
      context.read<RequirementsProvider>().loadData(requesterId: auth.user?.id);
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
    _onTabTap(index);
  }

  void _showCityPicker(BuildContext context, {bool vendorMarketplace = false}) {
    final reqProvider = context.read<RequirementsProvider>();
    final cities = vendorMarketplace ? ['All Cities', ...navbarCities] : navbarCities;

    showAppBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
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
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Text(
                    vendorMarketplace ? 'Marketplace city' : 'Select city',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: AppTheme.textPrimary),
                  ),
                ),
              const Divider(height: 1, color: AppTheme.borderSubtle),
              Expanded(
                child: ListView.separated(
                  itemCount: cities.length,
                  separatorBuilder: (_, _) => const Divider(height: 1, indent: 56, color: AppTheme.borderSubtle),
                  itemBuilder: (_, index) {
                    final city = cities[index];
                    final current = vendorMarketplace ? reqProvider.marketplaceCity : reqProvider.selectedCity;
                    final isSelected = city == 'All Cities'
                        ? current == 'ALL'
                        : current.toLowerCase().startsWith(city.toLowerCase());

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
                        if (vendorMarketplace) {
                          reqProvider.setMarketplaceCity(city == 'All Cities' ? 'ALL' : city);
                        } else {
                          reqProvider.setSelectedCity(city);
                        }
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
        : VendorDashboardScreen(
            onOpenLeads: () => _selectTab(1),
            onOpenJobs: () => _selectTab(2),
            onOpenCalendar: () => _selectTab(3),
            onOpenProfile: () => _selectTab(4),
          );
    final eventsPage = isHost ? const MyEventsScreen() : const LiveAuctionsScreen();
    final bookingsPage = isHost ? const HostBookingsScreen() : const VendorBookingsScreen();
    final calendarPage = const AvailabilityScreen();
    final profilePage = isHost
        ? ProfileScreen(
            onNavigateToEvents: () => _selectTab(1),
            onNavigateToBookings: () => _selectTab(3),
          )
        : VendorProfileScreen(
            onNavigateToLeads: () => _selectTab(1),
            onNavigateToJobs: () => _selectTab(2),
            onNavigateToCalendar: () => _selectTab(3),
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
                  if (!isHost)
                    _VendorHeader(
                      onOpenCityPicker: () => _showCityPicker(context, vendorMarketplace: true),
                      city: reqProvider.marketplaceCity == 'ALL' ? 'All Cities' : reqProvider.marketplaceCity,
                      showCity: _currentIndex == 0 || _currentIndex == 1,
                    ),
                  Expanded(
                    child: ShellNavScope(
                      child: Padding(
                        padding: EdgeInsets.only(bottom: ShellBottomInsets.reserved(context)),
                        child: MediaQuery.removePadding(
                          context: context,
                          removeBottom: true,
                          child: TabSwipeShell(
                            currentIndex: _stackIndex,
                            children: isHost
                                ? [
                                    _TabNavigator(navigatorKey: _homeNavKey, root: homePage),
                                    _TabNavigator(navigatorKey: _eventsNavKey, root: eventsPage),
                                    _TabNavigator(navigatorKey: _bookingsNavKey, root: bookingsPage),
                                    _TabNavigator(navigatorKey: _profileNavKey, root: profilePage),
                                  ]
                                : [
                                    _TabNavigator(navigatorKey: _homeNavKey, root: homePage),
                                    _TabNavigator(navigatorKey: _eventsNavKey, root: eventsPage),
                                    _TabNavigator(navigatorKey: _bookingsNavKey, root: bookingsPage),
                                    _TabNavigator(navigatorKey: _calendarNavKey, root: calendarPage),
                                    _TabNavigator(navigatorKey: _profileNavKey, root: profilePage),
                                  ],
                          ),
                        ),
                      ),
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
                  isVendor: !isHost,
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
  final bool isVendor;

  const _ShellNavBar({
    required this.currentIndex,
    required this.onTap,
    required this.badgeIconKey,
    this.isVendor = false,
  });

  @override
  Widget build(BuildContext context) {
    final unread = context.select<NotificationsProvider, int>((p) => p.unreadCount);
    final bookingBadge = context.select<BookingsProvider, int>((p) => p.unseenBadgeCount);
    final initial = context.select<AuthProvider, String?>((auth) {
      final name = auth.user?.name.trim() ?? '';
      if (!auth.isLoggedIn || name.isEmpty) return null;
      return name[0].toUpperCase();
    });

    final items = isVendor ? _MainNavigationScreenState._vendorTabs : _MainNavigationScreenState._hostTabs;
    return FlipkartBottomNav(
      currentIndex: currentIndex.clamp(0, items.length - 1),
      items: items,
      onTap: onTap,
      badgeCount: bookingBadge,
      badgeCounts: isVendor ? [0, 0, bookingBadge, 0, 0] : [0, unread, 0, bookingBadge, 0],
      accountInitial: initial,
      activeColor: AppTheme.primary,
      badgeIconKey: badgeIconKey,
    );
  }
}

class _VendorHeader extends StatelessWidget {
  final VoidCallback onOpenCityPicker;
  final String city;
  final bool showCity;

  const _VendorHeader({
    required this.onOpenCityPicker,
    required this.city,
    this.showCity = true,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 10, 10, 12),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: Color(0xFFF0F1F4))),
          ),
          child: Row(
            children: [
              const EzzyGoLogo(size: 24),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryLight,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'PARTNER',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                    color: AppTheme.primary,
                  ),
                ),
              ),
              const Spacer(),
              if (showCity)
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: onOpenCityPicker,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                    decoration: BoxDecoration(
                      color: AppTheme.ink,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.mapPin, size: 13, color: AppTheme.primary),
                        const SizedBox(width: 5),
                        Text(
                          city.split(',')[0].trim(),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 3),
                        const Icon(LucideIcons.chevronDown, size: 13, color: Colors.white70),
                      ],
                    ),
                  ),
                ),
              if (showCity) const SizedBox(width: 8),
              const NotificationBellButton(size: 38, iconSize: 18),
            ],
          ),
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
