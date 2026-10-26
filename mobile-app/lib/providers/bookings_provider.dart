import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/booking_model.dart';
import '../services/api_service.dart';
import '../services/razorpay_checkout.dart';

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
    upsert(booking);
    return booking;
  }

  void upsert(BookingModel booking) {
    if (booking.id.isEmpty) return;
    final idx = _bookings.indexWhere((b) => b.id == booking.id);
    if (idx == -1) {
      _bookings.insert(0, booking);
    } else {
      _bookings[idx] = booking;
    }
    notifyListeners();
  }

  void upsertFromJson(dynamic raw) {
    if (raw is! Map) return;
    try {
      upsert(BookingModel.fromJson(Map<String, dynamic>.from(raw)));
    } catch (_) {}
  }

  BookingModel? _localPaid(String bookingId) {
    final match = _bookings.where((b) => b.id == bookingId);
    if (match.isEmpty) return null;
    final booking = match.first;
    return booking.isEscrowPaid ? booking : null;
  }

  Future<BookingModel?> _paidBooking(String bookingId) async {
    final local = _localPaid(bookingId);
    if (local != null) return local;
    await loadData();
    return _localPaid(bookingId);
  }

  Future<BookingModel> _confirmSimulatedEscrow(String bookingId, String methodLabel) async {
    final paid = await ApiService().post(ApiConfig.payBooking, {
      'bookingId': bookingId,
      'paymentMethod': methodLabel,
    });
    final booking = _bookingFromPayResponse(paid) ?? await _paidBooking(bookingId);
    if (booking == null) {
      throw ApiException('Payment did not confirm. Try again.');
    }
    return _markPaid(booking);
  }

  Future<BookingModel> payEscrow({
    required String bookingId,
    String method = 'upi',
    String? customerName,
    String? customerEmail,
    String? customerPhone,
    String? description,
  }) async {
    if (bookingId.isEmpty) {
      throw ApiException('Booking is missing. Accept a bid again, then pay.');
    }
    final already = _localPaid(bookingId);
    if (already != null) return already;

    final methodLabel = method.toLowerCase() == 'card' ? 'Demo Card' : 'Demo UPI';
    ApiException? checkoutError;

    try {
      final order = await ApiService().post(ApiConfig.createOrder, {'bookingId': bookingId});
      if (order is Map && order['success'] == true) {
        final orderId = (order['order_id'] ?? order['id'] ?? '').toString();
        final key = (order['key_id'] ?? order['key'] ?? '').toString();
        final amount = order['amount'] is num ? (order['amount'] as num).toInt() : 0;
        final isLive = key.startsWith('rzp_live_');
        if (isLive && orderId.isNotEmpty && key.isNotEmpty) {
          try {
            final checkout = await RazorpayCheckout.open(
              key: key,
              orderId: orderId,
              amountPaise: amount > 0 ? amount : 100,
              method: method,
              description: description,
              customerName: customerName,
              customerEmail: customerEmail,
              customerPhone: customerPhone,
            );
            final verified = await ApiService().post(ApiConfig.verifyPayment, {
              'razorpay_order_id': checkout.orderId,
              'razorpay_payment_id': checkout.paymentId,
              'razorpay_signature': checkout.signature,
              'bookingId': bookingId,
            });
            BookingModel? paid = _bookingFromPayResponse(verified);
            paid ??= await _paidBooking(bookingId);
            if (paid == null) {
              throw ApiException('Payment received. Pull down Bookings to refresh.');
            }
            return _markPaid(paid);
          } on ApiException catch (e) {
            checkoutError = e;
          } catch (e) {
            checkoutError = ApiException(e.toString());
          }
        }
      }
    } on ApiException catch (e) {
      if (e.message.toLowerCase().contains('already paid')) {
        final paid = await _paidBooking(bookingId);
        if (paid != null) return paid;
      }
      checkoutError = e;
    }

    try {
      return await _confirmSimulatedEscrow(bookingId, methodLabel);
    } on ApiException catch (e) {
      if (e.statusCode == 403) {
        throw checkoutError ??
            ApiException('Live UPI is not ready yet. Add Razorpay live keys, or keep NODE_ENV=development for demo pay.');
      }
      if (e.message.toLowerCase().contains('already paid') || e.message.toLowerCase().contains('already confirmed')) {
        final paid = await _paidBooking(bookingId);
        if (paid != null) return paid;
      }
      throw checkoutError ?? e;
    }
  }

  BookingModel? _bookingFromPayResponse(dynamic res) {
    if (res is! Map) return null;
    final data = res['data'];
    if (data is Map && data['booking'] is Map) {
      return BookingModel.fromJson((data['booking'] as Map).cast<String, dynamic>());
    }
    if (data is Map && (data['_id'] != null || data['id'] != null || data['status'] != null)) {
      return BookingModel.fromJson(data.cast<String, dynamic>());
    }
    return null;
  }

  BookingModel _markPaid(BookingModel paid) {
    final updated = paid.copyWith(status: 'ACTIVE', isContactRevealed: true);
    upsert(updated);
    return updated;
  }

  Future<void> completeBooking(String id) async {
    await ApiService().post(ApiConfig.completeBooking, {'bookingId': id});

    final idx = _bookings.indexWhere((b) => b.id == id);
    if (idx != -1) {
      final b = _bookings[idx];
      _bookings[idx] = b.copyWith(status: 'COMPLETED', isContactRevealed: true);
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
