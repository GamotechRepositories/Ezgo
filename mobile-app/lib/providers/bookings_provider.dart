import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/booking_model.dart';
import '../services/api_service.dart';

class BookingsProvider extends ChangeNotifier {
  List<BookingModel> _bookings = [];
  bool _isLoading = false;

  List<BookingModel> get bookings => _bookings;
  bool get isLoading => _isLoading;

  List<BookingModel> get upcomingBookings =>
      _bookings.where((b) => b.status == 'ACTIVE').toList();

  List<BookingModel> get awaitingPaymentBookings =>
      _bookings.where((b) => b.status == 'AWAITING_PAYMENT').toList();

  List<BookingModel> get completedBookings =>
      _bookings.where((b) => b.status == 'COMPLETED').toList();

  BookingsProvider() {
    loadData();
  }

  Future<void> loadData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await ApiService().get(ApiConfig.bookings);
      if (res != null && res['success'] == true && res['data'] is List) {
        final list = res['data'] as List<dynamic>;
        _bookings = list
            .map((item) => BookingModel.fromJson(item as Map<String, dynamic>))
            .toList();
      } else {
        _bookings = [];
      }
    } catch (_) {
      _bookings = [];
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<BookingModel> acceptBid({
    required String requirementId,
    required String bidId,
    required String requesterId,
  }) async {
    final res = await ApiService().post(ApiConfig.acceptBid, {
      'requirementId': requirementId,
      'bidId': bidId,
      'requesterId': requesterId,
    });

    if (res is! Map || res['data'] is! Map) {
      throw ApiException(res is Map ? (res['message'] ?? 'Failed to accept bid').toString() : 'Failed to accept bid');
    }

    final booking = BookingModel.fromJson((res['data'] as Map).cast<String, dynamic>());
    _bookings.insert(0, booking);
    notifyListeners();
    return booking;
  }

  Future<void> payEscrow(String bookingId) async {
    Map<String, dynamic>? res;
    try {
      final paid = await ApiService().post(ApiConfig.payBooking, {
        'bookingId': bookingId,
        'paymentMethod': 'UPI',
      });
      res = paid is Map ? paid.cast<String, dynamic>() : null;
    } on ApiException catch (e) {
      if (e.statusCode == 403) {
        await ApiService().post(ApiConfig.createOrder, {'bookingId': bookingId});
        throw ApiException('Razorpay checkout is required. Simulated escrow pay is disabled on this server.');
      }
      rethrow;
    }

    BookingModel? paid;
    final data = res?['data'];
    if (data is Map) {
      paid = BookingModel.fromJson(data.cast<String, dynamic>());
    }

    final idx = _bookings.indexWhere((b) => b.id == bookingId);
    if (idx != -1) {
      final b = paid ?? _bookings[idx];
      _bookings[idx] = BookingModel(
        id: b.id,
        requirementId: b.requirementId,
        requirementTitle: b.requirementTitle,
        category: b.category,
        eventDate: b.eventDate,
        locationText: b.locationText,
        bidAmount: b.bidAmount,
        platformFee: b.platformFee,
        totalPaid: b.totalPaid,
        status: 'ACTIVE',
        hostName: b.hostName,
        hostPhone: b.hostPhone,
        vendorName: b.vendorName,
        vendorPhone: b.vendorPhone,
        isContactRevealed: true,
      );
      notifyListeners();
    } else if (paid != null) {
      _bookings.insert(0, paid);
      notifyListeners();
    }
  }

  Future<void> completeBooking(String id) async {
    await ApiService().post(ApiConfig.completeBooking, {'bookingId': id});

    final idx = _bookings.indexWhere((b) => b.id == id);
    if (idx != -1) {
      final b = _bookings[idx];
      _bookings[idx] = BookingModel(
        id: b.id,
        requirementId: b.requirementId,
        requirementTitle: b.requirementTitle,
        category: b.category,
        eventDate: b.eventDate,
        locationText: b.locationText,
        bidAmount: b.bidAmount,
        platformFee: b.platformFee,
        totalPaid: b.totalPaid,
        status: 'COMPLETED',
        hostName: b.hostName,
        hostPhone: b.hostPhone,
        vendorName: b.vendorName,
        vendorPhone: b.vendorPhone,
        isContactRevealed: true,
      );
      notifyListeners();
    }
  }

  Future<void> cancelBooking(String id, {String? reason}) async {
    await ApiService().post(ApiConfig.cancelBooking, {
      'bookingId': id,
      if (reason != null) 'reason': reason,
    });
    await loadData();
  }
}
