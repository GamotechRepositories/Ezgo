import React, { useMemo, useState } from 'react';
import { Calendar, ClipboardList, MapPin, Plus, ShieldCheck, Users, WifiOff } from 'lucide-react';
import type { Requirement } from '../types';

const FILTERS = ['All', 'Open', 'With bids', 'Booked', 'Closed'] as const;

interface MyEventsPageProps {
  requirements: Requirement[];
  onOpenPostModal: () => void;
  onAcceptBid: (requirementId: string, bidId: string) => Promise<void>;
  onOpenBookings: () => void;
  onRefresh?: () => void;
}

const formatDate = (value?: string) => {
  if (!value) return 'Date TBA';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const MyEventsPage: React.FC<MyEventsPageProps> = ({
  requirements,
  onOpenPostModal,
  onAcceptBid,
  onOpenBookings,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(() => ({
    All: requirements.length,
    Open: requirements.filter((r) => r.status === 'OPEN').length,
    'With bids': requirements.filter((r) => r.status === 'OPEN' && ((r.bidsCount || 0) > 0 || (r.bids || []).length > 0)).length,
    Booked: requirements.filter((r) => r.status === 'ACCEPTED' || r.status === 'ACTIVE').length,
    Closed: requirements.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED').length,
  }), [requirements]);

  const filtered = useMemo(() => {
    if (filter === 'Open') return requirements.filter((r) => r.status === 'OPEN');
    if (filter === 'With bids') return requirements.filter((r) => r.status === 'OPEN' && ((r.bidsCount || 0) > 0 || (r.bids || []).length > 0));
    if (filter === 'Booked') return requirements.filter((r) => r.status === 'ACCEPTED' || r.status === 'ACTIVE');
    if (filter === 'Closed') return requirements.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED');
    return requirements;
  }, [filter, requirements]);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="sticky top-0 z-20 bg-white">
        <div className="h-14 px-4 flex items-center justify-between">
          <h1 className="text-[17px] font-extrabold">My Events</h1>
          <button type="button" onClick={onOpenPostModal} className="w-10 h-10 flex items-center justify-center cursor-pointer">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pb-2.5">
          <p className="text-xs font-semibold text-slate-500">
            {requirements.length === 0
              ? 'Posted requests and vendor bids'
              : `${requirements.length} event${requirements.length === 1 ? '' : 's'} posted`}
          </p>
          <div className="mt-2.5 flex gap-2 overflow-x-auto scrollbar-none">
            {FILTERS.map((name) => {
              const active = filter === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFilter(name)}
                  className={`shrink-0 h-[38px] px-3.5 rounded-full text-xs border cursor-pointer ${
                    active ? 'bg-[#f07d4a] text-white border-[#f07d4a] font-bold' : 'bg-[#f8fafc] text-slate-800 border-[#e8edf2] font-medium'
                  }`}
                >
                  {name} ({counts[name]})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 pb-8 space-y-3.5">
        {filtered.length === 0 ? (
          <div className="pt-20 text-center">
            {requirements.length === 0 ? (
              <ClipboardList className="w-11 h-11 text-[#f07d4a] mx-auto" />
            ) : (
              <WifiOff className="w-11 h-11 text-slate-400 mx-auto" />
            )}
            <p className="mt-3 text-base font-extrabold">
              {requirements.length === 0 ? 'No events posted yet' : 'No events in this tab'}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {requirements.length === 0
                ? 'Post a request with your budget. Verified vendors bid at least 15% below it.'
                : 'Try another filter, or post a new event request.'}
            </p>
            <button
              type="button"
              onClick={onOpenPostModal}
              className="mt-4 inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-[#f07d4a] text-white text-sm font-extrabold cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Post Event Request
            </button>
            {onRefresh && (
              <button type="button" onClick={onRefresh} className="block mx-auto mt-3 text-xs font-bold text-slate-500 cursor-pointer">
                Pull to retry
              </button>
            )}
          </div>
        ) : (
          filtered.map((req) => {
            const bids = req.bids || [];
            const bidCount = req.bidsCount || bids.length;
            const open = req.status === 'OPEN';
            const expanded = expandedId === req._id;
            const cover = req.imageUrl || req.images?.[0];
            return (
              <div key={req._id} className="bg-white rounded-[22px] border border-[#e8edf2] overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.03)]">
                <button type="button" onClick={() => setExpandedId(expanded ? null : req._id)} className="w-full text-left cursor-pointer">
                  <div className="relative h-[148px] bg-slate-100">
                    {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center"><Calendar className="w-8 h-8 text-slate-400" /></div>
                    )}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                      open ? 'bg-[#fff7ed] text-[#f07d4a] border border-[#ffd7c2]' : 'bg-white text-slate-700 border border-slate-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">{req.category}</span>
                      {req.eventType && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">{req.eventType}</span>}
                    </div>
                    <p className="mt-2 text-base font-extrabold leading-snug">{req.title}</p>
                    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.location?.area || req.location?.city}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(req.eventDate)}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{req.guestCount} guests</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[13px] font-extrabold">₹{req.budget.toLocaleString()}</p>
                      <p className="text-[11px] font-extrabold text-emerald-600">
                        {req.lowestBid ? `Low ₹${req.lowestBid.toLocaleString()}` : `${bidCount} bid${bidCount === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <p className="mt-2 text-[12px] font-extrabold text-[#f07d4a]">
                      {req.status === 'ACCEPTED' ? 'Pay to confirm' : bidCount > 0 ? `See bids (${bidCount})` : 'View request'}
                    </p>
                  </div>
                </button>

                {expanded && (
                  <div className="px-3.5 pb-3.5 space-y-2 border-t border-slate-100 pt-3">
                    {req.status === 'ACCEPTED' || req.status === 'ACTIVE' ? (
                      <button type="button" onClick={onOpenBookings} className="w-full h-11 rounded-xl bg-[#f07d4a] text-white text-sm font-extrabold cursor-pointer">
                        View booking
                      </button>
                    ) : bids.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">Vendors will bid here. Eligible bids stay 15% below your budget.</p>
                    ) : (
                      bids.map((bid) => {
                        const fee = Math.round(bid.amount * 0.1);
                        const total = bid.amount + fee;
                        return (
                          <div key={bid._id} className="rounded-2xl border border-slate-200 p-3 space-y-2">
                            <div className="flex justify-between gap-2">
                              <p className="text-sm font-extrabold">{bid.providerId?.businessName || bid.providerId?.name || 'Vendor'}</p>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${bid.isEligibleForAccept ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {bid.discountPercent}% OFF
                              </span>
                            </div>
                            {bid.proposalNotes && <p className="text-xs text-slate-600">“{bid.proposalNotes}”</p>}
                            <div className="text-xs space-y-0.5">
                              <div className="flex justify-between"><span>Vendor bid</span><span className="font-bold">₹{bid.amount.toLocaleString()}</span></div>
                              <div className="flex justify-between text-slate-500"><span>EzzyGo fee (10%)</span><span>+₹{fee.toLocaleString()}</span></div>
                              <div className="flex justify-between font-extrabold pt-1 border-t border-slate-100"><span>You pay</span><span className="text-emerald-700">₹{total.toLocaleString()}</span></div>
                            </div>
                            {bid.isEligibleForAccept ? (
                              <button
                                type="button"
                                onClick={() => onAcceptBid(req._id, bid._id)}
                                className="w-full h-11 rounded-xl bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <ShieldCheck className="w-4 h-4" /> Choose this vendor · Pay ₹{total.toLocaleString()}
                              </button>
                            ) : (
                              <p className="text-[10px] font-bold text-rose-700 text-center">Too high to accept. Bid must be ₹{req.maxAcceptableBid.toLocaleString()} or less.</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
