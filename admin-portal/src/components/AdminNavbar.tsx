import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  ShieldAlert, 
  FolderKanban, 
  ScrollText, 
  Activity,
  Bell,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Server,
  Database,
  Lock,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles
} from 'lucide-react';
import { EzGoLogo } from './EzGoLogo';
import type { User } from '../types';

interface AdminNavbarProps {
  admin: User;
  activeTab: 'metrics' | 'kyc' | 'escrow' | 'categories' | 'logs';
  onTabChange: (tab: 'metrics' | 'kyc' | 'escrow' | 'categories' | 'logs') => void;
  pendingKycCount: number;
  activeEscrowCount: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  admin,
  activeTab,
  onTabChange,
  pendingKycCount,
  activeEscrowCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [isPortalsOpen, setIsPortalsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const gatewayRef = useRef<HTMLDivElement>(null);
  const portalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (gatewayRef.current && !gatewayRef.current.contains(target)) {
        setIsGatewayOpen(false);
      }
      if (portalsRef.current && !portalsRef.current.contains(target)) {
        setIsPortalsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAlerts = pendingKycCount + (activeEscrowCount > 0 ? 1 : 0);

  const navItems = [
    {
      id: 'metrics' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-[#f95724]',
      badge: null,
    },
    {
      id: 'kyc' as const,
      label: 'Provider KYC',
      icon: UserCheck,
      iconColor: 'text-blue-600',
      badge: pendingKycCount > 0 ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      ) : null,
      countBadge: pendingKycCount > 0 ? pendingKycCount : null,
    },
    {
      id: 'escrow' as const,
      label: 'Escrow Custody',
      icon: ShieldAlert,
      iconColor: 'text-emerald-600',
      badge: null,
      countBadge: activeEscrowCount > 0 ? activeEscrowCount : null,
      countBadgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'categories' as const,
      label: 'Categories',
      icon: FolderKanban,
      iconColor: 'text-purple-600',
      badge: null,
    },
    {
      id: 'logs' as const,
      label: 'Audit Trail',
      icon: ScrollText,
      iconColor: 'text-slate-500',
      badge: null,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Gradient Brand Accent Line */}
      <div className="h-[3px] bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 w-full" />

      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#fffdfa]/95 backdrop-blur-md shadow-lg shadow-slate-900/5 border-b border-amber-200/70'
            : 'bg-[#fffdfa] border-b border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand Logo & Admin Badge */}
            <div className="flex items-center gap-4 sm:gap-6">
              <a 
                href="/" 
                className="flex items-center select-none transition-transform hover:scale-[1.02] active:scale-95 py-1"
                title="EzGo Admin Portal"
              >
                <EzGoLogo variant="admin" size="lg" />
              </a>
            </div>

            {/* Center: Desktop Navigation Tabs */}
            <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 text-xs font-bold shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer relative select-none ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    <span>{item.label}</span>

                    {item.countBadge !== null && item.countBadge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                        item.countBadgeColor || 'bg-rose-500 text-white shadow-xs'
                      }`}>
                        {item.countBadge}
                      </span>
                    )}

                    {item.badge}
                  </button>
                );
              })}
            </nav>

            {/* Right: Controls, System Health, Portals & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* API Gateway Status Pill & Dropdown */}
              <div className="relative hidden md:block" ref={gatewayRef}>
                <button
                  onClick={() => setIsGatewayOpen(!isGatewayOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs transition cursor-pointer"
                  title="System Status"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Gateway Online</span>
                  <ChevronDown className="w-3 h-3 text-emerald-600 opacity-70" />
                </button>

                {isGatewayOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">Backend Infrastructure</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        100% HEALTHY
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Server className="w-3.5 h-3.5 text-slate-500" />
                          <span>REST Gateway</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">Port 5000 (Active)</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-slate-500" />
                          <span>MongoDB Cluster</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">Connected (22ms)</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Escrow Smart Vault</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">Locked & Audited</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Portal Switcher Dropdown */}
              <div className="relative hidden lg:block" ref={portalsRef}>
                <button
                  onClick={() => setIsPortalsOpen(!isPortalsOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:border-slate-300 hover:text-slate-900 shadow-2xs transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Portals</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isPortalsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Switch Workspace
                    </div>
                    
                    <a
                      href="http://localhost:5173"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-[#f95724] transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span>Host & Event App</span>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    </a>

                    <a
                      href="http://localhost:5174"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Vendor Bidding Desk</span>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    </a>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <div className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-between">
                        <span>Admin Hub (Current)</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications Alert Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition cursor-pointer relative"
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
                      <span className="text-xs font-extrabold text-slate-900">Admin Operational Alerts</span>
                      <span className="text-[10px] text-slate-400 font-bold">{totalAlerts} Action items</span>
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
                            New audio & decor vendors awaiting identity verification.
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
                            Funds safely locked in escrow vault awaiting host completion.
                          </p>
                        </div>
                      )}

                      {totalAlerts === 0 && (
                        <div className="py-6 text-center text-xs text-slate-400">
                          <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500 mb-1" />
                          <p className="font-semibold text-slate-600">All Systems Clear</p>
                          <p className="text-[11px]">No pending escalations or disputes.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative pl-1" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white border border-slate-200 hover:border-rose-300 hover:shadow-xs transition cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={admin.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                      alt={admin.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-300 shadow-2xs"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>

                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-extrabold text-slate-900 leading-tight">
                      {admin.name}
                    </div>
                    <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                      Super Admin
                    </div>
                  </div>

                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-3 bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl mb-1 border border-rose-100">
                      <div className="text-xs font-black text-slate-900">{admin.name}</div>
                      <div className="text-[11px] text-slate-500">{admin.email || 'admin@ezgo.events'}</div>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700">
                        <Zap className="w-3 h-3 text-rose-500" />
                        <span>Root Privilege Level 4</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Refresh Platform Sync</span>
                    </button>

                    <button
                      onClick={() => {
                        onTabChange('logs');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                    >
                      <ScrollText className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Security Logs</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                title="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile & Tablet Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 shadow-xl space-y-3 animate-in slide-in-from-top-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
              Admin Navigation
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-rose-50 text-rose-900 border border-rose-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.countBadge !== null && item.countBadge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.countBadgeColor || 'bg-rose-500 text-white'
                      }`}>
                        {item.countBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Gateway & Links */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Port 5000 Connected</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-orange-50 text-[#f95724] font-bold"
                >
                  Host App ↗
                </a>
                <a
                  href="http://localhost:5174"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold"
                >
                  Vendor Desk ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};