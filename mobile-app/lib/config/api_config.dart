class ApiConfig {
  // When connected via USB debugging with 'adb reverse tcp:5000 tcp:5000',
  // 'http://localhost:5000/api' routes traffic directly over the USB cable.
  static String get baseUrl {
    return 'http://localhost:5000/api';
  }

  static const String demoAccounts = '/auth/demo-accounts';
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String sendOtp = '/auth/send-otp';
  static const String verifyOtp = '/auth/verify-otp';
  static const String me = '/auth/me';
  static const String requirements = '/requirements';
  static const String categories = '/categories';
  static const String occasions = '/occasions';
  static const String bids = '/bids';
  static const String bookings = '/bookings';
  static const String payments = '/payments';
  static const String blockDate = '/auth/availability/block';
  static const String unblockDate = '/auth/availability/unblock';
}
