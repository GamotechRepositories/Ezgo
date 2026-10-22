import { useEffect, useState, useRef } from 'react';
import { EzzyGoLogo } from './EzzyGoLogo';
import { api, type DemoAccount } from '../services/api';
import type { User } from '../types';
import { Mail, ArrowLeft, ShieldCheck, RefreshCw, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onSuccess: (user: User) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const points = [
  'Approve a vendor before hosts can book them.',
  'Pay the vendor after the host marks the event done.',
  'Cancel a paid booking and refund the host in full.',
  'Manage platform categories, pricing rules, and escrow disputes.',
];

const maskEmail = (emailStr: string): string => {
  const parts = emailStr.split('@');
  if (parts.length !== 2) return emailStr;
  const [local, domain] = parts;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  const maskedLocal = `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  // Navigation / Step state
  const [step, setStep] = useState<'email' | 'otp'>('email');

  // Input states
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);

  // Loading & Feedback states
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Cooldown timer for resending OTP (60 seconds)
  const [cooldown, setCooldown] = useState(0);

  // References to 6 OTP input elements for auto-focus & paste handling
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Demo accounts for local development fallback
  const [demos, setDemos] = useState<DemoAccount[]>([]);
  const [showLegacyLogin, setShowLegacyLogin] = useState(false);
  const [legacyPhone, setLegacyPhone] = useState('');
  const [legacyPassword, setLegacyPassword] = useState('');

  useEffect(() => {
    api.demoAccounts()
      .then((list) => setDemos(list.filter((a) => a.role === 'admin')))
      .catch(() => {});
  }, []);

  // Cooldown countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP input when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // ==========================================
  // Step 1: Send OTP to Admin Email
  // ==========================================
  const handleSendOtp = async (targetEmail: string) => {
    const trimmedEmail = targetEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid administrator email address.');
      return;
    }

    setIsSending(true);
    setError('');
    setInfoMessage('');

    try {
      const response = await api.sendAdminOtp(trimmedEmail);
      setInfoMessage(
        response.message ||
          'If an authorized admin account is registered with this email, a 6-digit verification code has been sent.'
      );
      setStep('otp');
      setCooldown(60); // 60s cooldown
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Unable to send verification email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ==========================================
  // Step 2: Verify Submitted 6-Digit OTP
  // ==========================================
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otpDigits.join('');
    if (fullCode.length !== 6 || !/^\d{6}$/.test(fullCode)) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const admin = await api.verifyAdminOtp(email.trim().toLowerCase(), fullCode);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(admin);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
      // If code was invalid, clear and focus first box for convenience
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle individual digit typing
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    const digit = cleaned[cleaned.length - 1]; // take the last entered char
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError('');

    // Advance focus to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // All 6 digits filled, automatically trigger verification
      const fullCode = next.join('');
      if (fullCode.length === 6) {
        handleVerifyOtp(fullCode);
      }
    }
  };

  // Handle backspace and arrow navigation
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle clipboard paste of 6-digit OTP code
  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(nextDigits);
    setError('');

    if (pastedData.length >= 6) {
      inputRefs.current[5]?.focus();
      handleVerifyOtp(pastedData.slice(0, 6));
    } else {
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  // Legacy fallback login handler for developer convenience
  const handleLegacyLogin = async () => {
    setIsSending(true);
    setError('');
    try {
      const user = await api.login(legacyPhone, legacyPassword);
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2 bg-[#f8fafc] lg:bg-white text-slate-900">
      {/* Brand Hero Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between bg-[#fff6f1] border-r border-orange-100 px-12 xl:px-16 py-10 select-none">
        <EzzyGoLogo variant="admin" size="lg" />
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#ea580c] text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-[#ea580c]" />
            Secure Admin Access
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
            The control desk for vendors, payments, & disputes
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Protected by multi-factor cryptographic email OTP authentication. Only verified administrator accounts can access this panel.
          </p>

          <ol className="mt-8 space-y-3.5">
            {points.map((point, index) => (
              <li key={point} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white border border-orange-200 text-[#f95724] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-700 leading-relaxed">{point}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="pt-6 border-t border-orange-200/60">
          <p className="text-xs text-slate-500">
            EzzyGo Event Marketplace &bull; Security Level: High (Zero Plaintext Secrets)
          </p>
        </div>
      </aside>

      {/* Main Authentication Card */}
      <main className="min-h-dvh flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[440px] mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 lg:border-0 lg:shadow-none lg:p-0">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <EzzyGoLogo variant="admin" size="md" />
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-[#f95724] font-semibold border border-orange-200">
              Admin Gateway
            </span>
          </div>

          {/* ========================================================= */}
          {/* STEP 1: Enter Administrator Email                         */}
          {/* ========================================================= */}
          {step === 'email' && !showLegacyLogin && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#f95724] flex items-center justify-center mb-4 border border-orange-200">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Admin Sign In
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-2">
                  Enter your registered admin email address. We will send a secure 6-digit OTP code to verify your identity.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp(email);
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="admin-email" className="block text-sm font-semibold text-slate-700">
                    Administrator Email
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                      placeholder="e.g. admin@ezzygo.com"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#f95724] focus:ring-2 focus:ring-[#f95724]/15 transition"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Only authorized admin accounts may authenticate. Public registration is disabled.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSending || !email.trim()}
                  className="w-full h-12 rounded-xl bg-[#f95724] hover:bg-[#e04818] active:bg-[#c83b0f] text-white font-semibold text-base shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send Login OTP</span>
                  )}
                </button>
              </form>

              {/* Developer options in dev environment */}
              {demos.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Developer Demo Accounts:</span>
                    <button
                      type="button"
                      onClick={() => setShowLegacyLogin(!showLegacyLogin)}
                      className="text-[#f95724] font-medium hover:underline"
                    >
                      {showLegacyLogin ? 'Use Email OTP' : 'Switch to Password Login'}
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {demos.map((d) => (
                      <button
                        key={d.phone}
                        type="button"
                        onClick={() => {
                          // If admin has email or phone
                          setEmail('onereach66@gmail.com');
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 text-xs transition"
                      >
                        <span className="font-semibold text-slate-900 block">{d.name}</span>
                        <span className="text-slate-500">Email: onereach66@gmail.com &bull; Role: admin</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: Dedicated OTP Verification Screen                 */}
          {/* ========================================================= */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-3 cursor-pointer transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Email</span>
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Enter Verification Code
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  We sent a 6-digit one-time code to{' '}
                  <strong className="text-slate-900 font-semibold">{maskEmail(email)}</strong>. Code expires in 5 minutes.
                </p>
              </div>

              {/* Success Feedback banner */}
              {infoMessage && (
                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-orange-950 leading-relaxed">
                  {infoMessage}
                </div>
              )}

              {/* Error feedback */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Success redirect state */}
              {isSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold animate-pulse">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span>OTP verified successfully! Accessing Admin Dashboard...</span>
                </div>
              )}

              {/* 6-Digit OTP Input Grid */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  6-Digit Admin OTP
                </label>
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5" onPaste={handleDigitPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      disabled={isVerifying || isSuccess}
                      className={`h-13 sm:h-14 w-full text-center text-2xl font-bold rounded-xl border transition ${
                        digit
                          ? 'border-[#f95724] bg-orange-50/30 text-[#ea580c]'
                          : 'border-slate-200 bg-white text-slate-900'
                      } focus:outline-none focus:border-[#f95724] focus:ring-2 focus:ring-[#f95724]/20 disabled:opacity-50`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Tip: You can paste the entire 6-digit code directly into any box.
                </p>
              </div>

              {/* Verification Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isVerifying || isSuccess || otpDigits.join('').length !== 6}
                className="w-full h-12 rounded-xl bg-[#f95724] hover:bg-[#e04818] active:bg-[#c83b0f] text-white font-semibold text-base shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Authenticated</span>
                  </>
                ) : (
                  <span>Verify & Log In</span>
                )}
              </button>

              {/* Resend Cooldown Section */}
              <div className="pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Didn't receive the email?</span>
                {cooldown > 0 ? (
                  <span className="text-slate-400 font-medium text-xs">
                    Resend available in <strong className="text-slate-600">{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp(email)}
                    disabled={isSending || isVerifying}
                    className="text-[#f95724] hover:text-[#c83b0f] font-semibold text-xs cursor-pointer hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* Optional Legacy Password Form (Dev Mode Switch)          */}
          {/* ========================================================= */}
          {showLegacyLogin && step === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Developer Password Login</h2>
                <button
                  type="button"
                  onClick={() => setShowLegacyLogin(false)}
                  className="text-xs text-[#f95724] font-semibold hover:underline"
                >
                  Use Email OTP
                </button>
              </div>

              <input
                type="text"
                value={legacyPhone}
                onChange={(e) => setLegacyPhone(e.target.value)}
                placeholder="Mobile number"
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm"
              />
              <input
                type="password"
                value={legacyPassword}
                onChange={(e) => setLegacyPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm"
              />
              <button
                type="button"
                onClick={handleLegacyLogin}
                className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-sm"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
