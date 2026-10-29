import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  MapPin,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Users,
  WifiOff,
  Zap,
} from 'lucide-react';
import type { Requirement } from '../types';

const FILTERS = ['All', 'Open', 'With bids', 'Booked', 'Closed'] as const;

interface MyEventsPageProps {
  requirements: Requirement[];
  onOpenPostModal: () => void;
  onAcceptBid: (requirementId: string, bidId: string) => Promise<void>;
  onOpenBookings: () => void;
  onRefresh?: () => void;
  onBack?: () => void;
}

const formatDate = (value?: string) => {
  if (!value) return 'Date TBA';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getRequirementCoverImage = (req: Requirement): string => {
  if (req.imageUrl) return req.imageUrl;
  if (req.images && req.images.length > 0) return req.images[0];
  const cat = (req.category || '').toLowerCase();
  const evt = (req.eventType || '').toLowerCase();
  if (cat.includes('cater') || evt.includes('cater') || cat.includes('food')) return '/service_catering.jpg';
  if (cat.includes('wedding') || evt.includes('wedding') || evt.includes('engagement') || evt.includes('reception') || evt.includes('mandap')) return '/occasion_weddings.jpg';
  if (cat.includes('birthday') || evt.includes('birthday') || evt.includes('baby') || cat.includes('balloon')) return '/occasion_birthdays.jpg';
  if (cat.includes('corporate') || evt.includes('corporate') || evt.includes('conference') || evt.includes('seminar')) return '/occasion_corporate.jpg';
  if (cat.includes('dj') || evt.includes('dj') || cat.includes('sound') || cat.includes('festival') || evt.includes('festival')) return '/occasion_festivals.jpg';
  return '/occasion_parties.jpg';
};


export const MyEventsPage: React.FC<MyEventsPageProps> = ({
  requirements,
  onOpenPostModal,
  onAcceptBid,
  onOpenBookings,
  onRefresh,
  onBack,
}) => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      All: requirements.length,
      Open: requirements.filter((r) => r.status === 'OPEN').length,
      'With bids': requirements.filter(
        (r) => r.status === 'OPEN' && ((r.bidsCount || 0) > 0 || (r.bids || []).length > 0)
      ).length,
      Booked: requirements.filter((r) => r.status === 'ACCEPTED' || r.status === 'ACTIVE').length,
      Closed: requirements.filter(
        (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED'
      ).length,
    }),
    [requirements]
  );

  const filtered = useMemo(() => {
    if (filter === 'Open') return requirements.filter((r) => r.status === 'OPEN');
    if (filter === 'With bids')
      return requirements.filter(
        (r) => r.status === 'OPEN' && ((r.bidsCount || 0) > 0 || (r.bids || []).length > 0)
      );
    if (filter === 'Booked')
      return requirements.filter((r) => r.status === 'ACCEPTED' || r.status === 'ACTIVE');
    if (filter === 'Closed')
      return requirements.filter(
        (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED'
      );
    return requirements;
  }, [filter, requirements]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 pt-0 lg:pt-20">
      {/* Desktop Top Breadcrumbs & Header Section */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 lg:pt-6">
        <div className="hidden lg:flex items-center justify-between pb-4 pt-2 border-b border-slate-200/80 mb-6">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#ff5c28]" />
                <span>Back to Marketplace</span>
              </button>
            )}
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">My Events & Requirements</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              15% Min. Reverse Bidding Savings
            </span>
            <button
              type="button"
              onClick={onOpenPostModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff5c28] hover:bg-[#e06b37] text-white text-xs font-extrabold shadow-md shadow-orange-500/20 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Post New Requirement</span>
            </button>
          </div>
        </div>

        {/* Desktop Page Title Banner */}
        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            My Events & <span className="text-[#ff5c28]">Reverse Bidding</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl font-medium">
            Track your posted requirements, watch verified local vendors compete, and accept bids that save at least 15% below your budget.
          </p>
        </div>
      </div>

      {/* Sticky Tab & Filter Bar (Desktop & Mobile) */}
      <div className="sticky top-0 lg:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Mobile Header Bar */}
          <div className="lg:hidden h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 -ml-1 cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-[17px] font-extrabold">My Events</h1>
            </div>
            <button
              type="button"
              onClick={onOpenPostModal}
              className="w-10 h-10 rounded-full bg-[#ff5c28] text-white flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              aria-label="Post Requirement"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Tabs Row */}
          <div className="pb-3 pt-1 lg:pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              {FILTERS.map((name) => {
                const active = filter === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFilter(name)}
                    className={`shrink-0 h-[36px] lg:h-[38px] px-4 rounded-full text-xs border cursor-pointer transition-all ${
                      active
                        ? 'bg-[#ff5c28] text-white border-[#ff5c28] font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-medium'
                    }`}
                  >
                    <span>{name}</span>
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {counts[name]}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-semibold text-slate-500 hidden sm:block shrink-0">
              {requirements.length === 0
                ? 'No requests posted'
                : `${requirements.length} event${requirements.length === 1 ? '' : 's'} posted`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Events Grid / Empty State */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {filtered.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs max-w-lg mx-auto">
            {requirements.length === 0 ? (
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#ff5c28] flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8" />
              </div>
            )}
            <p className="text-lg font-extrabold text-slate-900">
              {requirements.length === 0 ? 'No events posted yet' : 'No events in this tab'}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {requirements.length === 0
                ? 'Post an event request with your maximum budget. Verified local vendors will submit competitive bids with guaranteed 15% savings.'
                : 'Try switching to another tab, or post a new event request.'}
            </p>
            <button
              type="button"
              onClick={onOpenPostModal}
              className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#ff5c28] hover:bg-[#e06b37] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-orange-500/20 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post Event Request</span>
            </button>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="block mx-auto mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer transition"
              >
                Pull to refresh
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filtered.map((req) => {
              const bids = req.bids || [];
              const bidCount = req.bidsCount || bids.length;
              const open = req.status === 'OPEN';
              const expanded = expandedId === req._id;
              const cover = req.imageUrl || req.images?.[0] || getRequirementCoverImage(req);

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : req._id)}
                    className="w-full text-left cursor-pointer group"
                  >
                    {/* Card Cover Image */}
                    <div className="relative h-[160px] sm:h-[180px] bg-slate-100 overflow-hidden">
                      {cover ? (
                        <img
                          src={cover}
                          alt={req.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <Calendar className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Status Badge */}
                      <span
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-black tracking-wide shadow-xs ${
                          open
                            ? 'bg-[#fff7ed] text-[#ff5c28] border border-[#ffd7c2]'
                            : req.status === 'ACCEPTED' || req.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {req.status}
                      </span>

                      {/* Category Tag on Image */}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold">
                        {req.category}
                      </span>

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                        <span className="inline-flex items-center gap-1 drop-shadow-sm">
                          <MapPin className="w-3.5 h-3.5 text-amber-300" />
                          {req.location?.area || req.location?.city || 'Location TBA'}
                        </span>
                        <span className="inline-flex items-center gap-1 drop-shadow-sm">
                          <Users className="w-3.5 h-3.5 text-amber-300" />
                          {req.guestCount || 50} guests
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {req.eventType && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10.5px] font-bold text-slate-700">
                            {req.eventType}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(req.eventDate)}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {req.title}
                      </h3>

                      {/* Reverse Auction Pricing & Savings Meter */}
                      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-orange-50/30 border border-slate-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              Budget Ceiling
                            </p>
                            <p className="text-sm sm:text-base font-black text-slate-800">
                              ₹{req.budget.toLocaleString()}
                            </p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-[#ff5c28] flex items-center justify-center shrink-0">
                            <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                              {req.lowestBid ? 'Lowest Bid' : 'Status'}
                            </p>
                            <p className="text-sm sm:text-base font-black text-emerald-600">
                              {req.lowestBid ? (
                                `₹${req.lowestBid.toLocaleString()}`
                              ) : (
                                <span className="text-slate-500 text-xs font-bold">
                                  {bidCount > 0 ? `${bidCount} bid${bidCount === 1 ? '' : 's'}` : 'Waiting'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Mini Savings Indicator */}
                        {req.lowestBid && req.budget > 0 ? (
                          <div className="pt-2 border-t border-slate-200/70">
                            <div className="flex items-center justify-between text-[11px] font-black text-emerald-700">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Save ₹{(req.budget - req.lowestBid).toLocaleString()}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[10px]">
                                {Math.round(((req.budget - req.lowestBid) / req.budget) * 100)}% OFF
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[10.5px] font-bold text-slate-500">
                            <span className="flex items-center gap-1 text-[#ff5c28]">
                              <Zap className="w-3 h-3" />
                              Min. 15% rule
                            </span>
                            <span>Save ≥ ₹{Math.round(req.budget * 0.15).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Expand Action Footer */}
                      <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-extrabold text-[#ff5c28] flex items-center gap-1">
                          {req.status === 'ACCEPTED'
                            ? 'Pay to confirm'
                            : bidCount > 0
                              ? `See bids (${bidCount})`
                              : 'View request details'}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#ff5c28] group-hover:text-white transition">
                          {expanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Bids Section */}
                  {expanded && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3.5 border-t border-slate-100 pt-4 bg-[#fafbfc]">
                      {req.status === 'ACCEPTED' || req.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          onClick={onOpenBookings}
                          className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-black cursor-pointer transition flex items-center justify-center gap-2 shadow-sm"
                        >
                          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                          <span>View Confirmed Booking in Escrow</span>
                        </button>
                      ) : bids.length === 0 ? (
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 text-center space-y-2 shadow-2xs">
                          <div className="w-10 h-10 rounded-full bg-orange-50 text-[#ff5c28] flex items-center justify-center mx-auto">
                            <Radio className="w-5 h-5 animate-pulse" />
                          </div>
                          <p className="text-xs font-black text-slate-800">
                            Active Live Auction · Notifying Verified Vendors
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                            Local vendors are reviewing your requirement. All submitted bids must be at least 15% below your ₹{req.budget.toLocaleString()} ceiling!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              <span>Competing Vendor Bids ({bids.length})</span>
                            </p>
                            <span className="text-[10px] font-bold text-slate-500">Sorted by lowest price</span>
                          </div>

                          {(() => {
                            const sortedBids = [...bids].sort((a, b) => a.amount - b.amount);
                            const lowestEligibleId = sortedBids.find((b) => b.isEligibleForAccept)?._id;

                            return sortedBids.map((bid) => {
                              const fee = Math.round(bid.amount * 0.1);
                              const total = bid.amount + fee;
                              const isLowest = bid._id === lowestEligibleId;
                              const totalSaved = Math.max(0, req.budget - total);
                              const totalSavedPct = req.budget > 0 ? Math.round((totalSaved / req.budget) * 100) : 0;

                              return (
                                <div
                                  key={bid._id}
                                  className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition-all ${
                                    isLowest
                                      ? 'border-emerald-300 ring-1 ring-emerald-300/60 bg-gradient-to-b from-emerald-50/40 via-white to-white'
                                      : 'border-slate-200 bg-white'
                                  }`}
                                >
                                  {isLowest && (
                                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10.5px] font-black uppercase tracking-wider shadow-2xs">
                                      <span className="flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        #1 Lowest Bid · Maximum Savings
                                      </span>
                                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                                        Save ₹{totalSaved.toLocaleString()}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-black text-slate-900 truncate">
                                        {bid.providerId?.businessName ||
                                          bid.providerId?.name ||
                                          'Verified Vendor'}
                                      </p>
                                      <p className="text-[11px] text-slate-500 font-medium">Verified Local Provider</p>
                                    </div>
                                    <span
                                      className={`text-[10.5px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                                        bid.isEligibleForAccept
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                                      }`}
                                    >
                                      {bid.discountPercent}% Below Ceiling
                                    </span>
                                  </div>

                                  {bid.proposalNotes && (
                                    <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                                      “{bid.proposalNotes}”
                                    </p>
                                  )}

                                  {/* Price Breakdown */}
                                  <div className="text-xs space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                                    <div className="flex justify-between text-slate-600 font-medium">
                                      <span>Vendor Proposal Price</span>
                                      <span className="font-bold text-slate-900">
                                        ₹{bid.amount.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 text-[11px]">
                                      <span>EzzyGo Escrow & Protection Fee (10%)</span>
                                      <span>+₹{fee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-black pt-2 border-t border-slate-200/80 text-slate-900 text-sm">
                                      <span>Total Payable in Escrow</span>
                                      <span className="text-emerald-700">
                                        ₹{total.toLocaleString()}
                                      </span>
                                    </div>
                                    {totalSaved > 0 && (
                                      <div className="flex justify-between text-xs font-black text-emerald-700 pt-1">
                                        <span>Your Total Savings</span>
                                        <span>₹{totalSaved.toLocaleString()} ({totalSavedPct}% OFF)</span>
                                      </div>
                                    )}
                                  </div>

                                  {bid.isEligibleForAccept ? (
                                    <button
                                      type="button"
                                      onClick={() => onAcceptBid(req._id, bid._id)}
                                      className={`w-full h-11 rounded-xl text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition active:scale-95 ${
                                        isLowest
                                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                                          : 'bg-[#ff5c28] hover:bg-[#e64814] shadow-orange-500/20'
                                      }`}
                                    >
                                      <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                                      <span>Accept Proposal · Pay ₹{total.toLocaleString()}</span>
                                    </button>
                                  ) : (
                                    <p className="text-[11px] font-bold text-rose-700 text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                                      Too high to accept. Bid must be ₹{req.maxAcceptableBid.toLocaleString()} or less.
                                    </p>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
