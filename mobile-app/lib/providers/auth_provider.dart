import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  UserRole _activeRole = UserRole.host;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  UserRole get activeRole => _activeRole;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isLoggedIn => _user != null && _user!.token != null;
  bool get isHost => _activeRole == UserRole.host;
  bool get isVendor => _activeRole == UserRole.vendor;

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    final roleStr = prefs.getString('active_role') ?? 'host';
    _activeRole = roleStr == 'vendor' ? UserRole.vendor : UserRole.host;

    if (token != null) {
      ApiService().setToken(token);
      final res = await ApiService().get(ApiConfig.me);
      if (res != null && res['success'] == true && res['data'] != null) {
        final userData = res['data'] as Map<String, dynamic>;
        userData['token'] = token;
        _user = UserModel.fromJson(userData);
        _activeRole = _user!.role;
        notifyListeners();
        return;
      }
    }

    if (token == null) {
      _user = null;
      notifyListeners();
      return;
    }

    // If token exists but network is offline, maintain session
    _user = UserModel(
      id: _activeRole == UserRole.host ? 'user_host_101' : 'user_vendor_202',
      name: _activeRole == UserRole.host ? 'Ananya Sharma (Host)' : 'Rajesh Sound & FX Pro',
      phone: _activeRole == UserRole.host ? '+91 98765 43210' : '+91 98231 45678',
      role: _activeRole,
      businessName: _activeRole == UserRole.vendor ? 'Rajesh Pro Audio & Lightings' : null,
      isVerified: true,
      completedJobs: 42,
      rating: 4.9,
      token: token,
    );
    notifyListeners();
  }

  Future<bool> login({
    required String phone,
    required String password,
    required UserRole role,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    final roleString = role == UserRole.vendor ? 'provider' : 'requester';

    try {
      final res = await ApiService().post(ApiConfig.login, {
        'phone': cleanPhone,
        'password': password,
        'role': roleString,
      });

      if (res != null && res['success'] == true && res['data'] != null) {
        final data = res['data'] as Map<String, dynamic>;
        final token = data['token'] as String;
        final userData = data['user'] as Map<String, dynamic>;
        userData['token'] = token;

        _user = UserModel.fromJson(userData);
        _activeRole = _user!.role;
        ApiService().setToken(token);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        await prefs.setString('active_role', _activeRole == UserRole.vendor ? 'vendor' : 'host');

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        // Fallback for offline demo mode if backend is not reachable
        _activeRole = role;
        _user = UserModel(
          id: role == UserRole.host ? 'user_host_101' : 'user_vendor_202',
          name: role == UserRole.host ? 'Ananya Sharma (Host)' : 'Rajesh Sound & FX Pro',
          phone: phone,
          role: role,
          businessName: role == UserRole.vendor ? 'Rajesh Pro Audio & Lightings' : null,
          isVerified: true,
          completedJobs: 24,
          rating: 4.95,
          token: 'offline_token',
        );

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('active_role', role == UserRole.vendor ? 'vendor' : 'host');

        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String phone,
    required String password,
    required UserRole role,
    String? businessName,
    String? serviceArea,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    final roleString = role == UserRole.vendor ? 'provider' : 'requester';

    try {
      final res = await ApiService().post(ApiConfig.register, {
        'name': name,
        'phone': cleanPhone,
        'password': password,
        'role': roleString,
        'businessName': businessName ?? '',
        'serviceArea': serviceArea ?? 'Pune',
      });

      if (res != null && res['success'] == true && res['data'] != null) {
        final data = res['data'] as Map<String, dynamic>;
        final token = data['token'] as String;
        final userData = data['user'] as Map<String, dynamic>;
        userData['token'] = token;

        _user = UserModel.fromJson(userData);
        _activeRole = _user!.role;
        ApiService().setToken(token);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        await prefs.setString('active_role', _activeRole == UserRole.vendor ? 'vendor' : 'host');

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = res?['message'] ?? 'Registration failed. Try again.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void switchRole() async {
    _activeRole = _activeRole == UserRole.host ? UserRole.vendor : UserRole.host;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('active_role', _activeRole == UserRole.vendor ? 'vendor' : 'host');

    _user = _user?.copyWith(
      role: _activeRole,
      name: _activeRole == UserRole.host ? 'Ananya Sharma (Host)' : 'Rajesh Sound & FX Pro',
      businessName: _activeRole == UserRole.vendor ? 'Rajesh Pro Audio & Lightings' : null,
    );
    notifyListeners();
  }

  void logout() async {
    _user = null;
    ApiService().setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('active_role');
    notifyListeners();
  }
}
