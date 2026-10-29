import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../utils/app_bootstrap.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  UserRole _activeRole = UserRole.host;
  bool _isLoading = false;
  bool _sessionReady = false;
  String? _errorMessage;
  Future<void>? _sessionLoad;

  UserModel? get user => _user;
  UserRole get activeRole => _activeRole;
  bool get isLoading => _isLoading;
  bool get sessionReady => _sessionReady;
  String? get errorMessage => _errorMessage;
  bool get isLoggedIn =>
      _user != null && (ApiService().token?.isNotEmpty == true || (_user!.token?.isNotEmpty ?? false));
  bool get isHost => _activeRole == UserRole.host;
  bool get isVendor => _activeRole == UserRole.vendor;

  AuthProvider() {
    ApiService().onUnauthorized = logout;
    _sessionLoad = _loadSession();
  }

  Future<void> ensureSession() async {
    await (_sessionLoad ?? _loadSession());
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    final roleStr = prefs.getString('active_role') ?? 'host';
    _activeRole = roleStr == 'vendor' ? UserRole.vendor : UserRole.host;

    if (token == null || token.isEmpty) {
      _user = null;
      ApiService().setToken(null);
      _sessionReady = true;
      notifyListeners();
      return;
    }

    ApiService().setToken(token);

    final savedUser = prefs.getString('auth_user');
    if (savedUser != null && savedUser.isNotEmpty) {
      try {
        final userData = jsonDecode(savedUser) as Map<String, dynamic>;
        userData['token'] = token;
        _user = UserModel.fromJson(userData);
        if (_user!.role == UserRole.vendor || _user!.role == UserRole.host) {
          _activeRole = _user!.role;
        }
        _sessionReady = true;
        notifyListeners();
      } catch (_) {}
    }

    try {
      final res = await ApiService().get(ApiConfig.me);
      final data = res is Map ? res['data'] : null;
      if (data is Map) {
        final userData = data.cast<String, dynamic>();
        userData['token'] = token;
        _user = UserModel.fromJson(userData);
        _activeRole = _user!.role;
        await _persistSession(token);
      }
    } on ApiException catch (e) {
      if (e.statusCode == 401) {
        _user = null;
        ApiService().setToken(null);
        await prefs.remove('auth_token');
        await prefs.remove('auth_user');
      }
    } catch (_) {}

    _sessionReady = true;
    notifyListeners();
  }

  Future<void> _persistSession(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('active_role', _activeRole == UserRole.vendor ? 'vendor' : 'host');
    if (_user != null) {
      await prefs.setString('auth_user', jsonEncode(_user!.toJson()));
    }
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
        await _persistSession(token);

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = res?['message'] ??
            (res == null
                ? 'Cannot reach the server. Check your connection.'
                : 'Wrong phone number or password.');
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
        await _persistSession(token);

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

  Future<bool> loginWithGoogle({required UserRole role}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        clientId: kIsWeb
            ? (ApiConfig.googleServerClientId.isNotEmpty
                ? ApiConfig.googleServerClientId
                : null)
            : null,
        serverClientId: ApiConfig.googleServerClientId.isNotEmpty
            ? ApiConfig.googleServerClientId
            : null,
        scopes: ['email', 'profile'],
      );

      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled the Google sign-in dialog
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;
      final String? accessToken = googleAuth.accessToken;

      if ((idToken == null || idToken.isEmpty) && (accessToken == null || accessToken.isEmpty)) {
        _errorMessage = 'Could not obtain Google authentication token. Please verify Google Play Services and OAuth client configuration.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final roleString = role == UserRole.vendor ? 'provider' : 'requester';
      final Map<String, dynamic> payload = {
        'role': roleString,
      };
      if (idToken != null && idToken.isNotEmpty) {
        payload['idToken'] = idToken;
      }
      if (accessToken != null && accessToken.isNotEmpty) {
        payload['accessToken'] = accessToken;
      }

      final res = await ApiService().post(ApiConfig.googleAuth, payload);

      if (res != null && res['success'] == true && res['data'] != null) {
        final data = res['data'] as Map<String, dynamic>;
        final token = data['token'] as String;
        final userData = data['user'] as Map<String, dynamic>;
        userData['token'] = token;

        _user = UserModel.fromJson(userData);
        _activeRole = _user!.role;
        ApiService().setToken(token);
        await _persistSession(token);

        _isLoading = false;
        notifyListeners();
        return true;
      } else if (res != null && res['isNewUser'] == true && res['googleProfile'] != null) {
        _errorMessage = res['message'] ?? 'Please complete your vendor profile on the web portal.';
        _isLoading = false;
        notifyListeners();
        return false;
      } else {
        _errorMessage = res?['message'] ?? 'Google authentication failed.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Google Sign-In error: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> updateProfile({
    String? name,
    String? email,
    String? avatar,
    String? serviceArea,
    String? businessName,
  }) async {
    if (_user == null) {
      throw ApiException('Please log in again.');
    }

    final res = await ApiService().put(ApiConfig.profile, {
      'userId': _user!.id,
      'name': ?name,
      'email': ?email,
      'avatar': ?avatar,
      'serviceArea': ?serviceArea,
      'businessName': ?businessName,
    });

    if (res is! Map || res['data'] is! Map) {
      throw ApiException(
        res is Map ? (res['message'] ?? 'Could not update profile').toString() : 'Could not update profile',
      );
    }

    final data = (res['data'] as Map).cast<String, dynamic>();
    data['token'] = _user!.token;
    _user = UserModel.fromJson(data);
    await _persistSession(_user!.token ?? '');
    notifyListeners();
  }

  Future<void> uploadAvatar(String filePath) async {
    final url = await ApiService().uploadImage(filePath, folder: 'ezzygo/avatars');
    await updateProfile(avatar: url);
  }

  Future<void> blockDate(String date, {String reason = 'Booked / Offline Event'}) async {
    final res = await ApiService().post(ApiConfig.blockDate, {'date': date, 'reason': reason});
    if (res is! Map || res['data'] is! Map) {
      throw ApiException(res is Map ? (res['message'] ?? 'Could not block date').toString() : 'Could not block date');
    }
    final data = (res['data'] as Map).cast<String, dynamic>();
    data['token'] = _user?.token;
    data['role'] = data['role'] ?? (_user?.role == UserRole.vendor ? 'provider' : 'requester');
    _user = UserModel.fromJson(data);
    await _persistSession(_user?.token ?? '');
    notifyListeners();
  }

  Future<void> unblockDate(String date) async {
    final res = await ApiService().delete('${ApiConfig.unblockDate}/$date');
    if (res is! Map || res['data'] is! Map) {
      throw ApiException(res is Map ? (res['message'] ?? 'Could not unblock date').toString() : 'Could not unblock date');
    }
    final data = (res['data'] as Map).cast<String, dynamic>();
    data['token'] = _user?.token;
    data['role'] = data['role'] ?? (_user?.role == UserRole.vendor ? 'provider' : 'requester');
    _user = UserModel.fromJson(data);
    await _persistSession(_user?.token ?? '');
    notifyListeners();
  }

  void logout() async {
    _user = null;
    ApiService().setToken(null);
    AppBootstrap.reset();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('active_role');
    await prefs.remove('auth_user');
    try {
      await GoogleSignIn().signOut();
    } catch (_) {}
    notifyListeners();
  }
}
