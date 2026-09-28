import React, { useState } from 'react';
import { 
  Mail, 
  ArrowRight, 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  Lock, 
  PhoneCall, 
  Percent, 
  Building2, 
  MapPin, 
  CheckCircle2
} from 'lucide-react';
import ezgoLogo from '../assets/EzGo logo.png';

interface FooterProps {
  onOpenExplainer?: () => void;
  onOpenPostModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenExplainer, onOpenPostModal }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-[#fbf0e2] via-[#faf0e4] to-[#f7e6d0] pt-12 sm:pt-16 pb-6 text-slate-700">
      
      {/* Ambient Silk Wave Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="none">
          <path d="M0,150 C320,80 640,240 960,160 C1200,100 1360,180 1440,120 L1440,600 L0,600 Z" fill="#e8bb82" fillOpacity="0.15" />
          <path d="M0,320 C400,200 800,380 1200,280 C1360,240 1400,260 1440,250 L1440,600 L0,600 Z" fill="#f59e0b" fillOpacity="0.08" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12 sm:space-y-14">
        
        {/* ========================================================================= */}
        {/* 1. TOP NEWSLETTER FLOATING BANNER                                         */}
        {/* ========================================================================= */}
        <div className="relative bg-gradient-to-r from-[#fff5ea] via-[#fff8f1] to-[#fef2e2] rounded-3xl p-6 sm:p-8 lg:p-10 border border-amber-200/90 shadow-sm overflow-hidden">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            
            {/* Left Header info */}
            <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-100/90 text-[#f95724] border border-orange-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#f95724] block">
                  Stay Updated
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f172a] leading-tight">
                  Get Event Deals & Tips <span className="text-[#f95724]">Straight to Your Inbox</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Be the first to know about new vendors, exciting offers, and event planning tips.
                </p>
              </div>
            </div>

            {/* Right Email Form & 3D Envelope Illustration */}
            <div className="w-full lg:w-auto shrink-0 flex items-center gap-6">
              {isSubscribed ? (
                <div className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Thank you for subscribing! Check your inbox soon.</span>
                </div>
              ) : (
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <form onSubmit={handleSubscribe} className="w-full sm:w-[380px] space-y-1.5">
                    <div className="flex items-center bg-white rounded-2xl p-1.5 border border-amber-200/90 shadow-xs focus-within:border-[#f95724] focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                      <div className="pl-3.5 pr-2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-2 font-medium"
                      />
                      <button
                        type="submit"
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-[#f95724] hover:from-orange-600 hover:to-[#f95724] text-white font-black text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>Subscribe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 text-center lg:text-left pl-2 font-medium">
                      No spam. Only useful updates.
                    </p>
                  </form>

                  {/* 3D Envelope & Letters Illustration */}
                  <div className="hidden xl:flex items-center justify-center w-24 h-24 shrink-0 drop-shadow-md">
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                      <rect x="15" y="32" width="70" height="48" rx="8" fill="#fb923c" />
                      <rect x="22" y="18" width="56" height="40" rx="4" fill="#ffffff" stroke="#fcd34d" strokeWidth="2" />
                      <line x1="28" y1="26" x2="55" y2="26" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="28" y1="34" x2="68" y2="34" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
                      <line x1="28" y1="42" x2="60" y2="42" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
                      <path d="M15,35 L50,60 L85,35" fill="#f97316" />
                      <path d="M15,35 L50,58 L85,35 L85,80 L15,80 Z" fill="#ea580c" fillOpacity="0.15" />
                      <polygon points="78,14 82,22 90,22 84,28 86,36 80,30 74,36 76,28 70,22 78,22" fill="#fbbf24" />
                      <polygon points="12,24 14,29 19,29 15,33 17,38 13,34 9,38 11,33 7,29 12,29" fill="#f59e0b" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN 5 COLUMNS CONTENT                                                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pt-2">
          
          {/* Column 1: Brand Info (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2.5">
              <img src={ezgoLogo} alt="EzGo" className="h-9 sm:h-10 w-auto object-contain" />
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-[#f95724] border border-orange-200/80">
                REVERSE BIDS
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium max-w-sm">
              Event Services Escrow Marketplace with Guaranteed ≥15% Minimum Savings.
            </p>

            {/* Social Icons Row with Exact Brand SVGs */}
            <div className="flex items-center gap-2.5 pt-1">
              
              {/* Instagram */}
              <a 
                href="#instagram" 
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white flex items-center justify-center shadow-2xs hover:scale-110 active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href="#facebook" 
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-2xs hover:scale-110 active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.593 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a 
                href="#youtube" 
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-2xs hover:scale-110 active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a 
                href="#linkedin" 
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-2xs hover:scale-110 active:scale-95 transition-transform"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a 
                href="#twitter" 
                aria-label="X Twitter"
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-2xs hover:scale-110 active:scale-95 transition-transform"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><a href="#" className="hover:text-[#f95724] transition-colors">Home</a></li>
              <li><button onClick={onOpenExplainer} className="hover:text-[#f95724] transition-colors cursor-pointer">How It Works</button></li>
              <li><a href="#services-grid" className="hover:text-[#f95724] transition-colors">Browse Services</a></li>
              <li><a href="#requirements-hub" className="hover:text-[#f95724] transition-colors">Live Bidding</a></li>
              <li><button onClick={onOpenPostModal} className="hover:text-[#f95724] transition-colors cursor-pointer">For Providers</button></li>
              <li><a href="#" className="hover:text-[#f95724] transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Column 3: Event Categories (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase">
              Event Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><a href="#services-grid" className="hover:text-[#f95724] transition-colors">Wedding</a></li>
              <li><a href="#services-grid" className="hover:text-[#f95724] transition-colors">Sangeet & Haldi</a></li>
              <li><a href="#services-grid" className="hover:text-[#f95724] transition-colors">Reception</a></li>
              <li><a href="#services-grid" className="hover:text-[#f95724] transition-colors">Birthday Party</a></li>
              <li><a href="#services-grid" className="hover:text-[#f95724] transition-colors">Corporate Events</a></li>
              <li><a href="#services-grid" className="hover:text-[#f95724] font-bold text-[#f95724] transition-colors">View All Categories</a></li>
            </ul>
          </div>

          {/* Column 4: Support (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <a href="#" className="flex items-center gap-1.5 hover:text-[#f95724] transition-colors">
                  <HelpCircle className="w-3.5 h-3.5 text-[#f95724]" />
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href="#faqs" className="flex items-center gap-1.5 hover:text-[#f95724] transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-[#f95724]" />
                  <span>FAQs</span>
                </a>
              </li>
              <li>
                <button onClick={onOpenExplainer} className="flex items-center gap-1.5 hover:text-[#f95724] transition-colors cursor-pointer">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f95724]" />
                  <span>Escrow Safety</span>
                </button>
              </li>
              <li>
                <a href="#" className="flex items-center gap-1.5 hover:text-[#f95724] transition-colors">
                  <FileText className="w-3.5 h-3.5 text-[#f95724]" />
                  <span>Terms & Conditions</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-1.5 hover:text-[#f95724] transition-colors">
                  <Lock className="w-3.5 h-3.5 text-[#f95724]" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-1.5 hover:text-[#f95724] transition-colors">
                  <PhoneCall className="w-3.5 h-3.5 text-[#f95724]" />
                  <span>Contact Support</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Download Our App (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase">
              Download Our App
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Explore events, bid on services, and manage bookings on the go.
            </p>

            <div className="space-y-2.5 pt-1">
              {/* App Store Button */}
              <a
                href="#app-store"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all w-fit cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.13.64-2.8 1.43-.58.68-1.09 1.76-1.02 2.8 1.08.08 2.19-.58 2.81-1.36z" />
                </svg>
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider block text-slate-300 leading-none">Download on the</span>
                  <span className="text-xs font-bold leading-tight block">App Store</span>
                </div>
              </a>

              {/* Google Play Button */}
              <a
                href="#google-play"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:scale-[1.02] active:scale-95 transition-all w-fit cursor-pointer"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.6 1.6l10.8 10.4-3.2 3.2-8.4-12.8c.2-.5.5-.8.8-.8z" />
                  <path fill="#34A853" d="M17.6 15.2l-3.2-3.2L3.6 22.4c.5 0 .9-.3 1.2-.5l12.8-6.7z" />
                  <path fill="#FBBC05" d="M20.8 10.7l-3.2 1.7-3.2-3.2 3.2-3.2 3.2 1.7c.8.5.8 2.5 0 3z" />
                  <path fill="#EA4335" d="M14.4 9.2L3.6 1.6C3.3 1.8 3 2.1 3 2.6v18.8c0 .5.3.8.6 1l10.8-10.4-3.2-3.2z" />
                </svg>
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider block text-slate-300 leading-none">GET IT ON</span>
                  <span className="text-xs font-bold leading-tight block">Google Play</span>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM MIDDLE VALUE PROPS STRIP (3 PROMISES)                           */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-amber-200/70">
          <div className="flex flex-wrap items-center justify-around gap-6 max-w-4xl mx-auto">
            
            {/* Value 1: 15% Minimum Savings */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-orange-100/90 text-[#f95724] border border-orange-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Percent className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 leading-tight">15% Minimum Savings</h5>
                <p className="text-[11px] text-slate-500 font-medium">Guaranteed Lower Bids</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-amber-200/80" />

            {/* Value 2: 0% Vendor Deductions */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100/90 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 leading-tight">0% Vendor Deductions</h5>
                <p className="text-[11px] text-slate-500 font-medium">More Earnings for Providers</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-amber-200/80" />

            {/* Value 3: RBI-Compliant Split Escrow */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-100/90 text-indigo-600 border border-indigo-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 leading-tight">RBI-Compliant Split Escrow</h5>
                <p className="text-[11px] text-slate-500 font-medium">Safe & Secure Payments</p>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM-MOST COPYRIGHT & PAYMENT METHOD LOGOS                           */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          
          {/* Copyright */}
          <div>
            © 2026 EzGo Event Services Marketplace Pvt. Ltd. All rights reserved.
          </div>

          {/* Cities & Payment Logos */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Hyderabad</span>
              <span>•</span>
              <span>Bangalore</span>
              <span>•</span>
              <span>Secunderabad</span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-slate-300" />

            {/* Payment Logos */}
            <div className="flex items-center gap-3">
              {/* VISA */}
              <span className="font-black italic text-blue-900 tracking-wider text-sm px-1.5 py-0.5 rounded bg-white border border-slate-200">
                VISA
              </span>

              {/* Mastercard */}
              <div className="flex items-center px-1.5 py-1 rounded bg-white border border-slate-200">
                <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] -mr-1.5 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] inline-block opacity-90" />
              </div>

              {/* UPI */}
              <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 tracking-tight">
                UPI ↗
              </span>

              {/* RuPay */}
              <span className="font-black text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-800 tracking-tight">
                RuPay<span className="text-orange-500">▶</span>
              </span>
            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};
