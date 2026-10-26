class BidModel {
  final String id;
  final String requirementId;
  final String providerId;
  final String providerName;
  final String businessName;
  final String providerPhone;
  final double providerRating;
  final int completedJobs;
  final bool isVerified;
  final int amount;
  final String proposalNotes;
  final String equipmentDetails;
  final double discountPercent;
  final bool isEligibleForAccept;
  final String status;

  const BidModel({
    required this.id,
    required this.requirementId,
    required this.providerId,
    required this.providerName,
    required this.businessName,
    required this.providerPhone,
    required this.providerRating,
    required this.completedJobs,
    required this.isVerified,
    required this.amount,
    required this.proposalNotes,
    required this.equipmentDetails,
    required this.discountPercent,
    required this.isEligibleForAccept,
    required this.status,
  });

  String get vendorName => businessName.isNotEmpty ? businessName : providerName;
  double get rating => providerRating;
  int get completedJobsCount => completedJobs;
  List<String> get deliverables {
    if (proposalNotes.isNotEmpty) {
      return proposalNotes.split(';').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
    }
    return const [
      'Verified equipment & crew',
      'On-time setup guarantee',
      'Dedicated event supervisor',
    ];
  }

  factory BidModel.fromJson(Map<String, dynamic> json) {
    final provider = json['providerId'] is Map
        ? (json['providerId'] as Map).cast<String, dynamic>()
        : <String, dynamic>{};
    final amt = (json['amount'] is num) ? (json['amount'] as num).toInt() : 0;
    final disc = (json['discountPercent'] is num)
        ? (json['discountPercent'] as num).toDouble()
        : 0.0;
    final rating = (provider['rating'] is num)
        ? (provider['rating'] as num).toDouble()
        : 4.8;

    return BidModel(
      id: json['_id'] ?? json['id'] ?? '',
      requirementId: json['requirementId'] is Map
          ? (json['requirementId']['_id'] ?? '')
          : (json['requirementId'] ?? ''),
      providerId: provider['_id'] ?? provider['id'] ?? '',
      providerName: provider['name'] ?? 'Verified Vendor',
      businessName: provider['businessName'] ?? provider['name'] ?? 'Professional Crew',
      providerPhone: provider['phone'] ?? '',
      providerRating: rating,
      completedJobs: (provider['completedJobs'] is num) ? (provider['completedJobs'] as num).toInt() : 20,
      isVerified: provider['isVerified'] ?? true,
      amount: amt,
      proposalNotes: json['proposalNotes'] ?? '',
      equipmentDetails: json['equipmentDetails'] ?? '',
      discountPercent: disc,
      isEligibleForAccept: json['isEligibleForAccept'] ?? disc >= 15,
      status: json['status'] ?? 'PENDING',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'requirementId': requirementId,
      'providerId': {
        '_id': providerId,
        'name': providerName,
        'businessName': businessName,
        'phone': providerPhone,
        'rating': providerRating,
        'completedJobs': completedJobs,
        'isVerified': isVerified,
      },
      'amount': amount,
      'proposalNotes': proposalNotes,
      'equipmentDetails': equipmentDetails,
      'discountPercent': discountPercent,
      'isEligibleForAccept': isEligibleForAccept,
      'status': status,
    };
  }
}
