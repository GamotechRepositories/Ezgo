import 'package:intl/intl.dart';
import 'bid_model.dart';

class RequirementModel {
  final String id;
  final String requesterId;
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
  final String timeStart;
  final String timeEnd;

  const RequirementModel({
    required this.id,
    this.requesterId = '',
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
    this.timeStart = '18:00',
    this.timeEnd = '23:00',
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

    final requester = json['requesterId'];
    final time = json['timeWindow'] is Map
        ? (json['timeWindow'] as Map).cast<String, dynamic>()
        : <String, dynamic>{};
    return RequirementModel(
      id: json['_id'] ?? json['id'] ?? '',
      requesterId: requester is Map
          ? (requester['_id'] ?? requester['id'] ?? '').toString()
          : (requester ?? '').toString(),
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
      timeStart: (time['start'] ?? '18:00').toString(),
      timeEnd: (time['end'] ?? '23:00').toString(),
    );
  }

  int get liveBidsCount => bids.isNotEmpty ? bids.length : bidsCount;

  String get displayDate {
    final raw = eventDate.trim();
    if (raw.isEmpty) return 'Date TBA';
    final parsed = DateTime.tryParse(raw) ??
        DateTime.tryParse(raw.length >= 10 ? raw.substring(0, 10) : raw);
    if (parsed != null) {
      return DateFormat('d MMM yyyy').format(parsed.toLocal());
    }
    return raw;
  }

  String get displayPlace {
    final a = area.trim();
    final c = city.trim();
    if (a.isEmpty) return c.isEmpty ? 'Location TBA' : c;
    if (c.isEmpty || a.toLowerCase() == c.toLowerCase()) return a;
    return '$a, $c';
  }

  String get displayStatus {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return 'Open for bids';
      case 'DRAFT':
        return 'Draft';
      case 'ACCEPTED':
        return 'Vendor chosen';
      case 'ACTIVE':
        return 'Booked';
      case 'COMPLETED':
        return 'Completed';
      case 'EXPIRED':
        return 'Auction closed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  bool get isOpen => status.toUpperCase() == 'OPEN';

  String get coverAsset {
    final key = '${occasion ?? ''} $category $title'.toLowerCase();
    if (key.contains('birthday')) return 'assets/images/occasion_birthdays.jpg';
    if (key.contains('festival') || key.contains('pooja') || key.contains('ganesh')) {
      return 'assets/images/occasion_festivals.jpg';
    }
    if (key.contains('corporat') || key.contains('conference') || key.contains('office')) {
      return 'assets/images/occasion_corporate.jpg';
    }
    if (key.contains('party') || key.contains('reception')) {
      return 'assets/images/occasion_parties.jpg';
    }
    return 'assets/images/occasion_weddings.jpg';
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
