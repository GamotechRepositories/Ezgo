import React, { useState } from 'react';
import { 
  TrendingDown, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  Phone, 
  CheckCircle2, 
  Wallet, 
  Building, 
  ShieldCheck 
} from 'lucide-react';
import type { Requirement, Booking, User, Category } from '../types';

interface ProviderViewProps {
  requirements: Requirement[];
  myBids?: any[];
  myBookings: Booking[];
  currentUser: User;
  categories: Category[];
  onOpenBidModal: (req: Requirement) => void;
  onOpenExplainer?: () => void;
}

export const ProviderView: React.FC<ProviderViewProps> = ({
  requirements,
  myBookings,
  currentUser,
  categories,
  onOpenBidModal,
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'active-gigs' | 'wallet'>('leads');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter open requirements
  const openLeads = requirements.filter(
    (r) => r.status === 'OPEN' && (selectedCategory === 'ALL' || r.category === selectedCategory)
  );

  const activeGigs = myBookings.filter((b) => b.status === 'ACTIVE');
  const completedGigs = myBookings.filter((b) => b.status === 'COMPLETED');
  const totalEarnings = completedGigs.reduce((acc, b) => acc + (b.bidAmount || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Provider Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Provider Portal • 0% Vendor Commission Guarantee</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Win High-Value Event Gigs. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Keep 100% of Your Quoted Bid.
              </span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Browse live leads in Hyderabad & surrounding areas. Place competitive reverse bids below client budgets. On completion, receive your full bid amount directly in your bank account with zero deductions.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Earned</span>
              <span className="font-mono text-xl font-black text-emerald-400">₹{totalEarnings.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Completed Gigs</span>
              <span className="font-mono text-xl font-black text-violet-400">{currentUser.completedJobs || completedGigs.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <span>Live Leads Feed</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/20 font-mono">
              {openLeads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active-gigs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'active-gigs'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <span>Active Confirmed Gigs</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/20 font-mono">
              {activeGigs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'wallet'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Payout Wallet & KYC</span>
          </button>
        </div>

        {/* Category Filter */}
        {activeTab === 'leads' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* TAB 1: LIVE LEADS FEED */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {openLeads.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Open Leads in this Category</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Try switching the category filter or check back soon as new event requirements are posted regularly.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {openLeads.map((req) => (
                <div
                  key={req._id}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition duration-200 flex flex-col justify-between shadow-lg shadow-black/20"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {req.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {req.eventDate}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                      {req.title}
                    </h3>

                    {req.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {req.description}
                      </p>
                    )}

                    {/* Event Specs */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 mb-5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {req.location.area}, {req.location.city}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {req.timeWindow.start} - {req.timeWindow.end}
                      </span>
                    </div>

                    {/* Reverse Bidding Threshold Card */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-3 mb-5">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                          Client Posted Budget
                        </span>
                        <span className="font-mono text-base font-bold text-white">
                          ₹{req.budget.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-400 uppercase font-semibold block mb-0.5">
                          Target Eligible Bid (≥15% OFF)
                        </span>
                        <span className="font-mono text-base font-bold text-amber-400">
                          ≤ ₹{req.maxAcceptableBid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Place Bid CTA */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      {req.bidsCount || 0} competitor bids placed
                    </span>

                    <button
                      onClick={() => onOpenBidModal(req)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-violet-500/25 flex items-center gap-1.5"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Place Reverse Bid</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE CONFIRMED GIGS */}
      {activeTab === 'active-gigs' && (
        <div className="space-y-4">
          {activeGigs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Active Gigs Right Now</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                When a client accepts your bid and deposits funds into Escrow, the job and client contact info will unlock here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {activeGigs.map((g) => (
                <div
                  key={g._id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl shadow-emerald-500/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Escrow Funded • Confirmed Booking</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ₹{g.bidAmount.toLocaleString()} Guaranteed
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {g.requirementId?.title || 'Confirmed Event Gig'}
                    </h3>

                    {/* Unlocked Requester Contact */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                            Client Contact
                          </span>
                          <span className="font-bold text-sm text-white">
                            {g.requesterId?.name}
                          </span>
                          <span className="font-mono text-xs text-emerald-400 block mt-0.5">
                            {g.requesterId?.phone}
                          </span>
                        </div>

                        <a
                          href={`tel:${g.requesterId?.phone}`}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Client</span>
                        </a>
                      </div>
                    </div>

                    {/* Venue & Timing */}
                    <div className="space-y-1.5 text-xs text-slate-300 mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Date: <strong className="text-white">{g.requirementId?.eventDate}</strong> ({g.requirementId?.timeWindow?.start} - {g.requirementId?.timeWindow?.end})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Venue: {g.requirementId?.location?.venueAddress || `${g.requirementId?.location?.area}, ${g.requirementId?.location?.city}`}</span>
                      </div>
                    </div>

                  </div>

                  {/* Payout Guarantee Banner */}
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300">
                    <strong>Payout Ready:</strong> Full amount of ₹{g.bidAmount.toLocaleString()} is locked in Escrow. It will be credited immediately to your bank once the client marks the event complete.
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WALLET & KYC */}
      {activeTab === 'wallet' && (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Bank & Payout Setup Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Registered Bank / UPI Account</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                RBI Compliant KYC
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400 font-sans">Account Holder:</span>
                <span className="text-white font-bold">{currentUser.bankDetails?.accountHolder || currentUser.name}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400 font-sans">Account Number:</span>
                <span className="text-white font-bold">{currentUser.bankDetails?.accountNumber || '••••••••8921'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400 font-sans">IFSC Code:</span>
                <span className="text-white font-bold">{currentUser.bankDetails?.ifscCode || 'HDFC0001234'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400 font-sans">Payout UPI ID:</span>
                <span className="text-emerald-400 font-bold">{currentUser.bankDetails?.upiId || 'rajesh.events@okaxis'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 text-xs text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Razorpay Route / Cashfree Split payouts are automatically disbursed within 15 minutes of job completion.</span>
            </div>
          </div>

          {/* Earnings Summary Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Earnings & Commission Breakdown</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Payouts Received:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">₹{totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Platform Commission Deducted:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">₹0 (0% Provider Charge)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Escrow Success Rate:</span>
                  <span className="font-mono text-base font-bold text-white">100%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mt-6">
              <strong>EzGo Promise:</strong> As per PRD Section 5, the 10% platform fee is paid exclusively by the requester. Providers never pay any commission fee.
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
