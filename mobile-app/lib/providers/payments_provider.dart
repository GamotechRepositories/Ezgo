import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/payment_model.dart';
import '../services/api_service.dart';

class PaymentsProvider extends ChangeNotifier {
  List<PaymentHistoryItem> _items = [];
  bool _isLoading = false;
  String? _error;

  List<PaymentHistoryItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get totalPaid => _items
      .where((i) => i.isEscrowHold && i.status == 'SUCCESS')
      .fold(0, (sum, i) => sum + i.amount);

  void clear() {
    _items = [];
    _error = null;
    _isLoading = false;
    notifyListeners();
  }

  Future<void> load() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await ApiService().get(ApiConfig.paymentHistory);
      if (res is Map && res['success'] == true && res['data'] is List) {
        _items = (res['data'] as List)
            .whereType<Map>()
            .map((row) => PaymentHistoryItem.fromJson(Map<String, dynamic>.from(row)))
            .toList();
      } else {
        _items = [];
      }
    } catch (e) {
      _error = e.toString();
      _items = [];
    }
    _isLoading = false;
    notifyListeners();
  }
}
