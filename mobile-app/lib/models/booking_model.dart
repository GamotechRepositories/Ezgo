class BookingModel {
  final String id;
  final String requirementId;
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
  final String vendorName;
  final String vendorPhone;
  final bool isContactRevealed;

  const BookingModel({
    required this.id,
    required this.requirementId,
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
    required this.vendorName,
    required this.vendorPhone,
    this.isContactRevealed = false,
  });

  int get agreedAmount => bidAmount;
  bool get isEscrowPaid => status == 'ACTIVE' || status == 'COMPLETED' || isContactRevealed;

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

    return BookingModel(
      id: json['_id'] ?? json['id'] ?? '',
      requirementId: req['_id'] ?? req['id'] ?? '',
      requirementTitle: req['title'] ?? 'Event Booking',
      category: req['category'] ?? 'General',
      eventDate: req['eventDate'] ?? '',
      locationText: '${loc['area'] ?? ''}, ${loc['city'] ?? ''}'.trim(),
      bidAmount: bid,
      platformFee: fee,
      totalPaid: total,
      status: json['status'] ?? 'ACTIVE',
      hostName: host['name'] ?? 'Host',
      hostPhone: host['phone'] ?? '',
      vendorName: vendor['businessName'] ?? vendor['name'] ?? 'Vendor',
      vendorPhone: vendor['phone'] ?? '',
      isContactRevealed: json['isContactRevealed'] ?? (json['status'] == 'ACTIVE' || json['status'] == 'COMPLETED'),
    );
  }
}
