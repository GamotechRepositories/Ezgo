class BookingModel {
  final String id;
  final String requirementId;
  final String bidId;
  final String requirementTitle;
  final String category;
  final String eventDate;
  final String locationText;
  final int bidAmount;
  final int platformFee;
  final int totalPaid;
  final String status; // AWAITING_PAYMENT, ACTIVE, COMPLETED, DISPUTED, CANCELLED
  final String hostName;
  final String hostPhone;
  final String hostEmail;
  final String hostAvatar;
  final String vendorId;
  final String vendorName;
  final String vendorBusinessName;
  final String vendorPhone;
  final String vendorEmail;
  final String vendorAvatar;
  final String vendorServiceArea;
  final List<String> vendorCategories;
  final double vendorRating;
  final int vendorReviewCount;
  final int vendorCompletedJobs;
  final bool vendorVerified;
  final bool isContactRevealed;

  const BookingModel({
    required this.id,
    required this.requirementId,
    this.bidId = '',
    required this.requirementTitle,
    required this.category,
    required this.eventDate,
    required this.locationText,
    required this.bidAmount,
    required this.platformFee,
    required this.totalPaid,
    required this.status,
    required this.hostName,
    required this.hostPhone,
    this.hostEmail = '',
    this.hostAvatar = '',
    this.vendorId = '',
    required this.vendorName,
    this.vendorBusinessName = '',
    required this.vendorPhone,
    this.vendorEmail = '',
    this.vendorAvatar = '',
    this.vendorServiceArea = '',
    this.vendorCategories = const [],
    this.vendorRating = 4.8,
    this.vendorReviewCount = 0,
    this.vendorCompletedJobs = 0,
    this.vendorVerified = false,
    this.isContactRevealed = false,
  });

  int get agreedAmount => bidAmount;
  bool get isEscrowPaid =>
      status == 'ACTIVE' || status == 'COMPLETED' || status == 'PAYOUT_RELEASED' || status == 'DISPUTED';
  bool get isAwaitingPayment => status == 'AWAITING_PAYMENT';

  BookingModel copyWith({String? status, bool? isContactRevealed}) {
    return BookingModel(
      id: id,
      requirementId: requirementId,
      bidId: bidId,
      requirementTitle: requirementTitle,
      category: category,
      eventDate: eventDate,
      locationText: locationText,
      bidAmount: bidAmount,
      platformFee: platformFee,
      totalPaid: totalPaid,
      status: status ?? this.status,
      hostName: hostName,
      hostPhone: hostPhone,
      hostEmail: hostEmail,
      hostAvatar: hostAvatar,
      vendorId: vendorId,
      vendorName: vendorName,
      vendorBusinessName: vendorBusinessName,
      vendorPhone: vendorPhone,
      vendorEmail: vendorEmail,
      vendorAvatar: vendorAvatar,
      vendorServiceArea: vendorServiceArea,
      vendorCategories: vendorCategories,
      vendorRating: vendorRating,
      vendorReviewCount: vendorReviewCount,
      vendorCompletedJobs: vendorCompletedJobs,
      vendorVerified: vendorVerified,
      isContactRevealed: isContactRevealed ?? this.isContactRevealed,
    );
  }

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    final req = json['requirementId'] is Map
        ? (json['requirementId'] as Map).cast<String, dynamic>()
        : <String, dynamic>{};
    final host = json['requesterId'] is Map
        ? (json['requesterId'] as Map).cast<String, dynamic>()
        : <String, dynamic>{};
    final vendor = json['providerId'] is Map
        ? (json['providerId'] as Map).cast<String, dynamic>()
        : <String, dynamic>{};
    final loc = req['location'] is Map
        ? (req['location'] as Map).cast<String, dynamic>()
        : <String, dynamic>{};

    final bid = (json['bidAmount'] is num) ? (json['bidAmount'] as num).toInt() : 0;
    final fee = (json['platformFee'] is num) ? (json['platformFee'] as num).toInt() : (bid * 0.1).round();
    final total = (json['totalPaid'] is num) ? (json['totalPaid'] as num).toInt() : (bid + fee);
    final rawReqId = json['requirementId'];
    final rawBidId = json['bidId'];
    final status = (json['status'] ?? 'ACTIVE').toString();
    final paid = status == 'ACTIVE' ||
        status == 'COMPLETED' ||
        status == 'PAYOUT_RELEASED' ||
        status == 'DISPUTED';
    final categories = paid && vendor['categories'] is List
        ? (vendor['categories'] as List).map((e) => e.toString()).where((e) => e.trim().isNotEmpty).toList()
        : <String>[];

    return BookingModel(
      id: json['_id'] ?? json['id'] ?? '',
      requirementId: rawReqId is Map
          ? (req['_id'] ?? req['id'] ?? '').toString()
          : (rawReqId ?? '').toString(),
      bidId: rawBidId is Map
          ? (rawBidId['_id'] ?? rawBidId['id'] ?? '').toString()
          : (rawBidId ?? '').toString(),
      requirementTitle: req['title'] ?? 'Event Booking',
      category: req['category'] ?? 'General',
      eventDate: req['eventDate'] ?? '',
      locationText: '${loc['area'] ?? ''}, ${loc['city'] ?? ''}'.trim(),
      bidAmount: bid,
      platformFee: fee,
      totalPaid: total,
      status: status,
      hostName: host['name'] ?? 'Host',
      hostPhone: paid ? (host['phone'] ?? '') : '',
      hostEmail: paid ? (host['email'] ?? '') : '',
      hostAvatar: paid ? (host['avatar'] ?? '') : '',
      vendorId: paid ? (vendor['_id'] ?? vendor['id'] ?? '').toString() : '',
      vendorName: paid ? (vendor['businessName'] ?? vendor['name'] ?? 'Vendor') : 'Selected vendor',
      vendorBusinessName: paid ? (vendor['businessName'] ?? vendor['name'] ?? '').toString() : '',
      vendorPhone: paid ? (vendor['phone'] ?? '') : '',
      vendorEmail: paid ? (vendor['email'] ?? '') : '',
      vendorAvatar: paid ? (vendor['avatar'] ?? '') : '',
      vendorServiceArea: paid ? (vendor['serviceArea'] ?? '') : '',
      vendorCategories: categories,
      vendorRating: paid && vendor['rating'] is num ? (vendor['rating'] as num).toDouble() : 0,
      vendorReviewCount: paid && vendor['reviewCount'] is num ? (vendor['reviewCount'] as num).toInt() : 0,
      vendorCompletedJobs: paid && vendor['completedJobs'] is num ? (vendor['completedJobs'] as num).toInt() : 0,
      vendorVerified: paid && vendor['isVerified'] == true,
      isContactRevealed: paid,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requirementId': requirementId,
      'bidId': bidId,
      'requirementTitle': requirementTitle,
      'category': category,
      'eventDate': eventDate,
      'locationText': locationText,
      'bidAmount': bidAmount,
      'platformFee': platformFee,
      'totalPaid': totalPaid,
      'status': status,
      'hostName': hostName,
      'hostPhone': hostPhone,
      'hostEmail': hostEmail,
      'hostAvatar': hostAvatar,
      'vendorId': vendorId,
      'vendorName': vendorName,
      'vendorBusinessName': vendorBusinessName,
      'vendorPhone': vendorPhone,
      'vendorEmail': vendorEmail,
      'vendorAvatar': vendorAvatar,
      'vendorServiceArea': vendorServiceArea,
      'vendorCategories': vendorCategories,
      'vendorRating': vendorRating,
      'vendorReviewCount': vendorReviewCount,
      'vendorCompletedJobs': vendorCompletedJobs,
      'vendorVerified': vendorVerified,
      'isContactRevealed': isContactRevealed,
    };
  }
}
