import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import type { Booking } from '../types';

interface EscrowDisputeManagerProps {
  bookings: Booking[];
  onReleasePayout: (bookingId: string) => void;
  onIssueRefund: (bookingId: string) => void;
}

export const EscrowDisputeManager: React.FC<EscrowDisputeManagerProps> = ({
  bookings = [],
  onReleasePayout,
  onIssueRefund,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-emerald-600" />
          <span>Escrow Custody & Payout Release Desk</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor locked escrow deposits, resolve fulfillment disagreements, and manually override payout releases or customer refunds.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold">
                <th className="pb-3">Booking Reference</th>
                <th className="pb-3">Event & Category</th>
                <th className="pb-3">Host (Payer)</th>
                <th className="pb-3">Vendor (Beneficiary)</th>
                <th className="pb-3">Escrow Deposit</th>
                <th className="pb-3">Commission (10%)</th>
                <th className="pb-3">Escrow Status</th>
                <th className="pb-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(bookings || []).map((b) => {
                const isHeld = b.paymentDetails?.escrowStatus === 'HELD' || b.status === 'ACTIVE';
                const isReleased = b.paymentDetails?.escrowStatus === 'RELEASED_TO_PROVIDER' || b.status === 'PAYOUT_RELEASED' || b.status === 'COMPLETED';
                const bidAmount = b.bidAmount || 0;
                const platformFee = b.platformFee || Math.round(bidAmount * 0.10);
                const displayId = b._id ? b._id.substring(0, 10) : 'BK-REF';

                return (
                  <tr key={b._id || Math.random()} className="hover:bg-slate-50 transition">
                    <td className="py-4 font-mono text-[#f95724] font-bold">
                      {displayId}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 truncate max-w-xs">{b.requirementId?.title || 'Event Booking'}</div>
                      <div className="text-[11px] text-slate-500">{b.requirementId?.category || 'General Service'}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{b.requesterId?.name || 'Event Host'}</div>
                      <div className="text-[11px] text-slate-500">{b.requesterId?.phone || '+91 98765 43210'}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{b.providerId?.name || 'Service Vendor'}</div>
                      <div className="text-[11px] text-slate-500">{b.providerId?.businessName || 'Pro Audio & Decor'}</div>
                    </td>
                    <td className="font-bold text-slate-900 font-mono">
                      ₹{bidAmount.toLocaleString()}
                    </td>
                    <td className="font-bold text-emerald-700 font-mono">
                      ₹{platformFee.toLocaleString()}
                    </td>
                    <td>
                      {isReleased ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Released</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Held in Escrow</span>
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      {isHeld ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onReleasePayout(b._id)}
                            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                          >
                            Release to Vendor
                          </button>
                          <button
                            onClick={() => onIssueRefund(b._id)}
                            className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition cursor-pointer"
                          >
                            Refund Host
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {(!bookings || bookings.length === 0) && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    No active escrow bookings in dispute.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};