import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
  XCircle,
} from 'lucide-react';
import type { Booking } from '../types';

interface EscrowDisputeManagerProps {
  bookings: Booking[];
  onReleasePayout: (bookingId: string) => Promise<void> | void;
  onIssueRefund: (bookingId: string) => Promise<void> | void;
  onResolveDispute?: (
    bookingId: string,
    action: 'PAYOUT_VENDOR' | 'REFUND_HOST' | 'DISMISS',
    note?: string
  ) => Promise<void> | void;
}

const statusInfo: Record<string, { label: string; className: string; icon: any }> = {
  AWAITING_PAYMENT: {
    label: 'Awaiting Payment',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  ACTIVE: {
    label: 'Escrow Held in Trust',
    className: 'bg-blue-50 text-blue-800 border-blue-200 font-bold',
    icon: ShieldCheck,
  },
  COMPLETED: {
    label: 'Vendor Payout Settled',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  PAYOUT_RELEASED: {
    label: 'Vendor Payout Settled',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Booking Cancelled',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Host Refunded',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: RotateCcw,
  },
  DISPUTED: {
    label: 'Disputed by User',
    className: 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
    icon: ShieldAlert,
  },
};

export const EscrowDisputeManager: React.FC<EscrowDisputeManagerProps> = ({
  bookings = [],
  onReleasePayout,
  onIssueRefund,
  onResolveDispute,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DISPUTED' | 'COMPLETED' | 'REFUNDED'>('ALL');
  const [search, setSearch] = useState('');

  // Financial aggregates
  const stats = useMemo(() => {
    let escrowHeld = 0;
    let totalSettled = 0;
    let totalCommission = 0;
    let disputeCount = 0;
    let activeCount = 0;
    let completedCount = 0;
    let refundedCount = 0;

    for (const b of bookings) {
      const bid = b.bidAmount || 0;
      const fee = b.platformFee || Math.round(bid * 0.1);
      const total = b.totalPaid || bid + fee;

      if (b.status === 'ACTIVE') {
        escrowHeld += total;
        activeCount++;
      }
      if (b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED') {
        totalSettled += bid;
        totalCommission += fee;
        completedCount++;
      }
      if (b.status === 'DISPUTED') {
        disputeCount++;
      }
      if (b.status === 'CANCELLED' || b.paymentDetails?.escrowStatus === 'REFUNDED') {
        refundedCount++;
      }
    }

    return {
      escrowHeld,
      totalSettled,
      totalCommission,
      disputeCount,
      activeCount,
      completedCount,
      refundedCount,
    };
  }, [bookings]);

  // Filter & Search logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const isRefunded = b.status === 'CANCELLED' && b.paymentDetails?.escrowStatus === 'REFUNDED';

      if (filter === 'ACTIVE' && b.status !== 'ACTIVE') return false;
      if (filter === 'DISPUTED' && b.status !== 'DISPUTED') return false;
      if (filter === 'COMPLETED' && b.status !== 'COMPLETED' && b.status !== 'PAYOUT_RELEASED') return false;
      if (filter === 'REFUNDED' && !isRefunded && b.status !== 'CANCELLED') return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (b.requirementId?.title || '').toLowerCase().includes(q);
        const catMatch = (b.requirementId?.category || '').toLowerCase().includes(q);
        const hostName = (b.requesterId?.name || '').toLowerCase().includes(q);
        const hostPhone = (b.requesterId?.phone || '').includes(q);
        const vendorName = (b.providerId?.businessName || b.providerId?.name || '').toLowerCase().includes(q);
        if (!titleMatch && !catMatch && !hostName && !hostPhone && !vendorName) return false;
      }

      return true;
    });
  }, [bookings, filter, search]);

  const run = async (bookingId: string, action: (id: string) => Promise<void> | void) => {
    setBusyId(bookingId);
    try {
      await action(bookingId);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payments & <span className="text-[#ff5c28]">Escrow Vault</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Complete administrative overview of funds held in escrow, automated 10% commission splits, and dispute arbitration.
          </p>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Protected Escrow</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">₹{stats.escrowHeld.toLocaleString()}</p>
          <p className="text-xs text-blue-700 font-semibold">{stats.activeCount} bookings held securely in trust</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Settled to Vendors</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">₹{stats.totalSettled.toLocaleString()}</p>
          <p className="text-xs text-emerald-700 font-semibold">{stats.completedCount} event payouts released</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">EzzyGo Revenue (10%)</span>
            <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#ff5c28] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">₹{stats.totalCommission.toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-semibold">10% retained platform service fee</p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-2xs space-y-2 ${stats.disputeCount > 0 ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200/90'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${stats.disputeCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
              Disputed Cases
            </span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${stats.disputeCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${stats.disputeCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {stats.disputeCount}
          </p>
          <p className={`text-xs font-semibold ${stats.disputeCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
            {stats.disputeCount > 0 ? 'Action required immediately' : 'Zero disputes pending'}
          </p>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Filter Controls & Search */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
          {/* Segment Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ACTIVE')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filter === 'ACTIVE'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              Held in Escrow ({stats.activeCount})
            </button>
            {stats.disputeCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter('DISPUTED')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  filter === 'DISPUTED'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                Disputes ({stats.disputeCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setFilter('COMPLETED')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              Settled ({stats.completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('REFUNDED')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filter === 'REFUNDED'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              Refunded ({stats.refundedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by event, host, or vendor..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff5c28] focus:ring-1 focus:ring-[#ff5c28] transition"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">
                <th className="py-3.5 px-4">Event Request</th>
                <th className="py-3.5 px-4">Host (Payer)</th>
                <th className="py-3.5 px-4">Vendor (Payee)</th>
                <th className="py-3.5 px-4">Total Paid</th>
                <th className="py-3.5 px-4">Vendor Payout</th>
                <th className="py-3.5 px-4">EzzyGo Fee</th>
                <th className="py-3.5 px-4">Escrow Status</th>
                <th className="py-3.5 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBookings.map((b) => {
                const bidAmount = b.bidAmount || 0;
                const platformFee = b.platformFee || Math.round(bidAmount * 0.1);
                const totalPaid = b.totalPaid || bidAmount + platformFee;
                const isRefunded = b.status === 'CANCELLED' && b.paymentDetails?.escrowStatus === 'REFUNDED';
                const info = (isRefunded ? statusInfo.REFUNDED : statusInfo[b.status]) || statusInfo.ACTIVE;
                const StatusIcon = info.icon || ShieldCheck;
                const isDisputed = b.status === 'DISPUTED';
                const canRelease = b.status === 'ACTIVE' || isDisputed;
                const canCancel = b.status === 'ACTIVE' || b.status === 'AWAITING_PAYMENT' || isDisputed;
                const isBusy = busyId === b._id;

                return (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition-colors align-top">
                    {/* Event Info */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1 max-w-[220px]" title={b.requirementId?.title}>
                        {b.requirementId?.title || 'Event Requirement'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold">
                          {b.requirementId?.category || 'Service'}
                        </span>
                        {b.requirementId?.location?.city && (
                          <span>· {b.requirementId.location.city}</span>
                        )}
                      </div>
                    </td>

                    {/* Host Info */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.requesterId?.name || 'Host User'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 pl-5">
                        {b.requesterId?.phone || '—'}
                      </div>
                    </td>

                    {/* Vendor Info */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]" title={b.providerId?.businessName || b.providerId?.name}>
                        {b.providerId?.businessName || b.providerId?.name || 'Verified Vendor'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {b.providerId?.phone || '—'}
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="py-4 px-4 whitespace-nowrap font-black text-slate-900 text-sm">
                      ₹{totalPaid.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-bold text-emerald-600 text-sm">
                      ₹{bidAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-700">
                      ₹{platformFee.toLocaleString()}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${info.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{info.label}</span>
                      </span>

                      {/* Dispute Alert Note if Disputed */}
                      {isDisputed && (
                        <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] max-w-[240px] space-y-1">
                          <span className="font-black flex items-center gap-1 text-[10px] uppercase text-rose-700 tracking-wider">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Dispute Reason:
                          </span>
                          <p className="italic leading-snug break-words">
                            "{b.disputeReason || b.disputeDetails?.reason || 'Host mediation requested'}"
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {isDisputed ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              if (window.confirm(`Resolve dispute and release full payout of ₹${bidAmount.toLocaleString()} to the vendor?`)) {
                                run(b._id, (id) =>
                                  onResolveDispute
                                    ? onResolveDispute(id, 'PAYOUT_VENDOR', 'Resolved by admin: payout to vendor')
                                    : onReleasePayout(id)
                                );
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11.5px] transition cursor-pointer whitespace-nowrap shadow-xs active:scale-95"
                          >
                            ✓ Pay Vendor (₹{bidAmount.toLocaleString()})
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              if (window.confirm(`Resolve dispute and refund full payment of ₹${totalPaid.toLocaleString()} to the host?`)) {
                                run(b._id, (id) =>
                                  onResolveDispute
                                    ? onResolveDispute(id, 'REFUND_HOST', 'Resolved by admin: host refunded')
                                    : onIssueRefund(id)
                                );
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-[11.5px] transition cursor-pointer whitespace-nowrap shadow-xs active:scale-95"
                          >
                            ↩ Refund Host (₹{totalPaid.toLocaleString()})
                          </button>

                          {onResolveDispute && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                if (window.confirm('Dismiss dispute and return booking to active escrow?')) {
                                  run(b._id, (id) => onResolveDispute(id, 'DISMISS', 'Dispute dismissed by admin'));
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[10.5px] font-semibold transition cursor-pointer whitespace-nowrap"
                            >
                              Dismiss Dispute
                            </button>
                          )}
                        </div>
                      ) : canRelease || canCancel ? (
                        <div className="flex flex-col items-end gap-1.5">
                          {canRelease && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                if (window.confirm(`Confirm event completion and release ₹${bidAmount.toLocaleString()} to vendor?`)) {
                                  run(b._id, onReleasePayout);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer whitespace-nowrap shadow-xs active:scale-95"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Release Payout</span>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              if (window.confirm(canRelease ? `Cancel booking and refund ₹${totalPaid.toLocaleString()} to host?` : 'Cancel this booking?')) {
                                run(b._id, onIssueRefund);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 disabled:opacity-50 text-rose-700 font-bold text-xs transition cursor-pointer whitespace-nowrap active:scale-95"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{canRelease ? 'Refund Host' : 'Cancel Booking'}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <p className="text-base font-bold text-slate-900">No bookings match this filter</p>
                    <p className="text-xs text-slate-500 mt-1">Try switching tabs or searching for another keyword.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Explainer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 text-[11.5px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Release Payout</strong> finalizes event completion and releases the full vendor bid. <strong>Refund Host</strong> refunds the entire charge and reopens the event for bids.
            </span>
          </div>
          <span className="font-bold text-slate-700 shrink-0">100% Escrow Protected</span>
        </div>
      </div>
    </div>
  );
};
