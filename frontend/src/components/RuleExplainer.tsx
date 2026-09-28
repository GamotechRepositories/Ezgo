import React, { useState } from 'react';
import { ShieldCheck, Percent, Lock, Zap, RefreshCw, X } from 'lucide-react';

interface RuleExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleExplainer: React.FC<RuleExplainerProps> = ({ isOpen, onClose }) => {
  const [testBudget, setTestBudget] = useState<number>(30000);
  const [testBid, setTestBid] = useState<number>(24000);

  if (!isOpen) return null;

  const maxAcceptableBid = Math.floor(testBudget * 0.85);
  const discountPercent = Math.round(((testBudget - testBid) / testBudget) * 100);
  const isEligible = testBid <= maxAcceptableBid;
  const platformFee = Math.round(testBid * 0.10);
  const totalPayableByRequester = testBid + platformFee;
  const netSavings = testBudget - totalPayableByRequester;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 my-8">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
            <Percent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              EzGo 15% Minimum Discount & Escrow Model
            </h2>
            <p className="text-xs text-slate-500">
              Guaranteed savings for event hosts, zero deductions for verified vendors.
            </p>
          </div>
        </div>

        {/* 3 Core Rules Pill */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>15% Discount Rule</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Vendor bids must be at least 15% lower than your budget ceiling to be eligible for acceptance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200">
            <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-xs uppercase tracking-wider mb-1">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>10% Platform Fee</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Hosts pay 10% escrow fee on top of the bid. 100% of the money is held in RBI Escrow until completion.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>100% Provider Payout</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Vendors receive 100% of their quoted bid amount with zero commission deduction upon job sign-off.
            </p>
          </div>
        </div>

        {/* Interactive Calculator */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>Interactive Financial Breakdown</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Host Budget Ceiling (₹)
              </label>
              <input
                type="number"
                step="1000"
                min="5000"
                value={testBudget}
                onChange={(e) => setTestBudget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Max Acceptable Bid (85%): <strong className="text-amber-700 font-mono">₹{maxAcceptableBid.toLocaleString()}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vendor Quoted Bid (₹)
              </label>
              <input
                type="number"
                step="500"
                value={testBid}
                onChange={(e) => setTestBid(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
              <span className={`text-[11px] font-bold mt-1 block ${isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isEligible
                  ? `✓ Eligible (${discountPercent}% discount ≥ 15%)`
                  : `✗ Ineligible (${discountPercent}% discount is < 15%)`}
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 text-left font-bold">Line Item</th>
                  <th className="py-2.5 px-4 text-left font-bold">Formula / Explanation</th>
                  <th className="py-2.5 px-4 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-4 text-slate-800 font-sans">Accepted Vendor Bid</td>
                  <td className="py-2.5 px-4 text-slate-500 font-sans">As quoted by vendor</td>
                  <td className="py-2.5 px-4 text-right text-slate-900 font-bold">₹{testBid.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-800 font-sans">Platform Escrow Fee (10%)</td>
                  <td className="py-2.5 px-4 text-slate-500 font-sans">10% of bid amount</td>
                  <td className="py-2.5 px-4 text-right text-amber-700 font-bold">+ ₹{platformFee.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-3 px-4 text-slate-900 font-sans">Total Charged to Host (in Escrow)</td>
                  <td className="py-3 px-4 text-slate-600 font-sans">Bid + 10% Platform Fee</td>
                  <td className="py-3 px-4 text-right text-emerald-700 text-sm">₹{totalPayableByRequester.toLocaleString()}</td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="py-3 px-4 text-emerald-950 font-sans font-bold">Vendor Payout (on Completion)</td>
                  <td className="py-3 px-4 text-emerald-800 font-sans">Full bid amount (0% deduction)</td>
                  <td className="py-3 px-4 text-right text-emerald-800 font-bold text-sm">₹{testBid.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-emerald-900 font-sans font-bold">Net Savings for Host</td>
                  <td className="py-2.5 px-4 text-slate-500 font-sans">Original Budget - Total Paid</td>
                  <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">
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
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md cursor-pointer"
          >
            Got it, close
          </button>
        </div>

      </div>
    </div>
  );
};
