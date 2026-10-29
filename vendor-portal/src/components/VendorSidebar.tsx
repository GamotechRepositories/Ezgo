import React from 'react';
import {
  Search,
  CalendarCheck,
  Calendar,
  HelpCircle,
  ExternalLink,
  X,
  Star,
  User as UserIcon,
} from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
import { getUserPortalUrl } from '../utils/portalUrls';
import type { User } from '../types';

interface VendorSidebarProps {
  vendor: User;
  activeTab: 'auctions' | 'orders' | 'availability' | 'wallet' | 'inventory' | 'profile';
  onTabChange: (tab: 'auctions' | 'orders' | 'availability' | 'wallet' | 'inventory' | 'profile') => void;
  onOpenExplainer: () => void;
  onOpenAccountModal?: () => void;
  activeOrdersCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const VendorSidebar: React.FC<VendorSidebarProps> = ({
  vendor,
  activeTab,
  onTabChange,
  onOpenExplainer,
  onOpenAccountModal,
  activeOrdersCount,
  isOpen,
  onClose,
}) => {
  const navItems = [
    { id: 'auctions' as const, label: 'Live leads', icon: Search, count: null },
    { id: 'orders' as const, label: 'My jobs', icon: CalendarCheck, count: activeOrdersCount > 0 ? activeOrdersCount : null },
    { id: 'availability' as const, label: 'Availability', icon: Calendar, count: null },
    { id: 'profile' as const, label: 'Profile', icon: UserIcon, count: null },
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
              <EzzyGoLogo variant="vendor" size="md" showBadge={false} />
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
            const isActive = item.id === 'profile'
              ? ['profile', 'wallet', 'inventory'].includes(activeTab)
              : activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#fff1ea] text-[#de6a3a] font-semibold border border-[#ffd7c2]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium border border-transparent'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f07d4a]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </span>
                {item.count !== null && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f07d4a] text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => {
              onOpenExplainer();
              onClose();
            }}
            className="w-full mt-2 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How bidding works</span>
          </button>

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
          </div>
        </nav>

        <button
          type="button"
          onClick={() => {
            if (onOpenAccountModal) onOpenAccountModal();
            onClose();
          }}
          className="p-3 m-3 rounded-2xl bg-slate-50 hover:bg-slate-50/60 border border-slate-200 hover:border-slate-200 flex items-center gap-3 min-w-0 transition cursor-pointer text-left group"
        >
          {vendor.avatar ? (
            <img src={vendor.avatar} alt={vendor.name} className="w-9 h-9 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-100 text-[#17233d] font-semibold flex items-center justify-center shrink-0">
              {(vendor.businessName || vendor.name || 'V').charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 group-hover:text-[#17233d] truncate transition">
              {vendor.businessName || vendor.name}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              {vendor.rating ? (
                <>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{vendor.rating}</span>
                  {vendor.serviceArea && <span>· {vendor.serviceArea}</span>}
                </>
              ) : (
                <span>{vendor.serviceArea || (vendor.isVerified ? 'Verified vendor' : 'Not verified yet')}</span>
              )}
            </div>
          </div>
        </button>
      </aside>
    </>
  );
};
