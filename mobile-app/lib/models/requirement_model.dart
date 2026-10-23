import 'bid_model.dart';

class RequirementModel {
  final String id;
  final String title;
  final String category;
  final String? occasion;
  final String description;
  final int budget;
  final int maxAcceptableBid;
  final int? lowestBid;
  final int bidsCount;
  final int guestCount;
  final String eventDate;
  final String area;
  final String city;
  final String? venueAddress;
  final String status;
  final String? imageUrl;
  final List<String> images;
  final List<String> equipmentNeeded;
  final List<BidModel> bids;

  const RequirementModel({
    required this.id,
    required this.title,
    required this.category,
    this.occasion,
    required this.description,
    required this.budget,
    required this.maxAcceptableBid,
    this.lowestBid,
    required this.bidsCount,
    required this.guestCount,
    required this.eventDate,
    required this.area,
    required this.city,
    this.venueAddress,
    required this.status,
    this.imageUrl,
    this.images = const [],
    this.equipmentNeeded = const [],
    this.bids = const [],
  });

  factory RequirementModel.fromJson(Map<String, dynamic> json) {
    final loc = json['location'] is Map
        ? (json['location'] as Map).cast<String, dynamic>()
        : <String, dynamic>{};
    final budgetVal = (json['budget'] is num) ? (json['budget'] as num).toInt() : 10000;
    final maxBid = (json['maxAcceptableBid'] is num)
        ? (json['maxAcceptableBid'] as num).toInt()
        : (budgetVal * 0.85).round();

    final bidsList = (json['bids'] as List<dynamic>?)
            ?.map((b) => BidModel.fromJson(b as Map<String, dynamic>))
            .toList() ??
        [];

    int calculatedLowest = (json['lowestBid'] is num) ? (json['lowestBid'] as num).toInt() : 0;
    if (calculatedLowest == 0 && bidsList.isNotEmpty) {
      calculatedLowest = bidsList.map((b) => b.amount).reduce((curr, next) => curr < next ? curr : next);
    }

    return RequirementModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? 'Event Requirement',
      category: json['category'] ?? 'Event Services',
      occasion: json['occasion'],
      description: json['description'] ?? '',
      budget: budgetVal,
      maxAcceptableBid: maxBid,
      lowestBid: calculatedLowest > 0 ? calculatedLowest : null,
      bidsCount: bidsList.isNotEmpty ? bidsList.length : (json['bidsCount'] ?? 0),
      guestCount: (json['guestCount'] is num) ? (json['guestCount'] as num).toInt() : 100,
      eventDate: json['eventDate'] ?? '',
      area: loc['area'] ?? json['area'] ?? 'City Center',
      city: loc['city'] ?? json['city'] ?? 'Pune',
      venueAddress: loc['venueAddress'],
      status: json['status'] ?? 'OPEN',
      imageUrl: json['imageUrl'],
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          (json['imageUrl'] != null ? [json['imageUrl'].toString()] : []),
      equipmentNeeded: (json['equipmentNeeded'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      bids: bidsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'category': category,
      'occasion': occasion,
      'description': description,
      'budget': budget,
      'maxAcceptableBid': maxAcceptableBid,
      'lowestBid': lowestBid,
      'bidsCount': bidsCount,
      'guestCount': guestCount,
      'eventDate': eventDate,
      'location': {
        'city': city,
        'area': area,
        'venueAddress': venueAddress,
      },
      'status': status,
      'imageUrl': imageUrl,
      'equipmentNeeded': equipmentNeeded,
      'bids': bids.map((b) => b.toJson()).toList(),
    };
  }
}
