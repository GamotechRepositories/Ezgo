import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Layers, 
  Wallet, 
  Sparkles, 
  MapPin, 
  ChevronDown,
  Award,
  Bell,
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
  DollarSign,
  Star,
  RefreshCw,
  SlidersHorizontal,
  Building2
} from 'lucide-react';
import { EzGoLogo } from './EzGoLogo';
import type { User } from '../types';

interface VendorNavbarProps {
  vendor: User;
  activeTab: 'auctions' | 'orders' | 'wallet' | 'inventory';
  onTabChange: (tab: 'auctions' | 'orders' | 'wallet' | 'inventory') => void;
  onOpenExplainer: () => void;
  activeOrdersCount: number;
}

export const VendorNavbar: React.FC<VendorNavbarProps> = ({
  vendor,
  activeTab,
  onTabChange,
  onOpenExplainer,
  activeOrdersCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState(vendor.serviceArea || 'Pune, MH');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPortalsOpen, setIsPortalsOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const portalsRef = useRef<HTMLDivElement>(null);

  const cities = ['Pune, MH', 'Hyderabad, TS', 'Mumbai, MH', 'Bangalore, KA', 'Delhi NCR'];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cityRef.current && !cityRef.current.contains(target)) {
        setIsCityOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (portalsRef.current && !portalsRef.current.contains(target)) {
        setIsPortalsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      id: 'auctions' as const,
      label: 'Live Auctions',
      icon: Radio,
      iconColor: 'text-[#f95724]',
      badge: (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f95724]"></span>
        </span>
      ),
      countBadge: '3 Live',
      countBadgeColor: 'bg-orange-100 text-[#f95724] border border-orange-200/60',
    },
    {
      id: 'orders' as const,
      label: 'Active Bookings',
      icon: Layers,
      iconColor: 'text-indigo-600',
      countBadge: activeOrdersCount > 0 ? activeOrdersCount : null,
      countBadgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'wallet' as const,
      label: 'Wallet & Payouts',
      icon: Wallet,
      iconColor: 'text-emerald-600',
    },
    {
      id: 'inventory' as const,
      label: 'Equipment & Gear',
      icon: Sparkles,
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Gradient Brand Accent Line */}
      <div className="h-[3px] bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 w-full" />

      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#fffdfa]/95 backdrop-blur-md shadow-lg shadow-slate-900/5 border-b border-amber-200/70'
            : 'bg-[#fffdfa] border-b border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand Logo & Vendor Pro Badge */}
            <div className="flex items-center gap-4 sm:gap-6">
              <a 
                href="/" 
                className="flex items-center select-none transition-transform hover:scale-[1.02] active:scale-95 py-1"
                title="EzGo Vendor Portal"
              >
                <EzGoLogo variant="vendor" size="lg" />
              </a>
            </div>

            {/* Center: Desktop Navigation Tabs */}
            <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 text-xs font-bold shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer relative select-none ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    <span>{item.label}</span>

                    {item.countBadge !== null && item.countBadge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                        item.countBadgeColor || 'bg-[#f95724] text-white shadow-xs'
                      }`}>
                        {item.countBadge}
                      </span>
                    )}

                    {item.badge}
                  </button>
                );
              })}
            </nav>

            {/* Right: Controls, 15% Rules, City, Wallet, Notifications & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* 15% Rule Explainer Guide Pill */}
              <button
                onClick={onOpenExplainer}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 text-amber-900 text-xs font-bold hover:border-orange-400 hover:text-[#f95724] shadow-2xs transition cursor-pointer group"
                title="View EzGo 15% Minimum Reduction Bidding Rule"
              >
                <Award className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
                <span>15% Rules Guide</span>
              </button>

              {/* City / Service Area Selector */}
              <div className="relative" ref={cityRef}>
                <button
                  onClick={() => setIsCityOpen(!isCityOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-orange-300 text-slate-800 text-xs font-bold shadow-2xs transition cursor-pointer"
                  title="Filter by City"
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
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs transition cursor-pointer"
                title="View Wallet & Escrow"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>₹48,500</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              {/* Portals Switcher */}
              <div className="relative hidden lg:block" ref={portalsRef}>
                <button
                  onClick={() => setIsPortalsOpen(!isPortalsOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:border-slate-300 hover:text-slate-900 shadow-2xs transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Portals</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isPortalsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      EzGo Ecosystem
                    </div>
                    
                    <a
                      href="http://localhost:5173"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-[#f95724] transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span>Host & Event App</span>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    </a>

                    <div className="px-3 py-1.5 rounded-xl bg-orange-50 text-[#f95724] font-bold text-xs flex items-center justify-between my-1">
                      <span>Vendor Portal (Current)</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#f95724]" />
                    </div>

                    <a
                      href="http://localhost:5175"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>Admin Hub</span>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    </a>
                  </div>
                )}
              </div>

              {/* Notifications Alert Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition cursor-pointer relative"
                  title="Vendor Notifications"
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

              {/* Vendor Profile Pill & Dropdown */}
              <div className="relative pl-1" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full bg-white border border-slate-200 hover:border-orange-300 hover:shadow-xs transition cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={vendor.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80'}
                      alt={vendor.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-300 shadow-2xs"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>

                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                      <span>{vendor.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 inline" />
                    </div>
                    <div className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                      <span>{vendor.rating || '4.9'} ({vendor.completedJobs || 42} events)</span>
                    </div>
                  </div>

                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl mb-1 border border-orange-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#f95724]" />
                        <span className="text-xs font-black text-slate-900">{vendor.businessName || vendor.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{vendor.serviceArea || selectedCity}</div>
                      
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

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                title="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile & Tablet Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 shadow-xl space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Vendor Navigation
              </div>
              <button
                onClick={() => {
                  onOpenExplainer();
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-[#f95724] flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>15% Rule</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-orange-50 text-orange-950 border border-orange-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.countBadge !== null && item.countBadge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.countBadgeColor || 'bg-[#f95724] text-white'
                      }`}>
                        {item.countBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Wallet & Links */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Wallet: ₹48,500 Available</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-orange-50 text-[#f95724] font-bold"
                >
                  Host App ↗
                </a>
                <a
                  href="http://localhost:5175"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 font-bold"
                >
                  Admin Hub ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};