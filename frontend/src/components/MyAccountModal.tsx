import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Camera,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Loader2,
  Save,
  Check,
} from 'lucide-react';
import type { User } from '../types';
import { api } from '../services/api';
import { getVendorPortalUrl } from '../utils/portalUrls';

interface MyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onOpenBookings?: () => void;
  onOpenMyEvents?: () => void;
  onOpenExplainer?: () => void;
  onOpenPostModal?: () => void;
  requirementsCount?: number;
  activeBookingsCount?: number;
  completedBookingsCount?: number;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

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

type TabType = 'profile' | 'activity' | 'safety' | 'support';

export const MyAccountModal: React.FC<MyAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenBookings,
  onOpenMyEvents,
  onOpenExplainer,
  onOpenPostModal,
  requirementsCount = 0,
  activeBookingsCount = 0,
  completedBookingsCount = 0,
  selectedCity = 'Pune, MH',
  onSelectCity,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [city, setCity] = useState(selectedCity);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setAvatar(currentUser.avatar || '');
    setCity(selectedCity);
  }, [currentUser, selectedCity, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('error', 'Name Required', 'Please enter your name.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        userId: currentUser._id,
        name: name.trim(),
        email: email.trim(),
        avatar,
        serviceArea: city,
      });

      if (onSelectCity && city !== selectedCity) {
        onSelectCity(city);
      }

      onUpdateUser({
        ...currentUser,
        ...updated,
        name: name.trim(),
        email: email.trim(),
        avatar,
      });

      onShowToast('success', 'Profile Updated', 'Your profile details have been saved.');
    } catch (err: any) {
      onShowToast('error', 'Update Failed', err.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
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
      
      // Auto-save avatar to user profile
      const updated = await api.updateProfile({
        userId: currentUser._id,
        avatar: url,
      });
      onUpdateUser({ ...currentUser, ...updated, avatar: url });
      onShowToast('success', 'Photo Updated', 'Your profile photo has been updated.');
    } catch (err: any) {
      onShowToast('error', 'Upload Failed', err.message || 'Could not upload photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const initials = (name || currentUser.name || 'C')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header with Slate Palette */}
        <div className="relative bg-slate-900 p-5 sm:p-6 text-white border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close Account Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar with Upload Badge */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider">
                    {initials}
                  </span>
                )}
              </div>
              <label
                htmlFor="account-avatar-upload"
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white text-slate-800 shadow-md hover:bg-slate-100 cursor-pointer transition transform active:scale-95 border border-slate-200"
                title="Change profile picture"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <input
                  id="account-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            {/* User Info Header */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                  {currentUser.name || 'Event Host'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold backdrop-blur-xs flex items-center gap-1 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Host
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                {currentUser.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +91 {currentUser.phone}
                  </span>
                )}
                {currentUser.email && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedCity.split(',')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner inside header */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl py-1.5 px-2">
              <div className="text-lg font-black text-white">{requirementsCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">Events Posted</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl py-1.5 px-2">
              <div className="text-lg font-black text-emerald-400">{activeBookingsCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">Active Bookings</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl py-1.5 px-2">
              <div className="text-lg font-black text-white">{completedBookingsCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">Completed</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 px-4 sm:px-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Events & Bookings</span>
            {activeBookingsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'safety'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Escrow & Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'support'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Help & Support</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/20 focus:border-[#FF5722] transition font-medium"
                  />
                  <UserIcon className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/20 focus:border-[#FF5722] transition font-medium"
                  />
                  <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Used for invoices and event confirmations.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (Registered)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-mono">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+91 {currentUser.phone || 'Not provided'}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Login is verified using this mobile number.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Default Event City
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/20 focus:border-[#FF5722] transition font-medium bg-white"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account Security Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Lock className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-800">
                  <div className="font-bold">Account Protection & Privacy</div>
                  <div className="text-slate-600 mt-0.5">
                    Your personal contact details remain private. Vendors only communicate through bids and cannot access your phone number without your approved booking.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-md shadow-slate-900/15 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: EVENTS & BOOKINGS ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bookings shortcut */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    {activeBookingsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[11px]">
                        {activeBookingsCount} Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition">
                    My Bookings & Invoices
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Track confirmed event vendors, complete payments via Razorpay, release escrow funds, and download receipts.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenBookings) onOpenBookings();
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Open My Bookings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Posted Requirements shortcut */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/50 transition group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
                      {requirementsCount} Total
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-800 transition">
                    Posted Events & Live Auctions
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    View real-time bids from DJs, Caterers, Decorators, and Photographers. Compare offers and accept the best rate.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenMyEvents) onOpenMyEvents();
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>View My Live Events</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Post New CTA Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-slate-700" />
                    Planning another event?
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Post your requirement in under 60 seconds and receive instant vendor price quotes.
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenPostModal) onOpenPostModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  + Post New Need
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ESCROW & SAFETY */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  100% Escrow Protection Policy
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  When you accept a vendor's bid, your payment is held securely in the EzzyGo Escrow vault. The vendor only receives payment after the event is successfully completed and you confirm satisfaction.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Platform Guarantees for Hosts
                </h4>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Zero Price Hikes:</span> Once you accept a bid, the agreed price is locked. Vendors cannot charge additional hidden fees.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Verified Vendors:</span> Vendors on EzzyGo are background checked with Aadhaar, PAN, and business verification.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Dedicated Dispute Support:</span> If a vendor fails to show up or delivers poor service, you can raise a dispute directly from your bookings screen for a prompt refund review.
                  </div>
                </div>
              </div>

              {onOpenExplainer && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenExplainer();
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Learn How Reverse Bidding Works</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 4: HELP & SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div className="font-bold text-sm text-amber-900 mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-amber-600" />
                  Need assistance with your event?
                </div>
                <p className="text-xs text-amber-800">
                  Our customer care team is available from 9:00 AM to 9:00 PM (Monday to Sunday) to help you find the right vendors or resolve booking queries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Support */}
                <a
                  href="https://wa.me/919322054199?text=Hello%20EzzyGo%20Team%2C%20I%20need%20help%20with%20my%20event%20booking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900 transition flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs">Chat on WhatsApp</div>
                    <div className="text-[11px] text-emerald-700 truncate">+91 93220 54199</div>
                  </div>
                </a>

                {/* Call Support */}
                <a
                  href="tel:+919322054199"
                  className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-blue-900 transition flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs">Call Support</div>
                    <div className="text-[11px] text-blue-700 truncate">+91 93220 54199</div>
                  </div>
                </a>

                {/* Email Support */}
                <a
                  href="mailto:support@ezzygo.in"
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800 transition flex items-center gap-3 cursor-pointer sm:col-span-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs">Email Desk</div>
                    <div className="text-[11px] text-slate-500">support@ezzygo.in (Response within 2 hours)</div>
                  </div>
                </a>
              </div>

              {/* Portal Links */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Are you an event vendor?</span>
                <a
                  href={getVendorPortalUrl()}
                  className="font-bold text-[#FF5722] hover:underline flex items-center gap-1"
                >
                  <span>Go to Vendor Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer with Logout & Switch Account */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>EzzyGo Host v1.0</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
