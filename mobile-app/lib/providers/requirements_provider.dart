import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/bid_model.dart';
import '../models/requirement_model.dart';
import '../services/api_service.dart';

class RequirementsProvider extends ChangeNotifier {
  List<RequirementModel> _requirements = [];
  String _selectedCategory = 'All';
  String _searchQuery = '';
  String _selectedCity = 'Pune';
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

  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;
  String get selectedCity => _selectedCity;
  bool get isLoading => _isLoading;

  RequirementsProvider() {
    loadData();
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
    notifyListeners();
  }

  Future<void> loadData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await ApiService().get(ApiConfig.requirements);
      if (res != null && res['success'] == true && res['data'] is List) {
        final list = res['data'] as List<dynamic>;
        _requirements = list
            .map((item) => RequirementModel.fromJson(item as Map<String, dynamic>))
            .toList();
        _isLoading = false;
        notifyListeners();
        return;
      }
    } catch (_) {}

    // Fallback sample data matching real backend requirements
    _loadSampleRequirements();
    _isLoading = false;
    notifyListeners();
  }

  void _loadSampleRequirements() {
    _requirements = [
      const RequirementModel(
        id: '6abcd97126b2c19c05a43f1c',
        title: 'Sangeet Night Pro Sound & Intelligent Moving Lights',
        category: 'DJ & Sound Setup',
        occasion: 'Sangeet & Haldi',
        description: 'Need a punchy sound setup for 350 guests with 4 dual subwoofers, 2 wireless shure mics, and moving sharpies.',
        budget: 35000,
        maxAcceptableBid: 29750,
        lowestBid: 25000,
        bidsCount: 3,
        guestCount: 350,
        eventDate: '2026-10-15',
        area: 'Baner',
        city: 'Pune',
        venueAddress: 'The Orchid Banquets, Baner Link Road',
        status: 'OPEN',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        equipmentNeeded: ['JBL VRX Tops', 'Dual 18" Subs', '4x Beam Sharpies', 'Pioneer DDJ-1000'],
        bids: [
          BidModel(
            id: 'bid_101',
            requirementId: '6abcd97126b2c19c05a43f1c',
            providerId: 'prov_1',
            providerName: 'BeatDrop Audio Works',
            businessName: 'BeatDrop Audio Works',
            providerPhone: '+91 97654 32100',
            providerRating: 4.8,
            completedJobs: 39,
            isVerified: true,
            amount: 25000,
            proposalNotes: 'Best rate in Pune. RCF active sound setup + smoke machine and Shure wireless microphones included.',
            equipmentDetails: 'RCF ART 745A Tops + 2x 18" Active Subs + Shure BLX288/PG58',
            discountPercent: 28.5,
            isEligibleForAccept: true,
            status: 'PENDING',
          ),
          BidModel(
            id: 'bid_102',
            requirementId: '6abcd97126b2c19c05a43f1c',
            providerId: 'prov_2',
            providerName: 'Rajesh Sound & FX Pro',
            businessName: 'Rajesh Pro Audio & Lightings',
            providerPhone: '+91 98231 45678',
            providerRating: 4.9,
            completedJobs: 64,
            isVerified: true,
            amount: 28000,
            proposalNotes: 'Includes JBL VRX line array tops, dual 18" subwoofers, 4 Sharpies, fog effect & dedicated audio engineer for 6 hours.',
            equipmentDetails: 'JBL VRX932LA + 2x JBL SRX828S Subs + Pioneer DDJ-1000 + 4x Beam 230 Sharpies',
            discountPercent: 20.0,
            isEligibleForAccept: true,
            status: 'PENDING',
          ),
        ],
      ),
      const RequirementModel(
        id: '6abcd97126b2c19c05a43f1e',
        title: 'Modern Floral Backdrop with Fairy Light Canopy for Reception',
        category: 'Decoration & Stage Setup',
        occasion: 'Reception',
        description: 'Pastel artificial + real hydrangeas decoration with brass lamps and royal couple sofa seating.',
        budget: 85000,
        maxAcceptableBid: 72250,
        lowestBid: 67000,
        bidsCount: 2,
        guestCount: 500,
        eventDate: '2026-10-22',
        area: 'Koregaon Park',
        city: 'Pune',
        venueAddress: 'Mahalaxmi Lawns, North Main Road',
        status: 'OPEN',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        equipmentNeeded: ['Truss Backdrop', 'Fairy Light Tunnel', 'Brass Diya Stands', 'Couple Sofa'],
        bids: [
          BidModel(
            id: 'bid_201',
            requirementId: '6abcd97126b2c19c05a43f1e',
            providerId: 'prov_3',
            providerName: 'Swara Mandap & Floral Decorators',
            businessName: 'Swara Events & Decor',
            providerPhone: '+91 98877 66554',
            providerRating: 4.6,
            completedJobs: 22,
            isVerified: true,
            amount: 67000,
            proposalNotes: 'Includes 30ft Stage Truss Backdrop, real flower arch with carnations/orchids, royal sofa, and warm fairy canopy.',
            equipmentDetails: 'Aluminum Box Truss 30x12ft + 500m Fairy Lights + Brass Diya Stands',
            discountPercent: 21.1,
            isEligibleForAccept: true,
            status: 'PENDING',
          ),
        ],
      ),
      const RequirementModel(
        id: '6abcd97126b2c19c05a43f20',
        title: 'Full Day Traditional Wedding & Reception 4K Drone Coverage',
        category: 'Photography & 4K Videography',
        occasion: 'Wedding',
        description: 'Need 2 Candid Photographers, 1 Traditional Videographer, and 1 4K Drone Operator with live feed.',
        budget: 60000,
        maxAcceptableBid: 51000,
        lowestBid: 48000,
        bidsCount: 1,
        guestCount: 600,
        eventDate: '2026-11-04',
        area: 'Kothrud',
        city: 'Pune',
        venueAddress: 'Shubharambh Lawns, DP Road',
        status: 'OPEN',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        equipmentNeeded: ['Sony FX3 / A7IV', 'DJI Mavic 3 Drone', 'Gimbal Stabilizer', 'Live Mixer'],
        bids: [],
      ),
    ];
  }

  Future<void> addRequirement(RequirementModel req) async {
    _requirements.insert(0, req);
    notifyListeners();

    try {
      await ApiService().post(ApiConfig.requirements, {
        'title': req.title,
        'category': req.category,
        'description': req.description,
        'budget': req.budget,
        'eventDate': req.eventDate,
        'guestCount': req.guestCount,
        'location': {
          'city': req.city,
          'area': req.area,
          'venueAddress': req.venueAddress ?? '',
        },
        'equipmentNeeded': req.equipmentNeeded,
      });
    } catch (_) {}
  }

  void placeBid({
    required String requirementId,
    required int amount,
    String providerName = 'Rajesh Sound & FX Pro',
    String businessName = 'Rajesh Pro Audio & Lightings',
    String phone = '+91 98231 45678',
    String proposalNotes = 'Professional equipment with on-site technician & transport included.',
    String equipmentDetails = 'Standard professional gear package',
  }) {
    final idx = _requirements.indexWhere((r) => r.id == requirementId);
    if (idx != -1) {
      final old = _requirements[idx];
      final newLowest = old.lowestBid == null
          ? amount
          : (amount < old.lowestBid! ? amount : old.lowestBid);

      final discount = ((old.budget - amount) / old.budget) * 100;

      final newBid = BidModel(
        id: 'bid_${DateTime.now().millisecondsSinceEpoch}',
        requirementId: requirementId,
        providerId: 'current_vendor',
        providerName: providerName,
        businessName: businessName,
        providerPhone: phone,
        providerRating: 4.9,
        completedJobs: 25,
        isVerified: true,
        amount: amount,
        proposalNotes: proposalNotes,
        equipmentDetails: equipmentDetails,
        discountPercent: discount,
        isEligibleForAccept: amount <= old.maxAcceptableBid,
        status: 'PENDING',
      );

      final updatedBids = List<BidModel>.from(old.bids)..insert(0, newBid);

      _requirements[idx] = RequirementModel(
        id: old.id,
        title: old.title,
        category: old.category,
        occasion: old.occasion,
        description: old.description,
        budget: old.budget,
        maxAcceptableBid: old.maxAcceptableBid,
        lowestBid: newLowest,
        bidsCount: old.bidsCount + 1,
        guestCount: old.guestCount,
        eventDate: old.eventDate,
        area: old.area,
        city: old.city,
        venueAddress: old.venueAddress,
        status: old.status,
        imageUrl: old.imageUrl,
        equipmentNeeded: old.equipmentNeeded,
        bids: updatedBids,
      );
      notifyListeners();
    }
  }
}
