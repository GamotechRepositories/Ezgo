import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, ArrowRight } from 'lucide-react';
import { EzGoLogo } from './EzGoLogo';
import type { User } from '../types';

interface NavbarProps {
  currentUser: User;
  onOpenExplainer: () => void;
  onOpenPostModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenExplainer,
  onOpenPostModal,
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
      <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-14">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a 
              href="/"
              className="flex items-center select-none transition-transform hover:scale-[1.02] active:scale-95 py-1"
            >
              <EzGoLogo variant="host" size="lg" />
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

              <button onClick={onOpenExplainer} className="hover:text-[#f95724] transition cursor-pointer">
                How It Works
              </button>

              <a href="#about" className="hover:text-[#f95724] transition">
                About
              </a>

              <a href="#blog" className="hover:text-[#f95724] transition">
                Blog
              </a>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Location Selector Pill */}
            <div className="relative">
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
              className="px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <span>Post Requirement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};