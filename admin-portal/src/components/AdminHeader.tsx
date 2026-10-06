import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import type { User } from '../types';

interface AdminHeaderProps {
  admin: User;
  activeTab: 'metrics' | 'kyc' | 'escrow' | 'categories' | 'occasions' | 'logs';
  onToggleSidebar: () => void;
  pendingKycCount: number;
  activeEscrowCount: number;
  onTabChange: (tab: 'metrics' | 'kyc' | 'escrow' | 'categories' | 'occasions' | 'logs') => void;
  onLogout: () => void;
}

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  metrics: { title: 'Overview', subtitle: 'Money and bookings at a glance' },
  kyc: { title: 'Vendor checks', subtitle: 'Approve vendors before hosts book them' },
  escrow: { title: 'Payments', subtitle: 'Pay vendors after events, or cancel bookings' },
  categories: { title: 'Categories', subtitle: 'Services hosts can ask for' },
  occasions: { title: 'Occasions', subtitle: 'Event types shown in the host app' },
  logs: { title: 'Money activity', subtitle: 'Recent payments, payouts, and fees' },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onToggleSidebar,
  pendingKycCount,
  activeEscrowCount,
  onTabChange,
  onLogout,
}) => {
  const currentTabInfo = tabTitles[activeTab] || tabTitles.metrics;

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
          {pendingKycCount > 0 && (
            <button
              onClick={() => onTabChange('kyc')}
              className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-sm font-medium transition cursor-pointer"
            >
              {pendingKycCount} {pendingKycCount === 1 ? 'vendor' : 'vendors'} to check
            </button>
          )}
          {activeEscrowCount > 0 && (
            <button
              onClick={() => onTabChange('escrow')}
              className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-sm font-medium transition cursor-pointer"
            >
              {activeEscrowCount} paid {activeEscrowCount === 1 ? 'booking' : 'bookings'} open
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            aria-label="Refresh"
            title="Refresh"
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
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
