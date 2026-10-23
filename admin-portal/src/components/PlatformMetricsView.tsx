import React from 'react';
import {
  TrendingUp,
  Wallet,
  ShieldCheck,
  Users,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Building2,
  BadgePercent,
  Banknote,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import type { AdminMetrics, User, Booking, Requirement } from '../types';
import type { AdminTab } from './AdminSidebar';

interface PlatformMetricsViewProps {
  metrics: AdminMetrics;
  providers?: User[];
  bookings?: Booking[];
  requirements?: Requirement[];
  currentAdmin?: User;
  onNavigateTab?: (tab: AdminTab) => void;
}

export const PlatformMetricsView: React.FC<PlatformMetricsViewProps> = ({
  metrics,
  providers = [],
  bookings = [],
  requirements = [],
  currentAdmin,
  onNavigateTab,
}) => {
  const gmv = metrics?.totalGMV || 0;
  const commission = metrics?.totalCommissionEarned || 0;
  const escrowHeld = metrics?.totalEscrowHeld || 0;
  const totalProviders = metrics?.totalProviders || providers.length || 0;
  const pendingKyc =
    metrics?.pendingVerificationCount || providers.filter((p) => !p.isVerified).length || 0;
  const totalReqs = metrics?.totalRequirements || requirements.length || 0;
  const activeBookings =
    metrics?.activeBookings || bookings.filter((b) => b.status === 'ACTIVE').length || 0;
  const completedBookings =
    metrics?.completedBookings ||
    bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED').length ||
    0;
  const disputedBookings = bookings.filter((b) => b.status === 'DISPUTED').length;

  const navigate = (tab: AdminTab) => {
    if (onNavigateTab) onNavigateTab(tab);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Executive Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#f95724]/20 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-orange-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>EzzyGo Core Marketplace Active</span>
              <span className="text-white/40">&bull;</span>
              <span>10% Platform Commission</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, {currentAdmin?.name?.split(' ')[0] || 'Administrator'} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Here is the live financial overview, pending KYC verifications, escrow deposits, and reverse-bidding activity across the platform.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {pendingKyc > 0 && (
              <button
                onClick={() => navigate('kyc')}
                className="px-4 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/40 text-orange-200 text-sm font-semibold transition cursor-pointer flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-orange-400" />
                <span>{pendingKyc} KYC to Check</span>
              </button>
            )}
            <button
              onClick={() => navigate('escrow')}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Wallet className="w-4 h-4 text-[#f95724]" />
              <span>Manage Escrows</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* GMV Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-orange-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Merchandise Value</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#f95724] flex items-center justify-center border border-orange-200/60 group-hover:scale-105 transition-transform">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{gmv.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500">Total volume secured through EzzyGo</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Host Payments</span>
            <span className="font-semibold text-slate-700">Bid + 10% Platform Fee</span>
          </div>
        </div>

        {/* EzzyGo Commission Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Revenue Earned (10%)</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 group-hover:scale-105 transition-transform">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              ₹{commission.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600/80">Retained platform commission</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Completed Events</span>
            <span className="font-semibold text-emerald-700">{completedBookings} bookings paid out</span>
          </div>
        </div>

        {/* Escrow Held Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Escrow Held in Trust</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold text-blue-700 tracking-tight">
              ₹{escrowHeld.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600/80">Protected funds awaiting event completion</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Bookings</span>
            <span className="font-semibold text-blue-700">{activeBookings} in progress</span>
          </div>
        </div>

        {/* Verified Vendors Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Verified Vendors</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold text-purple-900 tracking-tight">
              {totalProviders}
            </div>
            <p className="text-xs text-purple-700">Service partners in catalog</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Pending Review</span>
            <span className={`font-semibold ${pendingKyc > 0 ? 'text-[#f95724]' : 'text-slate-600'}`}>
              {pendingKyc > 0 ? `${pendingKyc} to verify` : 'All approved'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Action Required & Operational Alert Strip */}
      {(pendingKyc > 0 || disputedBookings > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingKyc > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50/60 border border-orange-200 flex items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ea580c] flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {pendingKyc} Vendor KYC Application{pendingKyc === 1 ? '' : 's'} Pending
                  </h4>
                  <p className="text-xs text-slate-600 truncate">Review Aadhaar, PAN, and bank details for approval</p>
                </div>
              </div>
              <button
                onClick={() => navigate('kyc')}
                className="px-3.5 py-1.5 rounded-xl bg-[#f95724] hover:bg-[#e04818] text-white text-xs font-bold shrink-0 transition cursor-pointer"
              >
                Review Now
              </button>
            </div>
          )}

          {disputedBookings > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50/60 border border-rose-200 flex items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-rose-950 truncate">
                    {disputedBookings} Active Escrow Dispute{disputedBookings === 1 ? '' : 's'}
                  </h4>
                  <p className="text-xs text-rose-800 truncate">Requires administrative dispute arbitration</p>
                </div>
              </div>
              <button
                onClick={() => navigate('escrow')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shrink-0 transition cursor-pointer"
              >
                Resolve
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Marketplace Lifecycle Pipeline (How EzzyGo Escrow Works) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Marketplace Reverse-Bidding & Escrow Flow</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Strict platform financial rules enforcing 15% minimum vendor discounts and 100% escrow protection.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            Protocol Version 1.1
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-bold text-slate-500">{totalReqs} Posted</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Host Posts Requirement</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Host sets event details, city venue, date, and baseline budget.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-[#f95724] flex items-center gap-1">
              <span>Reverse Bidding Active</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-orange-50/40 to-white border border-orange-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-[#f95724] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-bold text-[#ea580c]">&ge; 15% OFF</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Vendors Place Bids</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Vendors compete with bids at &le; 85% of host budget. Bids above 85% are blocked.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-[#f95724] flex items-center gap-1">
              <span>Host Selects Best Offer</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-blue-50/40 to-white border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-bold text-blue-700">{activeBookings} Held</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Host Pays into Escrow</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Host pays bid + 10% platform fee. Money is safely held in EzzyGo escrow vault.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-blue-700 flex items-center gap-1">
              <span>Event Delivery Verified</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-emerald-50/40 to-white border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <span className="text-xs font-bold text-emerald-700">{completedBookings} Completed</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payout Released</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Vendor receives 100% of the bid amount. EzzyGo retains the 10% platform commission.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <span>Settlement Finalized</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4b. City-Wise Operations & Geographic Analytics */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#ea580c] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">City-Wise Platform Operations & Analytics</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live geographic performance across operating cities — host requests, active escrows, vendor network, and volume.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{(metrics.cityBreakdown || []).length || 5} Major Cities Tracked</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4 rounded-l-xl">Operating City</th>
                <th className="py-3.5 px-4">Live Requests</th>
                <th className="py-3.5 px-4">Bookings in Escrow</th>
                <th className="py-3.5 px-4">Total GMV Volume</th>
                <th className="py-3.5 px-4">Platform Fee (10%)</th>
                <th className="py-3.5 px-4">Vendor Supply</th>
                <th className="py-3.5 px-4 rounded-r-xl text-right">Quick Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(metrics.cityBreakdown || []).map((c) => (
                <tr key={c.city} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-orange-50 text-[#ea580c] flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <span>{c.city}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900">{c.totalRequirements} total</div>
                    <div className="text-xs text-orange-600 font-medium">{c.openRequirements} open for bids</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900">{c.totalBookings} booked</div>
                    <div className="text-xs text-blue-600 font-medium">{c.activeBookings} active escrow</div>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    ₹{c.totalGMV.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-700">
                    ₹{c.totalCommissionEarned.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900">{c.totalProviders} vendors</div>
                    <div className="text-xs text-emerald-600 font-medium">{c.verifiedProviders} KYC verified</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => navigate('requirements')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-orange-50 text-slate-700 hover:text-[#ea580c] border border-slate-200 hover:border-orange-200 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
                    >
                      View City
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Quick Administrative Control Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('requirements')}
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f95724] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#f95724] transition-colors" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#f95724] transition-colors">
              Live Requests & Bidding
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspect active reverse bids, host budgets, and competitive discounts.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Explore Requirements</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        <div
          onClick={() => navigate('users')}
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              User Directory & Roles
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage accounts for hosts, verified vendors, and administrators.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>View All Accounts</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        <div
          onClick={() => navigate('logs')}
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Audit & Ledger Logs
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review platform payout transfers, refunds, and administrative actions.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Inspect Transactions</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
