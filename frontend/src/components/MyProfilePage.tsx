import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Wallet,
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
  Loader2,
  Save,
  Check,
  ChevronRight,
} from 'lucide-react';
import type { User, Booking, Requirement } from '../types';
import { api } from '../services/api';
import { getVendorPortalUrl } from '../utils/portalUrls';

interface MyProfilePageProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onBack: () => void;
  onOpenBookings: () => void;
  onOpenMyEvents: () => void;
  onOpenExplainer: () => void;
  onOpenPostModal: () => void;
  requirements: Requirement[];
  bookings: Booking[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
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

type ProfileTab = 'personal' | 'activity' | 'security' | 'support';

export const MyProfilePage: React.FC<MyProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onBack,
  onOpenBookings,
  onOpenMyEvents,
  onOpenExplainer,
  onOpenPostModal,
  requirements,
  bookings,
  selectedCity,
  onSelectCity,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
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
  }, [currentUser, selectedCity]);

  // Derived metrics
  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'ACTIVE' || b.status === 'AWAITING_PAYMENT'
  ).length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalSpent = bookings
    .filter((b) => b.status === 'ACTIVE' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.totalPaid || b.bidAmount || 0), 0);

  const initials = (name || currentUser.name || 'C')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

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

      if (city !== selectedCity) {
        onSelectCity(city);
      }

      onUpdateUser({
        ...currentUser,
        ...updated,
        name: name.trim(),
        email: email.trim(),
        avatar,
      });

      onShowToast('success', 'Profile Saved', 'Your account details have been updated.');
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

      const updated = await api.updateProfile({
        userId: currentUser._id,
        avatar: url,
      });

      onUpdateUser({ ...currentUser, ...updated, avatar: url });
      onShowToast('success', 'Photo Updated', 'Your profile picture has been updated.');
    } catch (err: any) {
      onShowToast('error', 'Upload Failed', err.message || 'Could not upload photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 pt-4 lg:pt-20">
      {/* Top Header Navigation */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-2xs transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* User Hero Banner - Executive Dark Slate Palette */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-xl shadow-slate-900/10 p-6 sm:p-8 mb-8">
          {/* Subtle micro dot grid */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider">
                      {initials}
                    </span>
                  )}
                </div>

                <label
                  htmlFor="profile-hero-avatar-upload"
                  className="absolute -bottom-1 -right-1 p-2.5 rounded-full bg-white text-slate-800 shadow-md hover:bg-slate-100 cursor-pointer transition transform active:scale-95 border border-slate-200"
                  title="Change profile picture"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <input
                    id="profile-hero-avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{currentUser.name || 'Event Host'}</h1>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Host
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-xs text-slate-300">
                  {currentUser.phone && (
                    <span className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      +91 {currentUser.phone}
                    </span>
                  )}
                  {currentUser.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {currentUser.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedCity}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action in Banner */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onOpenPostModal}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                <span>+ Post New Event</span>
              </button>
            </div>
          </div>

          {/* Activity Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-white">{requirements.length}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Events Posted</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-emerald-400">{activeBookingsCount}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Active Bookings</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-white">{completedBookingsCount}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Completed Events</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-slate-200">
                ₹{totalSpent.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Escrow Protected</div>
            </div>
          </div>
        </div>

        {/* Main Content Layout with Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs space-y-1">
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  activeTab === 'personal'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4" />
                  <span>Personal Details</span>
                </div>
                <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'personal' ? 'opacity-100' : ''}`} />
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  activeTab === 'activity'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  <span>Events & Bookings</span>
                </div>
                {activeBookingsCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                    activeTab === 'activity' ? 'bg-white/20 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {activeBookingsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'security' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span>Escrow & Safety</span>
                </div>
                <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'security' ? 'opacity-100' : ''}`} />
              </button>

              <button
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                </div>
                <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'support' ? 'opacity-100' : ''}`} />
              </button>
            </div>

            {/* Vendor Switch Card - Neutral Slate */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs shadow-2xs">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                Are you an Event Vendor?
              </div>
              <p className="text-slate-500 mb-3 leading-relaxed">
                Offer sound, catering, decoration, or photo services on EzzyGo.
              </p>
              <a
                href={getVendorPortalUrl()}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Vendor Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Right Main Panel */}
          <div className="lg:col-span-3">
            {/* TAB 1: PERSONAL DETAILS */}
            {activeTab === 'personal' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your display name, contact email, and default city for event bookings.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition font-medium"
                        />
                        <UserIcon className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition font-medium"
                        />
                        <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Registered Mobile Number
                      </label>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-mono">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>+91 {currentUser.phone || 'Not provided'}</span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          OTP Verified
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Primary Event City
                      </label>
                      <div className="relative">
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition font-medium bg-white"
                        >
                          {CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Security Banner - Soft Neutral */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 mt-4">
                    <Lock className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-800">
                      <div className="font-bold">Contact Privacy Protected</div>
                      <div className="text-slate-600 mt-0.5">
                        Your direct mobile number is never shared publicly with bidding vendors. Contact details are only exchanged once you choose to accept a vendor's bid.
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-sm shadow-md shadow-slate-900/15 flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Save className="w-4 h-4 text-white" />
                      )}
                      <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: EVENTS & BOOKINGS ACTIVITY */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                  <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Events & Bookings Activity</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track your live requirements and completed contracts with verified vendors.
                      </p>
                    </div>

                    <button
                      onClick={onOpenPostModal}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                    >
                      + Post Need
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bookings Card */}
                    <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="w-6 h-6" />
                        </span>
                        {activeBookingsCount > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs">
                            {activeBookingsCount} Active
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition">
                        My Bookings & Invoices
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                        View all confirmed vendor bookings, pay escrow advances securely, complete events, release payments, and download bills.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={onOpenBookings}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Open My Bookings</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={onOpenBookings}
                          className="w-full py-2.5 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Payment history</span>
                        </button>
                      </div>
                    </div>

                    {/* Requirements Card */}
                    <div className="p-5 rounded-2xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/50 transition group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                          <Calendar className="w-6 h-6" />
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                          {requirements.length} Total
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-800 transition">
                        Posted Events & Live Auctions
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                        Review incoming bids from verified DJs, Caterers, Decorators, and Photographers. Compare quotes in real-time.
                      </p>
                      <button
                        onClick={onOpenMyEvents}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <span>View Live Bids & Auctions</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ESCROW & SAFETY */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Escrow Security & Platform Guarantees</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How EzzyGo guarantees your event success and protects your advance payments.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-base mb-1.5">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    100% Escrow Protection Vault
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    When you accept a vendor bid, your money is securely deposited in the EzzyGo Escrow Account. The vendor only receives payment after the event has taken place and you click "Mark Done" in your bookings panel.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Check className="w-5 h-5 text-emerald-600 mb-2" />
                    <h3 className="font-bold text-sm text-slate-900 mb-1">Zero Hidden Charges</h3>
                    <p className="text-xs text-slate-600">
                      Agreed bid price is completely locked. Vendors cannot demand extra tips or surprise fees on event day.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Check className="w-5 h-5 text-emerald-600 mb-2" />
                    <h3 className="font-bold text-sm text-slate-900 mb-1">KYC Verified Vendors</h3>
                    <p className="text-xs text-slate-600">
                      All service providers undergo Aadhaar, PAN, and business legitimacy checks before bidding.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Check className="w-5 h-5 text-emerald-600 mb-2" />
                    <h3 className="font-bold text-sm text-slate-900 mb-1">Dispute Assistance</h3>
                    <p className="text-xs text-slate-600">
                      If any vendor fails to deliver as promised, you can raise an instant dispute for an immediate refund review.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-start">
                  <button
                    onClick={onOpenExplainer}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Read Full Bidding & Escrow Rules</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: HELP & SUPPORT */}
            {activeTab === 'support' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Customer Support Desk</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect directly with our operations team in Pune & Mumbai.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp Support */}
                  <a
                    href="https://wa.me/919322054199?text=Hello%20EzzyGo%20Team%2C%20I%20need%20help%20with%20my%20event%20booking"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900 transition flex items-center gap-4 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm">Chat on WhatsApp</div>
                      <div className="text-xs text-emerald-700 mt-0.5">+91 93220 54199</div>
                      <div className="text-[11px] text-emerald-600/80 mt-0.5">Quick response in 5 mins</div>
                    </div>
                  </a>

                  {/* Call Support */}
                  <a
                    href="tel:+919322054199"
                    className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-blue-900 transition flex items-center gap-4 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm">Direct Phone Call</div>
                      <div className="text-xs text-blue-700 mt-0.5">+91 93220 54199</div>
                      <div className="text-[11px] text-blue-600/80 mt-0.5">Available 9:00 AM - 9:00 PM</div>
                    </div>
                  </a>

                  {/* Email Support */}
                  <a
                    href="mailto:support@ezzygo.in"
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800 transition flex items-center gap-4 cursor-pointer sm:col-span-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm">Email Help Desk</div>
                      <div className="text-xs text-slate-600 mt-0.5">support@ezzygo.in</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">For billing, disputes, and partnerships</div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
