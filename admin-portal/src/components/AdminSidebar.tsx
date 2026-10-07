import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Wallet,
  FolderKanban,
  ScrollText,
  ExternalLink,
  X,
  PartyPopper,
} from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
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
    { id: 'metrics' as const, label: 'Overview', icon: LayoutDashboard, count: null },
    { id: 'kyc' as const, label: 'Vendor checks', icon: UserCheck, count: pendingKycCount > 0 ? pendingKycCount : null },
    { id: 'escrow' as const, label: 'Payments', icon: Wallet, count: activeEscrowCount > 0 ? activeEscrowCount : null },
    { id: 'categories' as const, label: 'Categories', icon: FolderKanban, count: null },
    { id: 'occasions' as const, label: 'Occasions', icon: PartyPopper, count: null },
    { id: 'logs' as const, label: 'Money activity', icon: ScrollText, count: null },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center select-none">
              <EzzyGoLogo variant="admin" size="md" showBadge={false} />
            </a>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-orange-50 text-slate-900 font-semibold border border-orange-200/80'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium border border-transparent'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f95724]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </span>
                {item.count !== null && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f95724] text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-5 mt-4 border-t border-slate-100 space-y-1">
            <div className="px-3 pb-1 text-xs text-slate-400">Other EzzyGo apps</div>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <span>Host app</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <span>Vendor app</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </nav>

        <div className="p-3.5 m-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center shrink-0">
            {(admin.name || 'A').charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{admin.name}</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </div>
      </aside>
    </>
  );
};
