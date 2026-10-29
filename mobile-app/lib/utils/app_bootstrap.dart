import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/banners_provider.dart';
import '../providers/bookings_provider.dart';
import '../providers/notifications_provider.dart';
import '../providers/payments_provider.dart';
import '../providers/requirements_provider.dart';

/// Loads session + first-screen data while splash is on screen.
class AppBootstrap {
  static Future<void>? _inflight;

  static void reset() {
    _inflight = null;
  }

  static Future<void> start(BuildContext context) {
    return _inflight ??= _load(context);
  }

  static Future<void> _load(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    final reqs = context.read<RequirementsProvider>();
    final bookings = context.read<BookingsProvider>();
    final banners = context.read<BannersProvider>();
    final notes = context.read<NotificationsProvider>();
    final payments = context.read<PaymentsProvider>();

    await auth.ensureSession();
    await reqs.ensureCityLoaded();

    final tasks = <Future<void>>[
      banners.loadForCity(reqs.selectedCity),
    ];

    if (auth.isLoggedIn) {
      tasks.add(
        reqs.loadData(
          requesterId: auth.isHost ? auth.user?.id : null,
          marketplace: !auth.isHost,
        ),
      );
      tasks.add(bookings.loadData());
      tasks.add(notes.load());
      tasks.add(payments.load());
    }

    if (context.mounted) {
      tasks.addAll([
        precacheImage(const AssetImage('assets/images/splash_wedding_bg.jpg'), context),
        precacheImage(const AssetImage('assets/images/occasion_weddings.jpg'), context),
        precacheImage(const AssetImage('assets/images/hero_wedding_bg.jpg'), context),
        precacheImage(const AssetImage('assets/images/ezgo_logo.png'), context),
      ]);
    }

    try {
      await Future.wait([
        for (final task in tasks)
          () async {
            try {
              await task;
            } catch (_) {}
          }(),
      ]).timeout(const Duration(seconds: 7));
    } catch (_) {}
  }
}
