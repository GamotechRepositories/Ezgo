import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  Star,
  ArrowRight,
  CreditCard,
  Check
} from 'lucide-react';
import type { Requirement, Booking, User } from '../types';

interface RequesterViewProps {
  requirements: Requirement[];
  bookings: Booking[];
  currentUser: User;
  onOpenPostModal: () => void;
  onAcceptBid: (requirementId: string, bidId: string) => Promise<void>;
  onOpenPaymentModal: (booking: Booking) => void;
  onCompleteBooking: (bookingId: string) => Promise<void>;
  onOpenReviewModal: (booking: Booking) => void;
  onOpenExplainer: () => void;
}

export const RequesterView: React.FC<RequesterViewProps> = ({
  requirements,
  bookings,
  onOpenPostModal,
  onAcceptBid,
  onOpenPaymentModal,
  onCompleteBooking,
  onOpenReviewModal,
  onOpenExplainer,
}) => {
  const [activeTab, setActiveTab] = useState<'open' | 'active' | 'completed'>('open');
  const [selectedReqForBids, setSelectedReqForBids] = useState<Requirement | null>(null);

  const openReqs = requirements.filter((r) => r.status === 'OPEN' || r.status === 'ACCEPTED');
  const activeBookings = bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'AWAITING_PAYMENT');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="space-y-8">
      
      {/* Hero Action Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reverse Bidding • Guaranteed ≥15% Savings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Post Your Event Need. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Watch Providers Compete.
              </span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Set your budget for DJ, Catering, Decor, Purohit or Photography. Providers bid lower to win your event. Funds are locked in RBI-compliant Escrow until you confirm completion.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenExplainer}
              className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>How 15% Rule Works</span>
            </button>

            <button
              onClick={onOpenPostModal}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm transition shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Post Event Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'open'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <span>Open Requirements</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/20 font-mono">
              {openReqs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <span>Active Bookings (Escrow)</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/20 font-mono">
              {activeBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <span>Completed & History</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/20 font-mono">
              {completedBookings.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: OPEN REQUIREMENTS */}
      {activeTab === 'open' && (
        <div className="space-y-4">
          {openReqs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Open Requirements</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                Post your wedding or festival requirement to receive competitive reverse bids from verified vendors.
              </p>
              <button
                onClick={onOpenPostModal}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Post Your First Requirement
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {openReqs.map((req) => (
                <div
                  key={req._id}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition duration-200 flex flex-col justify-between shadow-lg shadow-black/20"
                >
                  <div>
                    {/* Header Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
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

                    {/* Location & Time Window */}
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

                    {/* Budget Metrics Card */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-3 mb-5">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                          Posted Budget
                        </span>
                        <span className="font-mono text-base font-bold text-white">
                          ₹{req.budget.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-400 uppercase font-semibold block mb-0.5">
                          15% Max Acceptable
                        </span>
                        <span className="font-mono text-base font-bold text-amber-400">
                          ≤ ₹{req.maxAcceptableBid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200">
                        {req.bidsCount || (req.bids?.length || 0)} Bids Placed
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedReqForBids(req)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Review Bids</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE BOOKINGS (ESCROW & CONTACT UNLOCKED) */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeBookings.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Active Bookings</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                When you accept an eligible bid and pay into Escrow, your active booking will appear here with revealed vendor contact.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {activeBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl shadow-emerald-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        b.status === 'AWAITING_PAYMENT'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5'
                      }`}>
                        {b.status === 'AWAITING_PAYMENT' ? '⚠️ Payment Pending' : ' Escrow Active • Confirmed'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {b.paymentDetails?.transactionId || 'Awaiting Payment'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {b.requirementId?.title || 'Event Booking'}
                    </h3>

                    {/* Revealed Contact Card */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={b.providerId?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                          alt={b.providerId?.name}
                          className="w-11 h-11 rounded-full object-cover border border-emerald-500/40"
                        />
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{b.providerId?.businessName || b.providerId?.name}</span>
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              ★ {b.providerId?.rating || 4.9}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{b.providerId?.serviceArea || 'Hyderabad'}</p>
                        </div>
                      </div>

                      {b.status === 'ACTIVE' && (
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                                Direct Contact Unlocked
                              </span>
                              <span className="font-mono text-sm font-bold text-white">
                                {b.providerId?.phone}
                              </span>
                            </div>
                          </div>

                          <a
                            href={`https://wa.me/${b.providerId?.phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center mb-5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Accepted Bid</span>
                        <span className="font-mono font-bold text-white">₹{b.bidAmount?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">10% Platform Fee</span>
                        <span className="font-mono font-bold text-amber-400">₹{b.platformFee?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total in Escrow</span>
                        <span className="font-mono font-bold text-emerald-400">₹{b.totalPaid?.toLocaleString()}</span>
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                    {b.status === 'AWAITING_PAYMENT' ? (
                      <button
                        onClick={() => onOpenPaymentModal(b)}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay ₹{b.totalPaid?.toLocaleString()} to Confirm & Unlock Contact</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onCompleteBooking(b._id)}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Service Delivered? Mark Complete & Release Payout</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED & HISTORY */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedBookings.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
              <Check className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Completed Bookings Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Completed bookings and payouts will be archived here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {completedBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed & Payout Released</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {b.payoutDetails?.transferId || 'PAID'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">
                      {b.requirementId?.title || 'Event Service'}
                    </h3>

                    <p className="text-xs text-slate-400 mb-4">
                      Delivered by <strong className="text-slate-200">{b.providerId?.businessName || b.providerId?.name}</strong>. Payout of ₹{b.bidAmount?.toLocaleString()} released to vendor's registered bank account.
                    </p>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono mb-4">
                      <span className="text-slate-400 font-sans">Final Invoice Total:</span>
                      <span className="text-white font-bold">₹{b.totalPaid?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => onOpenReviewModal(b)}
                      className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rate & Review Vendor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BIDS REVIEW DRAWER / MODAL */}
      {selectedReqForBids && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95">
            
            <button
              onClick={() => setSelectedReqForBids(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {selectedReqForBids.category}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedReqForBids.location.area}, {selectedReqForBids.location.city}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedReqForBids.title}</h2>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span>Posted Budget: <strong className="text-white font-mono">₹{selectedReqForBids.budget.toLocaleString()}</strong></span>
                <span>15% Eligible Threshold: <strong className="text-amber-400 font-mono">≤ ₹{selectedReqForBids.maxAcceptableBid.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* 15% Rule Alert Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mb-6 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Server-Enforced 15% Rule:</strong> To protect your savings, only bids that offer at least 15% discount below your budget can be accepted. Vendor phone numbers are locked until payment is secured in Escrow.
              </div>
            </div>

            {/* Bids List */}
            <div className="space-y-4">
              {(!selectedReqForBids.bids || selectedReqForBids.bids.length === 0) ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No bids have been submitted yet. Verified vendors are reviewing your requirement!
                </div>
              ) : (
                selectedReqForBids.bids.map((bid) => {
                  const isEligible = bid.amount <= selectedReqForBids.maxAcceptableBid;
                  const discountPercent = Math.round(
                    ((selectedReqForBids.budget - bid.amount) / selectedReqForBids.budget) * 100
                  );
                  const platformFee = Math.round(bid.amount * 0.10);
                  const totalPayable = bid.amount + platformFee;

                  return (
                    <div
                      key={bid._id}
                      className={`p-5 rounded-2xl border transition ${
                        isEligible
                          ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/40 border-rose-500/20 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Provider Info (Anonymized Phone) */}
                        <div className="flex items-start gap-3">
                          <img
                            src={bid.providerId?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                            alt={bid.providerId?.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white">
                                {bid.providerId?.businessName || bid.providerId?.name}
                              </h4>
                              {bid.providerId?.isVerified && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 rounded">
                                  KYC Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {bid.providerId?.rating || 4.9} ({bid.providerId?.reviewCount || 0} reviews)
                              </span>
                              <span>•</span>
                              <span>{bid.providerId?.completedJobs || 0} Jobs Done</span>
                              <span>•</span>
                              <span className="text-slate-500 italic">Phone hidden until payment</span>
                            </div>
                          </div>
                        </div>

                        {/* Bid Amount & Eligibility Badge */}
                        <div className="text-right shrink-0">
                          <div className="font-mono text-xl font-black text-white">
                            ₹{bid.amount.toLocaleString()}
                          </div>
                          <div className={`text-xs font-bold mt-0.5 ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isEligible ? ` ${discountPercent}% OFF (Eligible)` : `❌ ${discountPercent}% OFF (< 15% Rule)`}
                          </div>
                        </div>

                      </div>

                      {/* Proposal Details */}
                      {bid.proposalNotes && (
                        <div className="mt-4 text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                          <strong className="text-slate-400 block mb-0.5">Proposal Inclusions:</strong>
                          {bid.proposalNotes}
                        </div>
                      )}

                      {/* Equipment Specs */}
                      {bid.equipmentDetails && (
                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                          <strong className="text-slate-500">Gear:</strong>
                          <span>{bid.equipmentDetails}</span>
                        </div>
                      )}

                      {/* Fee Breakdown & Accept Action */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-slate-400">
                          Total with 10% Escrow Fee: <strong className="text-cyan-300 font-mono">₹{totalPayable.toLocaleString()}</strong>
                        </div>

                        {isEligible ? (
                          <button
                            onClick={async () => {
                              await onAcceptBid(selectedReqForBids._id, bid._id);
                              setSelectedReqForBids(null);
                            }}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold transition shadow-md shadow-amber-500/20"
                          >
                            Accept Bid & Proceed to Pay
                          </button>
                        ) : (
                          <span className="text-rose-400 font-semibold italic text-xs">
                            Ineligible: Must be ≥15% below budget (≤ ₹{selectedReqForBids.maxAcceptableBid.toLocaleString()})
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
