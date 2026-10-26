import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Phone,
  MessageCircle,
  Star,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  X,
  Search,
  Lock,
  Info,
  Wallet
} from 'lucide-react';
import type { Booking, Category } from '../types';
import { api, type PaymentHistoryItem } from '../services/api';
import { VendorProfileModal } from './VendorProfileModal';

type Tab = 'all' | 'current' | 'to_pay' | 'finished' | 'cancelled' | 'payments';

interface MyBookingsPageProps {
  bookings: Booking[];
  categories: Category[];
  selectedCity?: string;
  onBack: () => void;
  onOpenPostModal: (initialCategory?: string) => void;
  onOpenPaymentModal: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onCompleteBooking: (bookingId: string) => Promise<void>;
  onOpenReviewModal: (booking: Booking) => void;
  onRaiseDispute?: (bookingId: string, reason: string) => Promise<void>;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80';

const rupees = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;

const formatDate = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const phoneDigits = (phone?: string) => (phone || '').replace(/[^0-9]/g, '');

const isFinished = (b: Booking) => b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED';

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  bookings = [],
  categories = [],
  onBack,
  onOpenPostModal,
  onOpenPaymentModal,
  onCancelBooking,
  onCompleteBooking,
  onOpenReviewModal,
  onRaiseDispute,
}) => {
  const toPay = useMemo(() => bookings.filter((b) => b.status === 'AWAITING_PAYMENT'), [bookings]);
  const upcoming = useMemo(() => bookings.filter((b) => b.status === 'ACTIVE'), [bookings]);
  const disputed = useMemo(() => bookings.filter((b) => b.status === 'DISPUTED'), [bookings]);
  const finished = useMemo(() => bookings.filter(isFinished), [bookings]);
  const cancelled = useMemo(() => bookings.filter((b) => b.status === 'CANCELLED'), [bookings]);

  const totalEscrowHeld = useMemo(() => upcoming.reduce((sum, b) => sum + (b.totalPaid || 0), 0), [upcoming]);
  const totalCompletedSpend = useMemo(() => finished.reduce((sum, b) => sum + (b.totalPaid || 0), 0), [finished]);

  const [tab, setTab] = useState<Tab>(() => {
    if (toPay.length > 0) return 'to_pay';
    if (upcoming.length > 0) return 'current';
    return 'all';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [disputeBookingModal, setDisputeBookingModal] = useState<Booking | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [profileBooking, setProfileBooking] = useState<Booking | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      setHistoryLoading(true);
      try {
        const rows = await api.getPaymentHistory();
        if (live) setPaymentHistory(Array.isArray(rows) ? rows : []);
      } catch {
        if (live) setPaymentHistory([]);
      } finally {
        if (live) setHistoryLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [bookings]);

  const disputeReasonsPreset = [
    'Vendor did not arrive at venue',
    'Major delay / critical ceremony missed',
    'Defective, damaged or incomplete equipment',
    'Demanding extra cash above agreed bid',
    'Unprofessional crew / non-fulfillment'
  ];

  const handleOpenDispute = (b: Booking) => {
    setDisputeBookingModal(b);
    setDisputeReasonText('');
  };

  const handleConfirmDispute = async () => {
    if (!disputeBookingModal || !disputeReasonText.trim()) return;
    if (!onRaiseDispute) return;
    setSubmittingDispute(true);
    try {
      await onRaiseDispute(disputeBookingModal._id, disputeReasonText.trim());
      setDisputeBookingModal(null);
    } catch {
      // toast handled in parent
    } finally {
      setSubmittingDispute(false);
    }
  };

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  };

  const imageFor = (b: Booking) => {
    const req = b.requirementId;
    if (req?.imageUrl) return req.imageUrl;
    const cat = categories.find((c) => c.name.toLowerCase() === (req?.category || '').toLowerCase());
    return cat?.image || FALLBACK_IMAGE;
  };

  const vendorName = (b: Booking) => b.providerId?.businessName || b.providerId?.name || 'Verified Vendor';

  // Filtered List based on tab and search
  const filteredBookings = useMemo(() => {
    let baseList: Booking[] = [];
    switch (tab) {
      case 'current':
        baseList = [...upcoming, ...disputed];
        break;
      case 'to_pay':
        baseList = toPay;
        break;
      case 'finished':
        baseList = finished;
        break;
      case 'cancelled':
        baseList = cancelled;
        break;
      case 'all':
      default:
        baseList = [...toPay, ...upcoming, ...disputed, ...finished, ...cancelled];
        break;
    }

    if (!searchQuery.trim()) return baseList;
    const q = searchQuery.toLowerCase();
    return baseList.filter((b) => {
      const titleMatch = (b.requirementId?.title || '').toLowerCase().includes(q);
      const catMatch = (b.requirementId?.category || '').toLowerCase().includes(q);
      const vendorMatch = vendorName(b).toLowerCase().includes(q);
      const cityMatch = (b.requirementId?.location?.city || '').toLowerCase().includes(q);
      return titleMatch || catMatch || vendorMatch || cityMatch;
    });
  }, [tab, upcoming, disputed, toPay, finished, cancelled, searchQuery]);

  const tabs: { id: Tab; label: string; count: number; color?: string }[] = [
    { id: 'all', label: 'All Bookings', count: bookings.length },
    { id: 'current', label: 'Confirmed (In Escrow)', count: upcoming.length + disputed.length, color: 'text-emerald-700' },
    { id: 'to_pay', label: 'Awaiting Payment', count: toPay.length, color: 'text-amber-700' },
    { id: 'finished', label: 'Completed', count: finished.length },
    { id: 'cancelled', label: 'Cancelled', count: cancelled.length },
    { id: 'payments', label: 'Payment history', count: paymentHistory.length, color: 'text-orange-700' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-24 sm:pt-28 pb-20">
      
      {/* Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER & BREADCRUMB NAVIGATION                                    */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-4 border-b border-orange-100">
          <div>
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#f95724] transition mb-3 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-[#f95724] group-hover:bg-orange-50 transition">
                <ArrowLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#f95724]" />
              </div>
              <span>Back to Marketplace</span>
            </button>

            <div className="flex items-center gap-2.5">
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                My Bookings & <span className="text-[#f95724]">Escrow Vault</span>
              </h1>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              Manage your confirmed vendors, access direct contact info, and release payouts safely after your event completes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenPostModal()}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#f95724] to-orange-500 hover:from-[#e04818] hover:to-[#f95724] text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer transition active:scale-95 whitespace-nowrap min-h-[46px]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Post New Requirement</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. STATS OVERVIEW CARDS                                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          
          {/* Card 1: Confirmed Active in Escrow */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Active in Escrow</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {upcoming.length} <span className="text-xs font-semibold text-slate-500">events</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{rupees(totalEscrowHeld)} secured in vault</span>
            </div>
          </div>

          {/* Card 2: Awaiting Payment */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-200/80 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Payment Pending</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {toPay.length} <span className="text-xs font-semibold text-slate-500">bids won</span>
            </div>
            <div className="text-[11px] font-semibold text-amber-800 mt-1">
              {toPay.length > 0 ? 'Pay to confirm & reveal vendor contacts' : 'All bids paid & confirmed'}
            </div>
          </div>

          {/* Card 3: Completed Events */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Delivered Events</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {finished.length} <span className="text-xs font-semibold text-slate-500">completed</span>
            </div>
            <div className="text-[11px] font-semibold text-indigo-700 mt-1">
              {rupees(totalCompletedSpend)} total fulfilled
            </div>
          </div>

          {/* Card 4: Escrow Protection Guarantee */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-orange-500 to-[#e04818] text-white shadow-md shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-orange-100 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>100% ESCROW</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                Guaranteed
              </span>
            </div>
            <div className="mt-2">
              <div className="text-sm font-black leading-tight">Zero Risk Payments</div>
              <p className="text-[11px] text-orange-100/90 mt-0.5 leading-relaxed font-medium">
                Vendor is paid ONLY after your event is done & you approve.
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. TABS AND SEARCH FILTER BAR                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vendor, title or city..."
              className="w-full pl-9 pr-8 py-2.5 bg-white rounded-full border border-slate-200/90 text-xs sm:text-sm focus:outline-none focus:border-[#f95724] shadow-2xs placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. BOOKINGS LIST OR EMPTY STATE                                           */}
        {/* ========================================================================= */}
        {tab === 'payments' ? (
          <div className="space-y-4">
            <div className="rounded-3xl bg-white border border-slate-200/90 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#f95724] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-slate-900">Saved payments</div>
                  <div className="text-xs font-semibold text-slate-500">Every escrow payment stays in your history.</div>
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">
                {rupees(paymentHistory.filter((p) => p.type === 'PAYMENT_HELD_ESCROW' && p.status === 'SUCCESS').reduce((sum, p) => sum + (p.amount || 0), 0))}
              </div>
            </div>
            {historyLoading && paymentHistory.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-slate-200/90 p-12 text-center text-sm font-semibold text-slate-500">
                Loading payment history...
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-slate-200/90 p-12 text-center space-y-2">
                <h3 className="font-editorial text-2xl font-black text-slate-900">No payments yet</h3>
                <p className="text-sm text-slate-600">Pay an accepted bid to save the first escrow receipt here.</p>
              </div>
            ) : (
              paymentHistory.map((item) => (
                <div key={item._id} className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-900">{item.label}</div>
                      <div className="text-xs font-semibold text-slate-600">{item.eventTitle}</div>
                    </div>
                    <div className="text-base font-black text-slate-900">{rupees(item.amount)}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : ''}
                    {item.vendorName && item.vendorName !== 'Vendor locked' ? ` · ${item.vendorName}` : ''}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[item.status, item.method, (item.escrowStatus || '').replaceAll('_', ' '), item.referenceId]
                      .filter(Boolean)
                      .map((chip, idx) => (
                        <span key={`${chip}-${idx}`} className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600">
                          {chip}
                        </span>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-200/90 p-12 sm:p-16 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-orange-100/70 text-[#f95724] flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-editorial text-2xl font-black text-slate-900">
                {searchQuery ? 'No matching bookings found' : tab === 'to_pay' ? 'No pending payments!' : 'No bookings in this category'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No bookings match "${searchQuery}". Try clearing your search.`
                  : 'Post a requirement for your event, review competing bids from local verified vendors, and confirm your favorite.'}
              </p>
            </div>
            <button
              onClick={() => onOpenPostModal()}
              className="mt-2 px-6 py-3 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 inline-flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post Event Requirement</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((b) => {
              const isPaid = b.status === 'ACTIVE';
              const isAwaitingPay = b.status === 'AWAITING_PAYMENT';
              const isDisputed = b.status === 'DISPUTED';
              const isDone = isFinished(b);
              const isCancelled = b.status === 'CANCELLED';
              const phone = phoneDigits(b.providerId?.phone);
              const busy = busyId === b._id;
              const req = b.requirementId;

              return (
                <article
                  key={b._id}
                  className="bg-white rounded-3xl sm:rounded-[32px] border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 overflow-hidden"
                >
                  
                  {/* Card Top Banner Bar */}
                  <div className="px-5 sm:px-7 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      {/* Category Badge */}
                      <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                        🏷️ {req?.category || 'Event Service'}
                      </span>

                      {/* City Tag */}
                      {req?.location?.city && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          <span>{req.location.city}</span>
                        </span>
                      )}

                      <span className="text-slate-300 hidden sm:inline">•</span>

                      {/* Booking ID */}
                      <span className="text-[11px] font-mono text-slate-600">
                        ID: #{b._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isAwaitingPay && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                          <span>Action Needed: Pay to Lock Vendor</span>
                        </span>
                      )}

                      {isPaid && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Confirmed • Escrow Protected</span>
                        </span>
                      )}

                      {isDisputed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-xs font-black shadow-2xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Dispute Raised • Funds Held</span>
                        </span>
                      )}

                      {isDone && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-black shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Completed • Payout Released</span>
                        </span>
                      )}

                      {isCancelled && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black">
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Cancelled</span>
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Card Main Body */}
                  <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    
                    {/* Left: Event Photo & Date Box (Col 1-4) */}
                    <div className="lg:col-span-4 space-y-3">
                      <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs group/img">
                        <img
                          src={imageFor(b)}
                          alt={req?.title || 'Event Booking'}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                        {/* Event Date Floating Badge */}
                        {req?.eventDate && (
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                            <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                              <Calendar className="w-3.5 h-3.5 text-amber-300" />
                              <span>{formatDate(req.eventDate)}</span>
                            </span>

                            {req?.timeWindow?.start && (
                              <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[11px]">
                                <Clock className="w-3 h-3 text-amber-300" />
                                <span>{req.timeWindow.start}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Center: Title, Vendor Profile & Contact (Col 5-8) */}
                    <div className="lg:col-span-5 space-y-4">
                      
                      {/* Title & Metadata */}
                      <div>
                        <h3 className="font-editorial text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                          {req?.title || 'Event Requirement Booking'}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                          {req?.location?.area && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{req.location.area}</span>
                            </span>
                          )}

                          {req?.guestCount && req.guestCount > 0 ? (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{req.guestCount} Guests</span>
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Vendor Card Details */}
                      <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Booked Provider
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Verified Provider
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {isPaid || isDone ? (
                            b.providerId?.avatar ? (
                              <img
                                src={b.providerId.avatar}
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-[#f95724] text-white font-black text-lg flex items-center justify-center shadow-xs">
                                {vendorName(b).charAt(0)}
                              </div>
                            )
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                              <Lock className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            {isPaid || isDone ? (
                              <button
                                type="button"
                                onClick={() => setProfileBooking(b)}
                                className="font-bold text-slate-900 text-sm sm:text-base truncate text-left cursor-pointer hover:text-orange-600"
                              >
                                {vendorName(b)}
                              </button>
                            ) : (
                              <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                Vendor locked until payment
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              {isPaid || isDone ? (
                                <>
                                  {b.providerId?.rating ? (
                                    <span className="flex items-center gap-0.5 font-bold text-amber-600">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                      <span>{b.providerId.rating}</span>
                                    </span>
                                  ) : null}
                                  <span>•</span>
                                  <span>{b.providerId?.completedJobs || 0} jobs completed</span>
                                </>
                              ) : (
                                <span>Pay escrow to unlock vendor profile and contact</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct Contact Buttons (Call & WhatsApp) */}
                        {b.isContactRevealed && phone ? (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                            <a
                              href={`tel:${phone}`}
                              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                            >
                              <Phone className="w-3.5 h-3.5 text-orange-400" />
                              <span>Call Vendor</span>
                            </a>
                            <a
                              href={`https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(`Hi, this is regarding my EzzyGo booking for ${req?.title || 'my event'}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-white" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        ) : (
                          <div className="text-[11px] font-semibold text-slate-500 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Phone & WhatsApp unlocked immediately after payment</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right: Payment Breakdown, Escrow & Action CTA (Col 9-12) */}
                    <div className="lg:col-span-3 space-y-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                      
                      {/* Price Summary */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          {isPaid ? 'Amount Paid' : 'Total Payable'}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                          {rupees(b.totalPaid || (b.bidAmount + (b.platformFee || 0)))}
                        </div>

                        <div className="mt-2 space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                          <div className="flex justify-between">
                            <span>Vendor Winning Bid:</span>
                            <span className="font-semibold text-slate-800">{rupees(b.bidAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee (10%):</span>
                            <span className="font-semibold text-slate-800">{rupees(b.platformFee)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Escrow Status Message */}
                      <div className="text-[11px] leading-relaxed rounded-xl p-2.5 bg-white border border-slate-200 text-slate-600 font-medium">
                        {isPaid && (
                          <div className="flex items-start gap-1.5 text-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Funds are locked in Escrow. Click below after your event to release payout.</span>
                          </div>
                        )}
                        {isAwaitingPay && (
                          <div className="flex items-start gap-1.5 text-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>Deposit into Escrow to lock vendor's calendar & get contacts.</span>
                          </div>
                        )}
                        {isDone && (
                          <div className="flex items-start gap-1.5 text-indigo-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span>Event marked completed. Payout released to vendor.</span>
                          </div>
                        )}
                        {isCancelled && (
                          <div className="flex items-start gap-1.5 text-slate-700">
                            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>This booking was cancelled.</span>
                          </div>
                        )}
                      </div>

                      {/* Action CTA Buttons */}
                      <div className="space-y-2 pt-1">
                        
                        {/* 1. If Awaiting Payment */}
                        {isAwaitingPay && (
                          <>
                            <button
                              disabled={busy}
                              onClick={() => onOpenPaymentModal(b)}
                              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Pay {rupees(b.totalPaid)} & Confirm</span>
                            </button>

                            <button
                              disabled={busy}
                              onClick={() => {
                                if (window.confirm('Cancel this accepted bid and return to open marketplace?')) {
                                  run(b._id, () => onCancelBooking(b._id));
                                }
                              }}
                              className="w-full py-2 text-rose-700 hover:text-rose-800 text-xs font-bold cursor-pointer transition text-center"
                            >
                              Decline & Choose Another Bid
                            </button>
                          </>
                        )}

                        {/* 2. If Active / Paid */}
                        {isPaid && (
                          <>
                            <button
                              onClick={() => setProfileBooking(b)}
                              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                            >
                              <span>View vendor profile</span>
                            </button>
                            <button
                              disabled={busy}
                              onClick={() =>
                                run(b._id, async () => {
                                  await onCompleteBooking(b._id);
                                  onOpenReviewModal(b);
                                })
                              }
                              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#f95724] to-orange-500 hover:from-[#e04818] hover:to-[#f95724] disabled:opacity-60 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Event Done • Release Payout</span>
                            </button>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                disabled={busy}
                                onClick={() => {
                                  if (window.confirm(`Cancel this booking? Full escrow refund of ${rupees(b.totalPaid)} will be processed.`)) {
                                    run(b._id, () => onCancelBooking(b._id));
                                  }
                                }}
                                className="py-2 px-2 text-rose-700 hover:bg-rose-50 rounded-lg text-[11px] font-bold border border-rose-200 transition cursor-pointer text-center"
                              >
                                Cancel & Refund
                              </button>

                              {onRaiseDispute && (
                                <button
                                  disabled={busy}
                                  onClick={() => handleOpenDispute(b)}
                                  className="py-2 px-2 text-amber-800 hover:bg-amber-50 rounded-lg text-[11px] font-bold border border-amber-300 transition cursor-pointer text-center flex items-center justify-center gap-1"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Raise Issue</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}

                        {/* 3. If Disputed */}
                        {isDisputed && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                            <div className="font-bold text-xs flex items-center gap-1 text-rose-800">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Mediation Active</span>
                            </div>
                            <p className="text-[11px] text-rose-700 leading-tight">
                              Reason: {b.disputeReason || 'Service dispute reported.'}
                            </p>
                          </div>
                        )}

                        {/* 4. If Completed */}
                        {isDone && (
                          <div className="space-y-2">
                            <button
                              onClick={() => setProfileBooking(b)}
                              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs border border-slate-200 cursor-pointer transition"
                            >
                              View vendor profile
                            </button>
                            {b.myRating ? (
                              <div className="py-2 px-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>You rated: {b.myRating} / 5</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => onOpenReviewModal(b)}
                                className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                              >
                                <Star className="w-3.5 h-3.5 fill-black text-black" />
                                <span>Leave Rating & Review</span>
                              </button>
                            )}

                            <button
                              onClick={() => onOpenPostModal(req?.category)}
                              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Book Similar Service</span>
                            </button>
                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* 4-Stage Visual Escrow Timeline Strip */}
                  <div className="px-5 sm:px-7 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs overflow-x-auto">
                    <div className="flex items-center gap-6 sm:gap-10 w-full min-w-[500px]">
                      
                      {/* Step 1 */}
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                          ✓
                        </div>
                        <span className="font-bold text-slate-900">Bid Accepted</span>
                      </div>

                      <div className="flex-1 h-[2px] bg-emerald-400" />

                      {/* Step 2 */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                            isPaid || isDone || isDisputed ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950 animate-pulse'
                          }`}
                        >
                          {isPaid || isDone || isDisputed ? '✓' : '2'}
                        </div>
                        <span className={`font-bold ${isPaid || isDone || isDisputed ? 'text-slate-900' : 'text-amber-700'}`}>
                          Escrow Deposit
                        </span>
                      </div>

                      <div className={`flex-1 h-[2px] ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />

                      {/* Step 3 */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                            isDone ? 'bg-emerald-500 text-white' : isPaid ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? '✓' : '3'}
                        </div>
                        <span className={`font-bold ${isDone ? 'text-slate-900' : isPaid ? 'text-orange-600' : 'text-slate-400'}`}>
                          Event Delivery
                        </span>
                      </div>

                      <div className={`flex-1 h-[2px] ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />

                      {/* Step 4 */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                            isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? '✓' : '4'}
                        </div>
                        <span className={`font-bold ${isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                          Payout Released
                        </span>
                      </div>

                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. DISPUTE MODAL DIALOG                                                   */}
      {/* ========================================================================= */}
      {disputeBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial font-black text-slate-900 text-lg">Report Event Issue / Dispute</h3>
                  <p className="text-xs text-slate-500 font-medium">Instantly freeze payout & request EzzyGo mediation</p>
                </div>
              </div>
              <button
                onClick={() => setDisputeBookingModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                If the vendor failed to arrive or delivered defective equipment, let us know immediately. The escrow payout of{' '}
                <strong className="text-slate-900">{rupees(disputeBookingModal.totalPaid)}</strong> will be locked in security until resolved.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Common issues:</label>
                <div className="flex flex-wrap gap-1.5">
                  {disputeReasonsPreset.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDisputeReasonText(r)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer font-medium ${
                        disputeReasonText === r
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Describe what happened:
                </label>
                <textarea
                  value={disputeReasonText}
                  onChange={(e) => setDisputeReasonText(e.target.value)}
                  placeholder="Provide specific details about vendor performance or issues during your event..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDisputeBookingModal(null)}
                disabled={submittingDispute}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispute}
                disabled={!disputeReasonText.trim() || submittingDispute}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/25"
              >
                {submittingDispute ? 'Submitting...' : 'Freeze Escrow & Open Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {profileBooking && (
        <VendorProfileModal booking={profileBooking} onClose={() => setProfileBooking(null)} />
      )}

    </div>
  );
};
