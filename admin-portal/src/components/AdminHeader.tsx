import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  Activity, 
  RefreshCw, 
  ChevronDown, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  Server,
  Database
} from 'lucide-react';
import type { User } from '../types';

interface AdminHeaderProps {
  admin: User;
  activeTab: 'metrics' | 'kyc' | 'escrow' | 'categories' | 'occasions' | 'logs';
  onToggleSidebar: () => void;
  pendingKycCount: number;
  activeEscrowCount: number;
  onTabChange: (tab: 'metrics' | 'kyc' | 'escrow' | 'categories' | 'occasions' | 'logs') => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  admin,
  activeTab,
  onToggleSidebar,
  pendingKycCount,
  activeEscrowCount,
  onTabChange,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const gatewayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
      if (gatewayRef.current && !gatewayRef.current.contains(target)) setIsGatewayOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAlerts = pendingKycCount + (activeEscrowCount > 0 ? 1 : 0);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    metrics: { title: 'Executive Dashboard', subtitle: 'Real-time GMV, volume, escrow custody and platform metrics' },
    kyc: { title: 'Provider KYC Management', subtitle: 'Verify credentials, GST, bank accounts & authenticate service pros' },
    escrow: { title: 'Escrow Custody & Disputes', subtitle: 'Manage safe escrow vault, release vendor payouts & process refunds' },
    categories: { title: 'Service Categories Catalog', subtitle: 'Configure available services, pricing tiers and icon sets' },
    logs: { title: 'Security Audit Trail', subtitle: 'Immutable transaction logs, auth events and system activity' },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.metrics;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top Gradient Line */}
      <div className="h-[2.5px] bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 w-full" />

      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Page Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {currentTabInfo.title}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Infrastructure Status, Alerts & Admin Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Gateway Status Badge */}
          <div className="relative hidden md:block" ref={gatewayRef}>
            <button
              onClick={() => setIsGatewayOpen(!isGatewayOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Port 5000 Online</span>
              <ChevronDown className="w-3 h-3 text-emerald-600 opacity-70" />
            </button>

            {isGatewayOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Backend System Status</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    100% HEALTHY
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-slate-500" />
                      <span>API Server</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600">Active (Port 5000)</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      <span>MongoDB Database</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600">Connected (22ms)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Sync Button */}
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notifications Alert Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer relative"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 px-1.5 py-0.2 min-w-[18px] text-center rounded-full bg-rose-500 text-white text-[10px] font-extrabold border-2 border-white shadow-xs">
                  {totalAlerts}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-900">Operational Alerts</span>
                  <span className="text-[10px] text-slate-400 font-bold">{totalAlerts} items</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {pendingKycCount > 0 && (
                    <div 
                      onClick={() => {
                        onTabChange('kyc');
                        setIsNotifOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-100/70 transition"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{pendingKycCount} Provider KYC Pending</span>
                      </div>
                      <p className="text-[11px] text-amber-700 mt-1">
                        Review submitted identity and equipment documentation.
                      </p>
                    </div>
                  )}

                  {activeEscrowCount > 0 && (
                    <div 
                      onClick={() => {
                        onTabChange('escrow');
                        setIsNotifOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 cursor-pointer hover:bg-emerald-100/70 transition"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{activeEscrowCount} Active Escrow Bookings</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Funds locked safely in escrow awaiting event completion.
                      </p>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
                      <p className="font-semibold text-slate-600">All Clear</p>
                      <p className="text-[11px]">No pending disputes or alerts.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Pill */}
          <div className="relative pl-1" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              <img
                src={admin.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={admin.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-300"
              />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {admin.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-2.5 bg-rose-50/70 rounded-xl mb-1 border border-rose-100">
                  <div className="text-xs font-black text-slate-900">{admin.name}</div>
                  <div className="text-[10px] text-rose-700 font-bold">Super Admin Access</div>
                </div>

                <button
                  onClick={() => {
                    onTabChange('logs');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Security Audit Logs
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
