import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/requirements_provider.dart';
import 'providers/bookings_provider.dart';
import 'providers/banners_provider.dart';
import 'providers/notifications_provider.dart';
import 'providers/payments_provider.dart';
import 'screens/splash_screen.dart';
import 'widgets/live_updates_binder.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.white,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: Colors.white,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint("Note: .env file not loaded or not found ($e). Using default ApiConfig.");
  }
  runApp(const EzzyGoApp());
}

class EzzyGoApp extends StatelessWidget {
  const EzzyGoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => RequirementsProvider()),
        ChangeNotifierProvider(create: (_) => BookingsProvider()),
        ChangeNotifierProvider(create: (_) => BannersProvider()),
        ChangeNotifierProvider(create: (_) => NotificationsProvider()),
        ChangeNotifierProvider(create: (_) => PaymentsProvider()),
      ],
      child: MaterialApp(
        title: 'EzzyGo',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        builder: (context, child) => LiveUpdatesBinder(
          child: _TopSafeView(child: child ?? const SizedBox.shrink()),
        ),
        home: const SplashScreen(),
      ),
    );
  }
}

/// Keeps every screen below the status bar / notch without double-padding AppBars.
class _TopSafeView extends StatelessWidget {
  final Widget child;
  const _TopSafeView({required this.child});

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final topInset = mq.viewPadding.top;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.white,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
      child: ColoredBox(
        color: Colors.white,
        child: Padding(
          padding: EdgeInsets.only(top: topInset),
          child: MediaQuery(
            data: mq.copyWith(
              padding: mq.padding.copyWith(top: 0),
              viewPadding: mq.viewPadding.copyWith(top: 0),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
