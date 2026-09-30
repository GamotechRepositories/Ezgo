import React, { useState } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';
import type { Booking, User } from '../types';

interface EarningsWalletProps {
  vendor: User;
  bookings: Booking[];
}

export const EarningsWallet: React.FC<EarningsWalletProps> = ({ vendor, bookings }) => {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('24000');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED');
  const activeBookings = bookings.filter((b) => b.status === 'ACTIVE');

  const totalEarned = completedBookings.reduce((acc, b) => acc + b.bidAmount, 0) + 54000;
  const escrowInTransit = activeBookings.reduce((acc, b) => acc + b.bidAmount, 0);
  const availablePayout = 24000;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setIsWithdrawOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Lifetime Earnings</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#f95724]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">₹{totalEarned.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>0% hidden provider deductions</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Escrow Held in Transit</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-700">₹{escrowInTransit.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-medium">Auto-released after host completion</div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-100/50 border border-orange-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#f95724]">Available For Instant Payout</span>
            <div className="p-2 rounded-xl bg-[#f95724] text-white font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">₹{availablePayout.toLocaleString()}</div>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="w-full py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/25 transition active:scale-95 cursor-pointer"
          >
            Request Instant UPI / IMPS Payout
          </button>
        </div>

      </div>

      {/* Bank & Settlement Account Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#f95724]" />
            <span>Linked Settlement Account</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>KYC Verified Pro</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-bold">Account Holder</div>
            <div className="text-slate-800 font-bold mt-1">{vendor.bankDetails?.accountHolder}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-bold">Bank Account Number</div>
            <div className="text-slate-800 font-bold mt-1">{vendor.bankDetails?.accountNumber} (IFSC: {vendor.bankDetails?.ifscCode})</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-bold">Instant UPI Handle</div>
            <div className="text-slate-800 font-bold mt-1">{vendor.bankDetails?.upiId}</div>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">Recent Dispatches & Escrow Transfers</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold">
                <th className="pb-3">Reference / UTR</th>
                <th className="pb-3">Event Service</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Gross Bid</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 font-mono font-bold text-[#f95724]">UTR-908123490</td>
                <td className="font-semibold text-slate-900">Sangeet Audio & Line Arrays</td>
                <td>28 Sep 2026</td>
                <td className="font-bold text-slate-900">₹32,000</td>
                <td>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    Dispatched (IMPS)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-mono font-bold text-[#f95724]">UTR-887102914</td>
                <td className="font-semibold text-slate-900">Reception Moving Sharpies + Truss</td>
                <td>21 Sep 2026</td>
                <td className="font-bold text-slate-900">₹22,000</td>
                <td>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    Dispatched (UPI)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Confirm Instant Settlement</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Funds will be directly dispatched to your verified UPI ID: <span className="text-slate-900 font-bold">{vendor.bankDetails?.upiId}</span>
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={availablePayout}
                  className="w-full mt-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black text-slate-900 focus:outline-none focus:border-[#f95724]"
                />
              </div>

              {withdrawSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transfer initiated successfully! Received via IMPS.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#f95724] text-white font-bold text-xs shadow-md shadow-[#f95724]/25"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};