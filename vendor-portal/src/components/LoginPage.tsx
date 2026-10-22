import { useEffect, useState, useRef } from 'react';
import {
  ShieldCheck,
  Store,
  Upload,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Check,
  AlertCircle,
  Zap,
  TrendingUp,
  FileBadge,
  FileText,
} from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
import { GoogleSignInButton } from './GoogleSignInButton';
import { api } from '../services/api';
import { getUserPortalUrl } from '../utils/portalUrls';
import type { User } from '../types';

interface LoginPageProps {
  onSuccess: (user: User) => void;
}

const fieldClass =
  'mt-1.5 w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#f95724] focus:ring-2 focus:ring-[#f95724]/15 transition';

const trustBadges = [
  {
    icon: TrendingUp,
    title: 'Live Reverse Auctions',
    desc: 'See live requests posted by hosts in your city and submit your best bids.',
  },
  {
    icon: ShieldCheck,
    title: '100% Milestone Escrow',
    desc: 'Funds are locked before the event and released straight to your bank account.',
  },
  {
    icon: Store,
    title: 'Zero Hidden Commissions',
    desc: 'Keep 100% of your accepted bid amount with zero listing or signup fees.',
  },
];

const getDocPreviewUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && /\.pdf($|\?)/i.test(url)) {
    return url.replace(/\.pdf($|\?)/i, '.jpg$1');
  }
  return url;
};

