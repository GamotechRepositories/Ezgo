import '../config/api_config.dart';

class BannerModel {
  final String id;
  final String title;
  final String subtitle;
  final String badge;
  final String imageUrl;
  final String targetUrl;
  final String ctaText;
  final String city;
  final String placement;
  final int discountPercent;
  final int order;
  final bool isActive;

  const BannerModel({
    required this.id,
    required this.title,
    this.subtitle = '',
    this.badge = 'FEATURED OFFER',
    required this.imageUrl,
    this.targetUrl = '',
    this.ctaText = 'Claim Deal',
    this.city = 'ALL',
    this.placement = 'hero_banner',
    this.discountPercent = 15,
    this.order = 0,
    this.isActive = true,
  });

  String get resolvedImageUrl {
    final url = imageUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.isEmpty) return '';
    final origin = ApiConfig.baseUrl.replaceFirst(RegExp(r'/api/?$'), '');
    if (url.startsWith('/')) return '$origin$url';
    return '$origin/$url';
  }

  String get assetFallback {
    final hay = '${title.toLowerCase()} ${imageUrl.toLowerCase()} $placement';
    if (hay.contains('dj') || hay.contains('sound') || hay.contains('music')) {
      return 'assets/images/occasion_parties.jpg';
    }
    if (hay.contains('photo') || hay.contains('video') || hay.contains('drone')) {
      return 'assets/images/occasion_weddings.jpg';
    }
    if (hay.contains('cater')) {
      return 'assets/images/service_catering.jpg';
    }
    if (hay.contains('corporate')) {
      return 'assets/images/occasion_corporate.jpg';
    }
    if (hay.contains('birthday')) {
      return 'assets/images/occasion_birthdays.jpg';
    }
    if (hay.contains('festival')) {
      return 'assets/images/occasion_festivals.jpg';
    }
    return 'assets/images/hero_wedding_bg.jpg';
  }

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    final discount = json['discountPercent'];
    final orderVal = json['order'];
    return BannerModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      subtitle: json['subtitle']?.toString() ?? '',
      badge: (json['badge']?.toString().isNotEmpty == true) ? json['badge'].toString() : 'FEATURED OFFER',
      imageUrl: json['imageUrl']?.toString() ?? '',
      targetUrl: json['targetUrl']?.toString() ?? '',
      ctaText: (json['ctaText']?.toString().isNotEmpty == true) ? json['ctaText'].toString() : 'Claim Deal',
      city: json['city']?.toString() ?? 'ALL',
      placement: json['placement']?.toString() ?? 'hero_banner',
      discountPercent: discount is num ? discount.toInt() : 15,
      order: orderVal is num ? orderVal.toInt() : 0,
      isActive: json['isActive'] != false,
    );
  }
}
