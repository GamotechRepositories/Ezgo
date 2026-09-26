import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  RefreshCw, 
  DollarSign, 
  Plus
} from 'lucide-react';
import type { AdminMetrics, Booking, Category, User } from '../types';

interface AdminViewProps {
  metrics: AdminMetrics | null;
  bookings: Booking[];
  categories: Category[];
  providers: User[];
  onVerifyProvider: (providerId: string, isVerified: boolean) => Promise<void>;
  onAddCategory: (category: Partial<Category>) => Promise<void>;
  onResetSeedData: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  metrics,
  bookings,
  categories,
  providers,
  onVerifyProvider,
  onAddCategory,
  onResetSeedData,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'verifications' | 'bookings' | 'categories'>('metrics');
  const [newCatName, setNewCatName] = useState('');
  const [newCatPrice, setNewCatPrice] = useState('₹5,000 - ₹30,000');

  const pendingProviders = providers.filter((p) => p.role === 'provider' && !p.isVerified);
  const verifiedProviders = providers.filter((p) => p.role === 'provider' && p.isVerified);

  const totalGMV = bookings.reduce((acc, b) => acc + (b.totalPaid || 0), 0);
  const totalCommission = bookings.reduce((acc, b) => acc + (b.platformFee || 0), 0);
  const totalPayouts = bookings.reduce((acc, b) => acc + (b.status === 'COMPLETED' ? (b.bidAmount || 0) : 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Admin Operations Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Platform Control & Auditing • PRD Section 6.3</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              EzGo Operations & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Escrow Commission Audit
              </span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Monitor real-time reverse bidding volume, audit 10% platform fee commission earnings, verify vendor KYC, and oversee booking state transitions.
            </p>
          </div>

          <button
            onClick={onResetSeedData}
            className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Reset Demo DB & Seed</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Platform GMV</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-white">
              ₹{(metrics?.totalGMV || totalGMV).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Escrow throughput</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">10% Commission Retained</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-emerald-400">
              ₹{(metrics?.totalCommissionEarned || totalCommission).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Net EzGo Platform Revenue</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Vendor Payouts Released</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-purple-400">
              ₹{(metrics?.totalPayoutsReleased || totalPayouts).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">0% vendor deduction applied</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">KYC Verification Queue</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-amber-400">
              {pendingProviders.length} Pending
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {verifiedProviders.length} Active Verified Vendors
            </span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'metrics'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Bookings & Escrow Flow
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <span>Vendor KYC Approvals</span>
          {pendingProviders.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono">
              {pendingProviders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'categories'
              ? 'bg-purple-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Manage Categories ({categories.length})
        </button>
      </div>

      {/* TAB 1: BOOKINGS & ESCROW FLOW */}
      {activeTab === 'metrics' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <h3 className="text-base font-bold text-white mb-4">Live Booking State Machine</h3>
          
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Requester</th>
                <th className="py-3 px-4 font-semibold">Provider</th>
                <th className="py-3 px-4 font-semibold">State Machine</th>
                <th className="py-3 px-4 font-semibold">Bid Amount</th>
                <th className="py-3 px-4 font-semibold">10% Fee</th>
                <th className="py-3 px-4 font-semibold">Total Held</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No active bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-300">{b._id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 px-4 text-white font-sans">{b.requesterId?.name}</td>
                    <td className="py-3 px-4 text-white font-sans">{b.providerId?.businessName || b.providerId?.name}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'COMPLETED'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : b.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">₹{b.bidAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-amber-400">+₹{b.platformFee?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-cyan-300 font-bold">₹{b.totalPaid?.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: VENDOR KYC APPROVALS */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4">Vendor Verification Queue (RBI & Marketplace KYC)</h3>
            
            <div className="space-y-3">
              {providers.filter((p) => p.role === 'provider').map((p) => (
                <div
                  key={p._id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{p.businessName || p.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.isVerified
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.isVerified ? 'KYC Verified' : 'Awaiting Approval'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Categories: {p.categories?.join(', ') || 'Event Services'} • Area: {p.serviceArea || 'Hyderabad'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.isVerified ? (
                      <button
                        onClick={() => onVerifyProvider(p._id, false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                      >
                        Revoke Verification
                      </button>
                    ) : (
                      <button
                        onClick={() => onVerifyProvider(p._id, true)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Verify</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Active Service Categories ({categories.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {categories.map((c) => (
                <div key={c._id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[11px] text-slate-400">{c.description || 'Verified event service'}</span>
                  </div>
                  <span className="font-mono text-amber-400 font-semibold">{c.avgPriceRange}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Add Expandable Category (PRD Section 4)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category Title</label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Wedding Cars / Baraat Horses"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Average Price Range</label>
                <input
                  type="text"
                  placeholder="e.g. ₹10,000 - ₹50,000"
                  value={newCatPrice}
                  onChange={(e) => setNewCatPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={async () => {
                  if (!newCatName) return;
                  await onAddCategory({ name: newCatName, avgPriceRange: newCatPrice, isActive: true });
                  setNewCatName('');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Service Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
