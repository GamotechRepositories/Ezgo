import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  HelpCircle,
  Calendar,
  Home,
  Check,
} from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
import type { User } from '../types';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onOpenExplainer: () => void;
  onOpenPostModal: (categoryName?: string) => void;
  onOpenBookings?: () => void;
  onGoHome?: () => void;
  isBookingsPage?: boolean;
  activeBookingsCount?: number;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

const NAVBAR_CITIES = [
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

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenExplainer,
  onOpenPostModal,
  onOpenBookings,
  onGoHome,
  isBookingsPage = false,
  activeBookingsCount = 0,
  selectedCity = 'Pune, MH',
  onSelectCity,
}) => {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsCityDropdownOpen(false);
        setIsServicesDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMobileNav = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#fffdfa]/95 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-amber-200/60 py-0.5'
            : 'bg-white/80 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none border-b border-slate-100 sm:border-transparent py-0'
        }`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-3.5 sm:px-8 lg:px-14">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Desktop Nav */}
            <div className="flex items-center gap-3 sm:gap-8 min-w-0">
              <a
                href="/"
                onClick={(e) => {
                  if (!onGoHome) return;
                  e.preventDefault();
                  onGoHome();
                }}
                className="flex items-center select-none transition-transform hover:scale-[1.02] active:scale-95 py-1 shrink-0"
              >
                <EzzyGoLogo variant="host" size="lg" hideTaglineOnMobile />
              </a>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-700">
                <div className="relative">
                  <button
                    onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                    className="flex items-center gap-1 hover:text-[#f95724] transition cursor-pointer"
                  >
                    <span>Services</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isServicesDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                      {[
                        'DJ & Sound Setup',
                        'Decoration & Stage Setup',
                        'Photography & 4K Videography',
                        'Catering & Live Food Counters',
                        'Lighting & Stage Trussing',
                        'Purohit & Vedic Ritual Services',
                        'Bridal Mehendi & Makeup Artists',
                      ].map((srv) => (
                        <button
                          key={srv}
                          onClick={() => {
                            setIsServicesDropdownOpen(false);
                            if (onOpenPostModal) onOpenPostModal(srv);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-900 transition cursor-pointer"
                        >
                          {srv}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {onOpenBookings && (
                  <button
                    onClick={onOpenBookings}
                    aria-current={isBookingsPage ? 'page' : undefined}
                    className={`flex items-center gap-1.5 font-extrabold transition cursor-pointer ${
                      isBookingsPage
                        ? 'text-emerald-700 underline underline-offset-8 decoration-2'
                        : 'hover:text-emerald-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>My Bookings</span>
                    {activeBookingsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
                        {activeBookingsCount}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={onOpenExplainer}
                  className="hover:text-[#f95724] transition cursor-pointer flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>How bidding works</span>
                </button>
              </nav>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* City selector pill (visible on all screens now) */}
              <div className="relative">
                <button
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  aria-label="Select city"
                  className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-[11px] sm:text-xs font-semibold hover:border-slate-300 shadow-2xs transition cursor-pointer min-h-[36px]"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#f95724] fill-[#f95724]/20 shrink-0" />
                  <span className="max-w-[75px] sm:max-w-none truncate">{selectedCity.split(',')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {isCityDropdownOpen && (
                  <div className="absolute right-0 sm:left-0 mt-2 w-52 max-h-80 overflow-y-auto bg-white rounded-2xl border border-slate-100 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Choose Your City
                    </div>
                    {NAVBAR_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          if (onSelectCity) onSelectCity(city);
                          setIsCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                          selectedCity === city
                            ? 'bg-orange-50 text-[#f95724] font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <Check className="w-3.5 h-3.5 text-[#f95724]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Requirement CTA Button */}
              <button
                onClick={() => onOpenPostModal()}
                className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] active:scale-95 text-white font-bold text-xs sm:text-xs shadow-md shadow-[#f95724]/25 flex items-center gap-1 sm:gap-1.5 transition cursor-pointer whitespace-nowrap min-h-[36px] sm:min-h-[42px]"
              >
                <span className="hidden sm:inline">Post Requirement</span>
                <span className="sm:hidden font-bold">+ Post Need</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </button>

              {/* Desktop Logout Button */}
              <button
                onClick={onLogout}
                title={currentUser.name}
                className="hidden lg:inline-flex px-3 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer whitespace-nowrap"
              >
                Log out
              </button>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer relative min-h-[42px] min-w-[42px] flex items-center justify-center"
              >
                <Menu className="w-5 h-5 text-slate-800" />
                {activeBookingsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Slide-Over Sheet */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-250 border-l border-slate-100">
            {/* Drawer Header */}
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <EzzyGoLogo variant="host" size="sm" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Info Card */}
              <div className="p-4 bg-orange-50/60 border-b border-orange-100/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f95724] to-[#ea4a17] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">{currentUser.name || 'Event Host'}</div>
                  <div className="text-xs text-slate-500 font-medium truncate">{currentUser.phone}</div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-3 space-y-1">
                <button
                  onClick={() => handleMobileNav(() => onGoHome?.())}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    !isBookingsPage
                      ? 'bg-orange-50 text-[#f95724]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>Home & Explore</span>
                </button>

                <button
                  onClick={() =>
                    handleMobileNav(() => {
                      if (onGoHome) onGoHome();
                      setTimeout(() => {
                        const el = document.getElementById('requirements-hub');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    })
                  }
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>My Events & Auctions</span>
                </button>

                {onOpenBookings && (
                  <button
                    onClick={() => handleMobileNav(onOpenBookings)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                      isBookingsPage
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>My Bookings</span>
                    </div>
                    {activeBookingsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold font-mono">
                        {activeBookingsCount}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => handleMobileNav(onOpenExplainer)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>How Bidding Works</span>
                </button>

                <div className="pt-2 pb-1 px-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Popular Services
                </div>

                {[
                  'DJ & Sound Setup',
                  'Decoration & Stage Setup',
                  'Photography & 4K Videography',
                  'Catering & Live Food Counters',
                ].map((srv) => (
                  <button
                    key={srv}
                    onClick={() => handleMobileNav(() => onOpenPostModal(srv))}
                    className="w-full text-left px-3.5 py-2.5 min-h-[38px] text-xs font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-900 rounded-lg transition cursor-pointer flex items-center"
                  >
                    {srv}
                  </button>
                ))}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50 safe-bottom">
              <button
                onClick={() => handleMobileNav(() => onOpenPostModal())}
                className="w-full py-3.5 min-h-[46px] rounded-xl bg-[#f95724] hover:bg-[#e04818] active:scale-95 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Post Event Requirement</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleMobileNav(onLogout)}
                className="w-full py-3 min-h-[44px] rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
