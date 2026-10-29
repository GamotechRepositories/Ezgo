import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const _timeout = Duration(seconds: 15);
  final http.Client _client = http.Client();

  String? _authToken;
  void Function()? onUnauthorized;
  bool _handling401 = false;

  void setToken(String? token) {
    _authToken = token;
    if (token != null && token.isNotEmpty) {
      _handling401 = false;
    }
  }

  String? get token => _authToken;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
      };

  Future<http.Response> _timed(Future<http.Response> request) {
    return request.timeout(
      _timeout,
      onTimeout: () => throw TimeoutException('EzzyGo took too long to respond.'),
    );
  }

  void _checkUnauthorized(int statusCode) {
    if (statusCode != 401 || _handling401) return;
    _handling401 = true;
    _authToken = null;
    onUnauthorized?.call();
  }

  Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await _timed(_client.get(url, headers: _headers));
      return _processResponse(response);
    } on ApiException {
      rethrow;
    } catch (_) {
      return null;
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await _timed(_client.post(
        url,
        headers: _headers,
        body: jsonEncode(data),
      ));
      return _processResponse(response);
    } on ApiException {
      rethrow;
    } catch (_) {
      throw ApiException('Could not reach EzzyGo. Check your connection.');
    }
  }

  Future<String> uploadImage(String filePath, {String folder = 'ezzygo/avatars'}) async {
    final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.upload}?folder=$folder');
    try {
      final request = http.MultipartRequest('POST', url);
      if (_authToken != null) {
        request.headers['Authorization'] = 'Bearer $_authToken';
      }
      request.files.add(await http.MultipartFile.fromPath('image', filePath));
      final streamed = await request.send().timeout(_timeout);
      final response = await http.Response.fromStream(streamed);
      final decoded = _processResponse(response);
      if (decoded is Map && decoded['url'] != null) {
        return decoded['url'].toString();
      }
      throw ApiException('Image upload failed.');
    } on ApiException {
      rethrow;
    } catch (_) {
      throw ApiException('Could not upload photo. Check your connection.');
    }
  }

  Future<dynamic> patch(String endpoint, [Map<String, dynamic>? data]) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await _timed(_client.patch(
        url,
        headers: _headers,
        body: jsonEncode(data ?? const {}),
      ));
      return _processResponse(response);
    } on ApiException {
      rethrow;
    } catch (_) {
      throw ApiException('Could not reach EzzyGo. Check your connection.');
    }
  }

  Future<dynamic> delete(String endpoint) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await _timed(_client.delete(url, headers: _headers));
      return _processResponse(response);
    } on ApiException {
      rethrow;
    } catch (_) {
      throw ApiException('Could not reach EzzyGo. Check your connection.');
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await _timed(_client.put(
        url,
        headers: _headers,
        body: jsonEncode(data),
      ));
      return _processResponse(response);
    } on ApiException {
      rethrow;
    } catch (_) {
      throw ApiException('Could not reach EzzyGo. Check your connection.');
    }
  }

  dynamic _processResponse(http.Response response) {
    dynamic decoded;
    try {
      if (response.body.isNotEmpty) {
        decoded = jsonDecode(response.body);
      }
    } catch (_) {}

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded ?? true;
    }

    _checkUnauthorized(response.statusCode);

    String message = 'Request failed (${response.statusCode})';
    if (decoded is Map) {
      final map = decoded.cast<String, dynamic>();
      message = (map['message'] ?? map['error'] ?? message).toString();
    }
    throw ApiException(message, response.statusCode);
  }
}
