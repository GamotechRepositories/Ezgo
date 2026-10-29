import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Soft coral for CTAs — lighter and richer than the old neon orange.
  static const Color primary = Color(0xFFF07D4A);
  static const Color primaryHover = Color(0xFFDE6A3A);
  static const Color primaryLight = Color(0xFFFFF1EA);
  static const Color primaryDark = Color(0xFFDE6A3A);
  static const Color ink = Color(0xFF17233D);
  static const Color teal = Color(0xFF0F766E);
  static const Color tealLight = Color(0xFFE6F4F1);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFF4A06C), Color(0xFFF07D4A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Background & Surface
  static const Color background = Color(0xFFF5F6F8);
  static const Color surface = Color(0xFFFFFFFF);

  // Text
  static const Color textPrimary = Color(0xFF17233D);
  static const Color textSecondary = Color(0xFF5B6578);
  static const Color textMuted = Color(0xFF8B93A1);

  // Borders
  static const Color borderSubtle = Color(0xFFE4E7EC);

  // Semantic Status Colors
  static const Color successBg = Color(0xFFE4F7EA); // #E4F7EA
  static const Color successText = Color(0xFF18794E); // #18794E
  static const Color emerald = Color(0xFF18794E);
  static const Color emerald600 = Color(0xFF18794E);
  static const Color emeraldLight = Color(0xFFE4F7EA);
  static const Color emerald50 = Color(0xFFE4F7EA);

  static const Color amber = Color(0xFFF59E0B);
  static const Color amber500 = Color(0xFFF59E0B);
  static const Color amberLight = Color(0xFFFFF8EB);
  static const Color amber50 = Color(0xFFFFF8EB);

  static const Color rose = Color(0xFFFF5148);
  static const Color red500 = Color(0xFFFF5148);
  static const Color redLight = Color(0xFFFFECEB);
  static const Color red50 = Color(0xFFFFECEB);

  // Neutral scale mapped to approved palette
  static const Color slate900 = Color(0xFF202124);
  static const Color slate800 = Color(0xFF333333);
  static const Color slate700 = Color(0xFF555555);
  static const Color slate600 = Color(0xFF777777);
  static const Color slate500 = Color(0xFF8E8E93);
  static const Color slate400 = Color(0xFFB0B0B5);
  static const Color slate300 = Color(0xFFD5DAE0);
  static const Color slate200 = Color(0xFFE4E7EC);
  static const Color slate100 = Color(0xFFF0F2F5);
  static const Color slate50 = Color(0xFFF7F8FA);

  // Category Pastel Backgrounds
  static const Color pastelRed = Color(0xFFFFEAE9);
  static const Color pastelBlue = Color(0xFFE8F4FD);
  static const Color pastelGreen = Color(0xFFE8F8F0);
  static const Color pastelPurple = Color(0xFFF0ECFC);
  static const Color pastelAmber = Color(0xFFFFF4E8);
  static const Color pastelPink = Color(0xFFFFF0F5);

  // Modern Typography (Poppins)
  static TextStyle displayFont({
    double fontSize = 26,
    FontWeight fontWeight = FontWeight.w800,
    Color color = textPrimary,
    double? height,
    double? letterSpacing,
  }) {
    return GoogleFonts.poppins(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing ?? -0.3,
    );
  }

  static TextStyle headingFont({
    double fontSize = 18,
    FontWeight fontWeight = FontWeight.w700,
    Color color = textPrimary,
    double? height,
    double? letterSpacing,
  }) {
    return GoogleFonts.poppins(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing ?? -0.2,
    );
  }

  static TextStyle bodyFont({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w500,
    Color color = textSecondary,
    double? height,
  }) {
    return GoogleFonts.poppins(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: GoogleFonts.poppins().fontFamily,
      scaffoldBackgroundColor: background,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: _EzFadeSlideTransitionsBuilder(),
          TargetPlatform.iOS: _EzFadeSlideTransitionsBuilder(),
          TargetPlatform.windows: _EzFadeSlideTransitionsBuilder(),
        },
      ),
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: ink,
        surface: surface,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          color: textPrimary,
          letterSpacing: -0.6,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: textPrimary,
          letterSpacing: -0.3,
        ),
        titleLarge: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          color: textPrimary,
        ),
        bodyLarge: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: textPrimary,
        ),
        bodyMedium: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w400,
          color: textSecondary,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          color: textPrimary,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          elevation: 0,
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
        hintStyle: TextStyle(
          color: textSecondary,
          fontSize: 13,
        ),
      ),
      cardTheme: const CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: borderSubtle),
        ),
      ),
    );
  }
}

class _EzFadeSlideTransitionsBuilder extends PageTransitionsBuilder {
  const _EzFadeSlideTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final curved = CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0.045, 0),
          end: Offset.zero,
        ).animate(curved),
        child: child,
      ),
    );
  }
}
