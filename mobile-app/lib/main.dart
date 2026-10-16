import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/requirements_provider.dart';
import 'providers/bookings_provider.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
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
      ],
      child: MaterialApp(
        title: 'EzzyGo',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
