import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/bid_model.dart';
import '../models/notification_model.dart';
import '../providers/auth_provider.dart';
import '../providers/bookings_provider.dart';
import '../providers/notifications_provider.dart';
import '../providers/payments_provider.dart';
import '../providers/requirements_provider.dart';
import '../services/socket_service.dart';

class LiveUpdatesBinder extends StatefulWidget {
  final Widget child;
  const LiveUpdatesBinder({super.key, required this.child});

  @override
  State<LiveUpdatesBinder> createState() => _LiveUpdatesBinderState();
}

class _LiveUpdatesBinderState extends State<LiveUpdatesBinder> {
  String? _boundUserId;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    SocketService.instance.on('notification:new', _onNotification);
    SocketService.instance.on('bid:placed', _onBidPlaced);
    SocketService.instance.on('requirement:updated', _onRequirementUpdated);
    SocketService.instance.on('booking:created', _onBooking);
    SocketService.instance.on('booking:updated', _onBooking);
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void dispose() {
    _poll?.cancel();
    SocketService.instance.off('notification:new', _onNotification);
    SocketService.instance.off('bid:placed', _onBidPlaced);
    SocketService.instance.off('requirement:updated', _onRequirementUpdated);
    SocketService.instance.off('booking:created', _onBooking);
    SocketService.instance.off('booking:updated', _onBooking);
    super.dispose();
  }

  void _sync() {
    final auth = context.read<AuthProvider>();
    final userId = auth.user?.id;
    if (!auth.isLoggedIn || userId == null || userId.isEmpty) {
      if (_boundUserId != null) {
        SocketService.instance.disconnect();
        context.read<NotificationsProvider>().clear();
        context.read<PaymentsProvider>().clear();
        _boundUserId = null;
        _poll?.cancel();
      }
      return;
    }
    if (_boundUserId == userId) return;
    _boundUserId = userId;
    SocketService.instance.connect(userId);
    context.read<NotificationsProvider>().load();
    context.read<PaymentsProvider>().load();
    _poll?.cancel();
    _poll = Timer.periodic(const Duration(seconds: 25), (_) {
      if (!mounted) return;
      context.read<NotificationsProvider>().load();
    });
  }

  Map<String, dynamic>? _map(dynamic raw) {
    if (raw is Map) return Map<String, dynamic>.from(raw);
    return null;
  }

  void _onNotification(dynamic data) {
    final map = _map(data);
    if (map == null) return;
    final item = AppNotification.fromJson(map);
    if (!mounted) return;
    context.read<NotificationsProvider>().prepend(item);
    final messenger = ScaffoldMessenger.maybeOf(context);
    messenger?.hideCurrentSnackBar();
    messenger?.showSnackBar(
      SnackBar(
        content: Text(item.title),
        backgroundColor: AppTheme.slate900,
        behavior: SnackBarBehavior.floating,
      ),
    );
    final auth = context.read<AuthProvider>();
    context.read<RequirementsProvider>().loadData(
      requesterId: auth.isHost ? auth.user?.id : null,
      marketplace: !auth.isHost,
    );
    context.read<BookingsProvider>().loadData();
    context.read<PaymentsProvider>().load();
  }

  void _onBidPlaced(dynamic data) {
    final map = _map(data);
    if (map == null) return;
    var reqId = (map['requirementId'] ?? '').toString();
    final req = map['requirement'];
    if (reqId.isEmpty && req is Map) {
      reqId = (req['_id'] ?? req['id'] ?? '').toString();
    }
    BidModel? bid;
    final bidRaw = map['bid'];
    if (bidRaw is Map) {
      bid = BidModel.fromJson(Map<String, dynamic>.from(bidRaw));
    }
    final lowest = map['lowestBid'];
    final count = map['bidsCount'];
    if (!mounted) return;
    context.read<RequirementsProvider>().applyLiveBid(
          requirementId: reqId,
          bid: bid,
          lowestBid: lowest is num ? lowest.toInt() : null,
          bidsCount: count is num ? count.toInt() : null,
        );
  }

  void _onRequirementUpdated(dynamic data) {
    final map = _map(data);
    if (map == null) return;
    final id = (map['_id'] ?? map['id'] ?? '').toString();
    if (id.isEmpty) return;
    if (!mounted) return;
    context.read<RequirementsProvider>().fetchRequirement(id);
  }

  void _onBooking(dynamic data) {
    if (!mounted) return;
    context.read<BookingsProvider>().upsertFromJson(data);
    context.read<PaymentsProvider>().load();
    final auth = context.read<AuthProvider>();
    context.read<RequirementsProvider>().loadData(
      requesterId: auth.isHost ? auth.user?.id : null,
      marketplace: !auth.isHost,
    );
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AuthProvider>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _sync();
    });
    return widget.child;
  }
}
