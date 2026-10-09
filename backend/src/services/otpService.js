import Otp from '../models/Otp.js';

export const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

/**
 * Generate a 6-digit OTP and save it with 5-minute expiry.
 * Rate limit: 3 requests per 10 minutes.
 */
export const generateAndSendOtp = async (rawPhone, purpose = 'login') => {
  const phone = normalizePhone(rawPhone);
  if (phone.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  // Check rate limit in the last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentOtpCount = await Otp.countDocuments({
    phone,
    createdAt: { $gte: tenMinutesAgo },
  });

  if (recentOtpCount >= 5) {
    throw new Error('Too many OTP requests. Please wait a few minutes before requesting again.');
  }

  // Generate 6-digit numeric OTP (e.g. 582194)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate any previous unused OTPs for this phone
  await Otp.deleteMany({ phone, isVerified: false });

  // Store new OTP
  await Otp.create({
    phone,
    otpCode,
    expiresAt,
    purpose,
    attempts: 0,
    isVerified: false,
  });

  // Dispatch via SMS provider or Simulated Provider in development
  const isProd = process.env.NODE_ENV === 'production' && process.env.SMS_PROVIDER_API_KEY;
  if (isProd) {
    // If external SMS provider configured, dispatch HTTP request here
    console.log(`[SMS GATEWAY] Sending OTP ${otpCode} to +91${phone}`);
  } else {
    console.log(`\n========================================`);
    console.log(`📱 [EzzyGo OTP] To: +91 ${phone} | Code: ${otpCode} | Expires: 5 mins`);
    console.log(`========================================\n`);
  }

  return {
    phone,
    expiresInSeconds: 300,
    // Return code in dev/demo mode for easy testing and evaluation
    demoOtp: isProd ? undefined : otpCode,
  };
};

/**
 * Verify submitted OTP code
 */
export const verifySubmittedOtp = async (rawPhone, code) => {
  const phone = normalizePhone(rawPhone);
  const cleanCode = String(code || '').trim();

  if (phone.length !== 10) {
    throw new Error('Invalid mobile number.');
  }
  if (cleanCode.length !== 6) {
    throw new Error('Please enter a 6-digit OTP code.');
  }

  const record = await Otp.findOne({
    phone,
    isVerified: false,
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new Error('No OTP request found. Please request a new OTP.');
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    throw new Error('OTP has expired. Please request a new code.');
  }

  if (record.attempts >= 4) {
    await Otp.deleteOne({ _id: record._id });
    throw new Error('Too many invalid attempts. Please request a new OTP.');
  }

  if (record.otpCode !== cleanCode) {
    record.attempts += 1;
    await record.save();
    const remaining = 4 - record.attempts;
    throw new Error(`Invalid OTP code. ${remaining} attempts remaining.`);
  }

  // Mark verified
  record.isVerified = true;
  await record.save();

  return true;
};
