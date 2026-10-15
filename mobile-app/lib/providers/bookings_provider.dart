import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/bid_model.dart';
import '../models/booking_model.dart';
import '../models/requirement_model.dart';
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
        _isLoading = false;
        notifyListeners();
        return;
      }
    } catch (_) {}

    _loadSampleBookings();
    _isLoading = false;
    notifyListeners();
  }

  void _loadSampleBookings() {
    _bookings = [
      const BookingModel(
        id: 'bkg_1',
        requirementId: '6abcd97126b2c19c05a43f1e',
        requirementTitle: 'Modern Floral Backdrop with Fairy Light Canopy for Reception',
        category: 'Decoration & Stage Setup',
        eventDate: '2026-10-22',
        locationText: 'Koregaon Park, Pune',
        bidAmount: 67000,
        platformFee: 6700,
        totalPaid: 73700,
        status: 'ACTIVE',
        hostName: 'Ananya Sharma',
        hostPhone: '+91 98765 43210',
        vendorName: 'Swara Mandap & Floral Decorators',
        vendorPhone: '+91 98877 66554',
        isContactRevealed: true,
      ),
      const BookingModel(
        id: 'bkg_2',
        requirementId: '6abcd97126b2c19c05a43f1c',
        requirementTitle: 'Sangeet Night Pro Sound & Intelligent Moving Lights',
        category: 'DJ & Sound Setup',
        eventDate: '2026-10-15',
        locationText: 'Baner, Pune',
        bidAmount: 25000,
        platformFee: 2500,
        totalPaid: 27500,
        status: 'AWAITING_PAYMENT',
        hostName: 'Ananya Sharma',
        hostPhone: '+91 98765 43210',
        vendorName: 'BeatDrop Audio Works',
        vendorPhone: '+91 97654 32100',
        isContactRevealed: false,
      ),
    ];
    notifyListeners();
  }

  BookingModel createBookingFromAcceptedBid({
    required RequirementModel requirement,
    required BidModel bid,
    required String hostName,
    required String hostPhone,
  }) {
    final fee = (bid.amount * 0.1).round();
    final total = bid.amount + fee;

    final newBooking = BookingModel(
      id: 'bkg_${DateTime.now().millisecondsSinceEpoch}',
      requirementId: requirement.id,
      requirementTitle: requirement.title,
      category: requirement.category,
      eventDate: requirement.eventDate,
      locationText: '${requirement.area}, ${requirement.city}',
      bidAmount: bid.amount,
      platformFee: fee,
      totalPaid: total,
      status: 'AWAITING_PAYMENT',
      hostName: hostName,
      hostPhone: hostPhone,
      vendorName: bid.businessName,
      vendorPhone: bid.providerPhone,
      isContactRevealed: false,
    );

    _bookings.insert(0, newBooking);
    notifyListeners();
    return newBooking;
  }

  void payEscrow(String bookingId) {
    final idx = _bookings.indexWhere((b) => b.id == bookingId);
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
        status: 'ACTIVE',
        hostName: b.hostName,
        hostPhone: b.hostPhone,
        vendorName: b.vendorName,
        vendorPhone: b.vendorPhone,
        isContactRevealed: true,
      );
      notifyListeners();
    }
  }

  void completeBooking(String id) {
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

  void cancelBooking(String id) {
    _bookings.removeWhere((b) => b.id == id);
    notifyListeners();
  }
}
