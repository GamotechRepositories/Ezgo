import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class AppShimmer extends StatelessWidget {
  final Widget child;
  final Color? baseColor;
  final Color? highlightColor;

  const AppShimmer({
    super.key,
    required this.child,
    this.baseColor,
    this.highlightColor,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: baseColor ?? const Color(0xFFE8ECEF),
      highlightColor: highlightColor ?? const Color(0xFFF7F9FA),
      period: const Duration(milliseconds: 1400),
      child: child,
    );
  }
}

class ShimmerBox extends StatelessWidget {
  final double? width;
  final double? height;
  final double borderRadius;
  final BoxShape shape;

  const ShimmerBox({
    super.key,
    this.width,
    this.height,
    this.borderRadius = 12,
    this.shape = BoxShape.rectangle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: shape,
        borderRadius: shape == BoxShape.circle ? null : BorderRadius.circular(borderRadius),
      ),
    );
  }
}

class AppSkeletons {
  /// Shimmer for Hero Banner / Promo Ad
  static Widget banner({double height = 180, double borderRadius = 24}) {
    return AppShimmer(
      child: ShimmerBox(
        width: double.infinity,
        height: height,
        borderRadius: borderRadius,
      ),
    );
  }

  /// Shimmer for Category or Occasion Cards
  static Widget card({double width = 140, double height = 180, double borderRadius = 20}) {
    return AppShimmer(
      child: ShimmerBox(
        width: width,
        height: height,
        borderRadius: borderRadius,
      ),
    );
  }

  /// Shimmer for Event / Requirement Card
  static Widget requirementCard() {
    return AppShimmer(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const ShimmerBox(width: 80, height: 24, borderRadius: 8),
                const SizedBox(width: 8),
                const ShimmerBox(width: 60, height: 24, borderRadius: 8),
                const Spacer(),
                const ShimmerBox(width: 70, height: 20, borderRadius: 6),
              ],
            ),
            const SizedBox(height: 14),
            const ShimmerBox(width: double.infinity, height: 18, borderRadius: 6),
            const SizedBox(height: 8),
            const ShimmerBox(width: 220, height: 14, borderRadius: 6),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    ShimmerBox(width: 60, height: 10, borderRadius: 4),
                    SizedBox(height: 4),
                    ShimmerBox(width: 90, height: 20, borderRadius: 6),
                  ],
                ),
                const ShimmerBox(width: 100, height: 36, borderRadius: 12),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
