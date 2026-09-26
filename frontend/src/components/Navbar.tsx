import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenPostModal: (service?: string) => void;
}

export default function Navbar({ onOpenPostModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const cities = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Jaipur', 'Hyderabad', 'Pune', 'Goa'];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Reverse Bidding', href: '#reverse-bidding' },
    { name: 'Occasions', href: '#occasions' },
    { name: 'Trust & Safety', href: '#trust' },
    { name: 'Reviews', href: '#testimonials' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-[#07141C]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40'
            : 'py-5 bg-gradient-to-b from-black/60 via-black/20 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-[#D93D04] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/30 group-hover:scale-105 transition-transform duration-200">
              <span className="font-serif font-black text-2xl text-white tracking-tighter">E</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="font-serif font-bold text-2xl tracking-tight text-white">Ez</span>
                <span className="font-serif font-bold text-2xl tracking-tight text-[#FF5A1F]">Go</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#FFF8EE]/60 font-semibold -mt-1">
                Event Marketplace
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#FFF8EE]/80 hover:text-white transition-colors duration-200 relative group py-1"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FF5A1F] transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Location Selector */}
            <div className="relative">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#FFF8EE]/90 transition-all backdrop-blur-md"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>{selectedCity}</span>
                <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[#07141C]/95 border border-white/15 shadow-2xl backdrop-blur-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                    Select City
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition flex items-center justify-between ${
                        selectedCity === city
                          ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] font-semibold'
                          : 'text-[#FFF8EE]/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {city}
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Provider Login / Join Link */}
            <a
              href="#provider"
              className="text-xs font-semibold text-[#FFF8EE]/80 hover:text-white transition px-2 py-1"
            >
              For Providers
            </a>

            {/* Post Requirement CTA Button */}
            <button
              onClick={() => onOpenPostModal()}
              className="relative group overflow-hidden px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7B47] text-white text-xs font-semibold shadow-lg shadow-[#FF5A1F]/30 hover:shadow-[#FF5A1F]/50 transition-all duration-300 active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Post Requirement</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => onOpenPostModal()}
              className="px-3 py-1.5 rounded-lg bg-[#FF5A1F] text-white text-xs font-semibold shadow-md shadow-[#FF5A1F]/30"
            >
              Post Bid
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between sm:hidden animate-in fade-in">
          <div className="space-y-4">
            <div className="pb-4 border-b border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-2 font-semibold">City</p>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      selectedCity === city
                        ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white'
                        : 'bg-white/5 border-white/10 text-white/80'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <nav className="space-y-3 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-serif font-medium text-white/90 hover:text-[#FF5A1F] transition py-1"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPostModal();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7B47] text-white font-semibold text-sm shadow-xl shadow-[#FF5A1F]/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Post Your Requirement</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-white/60 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Escrow Protected Booking</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
