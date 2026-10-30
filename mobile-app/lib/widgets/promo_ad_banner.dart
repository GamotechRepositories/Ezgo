import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../models/banner_model.dart';
import 'app_cached_image.dart';

class PromoAdBanner extends StatefulWidget {
  final List<BannerModel> banners;
  final String currentCity;
  final bool isLoading;
  final void Function(BannerModel banner) onAction;

  const PromoAdBanner({
    super.key,
    required this.banners,
    required this.currentCity,
    required this.onAction,
    this.isLoading = false,
  });

  @override
  State<PromoAdBanner> createState() => _PromoAdBannerState();
}

class _PromoAdBannerState extends State<PromoAdBanner> {
  PageController? _pageController;
  Timer? _timer;
  int _index = 0;

  List<BannerModel> get _ads => widget.banners.where((b) => b.isActive).toList();

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startTimer();
  }

  @override
  void didUpdateWidget(covariant PromoAdBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.banners != widget.banners) {
      _index = 0;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        final controller = _pageController;
        if (controller != null && controller.hasClients) {
          controller.jumpToPage(0);
        }
        _startTimer();
      });
    }
  }

  void _startTimer() {
    _timer?.cancel();
    if (_ads.length <= 1) return;
    _timer = Timer.periodic(const Duration(seconds: 6), (_) {
      if (!mounted) return;
      final controller = _pageController;
      if (controller == null || !controller.hasClients) return;
      controller.animateToPage(
        (_index + 1) % _ads.length,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController?.dispose();
    _pageController = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ads = _ads;
    if (ads.isEmpty) return const SizedBox.shrink();
    final count = ads.length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
      child: Column(
        children: [
          SizedBox(
            height: 196,
            child: PageView.builder(
              controller: _pageController,
              itemCount: count,
              onPageChanged: (i) {
                if (!mounted) return;
                setState(() => _index = i);
              },
              itemBuilder: (context, i) => _AdCard(
                banner: ads[i],
                onTap: () => widget.onAction(ads[i]),
              ),
            ),
          ),
          if (count > 1) ...[
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(count, (i) {
                final active = i == _index;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  height: 6,
                  width: active ? 18 : 6,
                  decoration: BoxDecoration(
                    color: active ? AppTheme.primary : AppTheme.slate300,
                    borderRadius: BorderRadius.circular(8),
                  ),
                );
              }),
            ),
          ],
        ],
      ),
    );
  }
}

class _AdCard extends StatelessWidget {
  final BannerModel banner;
  final VoidCallback onTap;

  const _AdCard({required this.banner, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.borderSubtle),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            _AdPhoto(banner: banner),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Color(0xCC111827),
                    Color(0x66111827),
                    Color(0x14111827),
                  ],
                  stops: [0.0, 0.48, 1.0],
                ),
              ),
            ),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [Color(0x99000000), Color(0x00000000)],
                  stops: [0.0, 0.45],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.fromLTRB(5, 3, 8, 3),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.45),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFBBF24),
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: const Text(
                            'AD',
                            style: TextStyle(
                              color: Color(0xFF111827),
                              fontSize: 8,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ),
                        if (banner.badge.trim().isNotEmpty) ...[
                          const SizedBox(width: 6),
                          Text(
                            banner.badge,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const Spacer(),
                  if (banner.discountPercent > 0)
                    Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Save ${banner.discountPercent}%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  Text(
                    banner.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      height: 1.2,
                    ),
                  ),
                  if (banner.subtitle.trim().isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      banner.subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFFE5E7EB),
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          banner.ctaText.isEmpty ? 'View offer' : banner.ctaText,
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(LucideIcons.arrowRight, size: 14, color: Colors.white),
                      ],
                    ),
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

class _AdPhoto extends StatelessWidget {
  final BannerModel banner;
  const _AdPhoto({required this.banner});

  @override
  Widget build(BuildContext context) {
    final url = banner.resolvedImageUrl;
    final dpr = MediaQuery.devicePixelRatioOf(context);
    final cacheWidth = (MediaQuery.sizeOf(context).width * dpr).round().clamp(600, 1400);

    Widget fallback() => Image.asset(
          banner.assetFallback,
          fit: BoxFit.cover,
          alignment: Alignment.centerRight,
        );

    if (!url.startsWith('http')) return fallback();

    return AppCachedImage(
      imageUrl: url,
      fallbackAsset: banner.assetFallback,
      fit: BoxFit.cover,
      memCacheWidth: cacheWidth,
    );
  }
}
