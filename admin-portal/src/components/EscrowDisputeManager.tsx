import React, { useState } from 'react';
import type { Booking } from '../types';

interface EscrowDisputeManagerProps {
  bookings: Booking[];
  onReleasePayout: (bookingId: string) => Promise<void> | void;
  onIssueRefund: (bookingId: string) => Promise<void> | void;
}

const statusInfo: Record<string, { label: string; className: string }> = {
  AWAITING_PAYMENT: { label: 'Not paid yet', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  ACTIVE: { label: 'EzGo holding money', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  COMPLETED: { label: 'Vendor paid', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  PAYOUT_RELEASED: { label: 'Vendor paid', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  REFUNDED: { label: 'Cancelled, host refunded', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  DISPUTED: { label: 'Disputed', className: 'bg-rose-50 text-rose-800 border-rose-200' },
};

export const EscrowDisputeManager: React.FC<EscrowDisputeManagerProps> = ({
  bookings = [],
  onReleasePayout,
  onIssueRefund,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);

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
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Payments</h2>
        <p className="text-base text-slate-600 mt-1">
          Money hosts paid for bookings. Pay the vendor after the event, or cancel and refund the host if something went wrong.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 whitespace-nowrap">
                <th className="pb-3 pr-4 font-medium">Event</th>
                <th className="pb-3 pr-4 font-medium">Host</th>
                <th className="pb-3 pr-4 font-medium">Vendor</th>
                <th className="pb-3 pr-4 font-medium">Host paid</th>
                <th className="pb-3 pr-4 font-medium">Vendor gets</th>
                <th className="pb-3 pr-4 font-medium">EzGo fee</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(bookings || []).map((b) => {
                const bidAmount = b.bidAmount || 0;
                const platformFee = b.platformFee || Math.round(bidAmount * 0.1);
                const totalPaid = b.totalPaid || bidAmount + platformFee;
                const isRefunded = b.status === 'CANCELLED' && b.paymentDetails?.escrowStatus === 'REFUNDED';
                const info = (isRefunded ? statusInfo.REFUNDED : statusInfo[b.status]) || statusInfo.ACTIVE;
                const canRelease = b.status === 'ACTIVE';
                const canCancel = b.status === 'ACTIVE' || b.status === 'AWAITING_PAYMENT';
                const isBusy = busyId === b._id;

                return (
                  <tr key={b._id} className="hover:bg-slate-50 transition align-top">
                    <td className="py-4 pr-3">
                      <div className="font-medium text-slate-900 truncate max-w-[200px]" title={b.requirementId?.title}>{b.requirementId?.title || '—'}</div>
                      <div className="text-slate-500 truncate max-w-[200px]">{b.requirementId?.category}</div>
                    </td>
                    <td className="py-4 pr-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{b.requesterId?.name || '—'}</div>
                      <div className="text-slate-500">{b.requesterId?.phone}</div>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="font-medium text-slate-900 max-w-[150px] truncate" title={b.providerId?.businessName || b.providerId?.name}>
                        {b.providerId?.businessName || b.providerId?.name || '—'}
                      </div>
                    </td>
                    <td className="py-4 pr-3 whitespace-nowrap font-semibold text-slate-900">₹{totalPaid.toLocaleString()}</td>
                    <td className="py-4 pr-3 whitespace-nowrap">₹{bidAmount.toLocaleString()}</td>
                    <td className="py-4 pr-3 whitespace-nowrap text-emerald-700">₹{platformFee.toLocaleString()}</td>
                    <td className="py-4 pr-3">
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${info.className}`}>
                        {info.label}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {canRelease || canCancel ? (
                        <div className="flex flex-col items-end gap-1.5">
                          {canRelease && (
                            <button
                              disabled={isBusy}
                              onClick={() => run(b._id, onReleasePayout)}
                              className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition cursor-pointer whitespace-nowrap"
                            >
                              Pay vendor
                            </button>
                          )}
                          <button
                            disabled={isBusy}
                            onClick={() => run(b._id, onIssueRefund)}
                            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-rose-50 border border-rose-200 disabled:opacity-50 text-rose-700 font-semibold text-sm transition cursor-pointer whitespace-nowrap"
                          >
                            {canRelease ? 'Cancel and refund' : 'Cancel booking'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {(!bookings || bookings.length === 0) && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 border-t border-slate-100 pt-4">
          "Pay vendor" marks the event done and sends the vendor their full bid. "Cancel and refund" gives the host back
          everything they paid and reopens the request for bids.
        </p>
      </div>
    </div>
  );
};
