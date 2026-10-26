import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/api_config.dart';

typedef SocketPayload = void Function(dynamic data);

class SocketService {
  SocketService._();
  static final SocketService instance = SocketService._();

  io.Socket? _socket;
  String? _userId;

  final Map<String, List<SocketPayload>> _listeners = {};

  String get _origin {
    return ApiConfig.baseUrl.replaceFirst(RegExp(r'/api/?$'), '');
  }

  void connect(String userId) {
    if (userId.isEmpty) return;
    if (_socket != null && _userId == userId && _socket!.connected) {
      _socket!.emit('join:user', userId);
      return;
    }
    disconnect();
    _userId = userId;
    _socket = io.io(
      _origin,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(999999)
          .setReconnectionDelay(1000)
          .build(),
    );
    _socket!
      ..onConnect((_) {
        if (_userId != null) _socket?.emit('join:user', _userId);
      })
      ..on('notification:new', (data) => _emit('notification:new', data))
      ..on('bid:placed', (data) => _emit('bid:placed', data))
      ..on('requirement:updated', (data) => _emit('requirement:updated', data))
      ..on('booking:created', (data) => _emit('booking:created', data))
      ..on('booking:updated', (data) => _emit('booking:updated', data))
      ..on('booking:update', (data) => _emit('booking:updated', data));
  }

  void on(String event, SocketPayload handler) {
    _listeners.putIfAbsent(event, () => []).add(handler);
  }

  void off(String event, SocketPayload handler) {
    _listeners[event]?.remove(handler);
  }

  void _emit(String event, dynamic data) {
    final handlers = List<SocketPayload>.from(_listeners[event] ?? const []);
    for (final handler in handlers) {
      handler(data);
    }
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
    _userId = null;
  }
}
