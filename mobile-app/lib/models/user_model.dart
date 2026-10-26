enum UserRole { host, vendor }

class UserModel {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String? avatar;
  final String? serviceArea;
  final UserRole role;
  final String? businessName;
  final bool isVerified;
  final double rating;
  final int completedJobs;
  final String? token;

  const UserModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.avatar,
    this.serviceArea,
    required this.role,
    this.businessName,
    this.isVerified = false,
    this.rating = 4.9,
    this.completedJobs = 0,
    this.token,
  });

  String get displayEmail {
    final value = email?.trim() ?? '';
    return value;
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final emailRaw = json['email']?.toString().trim();
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: (emailRaw == null || emailRaw.isEmpty) ? null : emailRaw,
      avatar: json['avatar']?.toString(),
      serviceArea: json['serviceArea']?.toString(),
      role: (json['role'] == 'provider' || json['role'] == 'vendor')
          ? UserRole.vendor
          : UserRole.host,
      businessName: json['businessName'],
      isVerified: json['isVerified'] ?? false,
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 4.9,
      completedJobs: json['completedJobs'] ?? 0,
      token: json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'avatar': avatar,
      'serviceArea': serviceArea,
      'role': role == UserRole.vendor ? 'provider' : 'requester',
      'businessName': businessName,
      'isVerified': isVerified,
      'rating': rating,
      'completedJobs': completedJobs,
      'token': token,
    };
  }

  UserModel copyWith({
    String? id,
    String? name,
    String? phone,
    String? email,
    String? avatar,
    String? serviceArea,
    UserRole? role,
    String? businessName,
    bool? isVerified,
    double? rating,
    int? completedJobs,
    String? token,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      serviceArea: serviceArea ?? this.serviceArea,
      role: role ?? this.role,
      businessName: businessName ?? this.businessName,
      isVerified: isVerified ?? this.isVerified,
      rating: rating ?? this.rating,
      completedJobs: completedJobs ?? this.completedJobs,
      token: token ?? this.token,
    );
  }
}
