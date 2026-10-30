import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import 'app_cached_image.dart';

class ImagePosterCard extends StatelessWidget {
  final String title;
  final String asset;
  final String? networkImage;
  final IconData? icon;
  final Widget? iconWidget;
  final VoidCallback onTap;
  final double? width;

  const ImagePosterCard({
    super.key,
    required this.title,
    required this.asset,
    this.networkImage,
    this.icon,
    this.iconWidget,
    required this.onTap,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width,
        height: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.18),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            AppCachedImage(
              imageUrl: networkImage,
              fallbackAsset: asset,
              fit: BoxFit.cover,
            ),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0x33FFFFFF),
                    Colors.transparent,
                    Color(0x99000000),
                    Color(0xE6000000),
                  ],
                  stops: [0, 0.42, 0.72, 1],
                ),
              ),
            ),
            Positioned(
              left: 12,
              right: 12,
              bottom: 14,
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.96),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.22),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: iconWidget ??
                          Icon(icon ?? LucideIcons.sparkles, size: 18, color: AppTheme.primary),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        height: 1.1,
                        shadows: [
                          Shadow(color: Colors.black54, blurRadius: 8),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.38),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.72), width: 1.2),
                    ),
                    child: const Icon(LucideIcons.arrowRight, size: 15, color: Colors.white),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class WeddingRingsIcon extends StatelessWidget {
  final double size;
  final Color color;

  const WeddingRingsIcon({super.key, this.size = 18, this.color = AppTheme.primary});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _RingsPainter(color)),
    );
  }
}

class _RingsPainter extends CustomPainter {
  final Color color;
  _RingsPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8
      ..strokeCap = StrokeCap.round;
    final r = size.width * 0.28;
    canvas.drawCircle(Offset(size.width * 0.36, size.height * 0.52), r, paint);
    canvas.drawCircle(Offset(size.width * 0.64, size.height * 0.48), r, paint);
  }

  @override
  bool shouldRepaint(covariant _RingsPainter oldDelegate) => oldDelegate.color != color;
}
