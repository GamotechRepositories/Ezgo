import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/bid_model.dart';
import '../models/requirement_model.dart';
import '../services/api_service.dart';

class RequirementsProvider extends ChangeNotifier {
  List<RequirementModel> _requirements = [];
  String _selectedCategory = 'All';
  String _searchQuery = '';
  String _selectedCity = 'Pune';
  bool _hasChosenCity = false;
  bool _isLoading = false;

  List<RequirementModel> get allRequirements => _requirements;

  List<RequirementModel> get requirements {
    return _requirements.where((req) {
      final matchCat = _selectedCategory == 'All' || req.category == _selectedCategory;
      final matchSearch = _searchQuery.isEmpty ||
          req.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          req.city.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          req.area.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchCat && matchSearch;
    }).toList();
  }

  List<RequirementModel> mine(String? userId) {
    if (userId == null || userId.isEmpty) return const [];
    return _requirements.where((r) => r.requesterId == userId).toList();
  }

  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;
  String get selectedCity => _selectedCity;
  bool get hasChosenCity => _hasChosenCity;
  bool get isLoading => _isLoading;
  Future<void>? _cityLoad;

  RequirementsProvider() {
    _cityLoad = _restoreCity();
    loadData();
  }

  Future<void> ensureCityLoaded() async {
    await (_cityLoad ?? _restoreCity());
  }

  Future<void> _restoreCity() async {
    final prefs = await SharedPreferences.getInstance();
    _selectedCity = prefs.getString('selected_city') ?? 'Pune';
    _hasChosenCity = prefs.getBool('city_chosen') ?? false;
    notifyListeners();
  }

  void setCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setSelectedCity(String city) {
    _selectedCity = city;
    _hasChosenCity = true;
    notifyListeners();
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString('selected_city', city);
      prefs.setBool('city_chosen', true);
    });
  }

  Future<void> loadData({String? requesterId}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final query = requesterId != null && requesterId.isNotEmpty
          ? '?requesterId=$requesterId&includeDrafts=true'
          : '';
      final res = await ApiService().get('${ApiConfig.requirements}$query');
      if (res != null && res['success'] == true && res['data'] is List) {
        final list = res['data'] as List<dynamic>;
        _requirements = list.map((item) {
          final map = Map<String, dynamic>.from(item as Map);
          if (requesterId != null &&
              requesterId.isNotEmpty &&
              map['requesterId'] == null) {
            map['requesterId'] = requesterId;
          }
          return RequirementModel.fromJson(map);
        }).toList();
      } else {
        _requirements = [];
      }
    } catch (_) {
      _requirements = [];
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<RequirementModel> addRequirement(RequirementModel req) async {
    final res = await ApiService().post(ApiConfig.requirements, {
      'title': req.title,
      'category': req.category,
      'occasion': req.occasion,
      'description': req.description,
      'budget': req.budget,
      'eventDate': req.eventDate,
      'guestCount': req.guestCount,
      'location': {
        'city': req.city,
        'area': req.area,
        'venueAddress': req.venueAddress ?? '',
      },
      'timeWindow': {
        'start': '18:00',
        'end': '23:00',
      },
    });

    if (res is! Map || res['success'] != true || res['data'] is! Map) {
      throw ApiException(res is Map ? (res['message'] ?? 'Failed to post requirement').toString() : 'Failed to post requirement');
    }

    final created = RequirementModel.fromJson((res['data'] as Map).cast<String, dynamic>());
    _requirements.insert(0, created);
    notifyListeners();
    return created;
  }

  Future<void> placeBid({
    required String requirementId,
    required int amount,
    required String providerId,
    String proposalNotes = 'Professional equipment with on-site technician included.',
    String equipmentDetails = 'Standard professional gear package',
  }) async {
    final res = await ApiService().post(ApiConfig.bids, {
      'requirementId': requirementId,
      'providerId': providerId,
      'amount': amount,
      'proposalNotes': proposalNotes,
      'equipmentDetails': equipmentDetails,
    });

    if (res is! Map || res['data'] is! Map) {
      throw ApiException(res is Map ? (res['message'] ?? 'Failed to place bid').toString() : 'Failed to place bid');
    }

    final bid = BidModel.fromJson((res['data'] as Map).cast<String, dynamic>());
    final idx = _requirements.indexWhere((r) => r.id == requirementId);
    if (idx != -1) {
      final old = _requirements[idx];
      final bids = List<BidModel>.from(old.bids);
      final existing = bids.indexWhere((b) => b.providerId == providerId || b.id == bid.id);
      if (existing >= 0) {
        bids[existing] = bid;
      } else {
        bids.insert(0, bid);
      }
      final lowest = bids.map((b) => b.amount).reduce((a, b) => a < b ? a : b);
      _requirements[idx] = RequirementModel(
        id: old.id,
        requesterId: old.requesterId,
        title: old.title,
        category: old.category,
        occasion: old.occasion,
        description: old.description,
        budget: old.budget,
        maxAcceptableBid: old.maxAcceptableBid,
        lowestBid: lowest,
        bidsCount: bids.length,
        guestCount: old.guestCount,
        eventDate: old.eventDate,
        area: old.area,
        city: old.city,
        venueAddress: old.venueAddress,
        status: old.status,
        imageUrl: old.imageUrl,
        images: old.images,
        equipmentNeeded: old.equipmentNeeded,
        bids: bids,
      );
      notifyListeners();
    }
  }

  Future<RequirementModel?> fetchRequirement(String id) async {
    if (id.isEmpty) return null;
    try {
      final res = await ApiService().get('${ApiConfig.requirements}/$id');
      if (res is! Map || res['data'] is! Map) return null;
      final updated = RequirementModel.fromJson((res['data'] as Map).cast<String, dynamic>());
      final idx = _requirements.indexWhere((r) => r.id == id);
      if (idx != -1) {
        _requirements[idx] = updated;
      } else {
        _requirements.insert(0, updated);
      }
      notifyListeners();
      return updated;
    } catch (_) {
      return null;
    }
  }

  void markAccepted(String requirementId) {
    final idx = _requirements.indexWhere((r) => r.id == requirementId);
    if (idx == -1) return;
    final old = _requirements[idx];
    _requirements[idx] = RequirementModel(
      id: old.id,
      requesterId: old.requesterId,
      title: old.title,
      category: old.category,
      occasion: old.occasion,
      description: old.description,
      budget: old.budget,
      maxAcceptableBid: old.maxAcceptableBid,
      lowestBid: old.lowestBid,
      bidsCount: old.bidsCount,
      guestCount: old.guestCount,
      eventDate: old.eventDate,
      area: old.area,
      city: old.city,
      venueAddress: old.venueAddress,
      status: 'ACCEPTED',
      imageUrl: old.imageUrl,
      equipmentNeeded: old.equipmentNeeded,
      bids: old.bids,
    );
    notifyListeners();
  }
}
