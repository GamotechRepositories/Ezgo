import { useEffect, useState, useRef } from 'react';
import {
  Building2,
  CheckCircle2,
  FileBadge,
  ShieldCheck,
  Store,
  Upload,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CreditCard,
  Check,
  AlertCircle
} from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
import { api, type DemoAccount } from '../services/api';
import type { User } from '../types';

interface LoginPageProps {
  onSuccess: (user: User) => void;
}

const fieldClass =
  'mt-1.5 w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#f95724] focus:ring-2 focus:ring-[#f95724]/15 transition';

const points = [
  'See live requests posted by hosts in your city.',
  'Submit your best price and compete fairly in auctions.',
  'Get 100% of your bid released straight to your bank account after the event.',
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic & Business Profile
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [serviceArea, setServiceArea] = useState('Pune');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Bank Account Details
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Step 3: KYC Documents
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState('');
  const [aadhaarBack, setAadhaarBack] = useState('');
  const [panCard, setPanCard] = useState('');
  const [gstDoc, setGstDoc] = useState('');

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [demos, setDemos] = useState<DemoAccount[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadField, setActiveUploadField] = useState<string | null>(null);

  useEffect(() => {
    api.demoAccounts()
      .then((list) => setDemos(list.filter((a) => a.role === 'provider')))
      .catch(() => {});
  }, []);

  // Sync account holder with vendor name if not manually modified
  useEffect(() => {
    if (name && !accountHolder) {
      setAccountHolder(name);
    }
  }, [name]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadField) return;

    setUploadingDoc(activeUploadField);
    setError('');
    try {
      const url = await api.uploadImage(file, 'ezzygo/kyc');
      if (activeUploadField === 'aadhaarFront') setAadhaarFront(url);
      else if (activeUploadField === 'aadhaarBack') setAadhaarBack(url);
      else if (activeUploadField === 'panCard') setPanCard(url);
      else if (activeUploadField === 'gstDoc') setGstDoc(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(null);
      setActiveUploadField(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (fieldName: string) => {
    setActiveUploadField(fieldName);
    fileInputRef.current?.click();
  };

  const validateStep1 = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!businessName.trim()) return 'Please enter your business or agency name.';
    if (!serviceArea.trim()) return 'Please enter your operating city.';
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) return 'Please enter a valid 10-digit mobile number.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const validateStep2 = () => {
    if (!accountHolder.trim()) return 'Please enter the bank account holder name.';
    if (!accountNumber.trim()) return 'Please enter your bank account number.';
    if (accountNumber !== confirmAccountNumber) return 'Bank account numbers do not match.';
    if (!ifscCode.trim() || ifscCode.trim().length < 8) return 'Please enter a valid Bank IFSC code.';
    return null;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (regStep === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setRegStep(2);
    } else if (regStep === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setRegStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      setBusy(true);
      api.login(phone, password)
        .then(onSuccess)
        .catch((err: any) => setError(err.message))
        .finally(() => setBusy(false));
      return;
    }

    // Mode is register
    const errStep1 = validateStep1();
    if (errStep1) {
      setRegStep(1);
      setError(errStep1);
      return;
    }

    const errStep2 = validateStep2();
    if (errStep2) {
      setRegStep(2);
      setError(errStep2);
      return;
    }

    // Step 3 validations
    if (!aadhaarNumber.trim() && !panNumber.trim()) {
      setError('Please provide at least Aadhaar or PAN details for KYC verification.');
      return;
    }

    if (aadhaarNumber.trim() && aadhaarNumber.replace(/\D/g, '').length !== 12) {
      setError('Aadhaar number must be exactly 12 digits.');
      return;
    }

    if (panNumber.trim() && panNumber.trim().length !== 10) {
      setError('PAN card number must be 10 characters (e.g. ABCDE1234F).');
      return;
    }

    setBusy(true);
    api.register({
      name: name.trim(),
      phone: phone.trim(),
      password,
      businessName: businessName.trim(),
      serviceArea: serviceArea.trim(),
      email: email.trim() || undefined,
      bankDetails: {
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        upiId: upiId.trim(),
      },
      kycDocuments: {
        aadhaarNumber: aadhaarNumber.trim(),
        aadhaarFront: aadhaarFront || undefined,
        aadhaarBack: aadhaarBack || undefined,
        panNumber: panNumber.trim().toUpperCase(),
        panCard: panCard || undefined,
        gstNumber: gstNumber.trim().toUpperCase() || undefined,
        gstDoc: gstDoc || undefined,
        businessAddress: businessAddress.trim(),
      },
    })
      .then(onSuccess)
      .catch((err: any) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const loginDemo = (demo: DemoAccount) => {
    setPhone(demo.phone);
    setPassword(demo.password);
    setBusy(true);
    setError('');
    api.login(demo.phone, demo.password)
      .then(onSuccess)
      .catch((err: any) => setError(err.message))
      .finally(() => setBusy(false));
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-12 bg-[#f8fafc]">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* Left branding aside */}
      <aside className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-[#fff6f1] border-r border-orange-100 px-10 xl:px-14 py-10 sticky top-0 h-screen">
        <EzzyGoLogo variant="vendor" size="lg" />
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-[#f95724] text-xs font-semibold uppercase tracking-wider mb-4">
            <Store className="w-3.5 h-3.5" /> Vendor Partner Portal
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 leading-tight">
            Send your price. Keep 100% of your earnings.
          </h2>
          <ol className="mt-8 space-y-4">
            {points.map((point, index) => (
              <li key={point} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-white border border-orange-200 text-[#f95724] text-sm font-semibold flex items-center justify-center shrink-0 shadow-sm">
                  {index + 1}
                </span>
                <span className="text-base text-slate-700 leading-snug pt-0.5">{point}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 p-4 rounded-2xl bg-white/80 border border-orange-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Verified Partner Trust:</strong> Providing your Bank Details and KYC ensures fast payouts and verified badge status on your bids.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Booking an event as a host?{' '}
          <a className="text-[#f95724] font-semibold hover:underline" href="http://localhost:5173">
            Open the host app
          </a>
        </p>
      </aside>

      {/* Right form container */}
      <main className="lg:col-span-7 min-h-dvh flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className={`w-full ${mode === 'register' ? 'max-w-[560px]' : 'max-w-[440px]'} mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-9 transition-all`}>
          <div className="lg:hidden mb-6">
            <EzzyGoLogo variant="vendor" size="lg" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {mode === 'login' ? 'Vendor log in' : 'Create vendor account'}
            </h1>
            {mode === 'register' && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-[#f95724] border border-orange-200 rounded-full">
                Step {regStep} of 3
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 mt-1.5">
            {mode === 'login'
              ? 'See open live requests and manage your event bookings.'
              : mode === 'register' && regStep === 1
              ? 'Tell us about your event business to get started.'
              : mode === 'register' && regStep === 2
              ? 'Add your bank account to receive automated event payouts.'
              : 'Submit your business KYC for fast account verification.'}
          </p>

          {/* Stepper bar for register */}
          {mode === 'register' && (
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRegStep(1)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                  regStep === 1
                    ? 'border-[#f95724] bg-orange-50 text-[#f95724]'
                    : regStep > 1
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                  regStep > 1 ? 'bg-emerald-600 text-white' : regStep === 1 ? 'bg-[#f95724] text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {regStep > 1 ? <Check className="w-3 h-3" /> : '1'}
                </div>
                <span className="truncate">Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!validateStep1()) setRegStep(2);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                  regStep === 2
                    ? 'border-[#f95724] bg-orange-50 text-[#f95724]'
                    : regStep > 2
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                  regStep > 2 ? 'bg-emerald-600 text-white' : regStep === 2 ? 'bg-[#f95724] text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {regStep > 2 ? <Check className="w-3 h-3" /> : '2'}
                </div>
                <span className="truncate">Bank Info</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!validateStep1() && !validateStep2()) setRegStep(3);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                  regStep === 3
                    ? 'border-[#f95724] bg-orange-50 text-[#f95724]'
                    : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                  regStep === 3 ? 'bg-[#f95724] text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  3
                </div>
                <span className="truncate">KYC Details</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'register' && regStep < 3 ? handleNextStep : handleSubmit} className="mt-6 space-y-4">
            {/* LOGIN MODE */}
            {mode === 'login' && (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Mobile number</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="current-password"
                      className={`${fieldClass} pr-14`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </label>
              </>
            )}

            {/* REGISTER STEP 1: Basic & Business Profile */}
            {mode === 'register' && regStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Your full name *</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Rajesh Kumar"
                      autoComplete="name"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Business / Agency name *</span>
                    <input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      placeholder="e.g. Rajesh Pro Audio & DJ"
                      className={fieldClass}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Operating city *</span>
                    <input
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      required
                      placeholder="e.g. Pune, Mumbai"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Mobile number *</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="10-digit mobile number"
                      className={fieldClass}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Email address (optional)</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. info@rajeshsound.com"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Create Password *</span>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        className={`${fieldClass} pr-14`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* REGISTER STEP 2: Bank Account Details for Payouts */}
            {mode === 'register' && regStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Direct Bank Payouts:</strong> EzzyGo transfers 100% of the confirmed booking amount directly to this bank account upon event completion with 0% platform deduction.
                  </p>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Account holder name *</span>
                  <input
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    required
                    placeholder="Name as printed on bank passbook / cheque"
                    className={fieldClass}
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Bank account number *</span>
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      placeholder="Account number"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Confirm account number *</span>
                    <input
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      required
                      placeholder="Re-enter account number"
                      className={`${fieldClass} ${
                        confirmAccountNumber && confirmAccountNumber !== accountNumber
                          ? 'border-rose-400 focus:border-rose-500'
                          : ''
                      }`}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">IFSC code *</span>
                    <input
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      required
                      placeholder="e.g. HDFC0001234"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">UPI ID / VPA (optional)</span>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi"
                      className={fieldClass}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* REGISTER STEP 3: KYC Verification */}
            {mode === 'register' && regStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                  <FileBadge className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900 leading-relaxed">
                    <strong>KYC & Government ID:</strong> Required to verify vendor authenticity and protect host safety. Verified vendors get priority bid placement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Aadhaar Card Number *</span>
                    <input
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      required
                      placeholder="12-digit Aadhaar number"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">PAN Card Number *</span>
                    <input
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                      required
                      placeholder="10-digit PAN (e.g. ABCDE1234F)"
                      className={fieldClass}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">GST Number (optional)</span>
                    <input
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase().slice(0, 15))}
                      placeholder="15-digit GSTIN"
                      className={fieldClass}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Business / Studio Address</span>
                    <input
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Office or Studio address"
                      className={fieldClass}
                    />
                  </label>
                </div>

                {/* Document Upload section */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                    Attach Document Copies (Optional for instant signup)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Aadhaar Upload */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between items-center text-center">
                      <span className="text-xs font-medium text-slate-700">Aadhaar Card</span>
                      {aadhaarFront ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold my-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={uploadingDoc === 'aadhaarFront'}
                          onClick={() => triggerUpload('aadhaarFront')}
                          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-[#f95724] transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3 h-3" />
                          {uploadingDoc === 'aadhaarFront' ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>

                    {/* PAN Card Upload */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between items-center text-center">
                      <span className="text-xs font-medium text-slate-700">PAN Card</span>
                      {panCard ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold my-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={uploadingDoc === 'panCard'}
                          onClick={() => triggerUpload('panCard')}
                          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-[#f95724] transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3 h-3" />
                          {uploadingDoc === 'panCard' ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>

                    {/* GST Document Upload */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between items-center text-center">
                      <span className="text-xs font-medium text-slate-700">GST Certificate</span>
                      {gstDoc ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold my-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={uploadingDoc === 'gstDoc'}
                          onClick={() => triggerUpload('gstDoc')}
                          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-[#f95724] transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3 h-3" />
                          {uploadingDoc === 'gstDoc' ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            {mode === 'login' ? (
              <button
                type="submit"
                disabled={busy}
                className="w-full h-12 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-base disabled:opacity-50 cursor-pointer shadow-sm transition"
              >
                {busy ? 'Please wait...' : 'Log in'}
              </button>
            ) : (
              <div className="pt-2 flex items-center gap-3">
                {regStep > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setRegStep((s) => (s === 3 ? 2 : 1));
                    }}
                    className="h-12 px-5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                )}

                {regStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 h-12 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-base cursor-pointer shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <span>Continue to {regStep === 1 ? 'Bank Details' : 'KYC Verification'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 h-12 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-base disabled:opacity-50 cursor-pointer shadow-sm transition flex items-center justify-center gap-2"
                  >
                    {busy ? (
                      'Creating account...'
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Create Vendor Account & Submit KYC</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setRegStep(1);
                setError('');
              }}
              className="text-sm font-semibold text-[#f95724] hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'New vendor? Register business & KYC' : 'Already have an account? Log in'}
            </button>
          </div>

          {/* Demo Accounts on login */}
          {mode === 'login' && demos.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Or continue with a demo account</p>
              {demos.map((demo) => (
                <button
                  key={demo.phone}
                  type="button"
                  disabled={busy}
                  onClick={() => loginDemo(demo)}
                  className="w-full min-h-12 text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer disabled:opacity-50 transition"
                >
                  <span className="block text-sm font-semibold text-slate-900">{demo.businessName || demo.name}</span>
                  <span className="block text-xs text-slate-500 break-all">{demo.phone} · {demo.password}</span>
                </button>
              ))}
            </div>
          )}

          <p className="lg:hidden mt-6 text-sm text-slate-600 text-center">
            Booking an event?{' '}
            <a className="text-[#f95724] font-semibold hover:underline" href="http://localhost:5173">
              Open the host app
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};
