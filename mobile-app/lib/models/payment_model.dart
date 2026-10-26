class PaymentHistoryItem {
  final String id;
  final String type;
  final String label;
  final int amount;
  final String status;
  final String referenceId;
  final String method;
  final String createdAt;
  final String bookingId;
  final String bookingStatus;
  final String eventTitle;
  final String eventDate;
  final String category;
  final String vendorName;
  final String escrowStatus;

  const PaymentHistoryItem({
    required this.id,
    required this.type,
    required this.label,
    required this.amount,
    required this.status,
    required this.referenceId,
    required this.method,
    required this.createdAt,
    required this.bookingId,
    required this.bookingStatus,
    required this.eventTitle,
    required this.eventDate,
    required this.category,
    required this.vendorName,
    required this.escrowStatus,
  });

  bool get isRefund => type == 'REFUND';
  bool get isPayout => type == 'PAYOUT_RELEASED_PROVIDER';
  bool get isEscrowHold => type == 'PAYMENT_HELD_ESCROW';

  factory PaymentHistoryItem.fromJson(Map<String, dynamic> json) {
    return PaymentHistoryItem(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      type: (json['type'] ?? '').toString(),
      label: (json['label'] ?? 'Payment').toString(),
      amount: json['amount'] is num ? (json['amount'] as num).toInt() : 0,
      status: (json['status'] ?? 'SUCCESS').toString(),
      referenceId: (json['referenceId'] ?? '').toString(),
      method: (json['method'] ?? '').toString(),
      createdAt: (json['createdAt'] ?? '').toString(),
      bookingId: (json['bookingId'] ?? '').toString(),
      bookingStatus: (json['bookingStatus'] ?? '').toString(),
      eventTitle: (json['eventTitle'] ?? 'Event booking').toString(),
      eventDate: (json['eventDate'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      vendorName: (json['vendorName'] ?? '').toString(),
      escrowStatus: (json['escrowStatus'] ?? '').toString(),
    );
  }
}
