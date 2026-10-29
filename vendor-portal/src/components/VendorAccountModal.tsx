import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
  Wallet,
  FileText,
  Camera,
  ExternalLink,
  LogOut,
  Save,
  Loader2,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { User } from '../types';
import { api } from '../services/api';
import { getUserPortalUrl, getAdminPortalUrl } from '../utils/portalUrls';

interface VendorAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: User;
  onUpdateVendor: (updated: User) => void;
  onLogout: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  onOpenVerificationModal?: () => void;
}

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

const CITIES = [
  'Pune, MH',
  'Mumbai, MH',
  'Delhi NCR',
  'Bangalore, KA',
  'Hyderabad, TS',
  'Nagpur, MH',
  'Nashik, MH',
  'Ahmedabad, GJ',
  'Jaipur, RJ',
  'Goa',
  'Kolkata, WB',
  'Chennai, TN',
  'Surat, GJ',
  'Lucknow, UP',
  'Chandigarh',
  'Indore, MP',
  'Kolhapur, MH',
];

type TabType = 'profile' | 'bank' | 'kyc' | 'portals';

export const VendorAccountModal: React.FC<VendorAccountModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onUpdateVendor,
  onLogout,
  onShowToast,
  onOpenVerificationModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Step 1: Business Profile State
  const [name, setName] = useState(vendor.name || '');
  const [businessName, setBusinessName] = useState(vendor.businessName || '');
  const [email, setEmail] = useState(vendor.email || '');
  const [phone, setPhone] = useState(vendor.phone || '');
  const [serviceArea, setServiceArea] = useState(vendor.serviceArea || 'Pune, MH');
  const [categories, setCategories] = useState<string[]>(vendor.categories || []);
  const [avatar, setAvatar] = useState(vendor.avatar || '');

  // Step 2: Bank State
  const [accountHolder, setAccountHolder] = useState(vendor.bankDetails?.accountHolder || vendor.name || '');
  const [accountNumber, setAccountNumber] = useState(vendor.bankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(vendor.bankDetails?.ifscCode || '');
  const [upiId, setUpiId] = useState(vendor.bankDetails?.upiId || '');

  // Step 3: KYC State
  const [aadhaarNumber, setAadhaarNumber] = useState(vendor.kycDocuments?.aadhaarNumber || '');
  const [panNumber, setPanNumber] = useState(vendor.kycDocuments?.panNumber || '');
  const [businessAddress, setBusinessAddress] = useState(vendor.kycDocuments?.businessAddress || '');
  const [gstNumber, setGstNumber] = useState(vendor.kycDocuments?.gstNumber || '');

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setName(vendor.name || '');
    setBusinessName(vendor.businessName || '');
    setEmail(vendor.email || '');
    setPhone(vendor.phone || '');
    setServiceArea(vendor.serviceArea || 'Pune, MH');
    setCategories(vendor.categories || []);
    setAvatar(vendor.avatar || '');

    setAccountHolder(vendor.bankDetails?.accountHolder || vendor.name || '');
    setAccountNumber(vendor.bankDetails?.accountNumber || '');
    setIfscCode(vendor.bankDetails?.ifscCode || '');
    setUpiId(vendor.bankDetails?.upiId || '');

    setAadhaarNumber(vendor.kycDocuments?.aadhaarNumber || '');
    setPanNumber(vendor.kycDocuments?.panNumber || '');
    setBusinessAddress(vendor.kycDocuments?.businessAddress || '');
    setGstNumber(vendor.kycDocuments?.gstNumber || '');
  }, [vendor, isOpen]);

  if (!isOpen) return null;

  const initials = (vendor.businessName || vendor.name || 'V')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('error', 'File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await api.uploadImage(file, 'ezzygo/avatars');
      setAvatar(url);
      const updated = await api.updateProfile({
        userId: vendor._id,
        avatar: url,
      });
      onUpdateVendor({ ...vendor, ...updated, avatar: url });
      onShowToast('success', 'Profile Photo Updated', 'Your display picture has been changed.');
    } catch (err: any) {
      onShowToast('error', 'Upload Failed', err.message || 'Could not upload image.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('error', 'Name Required', 'Please enter your full name.');
      return;
    }
    if (!businessName.trim()) {
      onShowToast('error', 'Business Name Required', 'Please enter your business or agency name.');
      return;
    }
    if (categories.length === 0) {
      onShowToast('error', 'Services Required', 'Please select at least one service category.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        userId: vendor._id,
        name: name.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        serviceArea,
        categories,
        avatar,
      });

      onUpdateVendor({
        ...vendor,
        ...updated,
        name: name.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        serviceArea,
        categories,
      });
      onShowToast('success', 'Business Profile Saved', 'Your provider details have been updated.');
    } catch (err: any) {
      onShowToast('error', 'Update Failed', err.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() && !upiId.trim()) {
      onShowToast('error', 'Payout Details Required', 'Please provide either a Bank Account Number or UPI ID.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        userId: vendor._id,
        bankDetails: {
          accountHolder: accountHolder.trim() || name.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          upiId: upiId.trim(),
        },
      });

      onUpdateVendor({
        ...vendor,
        ...updated,
        bankDetails: {
          accountHolder: accountHolder.trim() || name.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          upiId: upiId.trim(),
          isKycCompleted: vendor.bankDetails?.isKycCompleted ?? false,
        },
      });
      onShowToast('success', 'Bank Info Saved', 'Your payout method has been saved.');
    } catch (err: any) {
      onShowToast('error', 'Update Failed', err.message || 'Could not update bank details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarNumber.trim() || aadhaarNumber.replace(/\D/g, '').length !== 12) {
      onShowToast('error', 'Invalid Aadhaar', 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!panNumber.trim() || panNumber.trim().length !== 10) {
      onShowToast('error', 'Invalid PAN', 'Please enter a valid 10-character PAN number.');
      return;
    }
    if (!businessAddress.trim()) {
      onShowToast('error', 'Address Required', 'Please enter your registered business address.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await api.submitKyc({
        aadhaarNumber: aadhaarNumber.replace(/\D/g, ''),
        panNumber: panNumber.trim().toUpperCase(),
        businessAddress: businessAddress.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
      });

      onUpdateVendor({
        ...vendor,
        ...updated,
        kycDocuments: {
          ...vendor.kycDocuments,
          aadhaarNumber: aadhaarNumber.replace(/\D/g, ''),
          panNumber: panNumber.trim().toUpperCase(),
          businessAddress: businessAddress.trim(),
          gstNumber: gstNumber.trim().toUpperCase(),
        },
      });
      onShowToast('success', 'KYC Submitted', 'Verification details submitted for EzzyGo Admin review.');
    } catch (err: any) {
      onShowToast('error', 'KYC Submission Failed', err.message || 'Could not submit KYC details.');
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = vendor.role === 'admin' || vendor.roles?.includes('admin');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark Modern Header */}
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-5 sm:p-6 shrink-0 border-b border-slate-800">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={vendor.businessName || vendor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider">
                    {initials}
                  </span>
                )}
              </div>
              <label
                htmlFor="vendor-avatar-upload"
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white text-slate-800 shadow-md hover:bg-slate-100 cursor-pointer transition transform active:scale-95 border border-slate-200"
                title="Change display photo"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <input
                  id="vendor-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            {/* Vendor Info Header */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                  {vendor.businessName || vendor.name || 'Service Provider'}
                </h2>
                {vendor.isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold backdrop-blur-xs flex items-center gap-1 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified Provider
                  </span>
                ) : vendor.kycDocuments?.rejectionReason ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenVerificationModal) {
                        onClose();
                        onOpenVerificationModal();
                      }
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-bold backdrop-blur-xs flex items-center gap-1 border border-rose-500/40 animate-pulse transition cursor-pointer"
                    title="Click to view rejection reason and re-apply"
                  >
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    Action Required (Rejected)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenVerificationModal) {
                        onClose();
                        onOpenVerificationModal();
                      }
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 text-[11px] font-bold backdrop-blur-xs flex items-center gap-1 border border-amber-500/30 transition cursor-pointer"
                    title="Click to view verification status"
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    Verification Pending
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-300 font-medium mb-2 truncate">
                Proprietor: <span className="text-white font-semibold">{vendor.name || 'Vendor Partner'}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                {vendor.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +91 {vendor.phone}
                  </span>
                )}
                {vendor.email && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {vendor.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {vendor.serviceArea || 'Maharashtra'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 sm:px-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-[#17233d] text-[#17233d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Business Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bank'
                ? 'border-[#17233d] text-[#17233d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Bank & Payouts</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kyc'
                ? 'border-[#17233d] text-[#17233d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>KYC & Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('portals')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'portals'
                ? 'border-[#17233d] text-[#17233d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Switch Portals</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: Business Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Person Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Business / Studio Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Royal Photography & Films"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="business@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Service Area / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Event Services Offered (Select All Applicable)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const isSelected = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-slate-50 border-[#17233d] text-[#17233d] shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#17233d] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#ff5c28] hover:bg-[#e64814] active:scale-95 text-white font-bold text-sm shadow-md shadow-slate-900/12 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Business Details</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Bank & Payouts */}
          {activeTab === 'bank' && (
            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold">Automated Escrow Direct Payouts</p>
                  <p className="text-emerald-700 mt-0.5">
                    When the host completes an event, EzzyGo releases 100% of your earnings to this account within 24 hours.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Name as per bank passbook"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                    placeholder="e.g. 10293847561"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    UPI ID (GPay / PhonePe / Paytm)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.trim().toLowerCase())}
                    placeholder="e.g. username@okhdfcbank"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#ff5c28] hover:bg-[#e64814] active:scale-95 text-white font-bold text-sm shadow-md shadow-slate-900/12 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Bank Details</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: KYC & Verification */}
          {activeTab === 'kyc' && (
            <form onSubmit={handleSaveKyc} className="space-y-4">
              {vendor.kycDocuments?.rejectionReason && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Verification Rejected / Changes Required</span>
                    </div>
                    {onOpenVerificationModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenVerificationModal();
                        }}
                        className="text-xs font-bold text-[#17233d] hover:underline cursor-pointer"
                      >
                        Open Full Desk &rarr;
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-rose-800 bg-white/90 p-3 rounded-xl border border-rose-200">
                    <p className="font-semibold text-rose-950 mb-0.5">Admin Feedback / Rejection Reason:</p>
                    <p className="italic">{vendor.kycDocuments.rejectionReason}</p>
                  </div>
                  <p className="text-[11px] text-rose-600">
                    Update your details below, or open the Verification Desk to upload corrected document copies.
                  </p>
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                  vendor.isVerified
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
                    : vendor.kycDocuments?.rejectionReason
                    ? 'bg-rose-50/50 border-rose-100 text-rose-900'
                    : 'bg-amber-50 border-amber-100 text-amber-900'
                }`}
              >
                {vendor.isVerified ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : vendor.kycDocuments?.rejectionReason ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed">
                  <p className="font-bold">
                    {vendor.isVerified
                      ? 'KYC Documents Verified'
                      : vendor.kycDocuments?.rejectionReason
                      ? 'Action Required on KYC Documents'
                      : 'KYC Review in Progress'}
                  </p>
                  <p className="mt-0.5 opacity-90">
                    {vendor.isVerified
                      ? 'Your business profile is fully verified. Hosts see your Verified Badge on all bids.'
                      : vendor.kycDocuments?.rejectionReason
                      ? 'Admin requested corrections. Once updated, your verification review will be re-evaluated promptly.'
                      : 'EzzyGo compliance team reviews documents to ensure safe reverse auctions and customer trust.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    12-Digit Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={12}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    10-Character PAN Number
                  </label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Address
                </label>
                <textarea
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Studio / Office / Registered Work Address"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  maxLength={15}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition font-mono uppercase"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#ff5c28] hover:bg-[#e64814] active:scale-95 text-white font-bold text-sm shadow-md shadow-slate-900/12 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Update KYC Information</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Switch Portals & Security */}
          {activeTab === 'portals' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Access Other EzzyGo Consoles
                </h3>

                <div className="space-y-2">
                  <a
                    href={getUserPortalUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#17233d] hover:shadow-sm transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 text-[#17233d] flex items-center justify-center font-bold">
                        H
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-[#17233d] transition">
                          Host / Customer Portal
                        </div>
                        <div className="text-xs text-slate-500">Post event needs, view incoming bids & book vendors</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#17233d]" />
                  </a>

                  {isAdmin && (
                    <a
                      href={getAdminPortalUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-900 hover:shadow-sm transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                          A
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">Admin Control Panel</div>
                          <div className="text-xs text-slate-500">Platform overview, escrow ledger & KYC approvals</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
                    </a>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-rose-950">Sign Out of Vendor Desk</div>
                  <div className="text-xs text-rose-700">Ends your active session on this device</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
