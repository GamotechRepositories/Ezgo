import React, { useState } from 'react';
import { ShieldCheck, Percent, Lock, Zap, RefreshCw, X } from 'lucide-react';

interface RuleExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleExplainer: React.FC<RuleExplainerProps> = ({ isOpen, onClose }) => {
  const [testBudget, setTestBudget] = useState<number>(6000);
  const [testBid, setTestBid] = useState<number>(4500);

  if (!isOpen) return null;

  const maxAcceptableBid = Math.floor(testBudget * 0.85);
  const discountPercent = Math.round(((testBudget - testBid) / testBudget) * 100);
  const isEligible = testBid <= maxAcceptableBid;
  const platformFee = Math.round(testBid * 0.10);
  const totalPayableByRequester = testBid + platformFee;
  const netSavings = testBudget - totalPayableByRequester;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Percent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              EzGo 15% Minimum Discount & Escrow Model
            </h2>
            <p className="text-sm text-slate-400">
              PRD Section 5: Guaranteed savings for requesters, zero deductions for providers.
            </p>
          </div>
        </div>

        {/* 3 Core Rules Pill */}
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>15% Discount Rule</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bids must be at least 15% lower than the requester's budget to be eligible for acceptance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Lock className="w-4 h-4" />
              <span>10% Platform Fee</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Requester pays 10% platform fee on top of bid. Money is safely held in Escrow during booking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>100% Provider Payout</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Providers get 100% of their quoted bid amount with zero commission deduction upon job completion.
            </p>
          </div>
        </div>

        {/* Interactive Calculator */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Test the Math Live</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Requester Budget (₹)
              </label>
              <input
                type="number"
                step="500"
                min="1000"
                value={testBudget}
                onChange={(e) => setTestBudget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Max Acceptable Bid (85%): <strong className="text-amber-300 font-mono">₹{maxAcceptableBid.toLocaleString()}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Provider Quoted Bid (₹)
              </label>
              <input
                type="number"
                step="100"
                value={testBid}
                onChange={(e) => setTestBid(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
              <span className={`text-[11px] font-semibold mt-1 block ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isEligible
                  ? ` Eligible (${discountPercent}% discount ≥ 15%)`
                  : ` Ineligible (${discountPercent}% discount is < 15%)`}
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="py-2.5 px-4 text-left font-semibold">Item</th>
                  <th className="py-2.5 px-4 text-left font-semibold">Formula / Rule</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Calculated Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono">
                <tr>
                  <td className="py-2.5 px-4 text-slate-300 font-sans">Accepted Bid Amount</td>
                  <td className="py-2.5 px-4 text-slate-400 font-sans">As quoted by provider</td>
                  <td className="py-2.5 px-4 text-right text-white font-bold">₹{testBid.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-300 font-sans">Platform Fee (Requester pays)</td>
                  <td className="py-2.5 px-4 text-slate-400 font-sans">10% of bid amount</td>
                  <td className="py-2.5 px-4 text-right text-amber-400 font-bold">+ ₹{platformFee.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-900/60 font-bold">
                  <td className="py-3 px-4 text-white font-sans">Total Charged to Requester</td>
                  <td className="py-3 px-4 text-slate-300 font-sans">Bid + 10% Platform Fee</td>
                  <td className="py-3 px-4 text-right text-cyan-300 text-sm">₹{totalPayableByRequester.toLocaleString()}</td>
                </tr>
                <tr className="bg-emerald-950/20">
                  <td className="py-3 px-4 text-emerald-300 font-sans">Provider Payout (on Completion)</td>
                  <td className="py-3 px-4 text-emerald-400/80 font-sans">Full bid amount (0% deduction)</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold text-sm">₹{testBid.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-300 font-sans">EzGo Commission Retained</td>
                  <td className="py-2.5 px-4 text-slate-400 font-sans">Platform Fee Collected</td>
                  <td className="py-2.5 px-4 text-right text-purple-400 font-bold">₹{platformFee.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-emerald-300 font-sans font-bold">Net Savings for Requester</td>
                  <td className="py-2.5 px-4 text-slate-400 font-sans">Original Budget - Total Paid</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                    ₹{netSavings.toLocaleString()} ({Math.round((netSavings / testBudget) * 100)}% net saved)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs transition shadow-lg shadow-amber-500/20"
          >
            Got it, close
          </button>
        </div>

      </div>
    </div>
  );
};
