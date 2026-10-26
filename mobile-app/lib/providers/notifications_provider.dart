import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/notification_model.dart';
import '../services/api_service.dart';

class NotificationsProvider extends ChangeNotifier {
  List<AppNotification> _items = [];
  bool _isLoading = false;
  int _unreadCount = 0;

  List<AppNotification> get items => List.unmodifiable(_items);
  bool get isLoading => _isLoading;
  int get unreadCount => _unreadCount;

  Future<void> load() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService().get(ApiConfig.notifications);
      if (res is Map && res['success'] == true && res['data'] is List) {
        _items = (res['data'] as List)
            .whereType<Map>()
            .map((item) => AppNotification.fromJson(Map<String, dynamic>.from(item)))
            .toList();
        final apiUnread = res['unreadCount'];
        _unreadCount = apiUnread is num
            ? apiUnread.toInt()
            : _items.where((n) => !n.isRead).length;
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  void prepend(AppNotification notification) {
    _items.removeWhere((n) => n.id == notification.id);
    _items.insert(0, notification);
    if (!notification.isRead) {
      _unreadCount += 1;
    }
    notifyListeners();
  }

  Future<void> markRead(String id) async {
    final idx = _items.indexWhere((n) => n.id == id);
    if (idx != -1 && !_items[idx].isRead) {
      _items[idx] = _items[idx].copyWith(isRead: true);
      _unreadCount = _unreadCount > 0 ? _unreadCount - 1 : 0;
      notifyListeners();
    }
    try {
      await ApiService().patch('${ApiConfig.notifications}/$id/read');
    } catch (_) {}
  }

  Future<void> markAllRead() async {
    _items = _items.map((n) => n.copyWith(isRead: true)).toList();
    _unreadCount = 0;
    notifyListeners();
    try {
      await ApiService().patch('${ApiConfig.notifications}/read-all');
    } catch (_) {}
  }

  void clear() {
    _items = [];
    _unreadCount = 0;
    notifyListeners();
  }
}
