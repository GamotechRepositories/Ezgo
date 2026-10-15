import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class EzzyGoLogo extends StatelessWidget {
  final double size;
  final bool showBadge;
  final bool isLight;
  final bool isVertical;
  final String? subtitle;

  const EzzyGoLogo({
    super.key,
    this.size = 28,
    this.showBadge = false,
    this.isLight = false,
    this.isVertical = false,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isLight ? Colors.white : AppTheme.textPrimary;
    final primaryColor = AppTheme.primary;

    if (isVertical) {
      // Centered Vertical Branding (Splash Screen & Full-screen view)
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Exact Outlined Floral Bow / Tulip Monogram from Mockup
          CustomPaint(
            size: Size(size * 1.35, size * 1.35),
            painter: _EzzyGoFloralEmblemPainter(color: primaryColor),
          ),
          const SizedBox(height: 12),
          // Wordmark "EzzyGo" with refined Serif typography from mockup
          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              style: GoogleFonts.playfairDisplay(
                fontSize: size * 0.98,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.5,
              ),
              children: [
                TextSpan(
                  text: 'Ezzy',
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                TextSpan(
                  text: 'Go',
                  style: TextStyle(
                    color: primaryColor,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: isLight ? Colors.white70 : AppTheme.textSecondary,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ],
      );
    }

    // Horizontal Inline Logo (AppBar & Navigation)
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: subtitle != null ? CrossAxisAlignment.center : CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Official 3D Royal Festival Emblem from Brand Assets
            Image.asset(
              'assets/images/logo_emblem.png',
              height: size * 1.1,
              width: size * 1.1,
              fit: BoxFit.contain,
              errorBuilder: (_, _, _) => CustomPaint(
                size: Size(size * 1.0, size * 1.0),
                painter: _EzzyGoFloralEmblemPainter(color: primaryColor),
              ),
            ),
            const SizedBox(width: 8),
            // Wordmark "EzzyGo" with Serif elegance
            RichText(
              text: TextSpan(
                style: GoogleFonts.playfairDisplay(
                  fontSize: size * 0.88,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.3,
                ),
                children: [
                  TextSpan(
                    text: 'Ezzy',
                    style: TextStyle(
                      color: textColor,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  TextSpan(
                    text: 'Go',
                    style: TextStyle(
                      color: primaryColor,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
            if (showBadge) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.primaryLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'LIVE',
                  style: GoogleFonts.plusJakartaSans(
                    color: primaryColor,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ],
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 6),
          Text(
            subtitle!,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isLight ? Colors.white70 : AppTheme.textPrimary,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ],
    );
  }
}

class _EzzyGoFloralEmblemPainter extends CustomPainter {
  final Color color;
  const _EzzyGoFloralEmblemPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final strokePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.078
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..isAntiAlias = true;

    final w = size.width;
    final h = size.height;

    // 1. Top Tulip / Heart Petals
    final topHeartPath = Path();
    topHeartPath.moveTo(w * 0.50, h * 0.44);
    topHeartPath.cubicTo(w * 0.38, h * 0.32, w * 0.18, h * 0.22, w * 0.24, h * 0.07);
    topHeartPath.cubicTo(w * 0.30, h * -0.02, w * 0.45, h * 0.08, w * 0.50, h * 0.28);
    topHeartPath.cubicTo(w * 0.55, h * 0.08, w * 0.70, h * -0.02, w * 0.76, h * 0.07);
    topHeartPath.cubicTo(w * 0.82, h * 0.22, w * 0.62, h * 0.32, w * 0.50, h * 0.44);
    canvas.drawPath(topHeartPath, strokePaint);

    // 2. Left Side Wing Loop
    final leftLoop = Path();
    leftLoop.moveTo(w * 0.48, h * 0.42);
    leftLoop.cubicTo(w * 0.28, h * 0.30, w * 0.04, h * 0.36, w * 0.06, h * 0.48);
    leftLoop.cubicTo(w * 0.08, h * 0.62, w * 0.32, h * 0.58, w * 0.48, h * 0.46);
    canvas.drawPath(leftLoop, strokePaint);

    // 3. Right Side Wing Loop
    final rightLoop = Path();
    rightLoop.moveTo(w * 0.52, h * 0.42);
    rightLoop.cubicTo(w * 0.72, h * 0.30, w * 0.96, h * 0.36, w * 0.94, h * 0.48);
    rightLoop.cubicTo(w * 0.92, h * 0.62, w * 0.68, h * 0.58, w * 0.52, h * 0.46);
    canvas.drawPath(rightLoop, strokePaint);

    // 4. Bottom Crossed Ribbon Bow Tails
    final leftTail = Path();
    leftTail.moveTo(w * 0.44, h * 0.46);
    leftTail.cubicTo(w * 0.52, h * 0.64, w * 0.76, h * 0.82, w * 0.74, h * 0.92);
    leftTail.cubicTo(w * 0.72, h * 0.98, w * 0.60, h * 0.96, w * 0.54, h * 0.82);
    canvas.drawPath(leftTail, strokePaint);

    final rightTail = Path();
    rightTail.moveTo(w * 0.56, h * 0.46);
    rightTail.cubicTo(w * 0.48, h * 0.64, w * 0.24, h * 0.82, w * 0.26, h * 0.92);
    rightTail.cubicTo(w * 0.28, h * 0.98, w * 0.40, h * 0.96, w * 0.46, h * 0.82);
    canvas.drawPath(rightTail, strokePaint);
  }

  @override
  bool shouldRepaint(covariant _EzzyGoFloralEmblemPainter oldDelegate) => oldDelegate.color != color;
}
