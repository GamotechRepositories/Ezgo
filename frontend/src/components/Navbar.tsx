import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Menu, 
  X, 
  ArrowRight 
} from 'lucide-react';
import ezgoLogo from '../assets/ezgo-logo.png';

interface NavbarProps {
  onOpenPostModal: () => void;
}

export default function Navbar({ onOpenPostModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Hyderabad, Telangana');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const cities = [
    'Hyderabad, Telangana',
    'Mumbai, Maharashtra',
    'Delhi NCR',
    'Bengaluru, Karnataka',
    'Jaipur, Rajasthan',
    'Pune, Maharashtra',
    'Goa'
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'For Providers', href: '#reverse-bidding' },
    { name: 'About', href: '#occasions' },
    { name: 'Blog', href: '#testimonials' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-[#07141C]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl'
            : 'py-5 bg-gradient-to-b from-black/70 via-black/20 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <img
              src={ezgoLogo}
              alt="EzGo"
              className="h-9 sm:h-11 w-auto object-contain drop-shadow-md"
            />
          </a>

          {/* Center: Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs sm:text-sm font-medium text-white/90 hover:text-[#FF5A1F] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Location Pill Button */}
            <div className="relative">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-xs font-medium text-white transition backdrop-blur-md"
              >
                <MapPin className="w-3.5 h-3.5 text-white/80" />
                <span>{selectedCity}</span>
                <ArrowRight className="w-3 h-3 text-white/60 ml-0.5" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#07141C]/95 border border-white/15 shadow-2xl backdrop-blur-2xl py-1.5 z-50 animate-in fade-in">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs transition flex items-center justify-between ${
                        selectedCity === city
                          ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] font-semibold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              onClick={() => onOpenPostModal()}
              className="px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-xs font-medium text-white transition backdrop-blur-md"
            >
              Login
            </button>

            {/* Get Started Button */}
            <button
              onClick={() => onOpenPostModal()}
              className="px-4 py-1.5 rounded-full bg-[#FF5A1F] hover:bg-[#E44C13] text-white text-xs font-semibold shadow-lg shadow-[#FF5A1F]/30 transition flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => onOpenPostModal()}
              className="px-3 py-1 rounded-full bg-[#FF5A1F] text-white text-xs font-semibold"
            >
              Get Started
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-white/10 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between sm:hidden">
          <nav className="space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-serif font-medium text-white hover:text-[#FF5A1F]"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPostModal();
            }}
            className="w-full py-3 rounded-full bg-[#FF5A1F] text-white font-semibold text-sm shadow-xl"
          >
            Get Started →
          </button>
        </div>
      )}
    </>
  );
}
