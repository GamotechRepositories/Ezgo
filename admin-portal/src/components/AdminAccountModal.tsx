import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  LogOut,
  Save,
  Loader2,
  Camera,
  Lock,
} from 'lucide-react';
import type { User } from '../types';
import { api } from '../services/api';
import { getUserPortalUrl, getVendorPortalUrl } from '../utils/portalUrls';

interface AdminAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: User;
  onUpdateAdmin: (updated: User) => void;
  onLogout: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

type TabType = 'profile' | 'security' | 'portals';

export const AdminAccountModal: React.FC<AdminAccountModalProps> = ({
  isOpen,
  onClose,
  admin,
  onUpdateAdmin,
  onLogout,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const [name, setName] = useState(admin.name || '');
  const [email, setEmail] = useState(admin.email || '');
  const [phone, setPhone] = useState(admin.phone || '');
  const [avatar, setAvatar] = useState(admin.avatar || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setName(admin.name || '');
    setEmail(admin.email || '');
    setPhone(admin.phone || '');
    setAvatar(admin.avatar || '');
  }, [admin, isOpen]);

  if (!isOpen) return null;

  const initials = (admin.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('error', 'File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await api.uploadImage(file, 'ezzygo/admin-avatars');
      setAvatar(url);
      const updated = await api.updateProfile({
        userId: admin._id,
        avatar: url,
      });
      onUpdateAdmin({ ...admin, ...updated, avatar: url });
      onShowToast('success', 'Profile Photo Updated', 'Your administrator display picture has been changed.');
    } catch (err: any) {
      onShowToast('error', 'Upload Failed', err.message || 'Could not upload image.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('error', 'Name Required', 'Please enter your administrator name.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        userId: admin._id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar,
      });

      onUpdateAdmin({
        ...admin,
        ...updated,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      onShowToast('success', 'Profile Saved', 'Administrator profile details updated successfully.');
    } catch (err: any) {
      onShowToast('error', 'Update Failed', err.message || 'Could not update admin profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
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
                  <img src={avatar} alt={admin.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider">
                    {initials}
                  </span>
                )}
              </div>
              <label
                htmlFor="admin-avatar-upload"
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white text-slate-800 shadow-md hover:bg-slate-100 cursor-pointer transition transform active:scale-95 border border-slate-200"
                title="Change display photo"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <input
                  id="admin-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            {/* Admin Info Header */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                  {admin.name || 'Platform Administrator'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-500/15 text-orange-300 text-[11px] font-bold backdrop-blur-xs flex items-center gap-1 border border-orange-500/30">
                  <ShieldCheck className="w-3 h-3 text-[#17233d]" />
                  Super Admin
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 mt-2">
                {admin.email && (
                  <span className="flex items-center gap-1 truncate max-w-[220px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {admin.email}
                  </span>
                )}
                {admin.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +91 {admin.phone}
                  </span>
                )}
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
            <UserIcon className="w-4 h-4" />
            <span>Admin Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3.5 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-[#17233d] text-[#17233d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Access</span>
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
            <span>Switch Consoles</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: Admin Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrator Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Roshan Chaudhari"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ezzygo.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  6-digit verification OTP codes for logging into this panel are sent to this email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Emergency Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10 transition"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#f07d4a] hover:bg-[#de6a3a] active:scale-95 text-white font-bold text-sm shadow-md shadow-slate-900/12 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Administrator Details</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Privileges */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#17233d] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Role: Platform Super-Administrator</div>
                    <div className="text-xs text-slate-500">Unrestricted governance over users, escrows, and platform settings</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs text-slate-700">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-0.5">Authentication</span>
                    <span>6-Digit Cryptographic Email OTP</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-0.5">Universal Cross-Login</span>
                    <span className="text-emerald-700 font-semibold">Enabled (Host, Vendor, Admin)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-0.5">Escrow & Disputes</span>
                    <span>Manual Override & Direct Payouts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-0.5">Audit Logging</span>
                    <span>Immutable System Event Ledger</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Switch Consoles */}
          {activeTab === 'portals' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Universal Cross-Login Consoles
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
                        <div className="text-xs text-slate-500">Post event requirements & book vendors</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#17233d]" />
                  </a>

                  <a
                    href={getVendorPortalUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#17233d] hover:shadow-sm transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        V
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          Vendor / Service Provider Desk
                        </div>
                        <div className="text-xs text-slate-500">Live auction bidding desk & escrow earnings</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-rose-950">Sign Out of Admin Control Panel</div>
                  <div className="text-xs text-rose-700">Terminates administrative JWT credentials</div>
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
