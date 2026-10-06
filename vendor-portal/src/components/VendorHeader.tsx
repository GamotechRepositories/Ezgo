import React from 'react';
import { Menu } from 'lucide-react';
import type { User } from '../types';

interface VendorHeaderProps {
  vendor: User;
  activeTab: 'auctions' | 'orders' | 'wallet' | 'inventory';
  onToggleSidebar: () => void;
  onTabChange: (tab: 'auctions' | 'orders' | 'wallet' | 'inventory') => void;
  activeOrdersCount: number;
  onLogout: () => void;
}

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  auctions: { title: 'Open requests', subtitle: 'Events where hosts are waiting for bids' },
  orders: { title: 'My bookings', subtitle: 'Jobs a host picked you for' },
  wallet: { title: 'Earnings', subtitle: 'Money paid to you and money coming next' },
  inventory: { title: 'My equipment', subtitle: 'What you can bring to events' },
};

export const VendorHeader: React.FC<VendorHeaderProps> = ({
  vendor,
  activeTab,
  onToggleSidebar,
  onLogout,
}) => {
  const currentTabInfo = tabTitles[activeTab] || tabTitles.auctions;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            aria-label="Open menu"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{currentTabInfo.title}</h1>
            <p className="text-sm text-slate-500 hidden sm:block truncate">{currentTabInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-medium text-slate-800 hidden sm:inline">
            {vendor.businessName || vendor.name}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              vendor.isVerified ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {vendor.isVerified ? 'Verified' : 'Not verified'}
          </span>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};
