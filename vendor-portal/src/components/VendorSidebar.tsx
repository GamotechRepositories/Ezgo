import React from 'react';
import { 
  Radio, 
  Layers, 
  Wallet, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  ExternalLink,
  X,
  Star,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { EzGoLogo } from './EzGoLogo';
import type { User } from '../types';

interface VendorSidebarProps {
  vendor: User;
  activeTab: 'auctions' | 'orders' | 'wallet' | 'inventory';
  onTabChange: (tab: 'auctions' | 'orders' | 'wallet' | 'inventory') => void;
  onOpenExplainer: () => void;
  activeOrdersCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const VendorSidebar: React.FC<VendorSidebarProps> = ({
  vendor,
  activeTab,
  onTabChange,
  onOpenExplainer,
  activeOrdersCount,
  isOpen,
  onClose,
}) => {
  const navItems = [
    {
      id: 'auctions' as const,
      label: 'Live Auctions Desk',
      shortLabel: 'Live Auctions',
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
      label: 'Active Event Bookings',
      shortLabel: 'Active Bookings',
      icon: Layers,
      iconColor: 'text-indigo-600',
      countBadge: activeOrdersCount > 0 ? activeOrdersCount : null,
      countBadgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'wallet' as const,
      label: 'Wallet & Payouts',
      shortLabel: 'Wallet',
      icon: Wallet,
      iconColor: 'text-emerald-600',
      countBadge: null,
    },
    {
      id: 'inventory' as const,
      label: 'Equipment & Gear Catalog',
      shortLabel: 'Gear Inventory',
      icon: Sparkles,
      iconColor: 'text-purple-600',
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <a 
              href="/"
              className="flex items-center select-none transition-transform hover:scale-[1.02] active:scale-95"
            >
              <EzGoLogo variant="vendor" size="md" showBadge={false} />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#f95724] text-[11px] font-black tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#f95724]" />
              <span>VENDOR PARTNER</span>
            </div>
            <span className="text-[10px] font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-md">
              PRO TIER
            </span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Vendor Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-orange-50 text-orange-950 border border-orange-200/80 shadow-xs font-black'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white shadow-2xs' : 'bg-slate-100'}`}>
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.countBadge !== null && item.countBadge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      item.countBadgeColor || 'bg-[#f95724] text-white'
                    }`}>
                      {item.countBadge}
                    </span>
                  )}
                  {item.badge}
                </div>
              </button>
            );
          })}

          {/* 15% Rules Guide Button */}
          <button
            onClick={() => {
              onOpenExplainer();
              onClose();
            }}
            className="w-full mt-2 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 text-amber-900 text-xs font-bold hover:border-orange-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>15% Rule & Flow Guide</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/70 font-black text-amber-900">
              Guide
            </span>
          </button>

          {/* Quick Ecosystem Switcher */}
          <div className="pt-5 mt-4 border-t border-slate-100">
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Switch Portal</span>
            </div>

            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-orange-50 hover:text-[#f95724] transition group mb-1"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Host Event App</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />
            </a>

            <a
              href="http://localhost:5175"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Admin Hub</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />
            </a>
          </div>
        </div>

        {/* Bottom Vendor Profile Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-orange-50/60 to-slate-50 border border-orange-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={vendor.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80'}
                alt={vendor.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-300 shadow-2xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate flex items-center gap-1">
                <span>{vendor.businessName || vendor.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 inline" />
              </div>
              <div className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                <span>{vendor.rating || 4.9} • {vendor.serviceArea || 'Pune'}</span>
              </div>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700" title="KYC Verified Pro">
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </aside>
    </>
  );
};
