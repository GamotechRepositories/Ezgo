import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  CalendarCheck,
  Wallet,
  ExternalLink,
  LogOut,
  Building2,
  ChevronDown,
  Clock,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import type { User } from '../types';
import { getUserPortalUrl, getAdminPortalUrl } from '../utils/portalUrls';
import { EzzyGoLogo } from './EzzyGoLogo';

interface VendorHeaderProps {
  vendor: User;
  activeTab: 'auctions' | 'orders' | 'availability' | 'wallet' | 'inventory' | 'profile';
  onToggleSidebar: () => void;
  onTabChange: (tab: 'auctions' | 'orders' | 'availability' | 'wallet' | 'inventory' | 'profile') => void;
  activeOrdersCount: number;
  onLogout: () => void;
  onOpenAccountModal: () => void;
  onOpenVerificationModal?: () => void;
  marketplaceCity?: string;
  onMarketplaceCity?: (city: string) => void;
}

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  auctions: { title: 'Live leads', subtitle: 'Bid at least 15% below the host budget' },
  orders: { title: 'My jobs', subtitle: 'Host contact unlocks after they pay escrow' },
  availability: { title: 'Availability', subtitle: 'Block dates with offline gigs' },
  wallet: { title: 'Earnings', subtitle: 'You receive 100% of your accepted bid' },
  inventory: { title: 'Equipment', subtitle: 'Gear you can bring to events' },
  profile: { title: 'My Account', subtitle: 'Your jobs, bids and payouts' },
};

const HEADER_CITIES = ['ALL', 'Pune', 'Mumbai', 'Hyderabad', 'Bengaluru', 'Delhi NCR', 'Nagpur', 'Goa', 'Jaipur'];

export const VendorHeader: React.FC<VendorHeaderProps> = ({
  vendor,
  activeTab,
  onToggleSidebar: _onToggleSidebar,
  onTabChange,
  activeOrdersCount,
  onLogout,
  onOpenAccountModal,
  onOpenVerificationModal,
  marketplaceCity = 'ALL',
  onMarketplaceCity,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTabInfo = tabTitles[activeTab] || tabTitles.auctions;

  const initials = (vendor.businessName || vendor.name || 'V')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isAdmin = vendor.role === 'admin' || vendor.roles?.includes('admin');

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
        <div className="flex items-center gap-2 min-w-0">
          <div className="lg:hidden shrink-0">
            <EzzyGoLogo size="sm" showBadge={false} />
          </div>
          <div className="hidden lg:block min-w-0">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{currentTabInfo.title}</h1>
            <p className="text-sm text-slate-500 truncate">{currentTabInfo.subtitle}</p>
          </div>
          {onMarketplaceCity && (
            <label className="lg:hidden inline-flex items-center gap-1 px-2 py-1 rounded-[10px] text-xs font-semibold bg-slate-50 text-slate-800 border border-[#e8edf2]">
              <MapPin className="w-3 h-3 text-[#ff5c28]" />
              <select
                value={marketplaceCity}
                onChange={(e) => onMarketplaceCity(e.target.value)}
                className="bg-transparent font-bold text-[#17233d] outline-none cursor-pointer max-w-[110px]"
              >
                {HEADER_CITIES.map((c) => (
                  <option key={c} value={c}>{c === 'ALL' ? 'All Cities' : c}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* Right Section: My Account Dropdown & Verification */}
        <div className="flex items-center gap-3 shrink-0">
          {onMarketplaceCity && (
            <label className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#fff2ed] text-[#e64814] border border-[#ffd7c2]">
              <MapPin className="w-3.5 h-3.5" />
              <select
                value={marketplaceCity}
                onChange={(e) => onMarketplaceCity(e.target.value)}
                className="bg-transparent font-bold text-[#17233d] outline-none cursor-pointer max-w-[140px]"
                title="Filter leads by city"
              >
                {HEADER_CITIES.map((c) => (
                  <option key={c} value={c}>{c === 'ALL' ? 'All Cities' : c}</option>
                ))}
              </select>
            </label>
          )}

          {/* Interactive Verification Badge */}
          <button
            onClick={() => onOpenVerificationModal?.()}
            title="Click to check verification status, reminder, or re-apply"
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
              vendor.isVerified
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                : vendor.kycDocuments?.rejectionReason
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 ring-2 ring-rose-400/20 animate-pulse'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {vendor.isVerified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
              </>
            ) : vendor.kycDocuments?.rejectionReason ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Action Required</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Verification Pending</span>
              </>
            )}
          </button>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative hidden lg:block" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="My Account"
              title="My Account"
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer select-none"
            >
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                {vendor.avatar ? (
                  <img src={vendor.avatar} alt={vendor.businessName || vendor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {vendor.businessName || vendor.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">
                  Vendor Desk
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                {/* Header Info */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 overflow-hidden">
                      {vendor.avatar ? (
                        <img src={vendor.avatar} alt={vendor.businessName || vendor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                        <span>{vendor.businessName || vendor.name}</span>
                        {vendor.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {vendor.phone ? `+91 ${vendor.phone}` : vendor.email || 'Service Provider'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Actions */}
                <div className="space-y-0.5 text-xs">
                  {/* Verification Status Button */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenVerificationModal?.();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl font-bold transition flex items-center justify-between cursor-pointer ${
                      vendor.isVerified
                        ? 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70'
                        : vendor.kycDocuments?.rejectionReason
                        ? 'text-rose-800 bg-rose-50/70 hover:bg-rose-100/70'
                        : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {vendor.isVerified ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ) : vendor.kycDocuments?.rejectionReason ? (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                      <span>Verification Status</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                      {vendor.isVerified
                        ? 'Verified'
                        : vendor.kycDocuments?.rejectionReason
                        ? 'Fix Needed'
                        : 'Pending'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenAccountModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl font-bold text-slate-800 hover:bg-[#ff5c28]/10 hover:text-[#17233d] transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#17233d]" />
                    <span>My Account & Business Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onTabChange('orders');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarCheck className="w-4 h-4 text-slate-500" />
                      <span>My Bookings & Orders</span>
                    </div>
                    {activeOrdersCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
                        {activeOrdersCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onTabChange('wallet');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-slate-500" />
                    <span>Earnings & Payout Wallet</span>
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
                      <span>Switch to Host Portal</span>
                    </div>
                  </a>

                  {/* Switch to Admin if authorized */}
                  {isAdmin && (
                    <a
                      href={getAdminPortalUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-3 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>Switch to Admin Panel</span>
                      </div>
                    </a>
                  )}

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
