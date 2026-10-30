import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'app_shimmer.dart';

class AppCachedImage extends StatelessWidget {
  final String? imageUrl;
  final String? fallbackAsset;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final Widget? placeholder;
  final Widget? errorWidget;
  final int? memCacheWidth;
  final int? memCacheHeight;

  const AppCachedImage({
    super.key,
    required this.imageUrl,
    this.fallbackAsset,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.placeholder,
    this.errorWidget,
    this.memCacheWidth = 800,
    this.memCacheHeight = 800,
  });

  @override
  Widget build(BuildContext context) {
    final cleanUrl = (imageUrl ?? '').trim();

    Widget imageContent;

    if (cleanUrl.isEmpty) {
      imageContent = _buildFallback();
    } else if (cleanUrl.startsWith('assets/')) {
      imageContent = Image.asset(
        cleanUrl,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, _, _) => _buildFallback(),
      );
    } else {
      imageContent = CachedNetworkImage(
        imageUrl: cleanUrl,
        width: width,
        height: height,
        fit: fit,
        memCacheWidth: memCacheWidth,
        memCacheHeight: memCacheHeight,
        fadeInDuration: const Duration(milliseconds: 240),
        fadeOutDuration: const Duration(milliseconds: 150),
        placeholder: (context, url) =>
            placeholder ??
            AppShimmer(
              child: Container(
                width: width,
                height: height,
                color: Colors.white,
              ),
            ),
        errorWidget: (context, url, error) {
          return errorWidget ?? _buildFallback();
        },
      );
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageContent,
      );
    }

    return imageContent;
  }

  Widget _buildFallback() {
    if (fallbackAsset != null && fallbackAsset!.isNotEmpty) {
      return Image.asset(
        fallbackAsset!,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, _, _) => _buildGenericPlaceholder(),
      );
    }
    return _buildGenericPlaceholder();
  }

  Widget _buildGenericPlaceholder() {
    return Container(
      width: width,
      height: height,
      color: const Color(0xFFF1F5F9),
      child: Center(
        child: Icon(
          LucideIcons.image,
          size: 24,
          color: const Color(0xFFCBD5E1),
        ),
      ),
    );
  }
}
