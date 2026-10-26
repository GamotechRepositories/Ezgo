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
  String? _error;
  String? _scopedRequesterId;

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

  String _normId(String? value) => (value ?? '').trim().toLowerCase();

  String _idFrom(dynamic raw) {
    if (raw == null) return '';
    if (raw is String) return raw.trim();
    if (raw is Map) {
      return (raw['_id'] ?? raw['id'] ?? '').toString().trim();
    }
    return raw.toString().trim();
  }

  List<RequirementModel> mine(String? userId) {
    final id = _normId(userId ?? _scopedRequesterId);
    if (_requirements.isEmpty) return const [];
    if (id.isEmpty) return List.unmodifiable(_requirements);

    final owned = _requirements.where((r) => _normId(r.requesterId) == id).toList();
    if (owned.isNotEmpty) return owned;

    final allMissing = _requirements.every((r) => r.requesterId.trim().isEmpty);
    return allMissing ? List.unmodifiable(_requirements) : owned;
  }

  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;
  String get selectedCity => _selectedCity;
  bool get hasChosenCity => _hasChosenCity;
  bool get isLoading => _isLoading;
  String? get error => _error;
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

  Future<void> loadData({String? requesterId, bool marketplace = false}) async {
    if (marketplace) {
      _scopedRequesterId = null;
    } else if (requesterId != null && requesterId.isNotEmpty) {
      _scopedRequesterId = requesterId;
    }
    final scoped = marketplace ? null : (requesterId ?? _scopedRequesterId);
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final query = scoped != null && scoped.isNotEmpty
          ? '?requesterId=$scoped&includeDrafts=true'
          : '';
      final res = await ApiService().get('${ApiConfig.requirements}$query');
      if (res != null && res['success'] == true && res['data'] is List) {
        final list = res['data'] as List<dynamic>;
        _requirements = list.map((item) {
          final map = Map<String, dynamic>.from(item as Map);
          final parsedOwner = _idFrom(map['requesterId']);
          if (parsedOwner.isEmpty && scoped != null && scoped.isNotEmpty) {
            map['requesterId'] = scoped;
          } else if (parsedOwner.isNotEmpty) {
            map['requesterId'] = parsedOwner;
          }
          return RequirementModel.fromJson(map);
        }).toList();
        _error = null;
      } else {
        _requirements = [];
        _error = res is Map ? (res['message']?.toString()) : 'Could not load your events.';
      }
    } catch (e) {
      _requirements = [];
      _error = e.toString();
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

    final createdMap = Map<String, dynamic>.from(res['data'] as Map);
    final parsedOwner = _idFrom(createdMap['requesterId']);
    if (parsedOwner.isEmpty && _scopedRequesterId != null) {
      createdMap['requesterId'] = _scopedRequesterId;
    } else if (parsedOwner.isNotEmpty) {
      createdMap['requesterId'] = parsedOwner;
    }
    if ((createdMap['occasion'] == null || createdMap['occasion'].toString().isEmpty) &&
        req.occasion != null &&
        req.occasion!.trim().isNotEmpty) {
      createdMap['occasion'] = req.occasion;
    }
    final created = RequirementModel.fromJson(createdMap);
    _requirements.removeWhere((r) => r.id == created.id);
    _requirements.insert(0, created);
    notifyListeners();
    if (_scopedRequesterId != null && _scopedRequesterId!.isNotEmpty) {
      loadData(requesterId: _scopedRequesterId);
    }
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

  void markAccepted(String requirementId, {String? bidId}) {
    final idx = _requirements.indexWhere((r) => r.id == requirementId);
    if (idx == -1) {
      applyRequirementPatch(requirementId, status: 'ACCEPTED');
      return;
    }
    final old = _requirements[idx];
    final bids = old.bids
        .map((b) {
          if (bidId == null || bidId.isEmpty) return b;
          if (b.id == bidId) return b.copyWith(status: 'ACCEPTED');
          return b.copyWith(status: 'REJECTED');
        })
        .toList();
    _requirements[idx] = _clone(old, status: 'ACCEPTED', bids: bids);
    notifyListeners();
  }

  void applyLiveBid({
    required String requirementId,
    BidModel? bid,
    int? lowestBid,
    int? bidsCount,
    String? status,
  }) {
    final idx = _requirements.indexWhere((r) => r.id == requirementId);
    if (idx == -1) {
      if (requirementId.isNotEmpty) fetchRequirement(requirementId);
      return;
    }
    final old = _requirements[idx];
    final bids = List<BidModel>.from(old.bids);
    if (bid != null) {
      final existing = bids.indexWhere((b) => b.id == bid.id || (bid.providerId.isNotEmpty && b.providerId == bid.providerId));
      if (existing >= 0) {
        bids[existing] = bid;
      } else {
        bids.insert(0, bid);
      }
    }
    final lowest = lowestBid ??
        (bids.isEmpty ? old.lowestBid : bids.map((b) => b.amount).reduce((a, b) => a < b ? a : b));
    _requirements[idx] = _clone(
      old,
      lowestBid: lowest,
      bidsCount: bidsCount ?? bids.length,
      status: status,
      bids: bids,
    );
    notifyListeners();
  }

  void applyRequirementPatch(String requirementId, {String? status, int? lowestBid, int? bidsCount}) {
    final idx = _requirements.indexWhere((r) => r.id == requirementId);
    if (idx == -1) return;
    _requirements[idx] = _clone(
      _requirements[idx],
      status: status,
      lowestBid: lowestBid,
      bidsCount: bidsCount,
    );
    notifyListeners();
  }

  RequirementModel _clone(
    RequirementModel old, {
    int? lowestBid,
    int? bidsCount,
    String? status,
    List<BidModel>? bids,
  }) {
    return RequirementModel(
      id: old.id,
      requesterId: old.requesterId,
      title: old.title,
      category: old.category,
      occasion: old.occasion,
      description: old.description,
      budget: old.budget,
      maxAcceptableBid: old.maxAcceptableBid,
      lowestBid: lowestBid ?? old.lowestBid,
      bidsCount: bidsCount ?? old.bidsCount,
      guestCount: old.guestCount,
      eventDate: old.eventDate,
      area: old.area,
      city: old.city,
      venueAddress: old.venueAddress,
      status: status ?? old.status,
      imageUrl: old.imageUrl,
      images: old.images,
      equipmentNeeded: old.equipmentNeeded,
      bids: bids ?? old.bids,
      timeStart: old.timeStart,
      timeEnd: old.timeEnd,
    );
  }
}
