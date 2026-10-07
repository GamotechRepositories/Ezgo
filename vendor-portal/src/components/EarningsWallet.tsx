import React from 'react';
import type { Booking, User } from '../types';

interface EarningsWalletProps {
  vendor: User;
  bookings: Booking[];
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const EarningsWallet: React.FC<EarningsWalletProps> = ({ vendor, bookings }) => {
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED');
  const activeBookings = bookings.filter((b) => b.status === 'ACTIVE');

  const totalPaid = completedBookings.reduce((acc, b) => acc + (b.payoutDetails?.amountToProvider ?? b.bidAmount), 0);
  const upcoming = activeBookings.reduce((acc, b) => acc + b.bidAmount, 0);
  const bank = vendor.bankDetails;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Earnings</h2>
        <p className="text-base text-slate-600 mt-1">
          You get 100% of your bid. EzzyGo sends it to your bank after the host confirms the event is done.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-2 shadow-sm">
          <div className="text-sm text-slate-500">Paid to you</div>
          <div className="text-3xl font-bold text-emerald-700">₹{totalPaid.toLocaleString()}</div>
          <div className="text-sm text-slate-500">
            From {completedBookings.length} finished {completedBookings.length === 1 ? 'event' : 'events'}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-2 shadow-sm">
          <div className="text-sm text-slate-500">Coming after events</div>
          <div className="text-3xl font-bold text-slate-900">₹{upcoming.toLocaleString()}</div>
          <div className="text-sm text-slate-500">
            {activeBookings.length} paid {activeBookings.length === 1 ? 'booking' : 'bookings'} waiting for the event to finish
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">Your bank account</h3>
          <span
            className={`px-3 py-1 rounded-full border text-sm font-medium ${
              vendor.isVerified
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {vendor.isVerified ? 'Verified by EzzyGo' : 'Waiting for EzzyGo check'}
          </span>
        </div>

        {bank ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Account holder</div>
              <div className="text-slate-900 font-medium mt-1">{bank.accountHolder || '—'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Account number</div>
              <div className="text-slate-900 font-medium mt-1">
                {bank.accountNumber || '—'}
                {bank.ifscCode && <span className="text-slate-500"> · IFSC {bank.ifscCode}</span>}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">UPI ID</div>
              <div className="text-slate-900 font-medium mt-1">{bank.upiId || '—'}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No bank account added yet. Contact EzzyGo support to add one.</p>
        )}
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Payments received</h3>

        {completedBookings.length === 0 ? (
          <p className="text-sm text-slate-500">No payments yet. They show up here after your first finished event.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-medium">Event</th>
                  <th className="pb-3 font-medium">Paid on</th>
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {completedBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="py-3 font-medium text-slate-900">{b.requirementId?.title}</td>
                    <td>{formatDate(b.payoutDetails?.releasedAt || b.completedAt)}</td>
                    <td className="text-slate-500">{b.payoutDetails?.transferId || '—'}</td>
                    <td className="text-right font-semibold text-slate-900">
                      ₹{(b.payoutDetails?.amountToProvider ?? b.bidAmount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
