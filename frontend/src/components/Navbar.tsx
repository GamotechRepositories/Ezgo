import React from 'react';
import { ShieldCheck, UserCheck, Briefcase, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import type { User, UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser: User;
  onOpenExplainer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentUser,
  onOpenExplainer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-violet-600 p-[2px] shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Ez
                  </span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-white">
                  EzGo<span className="text-amber-400">.</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Reverse Bids
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Event Services Escrow Marketplace</p>
            </div>
          </div>

          {/* Center: Role Switcher Tabs */}
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex items-center gap-1">
            <button
              onClick={() => onRoleChange('requester')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                currentRole === 'requester'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Requester</span>
            </button>

            <button
              onClick={() => onRoleChange('provider')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                currentRole === 'provider'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Provider</span>
              {currentUser.role === 'provider' && currentUser.isVerified && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                currentRole === 'admin'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Right Action & Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenExplainer}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>15% Savings & Escrow Model</span>
              <ArrowUpRight className="w-3 h-3 text-amber-400" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-700 ring-2 ring-amber-500/20"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-white leading-none">
                  {currentUser.businessName || currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium capitalize mt-0.5 flex items-center gap-1">
                  <span>{currentUser.role}</span>
                  {currentUser.isVerified && (
                    <span className="text-emerald-400 text-[9px] font-bold bg-emerald-500/10 px-1 rounded">
                      KYC Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
