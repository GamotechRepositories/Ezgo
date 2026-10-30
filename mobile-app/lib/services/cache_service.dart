import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CacheService {
  static final CacheService _instance = CacheService._internal();
  factory CacheService() => _instance;
  CacheService._internal();

  SharedPreferences? _prefs;
  final Map<String, dynamic> _memoryCache = {};
  final Map<String, DateTime> _expiryTimes = {};

  Future<void> init() async {
    try {
      _prefs ??= await SharedPreferences.getInstance();
    } catch (e) {
      debugPrint('CacheService init error: $e');
    }
  }

  Future<SharedPreferences> _getPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  /// Store any JSON-encodable data (List or Map) with an optional Time-To-Live
  Future<void> set(String key, dynamic data, {Duration ttl = const Duration(hours: 24)}) async {
    if (data == null) return;
    try {
      final expiry = DateTime.now().add(ttl);
      _memoryCache[key] = data;
      _expiryTimes[key] = expiry;

      final prefs = await _getPrefs();
      final envelope = {
        'exp': expiry.millisecondsSinceEpoch,
        'val': data,
      };
      await prefs.setString('eg_cache_$key', jsonEncode(envelope));
    } catch (e) {
      debugPrint('Cache write error for key $key: $e');
    }
  }

  /// Retrieve cached JSON data synchronously if present in memory, or asynchronously from disk
  dynamic getSync(String key) {
    if (_memoryCache.containsKey(key)) {
      final exp = _expiryTimes[key];
      if (exp == null || DateTime.now().isBefore(exp)) {
        return _memoryCache[key];
      }
      _memoryCache.remove(key);
      _expiryTimes.remove(key);
    }
    return null;
  }

  /// Retrieve cached data with fallback to disk storage
  Future<dynamic> get(String key) async {
    final mem = getSync(key);
    if (mem != null) return mem;

    try {
      final prefs = await _getPrefs();
      final raw = prefs.getString('eg_cache_$key');
      if (raw == null || raw.isEmpty) return null;

      final decoded = jsonDecode(raw);
      if (decoded is Map && decoded.containsKey('exp') && decoded.containsKey('val')) {
        final expMs = decoded['exp'] as int?;
        if (expMs != null && DateTime.now().millisecondsSinceEpoch > expMs) {
          // Expired, cleanup
          await prefs.remove('eg_cache_$key');
          return null;
        }
        final val = decoded['val'];
        _memoryCache[key] = val;
        if (expMs != null) {
          _expiryTimes[key] = DateTime.fromMillisecondsSinceEpoch(expMs);
        }
        return val;
      }
      return decoded;
    } catch (e) {
      debugPrint('Cache read error for key $key: $e');
      return null;
    }
  }

  /// Invalidate / remove a specific key
  Future<void> remove(String key) async {
    _memoryCache.remove(key);
    _expiryTimes.remove(key);
    try {
      final prefs = await _getPrefs();
      await prefs.remove('eg_cache_$key');
    } catch (_) {}
  }

  /// Clear all cache entries matching a prefix (e.g. 'requirements_')
  Future<void> clearPrefix(String prefix) async {
    _memoryCache.removeWhere((k, _) => k.startsWith(prefix));
    _expiryTimes.removeWhere((k, _) => k.startsWith(prefix));
    try {
      final prefs = await _getPrefs();
      final keys = prefs.getKeys().where((k) => k.startsWith('eg_cache_$prefix'));
      for (final k in keys) {
        await prefs.remove(k);
      }
    } catch (_) {}
  }
}

