import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RuleExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { title: 'The host posts a request', body: 'They add the event date, place, guests, and the most they want to pay (their budget).' },
  { title: 'You bid at least 15% lower', body: 'Your bid must be 85% of the budget or less. On a ₹40,000 budget, you can bid up to ₹34,000.' },
  { title: 'The host picks a bid and pays', body: 'The host pays your bid plus a 10% EzzyGo fee. EzzyGo holds this money. You can now see their phone number.' },
  { title: 'You do the event and get paid', body: 'When the host confirms the event is done, EzzyGo sends you 100% of your bid. Nothing is cut from your side.' },
];

export const RuleExplainer: React.FC<RuleExplainerProps> = ({ isOpen, onClose }) => {
  const [testBudget, setTestBudget] = useState<number>(40000);
  const [testBid, setTestBid] = useState<number>(32000);

  if (!isOpen) return null;

  const maxAcceptableBid = Math.floor(testBudget * 0.85);
  const discountPercent = testBudget > 0 ? Math.round(((testBudget - testBid) / testBudget) * 100) : 0;
  const isEligible = testBid > 0 && testBid <= maxAcceptableBid;
  const hostFee = Math.round(testBid * 0.1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 pr-12">How bidding works</h2>
        <p className="text-base text-slate-600 mt-1">Four steps from a host's request to money in your bank.</p>

        <ol className="mt-6 space-y-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4 p-4 rounded-2xl border border-slate-200">
              <span className="w-7 h-7 rounded-full bg-orange-50 text-[#f95724] text-sm font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Try it</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Host budget (₹)</span>
              <input
                type="number"
                step="1000"
                value={testBudget}
                onChange={(e) => setTestBudget(Number(e.target.value))}
                className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold text-base focus:outline-none focus:border-[#f95724]"
              />
              <span className="text-slate-500 mt-1 block">You can bid up to ₹{maxAcceptableBid.toLocaleString()}</span>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Your bid (₹)</span>
              <input
                type="number"
                step="500"
                value={testBid}
                onChange={(e) => setTestBid(Number(e.target.value))}
                className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold text-base focus:outline-none focus:border-[#f95724]"
              />
              <span className={`mt-1 block font-medium ${isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isEligible
                  ? `${discountPercent}% lower. The host can pick this bid.`
                  : `Only ${discountPercent}% lower. It needs to be at least 15% lower.`}
              </span>
            </label>
          </div>

          <dl className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 text-sm">
            <div className="flex justify-between px-4 py-3">
              <dt className="text-slate-600">Host pays (your bid + 10% EzzyGo fee)</dt>
              <dd className="font-medium text-slate-900">₹{(testBid + hostFee).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between px-4 py-3 bg-emerald-50/60">
              <dt className="font-semibold text-emerald-900">You receive after the event</dt>
              <dd className="font-semibold text-emerald-800">₹{testBid.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
