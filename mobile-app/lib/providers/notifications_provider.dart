import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/notification_model.dart';
import '../services/api_service.dart';

class NotificationsProvider extends ChangeNotifier {
  static const _seenKey = 'eg_seen_notification_ids';
  static const _maxSeen = 300;

  List<AppNotification> _items = [];
  final List<String> _seenIds = [];
  bool _isLoading = false;
  bool _seenLoaded = false;

  List<AppNotification> get items => List.unmodifiable(_items);
  bool get isLoading => _isLoading;

  bool _isSeen(String id) => id.isNotEmpty && _seenIds.contains(id);

  int get unreadCount =>
      _items.where((n) => n.id.isNotEmpty && !n.isRead && !_isSeen(n.id)).length;

  NotificationsProvider() {
    _ensureSeenLoaded();
  }

  Future<void> _ensureSeenLoaded() async {
    if (_seenLoaded) return;
    final prefs = await SharedPreferences.getInstance();
    _seenIds
      ..clear()
      ..addAll(prefs.getStringList(_seenKey) ?? const []);
    _seenLoaded = true;
    notifyListeners();
  }

  Future<void> _persistSeen() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_seenKey, List<String>.from(_seenIds));
  }

  void _remember(Iterable<String> ids) {
    for (final id in ids) {
      if (id.isEmpty) continue;
      _seenIds.remove(id);
      _seenIds.add(id);
    }
    if (_seenIds.length > _maxSeen) {
      _seenIds.removeRange(0, _seenIds.length - _maxSeen);
    }
  }

  Future<void> load() async {
    await _ensureSeenLoaded();
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService().get(ApiConfig.notifications);
      if (res is Map && res['success'] == true && res['data'] is List) {
        _items = (res['data'] as List)
            .whereType<Map>()
            .map((item) => AppNotification.fromJson(Map<String, dynamic>.from(item)))
            .toList();
        _remember(_items.where((n) => n.isRead).map((n) => n.id));
        await _persistSeen();
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  void prepend(AppNotification notification) {
    _items.removeWhere((n) => n.id == notification.id);
    _items.insert(0, notification);
    if (notification.isRead) {
      _remember([notification.id]);
      _persistSeen();
    }
    notifyListeners();
  }

  Future<void> markRead(String id) async {
    final idx = _items.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _items[idx] = _items[idx].copyWith(isRead: true);
    }
    _remember([id]);
    notifyListeners();
    await _persistSeen();
    try {
      await ApiService().patch('${ApiConfig.notifications}/$id/read');
    } catch (_) {}
  }

  Future<void> markAllRead() async {
    await _ensureSeenLoaded();
    _items = _items.map((n) => n.copyWith(isRead: true)).toList();
    _remember(_items.map((n) => n.id));
    notifyListeners();
    await _persistSeen();
    try {
      await ApiService().patch('${ApiConfig.notifications}/read-all');
    } catch (_) {}
  }

  void clear() {
    _items = [];
    notifyListeners();
  }
}
