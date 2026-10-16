import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingDown,
  Star,
  ArrowRight,
  AlertCircle,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
import { GoogleSignInButton } from './GoogleSignInButton';
import { api } from '../services/api';
import type { User } from '../types';

interface LoginPageProps {
  onSuccess: (user: User) => void;
}

const trustBadges = [
  {
    icon: TrendingDown,
    title: 'Min. 15% Savings Guaranteed',
    desc: 'Vendors bid under your max budget in a live reverse auction.',
  },
  {
    icon: ShieldCheck,
    title: '100% Milestone Escrow',
    desc: 'Payments stay protected until you confirm the event is complete.',
  },
  {
    icon: Star,
    title: 'Vetted Event Professionals',
    desc: 'Browse verified photographers, caterers, DJs & decorators with real reviews.',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col lg:grid lg:grid-cols-12 bg-[#f8fafc]">
      {/* LEFT COLUMN: Hero Brand Experience (Visible on Laptop / Desktop) */}
      <aside className="hidden lg:flex lg:col-span-7 flex-col justify-between bg-gradient-to-br from-[#fff3eb] via-[#fff8f4] to-[#fef6f0] border-r border-orange-100/80 p-10 xl:p-14 relative overflow-hidden">
        {/* Ambient subtle glow background shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <EzzyGoLogo variant="host" size="lg" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-orange-200/70 text-xs font-semibold text-[#f95724] shadow-xs">
            India's 1st Event Escrow Marketplace
          </span>
        </div>

        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-[#f95724] uppercase tracking-wider mb-5">
            Host Event Console
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            Your Event, Your Budget.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f95724] to-[#ea3a06]">
              Top Vendors Compete Under Your Price.
            </span>
          </h2>
          <p className="mt-4 text-base xl:text-lg text-slate-600 leading-relaxed font-normal">
            Post your wedding, birthday, corporate event or party. Receive competitive reverse-bids from verified local pros in minutes.
          </p>

          <div className="mt-8 space-y-3.5">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-orange-100 shadow-xs hover:shadow-sm transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center shrink-0 text-[#f95724]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{badge.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Proof & Rating Strip */}
          <div className="mt-8 pt-6 border-t border-orange-200/50 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                  alt="Host"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                  alt="Host"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80"
                  alt="Host"
                />
              </div>
              <span className="font-semibold text-slate-800">10,000+ Happy Event Hosts</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <span className="text-amber-500">★★★★★</span>
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-orange-100">
          <span>&copy; {new Date().getFullYear()} EzzyGo Events Marketplace</span>
          <a
            href="http://localhost:5174"
            className="text-[#f95724] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Looking to bid as a vendor? Open Vendor Portal <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>

      {/* RIGHT COLUMN: Interactive Login Card (Optimized for Mobile & Laptop) */}
      <main className="flex-1 lg:col-span-5 flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-14">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Mobile Top Brand Bar (Visible only on Mobile & Tablets) */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <EzzyGoLogo variant="host" size="md" />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-[#f95724]">
              Host Portal
            </span>
          </div>

          {/* Main Glass Login Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-lg shadow-slate-200/40 p-6 sm:p-9 relative">
            <div className="text-center">
              <h1 className="font-['Playfair_Display',Georgia,serif] text-3xl sm:text-[36px] font-bold text-slate-900 leading-tight tracking-normal">
                Log in to EzzyGo
              </h1>
              <p className="text-sm sm:text-[14.5px] text-slate-600 leading-relaxed font-normal max-w-[340px] sm:max-w-[380px] mx-auto mt-2.5 mb-6">
                Continue with your Google account to post event requirements and receive bids from verified vendors.
              </p>
            </div>

            {/* Google Login Action Container */}
            <div className="space-y-4">
              <GoogleSignInButton
                onSuccess={async (token, isAccessToken) => {
                  setBusy(true);
                  setError('');
                  try {
                    const user = await api.loginWithGoogle(token, isAccessToken);
                    onSuccess(user);
                  } catch (err: any) {
                    setError(err.message || 'Failed to authenticate with Google.');
                  } finally {
                    setBusy(false);
                  }
                }}
                onError={(msg) => setError(msg)}
                disabled={busy}
                text="continue_with"
              />

              {error && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {busy && (
                <p className="text-center text-xs sm:text-sm text-[#f95724] animate-pulse font-semibold">
                  Connecting to Google secure session, please wait...
                </p>
              )}
            </div>

            {/* Divider with 'or' */}
            <div className="relative my-7 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <div className="relative bg-white px-3 text-xs text-slate-400 font-medium">
                or
              </div>
            </div>

            {/* 3 Quick Benefit Micro-Chips */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* 1-Click */}
              <div className="flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl bg-[#fffcf9] border border-[#ffedd5]/80 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#ffedd5]/60 flex items-center justify-center text-[#f95724] mb-2.5">
                  <Zap className="w-5 h-5 fill-orange-500 text-orange-500" />
                </div>
                <div className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">1-Click</div>
                <div className="text-xs text-slate-500 mt-1 font-normal">Sign-in</div>
              </div>

              {/* 100% Escrow Safe */}
              <div className="flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl bg-[#fffcf9] border border-[#ffedd5]/80 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#ffedd5]/60 flex items-center justify-center text-[#f95724] mb-2.5">
                  <ShieldCheck className="w-5 h-5 text-orange-500 stroke-[2.2]" />
                </div>
                <div className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">100%</div>
                <div className="text-xs text-slate-500 mt-1 font-normal">Escrow Safe</div>
              </div>

              {/* Min. 15% Savings */}
              <div className="flex flex-col items-center justify-center text-center py-4 px-2 rounded-2xl bg-[#fffcf9] border border-[#ffedd5]/80 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#ffedd5]/60 flex items-center justify-center text-[#f95724] mb-2.5">
                  <TrendingUp className="w-5 h-5 text-orange-500 stroke-[2.2]" />
                </div>
                <div className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight">Min. 15%</div>
                <div className="text-xs text-slate-500 mt-1 font-normal">Savings</div>
              </div>
            </div>

            {/* Security Guarantee Pill */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs sm:text-[13px] text-slate-500 font-normal">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.2]" />
              <span>Official Google Auth · 256-bit SSL encrypted</span>
            </div>
          </div>

          {/* Bottom Switcher Link */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Are you an event vendor or performer?{' '}
              <a
                href="http://localhost:5174"
                className="text-[#f95724] font-semibold hover:underline inline-flex items-center gap-1 ml-0.5 cursor-pointer"
              >
                Go to Vendor Portal <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
