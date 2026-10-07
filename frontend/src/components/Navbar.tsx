import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
import type { User } from '../types';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onOpenExplainer: () => void;
  onOpenPostModal: () => void;
  onOpenBookings?: () => void;
  onGoHome?: () => void;
  isBookingsPage?: boolean;
  activeBookingsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenExplainer,
  onOpenPostModal,
  onOpenBookings,
  onGoHome,
  isBookingsPage = false,
  activeBookingsCount = 0,
}) => {
  const [selectedCity, setSelectedCity] = useState('Pune, MH');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cities = ['Pune, MH', 'Hyderabad, TS', 'Mumbai, MH', 'Bangalore, KA', 'Delhi NCR'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-[#fffdfa]/95 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-amber-200/60 py-1'
        : 'bg-transparent border-b border-transparent py-0'
    }`}>
      <div className="w-full max-w-[1600px] mx-auto px-3.5 sm:px-8 lg:px-14">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-8">
            <a 
              href="/"
              onClick={(e) => {
                if (!onGoHome) return;
                e.preventDefault();
                onGoHome();
              }}
              className="flex items-center select-none transition-transform hover:scale-[1.02] active:scale-95 py-1"
            >
              <EzzyGoLogo variant="host" size="lg" hideTaglineOnMobile />
            </a>

            {/* Nav Links */}
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
                    {['DJ & Sound Systems', 'Stage & Mandap Decoration', '4K Photography & Drone', 'Catering Buffets', 'Lighting & Trussing', 'Priest & Purohit', 'Bridal Mehendi'].map((srv) => (
                      <button
                        key={srv}
                        onClick={() => {
                          setIsServicesDropdownOpen(false);
                          if (onOpenPostModal) onOpenPostModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-900 transition"
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
                    isBookingsPage ? 'text-emerald-700 underline underline-offset-8 decoration-2' : 'hover:text-emerald-700'
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

              <button onClick={onOpenExplainer} className="hover:text-[#f95724] transition cursor-pointer">
                How bidding works
              </button>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick My Bookings Pill for Mobile / Tablet */}
            {onOpenBookings && (
              <button
                onClick={onOpenBookings}
                aria-label="My bookings"
                aria-current={isBookingsPage ? 'page' : undefined}
                className={`lg:hidden flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border text-xs font-bold transition cursor-pointer shadow-2xs ${
                  isBookingsPage ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isBookingsPage ? 'text-white' : 'text-emerald-600'}`} />
                <span className="hidden sm:inline">Bookings</span>
                {activeBookingsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {activeBookingsCount}
                  </span>
                )}
              </button>
            )}

            {/* Location Selector Pill */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:border-slate-300 shadow-2xs transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#f95724] fill-[#f95724]/20" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl p-1.5 z-50">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                        selectedCity === city
                          ? 'bg-orange-50 text-[#f95724] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Post Need CTA Button */}
            <button
              onClick={onOpenPostModal}
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/25 flex items-center gap-1 sm:gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span className="hidden sm:inline">Post Requirement</span>
              <span className="sm:hidden">Post Need</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onLogout}
              title={currentUser.name}
              className="px-2 sm:px-3 py-2 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              Log out
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};