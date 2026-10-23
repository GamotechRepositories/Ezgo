import {
  LayoutDashboard,
  UserCheck,
  Wallet,
  FolderKanban,
  ScrollText,
  ExternalLink,
  X,
  PartyPopper,
  Sparkles,
  Users,
  Megaphone,
} from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
import { getUserPortalUrl, getVendorPortalUrl } from '../utils/portalUrls';
import type { User } from '../types';

export type AdminTab =
  | 'metrics'
  | 'requirements'
  | 'escrow'
  | 'kyc'
  | 'users'
  | 'categories'
  | 'occasions'
  | 'banners'
  | 'logs';

interface AdminSidebarProps {
  admin: User;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingKycCount: number;
  activeEscrowCount: number;
  openRequirementsCount?: number;
  reminderCount?: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenAccountModal?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  admin,
  activeTab,
  onTabChange,
  pendingKycCount,
  activeEscrowCount,
  openRequirementsCount = 0,
  reminderCount = 0,
  isOpen,
  onClose,
  onOpenAccountModal,
}) => {
  const navItems = [
    { id: 'metrics' as const, label: 'Overview', icon: LayoutDashboard, count: null, reminderCount: null },
    {
      id: 'requirements' as const,
      label: 'Live Requests & Bids',
      icon: Sparkles,
      count: openRequirementsCount > 0 ? openRequirementsCount : null,
      reminderCount: null,
    },
    { id: 'escrow' as const, label: 'Payments & Escrow', icon: Wallet, count: activeEscrowCount > 0 ? activeEscrowCount : null, reminderCount: null },
    {
      id: 'kyc' as const,
      label: 'Vendor Checks',
      icon: UserCheck,
      count: pendingKycCount > 0 ? pendingKycCount : null,
      reminderCount: reminderCount > 0 ? reminderCount : null,
    },
    { id: 'users' as const, label: 'User Directory', icon: Users, count: null, reminderCount: null },
    { id: 'categories' as const, label: 'Categories', icon: FolderKanban, count: null, reminderCount: null },
    { id: 'occasions' as const, label: 'Occasions', icon: PartyPopper, count: null, reminderCount: null },
    { id: 'banners' as const, label: 'Promotions & Ads', icon: Megaphone, count: null, reminderCount: null },
    { id: 'logs' as const, label: 'Audit & Ledger', icon: ScrollText, count: null, reminderCount: null },
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
                <div className="flex items-center gap-1.5">
                  {item.reminderCount !== null && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse" title="Priority review reminder from vendor">
                      ⚡ {item.reminderCount}
                    </span>
                  )}
                  {item.count !== null && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f95724] text-white">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div className="pt-5 mt-4 border-t border-slate-100 space-y-1">
            <div className="px-3 pb-1 text-xs text-slate-400">Other EzzyGo apps</div>
            <a
              href={getUserPortalUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <span>Host app</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href={getVendorPortalUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <span>Vendor app</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </nav>

        <button
          type="button"
          onClick={() => {
            if (onOpenAccountModal) onOpenAccountModal();
            onClose();
          }}
          className="p-3 m-3 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 hover:border-orange-200 flex items-center gap-3 min-w-0 transition cursor-pointer text-left group"
        >
          {admin.avatar ? (
            <img src={admin.avatar} alt={admin.name} className="w-9 h-9 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-200 group-hover:bg-[#f95724] text-slate-700 group-hover:text-white font-semibold flex items-center justify-center shrink-0 transition">
              {(admin.name || 'A').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 group-hover:text-[#f95724] truncate transition">
              {admin.name || 'Admin'}
            </div>
            <div className="text-xs text-slate-500">Super Administrator</div>
          </div>
        </button>
      </aside>
    </>
  );
};
