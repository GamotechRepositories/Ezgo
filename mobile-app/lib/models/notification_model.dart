class AppNotification {
  final String id;
  final String title;
  final String message;
  final String type;
  final String link;
  final bool isRead;
  final Map<String, dynamic> metadata;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.link = '',
    this.isRead = false,
    this.metadata = const {},
    required this.createdAt,
  });

  String? get requirementId {
    final value = metadata['requirementId'];
    if (value == null) return null;
    if (value is Map) return (value['_id'] ?? value['id'])?.toString();
    return value.toString();
  }

  String? get bookingId {
    final value = metadata['bookingId'];
    if (value == null) return null;
    if (value is Map) return (value['_id'] ?? value['id'])?.toString();
    return value.toString();
  }

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    final meta = json['metadata'];
    return AppNotification(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      title: json['title']?.toString() ?? 'EzzyGo update',
      message: json['message']?.toString() ?? '',
      type: json['type']?.toString() ?? 'SYSTEM',
      link: json['link']?.toString() ?? '',
      isRead: json['isRead'] == true,
      metadata: meta is Map ? Map<String, dynamic>.from(meta) : const {},
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  AppNotification copyWith({bool? isRead}) {
    return AppNotification(
      id: id,
      title: title,
      message: message,
      type: type,
      link: link,
      isRead: isRead ?? this.isRead,
      metadata: metadata,
      createdAt: createdAt,
    );
  }
}
