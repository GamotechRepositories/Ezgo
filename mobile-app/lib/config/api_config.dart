import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  // Configured via mobile-app/.env file.
  // Defaults to Wi-Fi LAN IP (192.168.1.42:5000) for real devices,
  // or localhost:5000 with 'adb reverse tcp:5000 tcp:5000'.
  static String get baseUrl {
    final envUrl = dotenv.env['BACKEND_URL'];
    if (envUrl != null && envUrl.trim().isNotEmpty) {
      return envUrl.trim();
    }
    const dartEnvUrl = String.fromEnvironment('BACKEND_URL');
    if (dartEnvUrl.isNotEmpty) {
      return dartEnvUrl;
    }
    return 'http://192.168.1.42:5000/api';
  }

  static const String demoAccounts = '/auth/demo-accounts';
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String sendOtp = '/auth/send-otp';
  static const String verifyOtp = '/auth/verify-otp';
  static const String googleAuth = '/auth/google';

  static String get googleServerClientId {
    final envId = dotenv.env['GOOGLE_SERVER_CLIENT_ID'];
    if (envId != null && envId.trim().isNotEmpty) {
      return envId.trim();
    }
    return const String.fromEnvironment(
      'GOOGLE_SERVER_CLIENT_ID',
      defaultValue: '1093562728700-c7eg1eet1kvi99f7ljs0u2clsbldds31.apps.googleusercontent.com',
    );
  }

  static String get googleAndroidClientId {
    final envId = dotenv.env['GOOGLE_ANDROID_CLIENT_ID'];
    if (envId != null && envId.trim().isNotEmpty) {
      return envId.trim();
    }
    return const String.fromEnvironment(
      'GOOGLE_ANDROID_CLIENT_ID',
      defaultValue: '1093562728700-veeifrhbp5emock1l86u548n75shibr8.apps.googleusercontent.com',
    );
  }
  static const String me = '/auth/me';
  static const String profile = '/auth/profile';
  static const String upload = '/upload';
  static const String vendorPortalUrl = 'https://vendor.ezzygo.in';
  static const String supportWhatsApp = 'https://wa.me/919322054199?text=Hello%20EzzyGo%20Team%2C%20I%20need%20help%20with%20my%20event%20booking';
  static const String supportPhone = 'tel:+919322054199';
  static const String supportEmail = 'mailto:support@ezzygo.in';
  static const String requirements = '/requirements';
  static const String categories = '/categories';
  static const String occasions = '/occasions';
  static const String banners = '/banners';
  static const String bids = '/bids';
  static const String bookings = '/bookings';
  static const String acceptBid = '/bookings/accept-bid';
  static const String payBooking = '/bookings/pay';
  static const String completeBooking = '/bookings/complete';
  static const String reviewBooking = '/bookings/review';
  static const String cancelBooking = '/bookings/cancel';
  static const String createOrder = '/create-order';
  static const String verifyPayment = '/verify-payment';
  static const String payments = '/payments';
  static const String blockDate = '/auth/availability/block';
  static const String unblockDate = '/auth/availability/unblock';
}