const isPdfDocument = (url?: string | null): boolean => {
  if (!url) return false;
  return /\.pdf($|\?)/i.test(url);
};

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic & Business Profile
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [serviceArea, setServiceArea] = useState('Pune');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password] = useState('Vendor@123'); // Default secure fallback for Google-authenticated vendors
  const [googleId, setGoogleId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Photography & Cinema']);

  const SERVICE_CATEGORIES = [
    'Photography & Cinema',
    'Catering & Food',
    'Decoration & Florals',
    'DJ & Sound Systems',
    'Venue & Banquets',
    'Makeup & Styling',
    'Anchors & Emcees',
    'Event Management',
  ];

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadField, setActiveUploadField] = useState<string | null>(null);
  const isRestoredRef = useRef(false);

  const DRAFT_STORAGE_KEY = 'ezzygo_vendor_registration_draft';

  const saveDraft = (overrides?: Record<string, any>) => {
    try {
      const draft = {
        name,
        businessName,
        serviceArea,
        phone,
        email,
        googleId,
        selectedCategories,
        accountHolder,
        accountNumber,
        confirmAccountNumber,
        ifscCode,
        upiId,
        aadhaarNumber,
        panNumber,
        gstNumber,
        businessAddress,
        aadhaarFront,
        aadhaarBack,
        panCard,
        gstDoc,
        regStep,
        mode,
        ...overrides,
        updatedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (_) {}
  };

  // Auto-restore incomplete registration draft on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) {
        isRestoredRef.current = true;
        return;
      }
      const draft = JSON.parse(saved);
      if (!draft) {
        isRestoredRef.current = true;
        return;
      }

      if (draft.name) setName(draft.name);
      if (draft.businessName) setBusinessName(draft.businessName);
      if (draft.serviceArea) setServiceArea(draft.serviceArea);
      if (draft.phone) setPhone(draft.phone);
      if (draft.email) setEmail(draft.email);
      if (draft.googleId) setGoogleId(draft.googleId);
      if (draft.selectedCategories?.length) setSelectedCategories(draft.selectedCategories);

      if (draft.accountHolder) setAccountHolder(draft.accountHolder);
      if (draft.accountNumber) setAccountNumber(draft.accountNumber);
      if (draft.confirmAccountNumber) setConfirmAccountNumber(draft.confirmAccountNumber);
      if (draft.ifscCode) setIfscCode(draft.ifscCode);
      if (draft.upiId) setUpiId(draft.upiId);

      if (draft.aadhaarNumber) setAadhaarNumber(draft.aadhaarNumber);
      if (draft.panNumber) setPanNumber(draft.panNumber);
      if (draft.gstNumber) setGstNumber(draft.gstNumber);
      if (draft.businessAddress) setBusinessAddress(draft.businessAddress);
      if (draft.aadhaarFront) setAadhaarFront(draft.aadhaarFront);
      if (draft.aadhaarBack) setAadhaarBack(draft.aadhaarBack);
      if (draft.panCard) setPanCard(draft.panCard);
      if (draft.gstDoc) setGstDoc(draft.gstDoc);

      const step1Done = Boolean(
        draft.name?.trim() &&
        draft.businessName?.trim() &&
        draft.phone?.replace(/\D/g, '').length === 10 &&
        (draft.selectedCategories?.length ?? 0) > 0
      );
      const step2Done = Boolean(
        (draft.accountNumber?.trim() && draft.ifscCode?.trim()?.length === 11) ||
        draft.upiId?.trim()
      );

      let targetStep: 1 | 2 | 3 = 1;
      if (draft.regStep === 3 && step1Done && step2Done) {
        targetStep = 3;
      } else if (draft.regStep === 2 && step1Done) {
        targetStep = 2;
      } else if (step1Done && step2Done) {
        targetStep = 3;
      } else if (step1Done) {
        targetStep = 2;
      } else {
        targetStep = 1;
      }

      if (draft.mode === 'register' || draft.googleId || step1Done) {
        setMode('register');
        setRegStep(targetStep);
      }
    } catch (_) {} finally {
      isRestoredRef.current = true;
    }
  }, []);

  // Auto-persist draft as user types/modifies details during registration
  useEffect(() => {
    if (!isRestoredRef.current || mode !== 'register') return;
    const timer = setTimeout(() => {
      saveDraft();
    }, 400);
    return () => clearTimeout(timer);
  }, [
    mode,
    regStep,
    name,
    businessName,
    serviceArea,
    phone,
    email,
    googleId,
    selectedCategories,
    accountHolder,
    accountNumber,
    confirmAccountNumber,
    ifscCode,
    upiId,
    aadhaarNumber,
    panNumber,
    gstNumber,
    businessAddress,
    aadhaarFront,
    aadhaarBack,
    panCard,
    gstDoc,
  ]);

  // Sync account holder with vendor name if not manually modified
  useEffect(() => {
    if (name && !accountHolder) {
      setAccountHolder(name);
    }
  }, [name, accountHolder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadField) return;

    setUploadingDoc(activeUploadField);
    setError('');
    try {
      const url = await api.uploadImage(file, 'ezzygo/kyc');
      if (activeUploadField === 'aadhaarFront') {
        setAadhaarFront(url);
        saveDraft({ aadhaarFront: url });
      } else if (activeUploadField === 'aadhaarBack') {
        setAadhaarBack(url);
        saveDraft({ aadhaarBack: url });
      } else if (activeUploadField === 'panCard') {
        setPanCard(url);
        saveDraft({ panCard: url });
      } else if (activeUploadField === 'gstDoc') {
        setGstDoc(url);
        saveDraft({ gstDoc: url });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (field: string) => {
    setActiveUploadField(field);
    fileInputRef.current?.click();
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!businessName.trim()) {
      setError('Please enter your business or studio name.');
      return false;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one service category you provide.');
      return false;
    }
    if (!serviceArea.trim()) {
      setError('Please specify your primary service city.');
      return false;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!accountHolder.trim()) {
      setError('Account holder name is required.');
      return false;
    }
    if (!accountNumber.trim()) {
      setError('Account number is required.');
      return false;
    }
    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match.');
      return false;
    }
    if (!ifscCode.trim() || ifscCode.trim().length !== 11) {
      setError('Please enter a valid 11-character IFSC code.');
      return false;
    }
    return true;
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (regStep === 1) {
      if (!validateStep1()) return;
      setRegStep(2);
      saveDraft({ regStep: 2 });
    } else if (regStep === 2) {
      if (!validateStep2()) return;
      setRegStep(3);
      saveDraft({ regStep: 3 });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep1() || !validateStep2()) return;

    if (!aadhaarNumber.trim() || aadhaarNumber.replace(/\D/g, '').length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!panNumber.trim() || panNumber.trim().length !== 10) {
      setError('Please enter a valid 10-character PAN number.');
      return;
    }
    if (!businessAddress.trim()) {
      setError('Business address is required for KYC compliance.');
      return;
    }

    setBusy(true);
    api.register({
      name: name.trim(),
      phone: phone.trim(),
      password: googleId ? (password || undefined) : password,
      googleId: googleId || undefined,
      businessName: businessName.trim(),
      serviceArea: serviceArea.trim(),
      categories: selectedCategories,
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
      .then((user) => {
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch (_) {}
        onSuccess(user);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setBusy(false));
  };

  return (
    <div className="min-h-dvh flex flex-col lg:grid lg:grid-cols-12 bg-[#f8fafc]">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* LEFT COLUMN: Hero Brand Experience (Visible on Laptop / Desktop) */}
      <aside className={`hidden lg:flex ${mode === 'register' ? 'lg:col-span-5' : 'lg:col-span-7'} flex-col justify-between bg-gradient-to-br from-[#fff3eb] via-[#fff8f4] to-[#fef6f0] border-r border-orange-100/80 p-10 xl:p-14 relative overflow-hidden sticky top-0 h-screen`}>
        {/* Ambient subtle glow background shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <EzzyGoLogo variant="vendor" size="lg" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-orange-200/70 text-xs font-semibold text-[#f95724] shadow-xs">
            Vendor Partner Hub
          </span>
        </div>

        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-[#f95724] uppercase tracking-wider mb-5">
            <Store className="w-3.5 h-3.5" /> Vendor Partner Console
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            Send your price.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f95724] to-[#ea3a06]">
              Keep 100% of your earnings.
            </span>
          </h2>
          <p className="mt-4 text-base xl:text-lg text-slate-600 leading-relaxed font-normal">
            Browse live host requests across Pune & Mumbai. Submit your competitive bids in real-time auctions and receive guaranteed escrow payouts.
          </p>

          <div className="mt-8 space-y-3.5">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-orange-100 shadow-xs hover:shadow-sm transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center shrink-0 text-[#f95724]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{badge.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Proof & Rating Strip */}
          <div className="mt-8 pt-6 border-t border-orange-200/50 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                  alt="Vendor"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                  alt="Vendor"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80"
                  alt="Vendor"
                />
              </div>
              <span className="font-semibold text-slate-800">5,000+ Verified Vendor Partners</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <span className="text-amber-500">★★★★★</span>
              <span>4.9/5 Vendor Trust</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-orange-100">
          <span>&copy; {new Date().getFullYear()} EzzyGo Events Marketplace</span>
          <a
            href={getUserPortalUrl()}
            className="text-[#f95724] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Booking an event? Open Host App <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>

      {/* RIGHT COLUMN: Interactive Login Card (Optimized for Mobile & Laptop) */}
      <main className={`flex-1 ${mode === 'register' ? 'lg:col-span-7' : 'lg:col-span-5'} flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-14`}>
        <div className={`w-full ${mode === 'register' ? 'max-w-[560px]' : 'max-w-[420px]'} mx-auto`}>
          {/* Mobile Top Brand Bar (Visible only on Mobile & Tablets) */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <EzzyGoLogo variant="vendor" size="md" />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-[#f95724]">
              Vendor Portal
            </span>
          </div>

          {mode === 'login' ? (
            /* Main Login Card - EXACT SAME AS FRONTEND LOGIN PAGE */
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-lg shadow-slate-200/40 p-6 sm:p-9 relative">
              <div className="text-center">
                <h1 className="font-['Poppins',sans-serif] text-3xl sm:text-[36px] font-bold text-slate-900 leading-tight tracking-normal">
                  Log in to EzzyGo
                </h1>
                <p className="text-sm sm:text-[14.5px] text-slate-600 leading-relaxed font-normal max-w-[340px] sm:max-w-[380px] mx-auto mt-2.5 mb-6">
                  Continue with your Google account to access your live auction desk, submit bids, and manage event orders.
                </p>
              </div>

              {/* Google Login Action Container */}
              <div className="space-y-4">
                <GoogleSignInButton
                  onSuccess={async (token, isAccessToken) => {
                    setBusy(true);
                    setError('');
                    try {
                      const res = await api.loginWithGoogle(token, isAccessToken);
                      if (!res.isNewUser && res.user) {
                        try {
                          localStorage.removeItem(DRAFT_STORAGE_KEY);
                        } catch (_) {}
                        onSuccess(res.user);
                      } else if (res.isNewUser && res.googleProfile) {
                        let draft: any = null;
                        try {
                          const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
                          if (saved) draft = JSON.parse(saved);
                        } catch (_) {}

                        const nameVal = res.googleProfile.name || draft?.name || res.user?.name || '';
                        const emailVal = res.googleProfile.email || draft?.email || res.user?.email || '';
                        const googleIdVal = res.googleProfile.googleId || draft?.googleId || (res.user as any)?.googleId || '';
                        const phoneVal = (res.googleProfile as any).phone || draft?.phone || res.user?.phone || '';
                        const rawBiz = (res.googleProfile as any).businessName || draft?.businessName || (res.user?.businessName && res.user.businessName !== 'Vendor Partner' ? res.user.businessName : '');
                        const businessNameVal = rawBiz && rawBiz !== 'Vendor Partner' ? rawBiz : '';
                        const serviceAreaVal = (res.googleProfile as any).serviceArea || draft?.serviceArea || res.user?.serviceArea || 'Pune';
                        const categoriesVal = (res.googleProfile as any).categories?.length
                          ? (res.googleProfile as any).categories
                          : (draft?.selectedCategories?.length
                            ? draft.selectedCategories
                            : (res.user?.categories?.length ? res.user.categories : ['Photography & Cinema']));

                        const bank = (res.googleProfile as any).bankDetails || res.user?.bankDetails || {};
                        const holderVal = bank.accountHolder || draft?.accountHolder || nameVal;
                        const accNumVal = bank.accountNumber || draft?.accountNumber || '';
                        const confAccVal = bank.accountNumber || draft?.confirmAccountNumber || draft?.accountNumber || '';
                        const ifscVal = bank.ifscCode || draft?.ifscCode || '';
                        const upiVal = bank.upiId || draft?.upiId || '';

                        const kyc = (res.googleProfile as any).kycDocuments || res.user?.kycDocuments || {};
                        const aadhaarVal = kyc.aadhaarNumber || draft?.aadhaarNumber || '';
                        const panVal = kyc.panNumber || draft?.panNumber || '';
                        const addrVal = kyc.businessAddress || draft?.businessAddress || '';
                        const gstVal = kyc.gstNumber || draft?.gstNumber || '';
                        const aadhaarFrontVal = kyc.aadhaarFront || draft?.aadhaarFront || '';
                        const aadhaarBackVal = kyc.aadhaarBack || draft?.aadhaarBack || '';
                        const panCardVal = kyc.panCard || draft?.panCard || '';
                        const gstDocVal = kyc.gstDoc || draft?.gstDoc || '';

                        setName(nameVal);
                        setEmail(emailVal);
                        setGoogleId(googleIdVal);
                        setPhone(phoneVal);
                        setBusinessName(businessNameVal);
                        setServiceArea(serviceAreaVal);
                        setSelectedCategories(categoriesVal);

                        setAccountHolder(holderVal);
                        setAccountNumber(accNumVal);
                        setConfirmAccountNumber(confAccVal);
                        setIfscCode(ifscVal);
                        setUpiId(upiVal);

                        setAadhaarNumber(aadhaarVal);
                        setPanNumber(panVal);
                        setBusinessAddress(addrVal);
                        setGstNumber(gstVal);
                        setAadhaarFront(aadhaarFrontVal);
                        setAadhaarBack(aadhaarBackVal);
                        setPanCard(panCardVal);
                        setGstDoc(gstDocVal);

                        const step1Done = Boolean(
                          nameVal.trim() &&
                          businessNameVal.trim() &&
                          phoneVal.replace(/\D/g, '').length === 10 &&
                          categoriesVal.length > 0
                        );
                        const step2Done = Boolean(
                          (accNumVal.trim() && ifscVal.trim().length === 11) ||
                          upiVal.trim()
                        );

                        // Resume exactly from where the user left off
                        let targetStep: 1 | 2 | 3 = 1;
                        if (draft?.regStep && (draft.regStep === 3 ? (step1Done && step2Done) : (draft.regStep === 2 ? step1Done : true))) {
                          targetStep = draft.regStep;
                        } else if (step1Done && step2Done) {
                          targetStep = 3;
                        } else if (step1Done) {
                          targetStep = 2;
                        } else {
                          targetStep = 1;
                        }

                        setMode('register');
                        setRegStep(targetStep);

                        saveDraft({
                          mode: 'register',
                          regStep: targetStep,
                          name: nameVal,
                          email: emailVal,
                          googleId: googleIdVal,
                          phone: phoneVal,
                          businessName: businessNameVal,
                          serviceArea: serviceAreaVal,
                          selectedCategories: categoriesVal,
                          accountHolder: holderVal,
                          accountNumber: accNumVal,
                          confirmAccountNumber: confAccVal,
                          ifscCode: ifscVal,
                          upiId: upiVal,
                          aadhaarNumber: aadhaarVal,
                          panNumber: panVal,
                          businessAddress: addrVal,
                          gstNumber: gstVal,
                          aadhaarFront: aadhaarFrontVal,
                          aadhaarBack: aadhaarBackVal,
                          panCard: panCardVal,
                          gstDoc: gstDocVal,
                        });
                      }
                    } catch (err: any) {
                      setError(err.message || 'Failed to authenticate with Google.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                  onError={(msg) => setError(msg)}
                  disabled={busy}
                  text="continue_with"
                />

                {error && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </div>
                )}

                {busy && (
                  <p className="text-center text-xs sm:text-sm text-[#f95724] animate-pulse font-semibold">
                    Connecting to Google secure session, please wait...
                  </p>
                )}
              </div>

              {/* Divider with 'or' */}
              <div className="relative my-7 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/80" />
                </div>
                <div className="relative bg-white px-3 text-xs text-slate-400 font-medium">
                  or
                </div>
              </div>

              {/* 3 Quick Benefit Micro-Chips */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* 1-Click */}
                <div className="flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl bg-[#fffcf9] border border-[#ffedd5]/80 shadow-2xs">
                  <div className="w-10 h-10 rounded-full bg-[#ffedd5]/60 flex items-center justify-center text-[#f95724] mb-2.5">
                    <Zap className="w-5 h-5 fill-orange-500 text-orange-500" />
                  </div>
                  <div className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">1-Click</div>
                  <div className="text-xs text-slate-500 mt-1 font-normal">Sign-in</div>
                </div>

                {/* 100% Escrow Safe */}
                <div className="flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl bg-[#fffcf9] border border-[#ffedd5]/80 shadow-2xs">
                  <div className="w-10 h-10 rounded-full bg-[#ffedd5]/60 flex items-center justify-center text-[#f95724] mb-2.5">
                    <ShieldCheck className="w-5 h-5 text-orange-500 stroke-[2.2]" />
                  </div>
                  <div className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">100%</div>
                  <div className="text-xs text-slate-500 mt-1 font-normal">Escrow Safe</div>
                </div>

                {/* Min. 15% Savings */}
                <div className="flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl bg-[#fffcf9] border border-[#ffedd5]/80 shadow-2xs">
                  <div className="w-10 h-10 rounded-full bg-[#ffedd5]/60 flex items-center justify-center text-[#f95724] mb-2.5">
                    <TrendingUp className="w-5 h-5 text-orange-500 stroke-[2.2]" />
                  </div>
                  <div className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">Min. 15%</div>
                  <div className="text-xs text-slate-500 mt-1 font-normal">Savings</div>
                </div>
              </div>

              {/* Security Guarantee Pill */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs sm:text-[13px] text-slate-500 font-normal">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.2]" />
                <span>Official Google Auth · 256-bit SSL encrypted</span>
              </div>
            </div>
          ) : (
            /* Mode === 'register': Stepper & KYC Registration Form for new vendors */
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-lg shadow-slate-200/40 p-6 sm:p-9 relative">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Complete Vendor Profile
                </h1>
                <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-[#f95724] border border-orange-200 rounded-full">
                  Step {regStep} of 3
                </span>
              </div>

              <p className="text-sm text-slate-600 mt-1.5">
                {regStep === 1
                  ? 'Tell us about your event business to get started.'
                  : regStep === 2
                  ? 'Add your bank account to receive automated event payouts.'
                  : 'Submit your business KYC for fast account verification.'}
              </p>

              {/* Stepper bar */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setRegStep(1);
                    saveDraft({ regStep: 1 });
                  }}
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
                    setError('');
                    if (validateStep1()) {
                      setRegStep(2);
                      saveDraft({ regStep: 2 });
                    }
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
                    setError('');
                    if (validateStep1() && validateStep2()) {
                      setRegStep(3);
                      saveDraft({ regStep: 3 });
                    }
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

              {/* Form Steps */}
              <form onSubmit={regStep < 3 ? handleNextStep : handleSubmit} className="mt-5 space-y-4">
                {regStep === 1 && (
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
                        <span className="text-sm font-medium text-slate-700">Contact mobile number *</span>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          inputMode="tel"
                          placeholder="10-digit number for booking alerts"
                          className={fieldClass}
                        />
                      </label>
                    </div>

                    <div className="pt-1">
                      <span className="text-sm font-medium text-slate-700 block mb-2">
                        Event Services You Provide * <span className="text-xs text-slate-400 font-normal">(Select all that apply)</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {SERVICE_CATEGORIES.map((cat) => {
                          const isSelected = selectedCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setSelectedCategories((prev) =>
                                  isSelected
                                    ? prev.length > 1
                                      ? prev.filter((c) => c !== cat)
                                      : prev
                                    : [...prev, cat]
                                );
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#f95724] text-white border-[#f95724] shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Email address</span>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="business@example.com"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                )}

                {regStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="rounded-xl bg-orange-50/70 border border-orange-100 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                      <CreditCard className="w-4 h-4 text-[#f95724] shrink-0 mt-0.5" />
                      <span>Direct automated event payouts will be wired to this bank account upon host milestone releases.</span>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Bank Account Holder Name *</span>
                      <input
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        required
                        placeholder="As shown in your bank passbook"
                        className={fieldClass}
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Bank Account Number *</span>
                        <input
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          required
                          type="password"
                          placeholder="Enter account number"
                          className={fieldClass}
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Confirm Account Number *</span>
                        <input
                          value={confirmAccountNumber}
                          onChange={(e) => setConfirmAccountNumber(e.target.value)}
                          required
                          placeholder="Re-enter account number"
                          className={fieldClass}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">IFSC Code *</span>
                        <input
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          required
                          maxLength={11}
                          placeholder="e.g. HDFC0001234"
                          className={`${fieldClass} uppercase font-mono`}
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">UPI ID (Optional)</span>
                        <input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okaxis"
                          className={fieldClass}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {regStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="rounded-xl bg-orange-50/70 border border-orange-100 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                      <FileBadge className="w-4 h-4 text-[#f95724] shrink-0 mt-0.5" />
                      <span>KYC verified vendors receive a verified badge on all bids, boosting host acceptance rate by 3x.</span>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Business / Studio Address *</span>
                      <textarea
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        required
                        rows={2}
                        placeholder="Complete shop/studio address where you operate"
                        className="mt-1.5 w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#f95724] focus:ring-2 focus:ring-[#f95724]/15 transition resize-none"
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Aadhaar Card Number *</span>
                        <input
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                          required
                          maxLength={12}
                          placeholder="12-digit Aadhaar number"
                          className={fieldClass}
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">PAN Card Number *</span>
                        <input
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          required
                          maxLength={10}
                          placeholder="10-digit PAN (e.g. ABCDE1234F)"
                          className={`${fieldClass} uppercase font-mono`}
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">GSTIN Number (Optional)</span>
                      <input
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        maxLength={15}
                        placeholder="15-digit GSTIN (Optional)"
                        className={`${fieldClass} uppercase font-mono`}
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                        <span className="text-xs font-semibold text-slate-700">Aadhaar Front Copy</span>
                        {aadhaarFront ? (
                          <div className="mt-2 flex items-center gap-2.5">
                            <div className="w-12 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 relative flex items-center justify-center">
                              <img
                                src={getDocPreviewUrl(aadhaarFront)}
                                alt="Aadhaar Front"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fb = e.currentTarget.parentElement?.querySelector('.fb-af');
                                  if (fb) fb.classList.remove('hidden');
                                }}
                              />
                              <div className="fb-af hidden">
                                <FileText className="w-5 h-5 text-orange-500" />
                              </div>
                              {isPdfDocument(aadhaarFront) && (
                                <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded-tl text-[8px] font-bold bg-rose-600 text-white">
                                  PDF
                                </span>
                              )}
                            </div>
                            <div className="flex-1 flex items-center justify-between text-xs text-emerald-700 font-medium">
                              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Uploaded</span>
                              <button
                                type="button"
                                onClick={() => triggerUpload('aadhaarFront')}
                                className="text-[#f95724] hover:underline cursor-pointer"
                              >
                                Replace
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={uploadingDoc === 'aadhaarFront'}
                            onClick={() => triggerUpload('aadhaarFront')}
                            className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-[#f95724] transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="w-3 h-3" />
                            {uploadingDoc === 'aadhaarFront' ? 'Uploading...' : 'Upload front'}
                          </button>
                        )}
                      </div>

                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                        <span className="text-xs font-semibold text-slate-700">PAN Card Copy</span>
                        {panCard ? (
                          <div className="mt-2 flex items-center gap-2.5">
                            <div className="w-12 h-10 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 relative flex items-center justify-center">
                              <img
                                src={getDocPreviewUrl(panCard)}
                                alt="PAN Card"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fb = e.currentTarget.parentElement?.querySelector('.fb-pan');
                                  if (fb) fb.classList.remove('hidden');
                                }}
                              />
                              <div className="fb-pan hidden">
                                <FileText className="w-5 h-5 text-orange-500" />
                              </div>
                              {isPdfDocument(panCard) && (
                                <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded-tl text-[8px] font-bold bg-rose-600 text-white">
                                  PDF
                                </span>
                              )}
                            </div>
                            <div className="flex-1 flex items-center justify-between text-xs text-emerald-700 font-medium">
                              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Uploaded</span>
                              <button
                                type="button"
                                onClick={() => triggerUpload('panCard')}
                                className="text-[#f95724] hover:underline cursor-pointer"
                              >
                                Replace
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={uploadingDoc === 'panCard'}
                            onClick={() => triggerUpload('panCard')}
                            className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-[#f95724] transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="w-3 h-3" />
                            {uploadingDoc === 'panCard' ? 'Uploading...' : 'Upload PAN'}
                          </button>
                        )}
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

                {/* Stepper Navigation buttons */}
                <div className="pt-2 flex items-center gap-3">
                  {regStep > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        const prev = (regStep === 3 ? 2 : 1) as 1 | 2 | 3;
                        setRegStep(prev);
                        saveDraft({ regStep: prev });
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
                          <span>Complete Registration & Submit KYC</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-[#f95724] transition cursor-pointer"
                  >
                    Cancel and return to Google login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bottom Switcher Link */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Booking an event as a host?{' '}
              <a
                href={getUserPortalUrl()}
                className="text-[#f95724] font-semibold hover:underline inline-flex items-center gap-1 ml-0.5 cursor-pointer"
              >
                Go to Host App <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
