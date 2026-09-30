import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  MapPin, 
  DollarSign, 
  ChevronDown, 
  CheckCircle2, 
  RefreshCw, 
  SlidersHorizontal,
  Wallet,
  Building2
} from 'lucide-react';
import type { User } from '../types';

interface VendorHeaderProps {
  vendor: User;
  activeTab: 'auctions' | 'orders' | 'wallet' | 'inventory';
  onToggleSidebar: () => void;
  onTabChange: (tab: 'auctions' | 'orders' | 'wallet' | 'inventory') => void;
  activeOrdersCount: number;
}

export const VendorHeader: React.FC<VendorHeaderProps> = ({
  vendor,
  activeTab,
  onToggleSidebar,
  onTabChange,
}) => {
  const [selectedCity, setSelectedCity] = useState(vendor.serviceArea || 'Pune, MH');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const cities = ['Pune, MH', 'Hyderabad, TS', 'Mumbai, MH', 'Bangalore, KA', 'Delhi NCR'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cityRef.current && !cityRef.current.contains(target)) setIsCityOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    auctions: { title: 'Live Event Auctions', subtitle: 'Browse real-time event requirements & submit competitive gear bids' },
    orders: { title: 'Active Event Bookings', subtitle: 'Manage accepted contracts, customer contacts, logistics & delivery' },
    wallet: { title: 'Earnings & Escrow Wallet', subtitle: '100% direct payouts with zero commission deductions & instant withdrawal' },
    inventory: { title: 'Equipment & Gear Catalog', subtitle: 'Showcase your sound systems, DJ consoles, lighting & stage trusses' },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.auctions;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top Gradient Line */}
      <div className="h-[2.5px] bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 w-full" />

      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Page Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {currentTabInfo.title}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: City Selector, Wallet Pill, Alerts & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* City / Service Hub Selector */}
          <div className="relative" ref={cityRef}>
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              title="Select Service Area"
            >
              <MapPin className="w-3.5 h-3.5 text-[#f95724] fill-[#f95724]/20" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isCityOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Select Service Hub
                </div>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      selectedCity === city
                        ? 'bg-orange-50 text-[#f95724] font-black'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <CheckCircle2 className="w-3.5 h-3.5 text-[#f95724]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Wallet Balance Pill */}
          <button
            onClick={() => onTabChange('wallet')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs transition cursor-pointer"
            title="Available Balance in Escrow Wallet"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>₹48,500</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* Notifications Alert Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer relative"
              title="Live Auction Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 px-1.5 py-0.2 min-w-[18px] text-center rounded-full bg-[#f95724] text-white text-[10px] font-extrabold border-2 border-white shadow-xs">
                2
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-900">Live Auction Broadcasts</span>
                  <span className="text-[10px] text-slate-400 font-bold">2 New Events</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  <div 
                    onClick={() => {
                      onTabChange('auctions');
                      setIsNotifOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 cursor-pointer hover:bg-orange-100/70 transition"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-orange-950">
                      <span>DJ & Sound in Baner, Pune</span>
                      <span className="text-[10px] text-[#f95724]">5m ago</span>
                    </div>
                    <p className="text-[11px] text-orange-800 mt-1">
                      Budget ₹45,000 • Max bid ₹38,250 (-15% rule applied)
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      onTabChange('orders');
                      setIsNotifOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 cursor-pointer hover:bg-emerald-100/70 transition"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                      <span>Escrow Deposit Secured</span>
                      <span className="text-[10px] text-emerald-600">1h ago</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      Host funded ₹28,000 in escrow for Wedding Sound Setup.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vendor Profile Dropdown */}
          <div className="relative pl-1" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              <img
                src={vendor.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80'}
                alt={vendor.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-300"
              />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {vendor.businessName || vendor.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl mb-1 border border-orange-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#f95724]" />
                    <span className="text-xs font-black text-slate-900">{vendor.businessName || vendor.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{selectedCity}</div>
                  
                  <div className="mt-2.5 pt-2 border-t border-orange-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">KYC Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      VERIFIED PRO
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onTabChange('inventory');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Manage Gear Inventory</span>
                </button>

                <button
                  onClick={() => {
                    onTabChange('wallet');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <Wallet className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bank & UPI Payout Details</span>
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sync Live Auctions</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
