import React from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  ShieldCheck, 
  Users, 
  Flame, 
  CheckCircle2, 
  ArrowUpRight,
  Layers,
  Sparkles
} from 'lucide-react';
import type { AdminMetrics } from '../types';

interface PlatformMetricsViewProps {
  metrics: AdminMetrics;
}

export const PlatformMetricsView: React.FC<PlatformMetricsViewProps> = ({ metrics }) => {
  const gmv = metrics?.totalGMV || 0;
  const commission = metrics?.totalCommissionEarned || 0;
  const escrowHeld = metrics?.totalEscrowHeld || 0;
  const totalProviders = metrics?.totalProviders || 0;
  const pendingKyc = metrics?.pendingVerificationCount || 0;
  const totalReqs = metrics?.totalRequirements || 0;
  const activeBookings = metrics?.activeBookings || 0;
  const completedBookings = metrics?.completedBookings || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-100/40 border border-amber-200/80 p-6 sm:p-10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f95724]/10 border border-[#f95724]/20 text-[#f95724] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXECUTIVE PLATFORM SUMMARY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            EzGo Marketplace Health & Financials
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Real-time tracking of Gross Merchandise Value (GMV), 10% platform take-rate commission, live reverse bidding auctions, and escrow safety.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Take Rate</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">10.0% Flat</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Marketplace GMV</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#f95724]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            ₹{gmv.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.8% vs last month</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Platform Commission (10%)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            ₹{commission.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">100% net revenue retained</div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Escrow In Custody</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
            ₹{escrowHeld.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Safely locked in nodal escrow</div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Verified Pro Vendors</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalProviders}
          </div>
          <div className="text-[11px] text-[#f95724] font-semibold">
            {pendingKyc} applications pending KYC
          </div>
        </div>

      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Demand Postings Broadcasted</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{totalReqs} Events</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Direct reverse-bids generated across Sound, Photography, Mandap, and Buffets.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Active Ongoing Bookings</span>
          </div>
          <div className="text-3xl font-black text-blue-700 font-mono">{activeBookings} Gigs</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Confirmed events with full escrow funded awaiting execution and provider payout.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Completed & Paid Out</span>
          </div>
          <div className="text-3xl font-black text-emerald-700 font-mono">{completedBookings} Completed</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Successfully delivered events with zero payment disputes and 5-star host feedback.
          </p>
        </div>

      </div>

      {/* Platform Operational Lifecycle Flow */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#f95724] uppercase">
              TRI-PARTY MARKETPLACE WORKFLOW
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              How EzGo Connects Hosts, Vendors & Escrow
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            100% Automated • Zero Payment Default Risk
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-[#f95724] text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[10px] font-mono text-slate-400">HOST POST</span>
            </div>
            <h4 className="text-xs font-bold text-white">Host Broadcasts Event</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Customer defines category, city, date, and max budget ceiling.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[10px] font-mono text-slate-400">REVERSE AUCTION</span>
            </div>
            <h4 className="text-xs font-bold text-white">Vendors Bid Down (≤85%)</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verified providers submit quotes with equipment checklist to win the job.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[10px] font-mono text-slate-400">NODAL ESCROW</span>
            </div>
            <h4 className="text-xs font-bold text-white">100% Escrow Deposited</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Host deposits funds into EzGo Escrow. Phone contact is unmasked instantly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <span className="text-[10px] font-mono text-slate-400">DISBURSEMENT</span>
            </div>
            <h4 className="text-xs font-bold text-white">Execution & 10% Retainage</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Host signs off. Vendor receives payout and EzGo retains 10% platform fee.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};