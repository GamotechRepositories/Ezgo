import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  RefreshCw,
  User as UserIcon,
  ShieldCheck,
  ExternalLink,
  LogOut,
  ChevronDown,
  Zap,
} from 'lucide-react';
import type { User } from '../types';
import type { AdminTab } from './AdminSidebar';
import { getUserPortalUrl, getVendorPortalUrl } from '../utils/portalUrls';

interface AdminHeaderProps {
  admin: User;
  activeTab: AdminTab;
  onToggleSidebar: () => void;
  pendingKycCount: number;
  activeEscrowCount: number;
  reminderCount?: number;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  onOpenAccountModal: () => void;
}

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  metrics: { title: 'Overview', subtitle: 'Platform volume, fee earnings, and active escrows' },
  requirements: { title: 'Live Requests & Bidding', subtitle: 'Host event requests and vendor reverse quotes' },
  escrow: { title: 'Payments & Escrow', subtitle: 'Manage held funds, release payouts, or resolve disputes' },
  kyc: { title: 'Vendor Checks & KYC', subtitle: 'Verify business identity, Aadhaar/PAN, and bank details' },
  users: { title: 'User Management', subtitle: 'Full directory of hosts, vendors, and administrators' },
  categories: { title: 'Service Categories', subtitle: 'Service catalog shown in host & vendor portals' },
  occasions: { title: 'Event Occasions', subtitle: 'Event types shown in the host portal and mobile app' },
  banners: { title: 'Promotions & Ad Banners', subtitle: 'Manage advertisement banners, offers, and city targeting on the user portal' },
  logs: { title: 'Audit & Financial Ledger', subtitle: 'System event history, administrative audits, and transactions' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  admin,
  activeTab,
  onToggleSidebar,
  pendingKycCount,
  activeEscrowCount,
  reminderCount = 0,
  onTabChange,
  onLogout,
  onOpenAccountModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTabInfo = tabTitles[activeTab] || tabTitles.metrics;

  const initials = (admin.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            aria-label="Open menu"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{currentTabInfo.title}</h1>
            <p className="text-sm text-slate-500 hidden sm:block truncate">{currentTabInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {reminderCount > 0 && (
            <button
              onClick={() => onTabChange('kyc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition cursor-pointer animate-pulse"
              title="Vendors waiting with priority review reminder"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{reminderCount} Review {reminderCount === 1 ? 'Reminder' : 'Reminders'}</span>
            </button>
          )}
          {pendingKycCount > 0 && (
            <button
              onClick={() => onTabChange('kyc')}
              className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold transition cursor-pointer"
            >
              {pendingKycCount} {pendingKycCount === 1 ? 'vendor' : 'vendors'} to check
            </button>
          )}
          {activeEscrowCount > 0 && (
            <button
              onClick={() => onTabChange('escrow')}
              className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-semibold transition cursor-pointer"
            >
              {activeEscrowCount} paid {activeEscrowCount === 1 ? 'booking' : 'bookings'} open
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            aria-label="Refresh"
            title="Refresh"
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Admin Account Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="Admin Account"
              title="Admin Profile"
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition cursor-pointer select-none"
            >
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                {admin.avatar ? (
                  <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {admin.name || 'Admin'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">
                  Super Admin
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                {/* Dropdown Header */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 overflow-hidden">
                      {admin.avatar ? (
                        <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                        <span>{admin.name || 'Super Admin'}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {admin.email || admin.phone || 'Platform Administrator'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Actions */}
                <div className="space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenAccountModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl font-bold text-slate-800 hover:bg-[#f95724]/10 hover:text-[#f95724] transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#f95724]" />
                    <span>My Account & Admin Profile</span>
                  </button>

                  <div className="my-1.5 border-t border-slate-100" />

                  {/* Switch to Host */}
                  <a
                    href={getUserPortalUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>Switch to Host App</span>
                    </div>
                  </a>

                  {/* Switch to Vendor */}
                  <a
                    href={getVendorPortalUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>Switch to Vendor Desk</span>
                    </div>
                  </a>

                  <div className="my-1.5 border-t border-slate-100" />

                  {/* Log Out */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
