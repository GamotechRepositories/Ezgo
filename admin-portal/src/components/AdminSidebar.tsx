import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  ShieldAlert, 
  FolderKanban, 
  ScrollText, 
  ShieldCheck, 
  ExternalLink,
  X,
  Sparkles,
  Server,
  PartyPopper
} from 'lucide-react';
import { EzGoLogo } from './EzGoLogo';
import type { User } from '../types';

interface AdminSidebarProps {
  admin: User;
  activeTab: 'metrics' | 'kyc' | 'escrow' | 'categories' | 'occasions' | 'logs';
  onTabChange: (tab: 'metrics' | 'kyc' | 'escrow' | 'categories' | 'occasions' | 'logs') => void;
  pendingKycCount: number;
  activeEscrowCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  admin,
  activeTab,
  onTabChange,
  pendingKycCount,
  activeEscrowCount,
  isOpen,
  onClose,
}) => {
  const navItems = [
    {
      id: 'metrics' as const,
      label: 'Dashboard Overview',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-[#f95724]',
      badge: null,
    },
    {
      id: 'kyc' as const,
      label: 'Provider KYC Desk',
      shortLabel: 'Provider KYC',
      icon: UserCheck,
      iconColor: 'text-blue-600',
      countBadge: pendingKycCount > 0 ? pendingKycCount : null,
      countBadgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'escrow' as const,
      label: 'Escrow Vault & Custody',
      shortLabel: 'Escrow Vault',
      icon: ShieldAlert,
      iconColor: 'text-emerald-600',
      countBadge: activeEscrowCount > 0 ? activeEscrowCount : null,
      countBadgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'categories' as const,
      label: 'Categories Catalog',
      shortLabel: 'Categories',
      icon: FolderKanban,
      iconColor: 'text-purple-600',
      badge: null,
    },
    {
      id: 'occasions' as const,
      label: 'Occasions & Themes',
      shortLabel: 'Occasions',
      icon: PartyPopper,
      iconColor: 'text-amber-500',
      badge: null,
    },
    {
      id: 'logs' as const,
      label: 'Security Audit Trail',
      shortLabel: 'Audit Trail',
      icon: ScrollText,
      iconColor: 'text-slate-500',
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
              <EzGoLogo variant="admin" size="md" showBadge={false} />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-black tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>ADMIN CONTROL</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              v2.4
            </span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Platform Management
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
                    ? 'bg-rose-50 text-rose-950 border border-rose-200/80 shadow-xs font-black'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white shadow-2xs' : 'bg-slate-100'}`}>
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.countBadge !== null && item.countBadge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                    item.countBadgeColor || 'bg-rose-500 text-white'
                  }`}>
                    {item.countBadge}
                  </span>
                )}
              </button>
            );
          })}

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
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Vendor Bidding Desk</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />
            </a>
          </div>
        </div>

        {/* Bottom User Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={admin.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={admin.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-300 shadow-2xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">{admin.name}</div>
              <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                Super Admin
              </div>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700" title="Server online">
            <Server className="w-3.5 h-3.5" />
          </div>
        </div>
      </aside>
    </>
  );
};
