import { useState } from 'react';
import { ArrowRight, Check, Heart } from 'lucide-react';
import ezgoLogo from '../assets/ezgo-logo.png';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-[#07141C] text-white border-t border-white/10 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand (3 cols on lg) */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3 text-left">
            <img
              src={ezgoLogo}
              alt="EzGo"
              className="h-10 w-auto object-contain mb-2"
            />
            <p className="text-xs text-white/60">
              Event Services Marketplace
            </p>
          </div>

          {/* Col 2: Quick Links (2 cols on lg) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-white/65">
              <li><a href="#services" className="hover:text-[#FF5A1F] transition">Services</a></li>
              <li><a href="#how-it-works" className="hover:text-[#FF5A1F] transition">How It Works</a></li>
              <li><a href="#reverse-bidding" className="hover:text-[#FF5A1F] transition">For Providers</a></li>
              <li><a href="#occasions" className="hover:text-[#FF5A1F] transition">About Us</a></li>
              <li><a href="#testimonials" className="hover:text-[#FF5A1F] transition">Blog</a></li>
            </ul>
          </div>

          {/* Col 3: Popular Services (2 cols on lg) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider mb-3">
              Popular Services
            </h4>
            <ul className="space-y-2 text-xs text-white/65">
              <li><a href="#services" className="hover:text-[#FF5A1F] transition">DJ / Sound</a></li>
              <li><a href="#services" className="hover:text-[#FF5A1F] transition">Catering</a></li>
              <li><a href="#services" className="hover:text-[#FF5A1F] transition">Decoration</a></li>
              <li><a href="#services" className="hover:text-[#FF5A1F] transition">Photography</a></li>
              <li><a href="#services" className="hover:text-[#FF5A1F] transition">Mehendi</a></li>
            </ul>
          </div>

          {/* Col 4: Support (2 cols on lg) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-white/65">
              <li><a href="#support" className="hover:text-[#FF5A1F] transition">Help Center</a></li>
              <li><a href="#support" className="hover:text-[#FF5A1F] transition">Contact Us</a></li>
              <li><a href="#privacy" className="hover:text-[#FF5A1F] transition">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-[#FF5A1F] transition">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Col 5: Newsletter (3 cols on lg) */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3 text-left">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider mb-2">
              Subscribe to our newsletter
            </h4>
            <p className="text-xs text-white/60 mb-3">
              Get the latest updates and offers.
            </p>

            <form onSubmit={handleSubscribe} className="relative mb-4">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white text-xs text-[#07141C] placeholder:text-slate-400 focus:outline-none pr-10 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-2.5 rounded-md bg-[#332211] hover:bg-[#FF5A1F] text-white flex items-center justify-center transition"
                aria-label="Subscribe"
              >
                {subscribed ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-white/70">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2025 EzGo. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Designed for memorable events</span>
            <Heart className="w-3.5 h-3.5 text-[#FF5A1F] fill-[#FF5A1F]" />
            <span>with EzGo</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
