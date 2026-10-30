import 'package:flutter/foundation.dart';
import '../config/api_config.dart';
import '../models/banner_model.dart';
import '../services/api_service.dart';
import '../services/cache_service.dart';

class BannersProvider extends ChangeNotifier {
  List<BannerModel> _banners = [];
  String _loadedCity = '';
  bool _isLoading = false;

  List<BannerModel> get banners => _banners;
  bool get isLoading => _isLoading;

  BannersProvider() {
    _hydrateCache();
    Future.microtask(() => loadForCity('Pune', force: true));
  }

  Future<void> _hydrateCache() async {
    final cached = await CacheService().get('banners_cache');
    if (cached is List && _banners.isEmpty) {
      _banners = cached
          .whereType<Map>()
          .map((item) => BannerModel.fromJson(Map<String, dynamic>.from(item)))
          .where((b) => b.isActive)
          .toList()
        ..sort((a, b) => a.order.compareTo(b.order));
      if (_banners.isNotEmpty) {
        notifyListeners();
      }
    }
  }

  Future<void> loadForCity(String city, {bool force = false}) async {
    final clean = city.split(',').first.trim();
    if (clean.isEmpty) return;
    if (!force && _loadedCity == clean && _banners.isNotEmpty) return;

    if (_banners.isEmpty) {
      _isLoading = true;
      notifyListeners();
    }

    try {
      final res = await ApiService().get(ApiConfig.banners);
      List raw = const [];
      if (res is List) {
        raw = res;
      } else if (res is Map && res['data'] is List) {
        raw = res['data'] as List;
      }

      final fresh = raw
          .whereType<Map>()
          .map((item) => BannerModel.fromJson(Map<String, dynamic>.from(item)))
          .where((b) => b.isActive)
          .toList()
        ..sort((a, b) => a.order.compareTo(b.order));

      if (fresh.isNotEmpty || _banners.isEmpty) {
        _banners = fresh;
      }
      _loadedCity = clean;
      if (raw.isNotEmpty) {
        await CacheService().set('banners_cache', raw);
      }
    } catch (e) {
      debugPrint('Banners load failed (retaining cache): $e');
    }

    _isLoading = false;
    notifyListeners();
  }
}
