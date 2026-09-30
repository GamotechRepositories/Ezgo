import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Percent, 
  X, 
  Users, 
  Truck, 
  Shield, 
  Sparkles, 
  Award,
  RefreshCw,
  BadgeCheck,
  Lock
} from 'lucide-react';

interface RuleExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleExplainer: React.FC<RuleExplainerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'vendor' | 'overview' | 'user' | 'admin' | 'calc'>('vendor');
  const [testBudget, setTestBudget] = useState<number>(40000);
  const [testBid, setTestBid] = useState<number>(32000);

  if (!isOpen) return null;

  const maxAcceptableBid = Math.floor(testBudget * 0.85);
  const discountPercent = Math.round(((testBudget - testBid) / testBudget) * 100);
  const isEligible = testBid <= maxAcceptableBid;
  const platformFee = Math.round(testBid * 0.10);
  const totalPayableByRequester = testBid + platformFee;
  const netSavings = testBudget - totalPayableByRequester;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer z-10"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-start gap-4 mb-6 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f95724] to-amber-500 flex items-center justify-center shadow-lg shadow-[#f95724]/20 shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#f95724] text-[11px] font-black tracking-wide uppercase mb-1">
              Vendor Rules & Flow Guide
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              EzGo Complete Flow (Host, Vendor & Admin)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              15% bidding threshold rule, 100% direct bank payouts, and 0% commission deductions!
            </p>
          </div>
        </div>

        {/* Navigation Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('vendor')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'vendor'
                ? 'bg-white text-[#f95724] shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#f95724]" />
            <span>1. For Vendors</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Ecosystem Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('user')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'user'
                ? 'bg-white text-indigo-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>3. For Event Hosts</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'admin'
                ? 'bg-white text-rose-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            <span>4. For Admin & Escrow</span>
          </button>

          <button
            onClick={() => setActiveTab('calc')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'calc'
                ? 'bg-white text-emerald-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Calculator</span>
          </button>
        </div>

        {/* TAB: FOR VENDOR */}
        {activeTab === 'vendor' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-orange-50/80 border border-orange-200">
              <h3 className="text-base font-bold text-orange-950 flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-[#f95724]" />
                <span>Vendor Partner Workflow (3 Simple Steps)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-orange-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Discover Live Local Auctions:</strong>
                    <p className="text-slate-600 mt-0.5">
                      View real-time event requirements posted by hosts across your service area (e.g. Pune, Mumbai, Bangalore).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-orange-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Submit Competitive Bid with Gear Details:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Bid within the required 15% discount threshold (e.g. max ₹34,000 for a ₹40,000 budget) and showcase your sound, lighting, or decor equipment specifications.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-orange-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">100% Guaranteed Payout (0% Commission Deduction):</strong>
                    <p className="text-slate-600 mt-0.5">
                      Client deposits 100% into escrow prior to event setup. When you complete the event, 100% of your quoted price is released directly into your bank account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200">
                <div className="w-8 h-8 rounded-full bg-[#f95724] text-white flex items-center justify-center font-black text-xs shadow-md mb-3">1</div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Host Posts Need</h4>
                <p className="text-xs text-slate-600">Event date, guest count, and maximum budget ceiling are published.</p>
                <div className="mt-2 text-[10px] font-bold text-orange-800 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-[#f95724]" />
                  <span>15% discount rule applies</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md mb-3">2</div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Vendors Place Bids</h4>
                <p className="text-xs text-slate-600">Verified vendors compete with at least 15% discount and gear details.</p>
                <div className="mt-2 text-[10px] font-bold text-blue-800 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-blue-600" />
                  <span>Host selects best package</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md mb-3">3</div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Escrow & Full Payout</h4>
                <p className="text-xs text-slate-600">Safe escrow custody ensures host satisfaction and 100% vendor payouts.</p>
                <div className="mt-2 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>100% money protection</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FOR USER */}
        {activeTab === 'user' && (
          <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3 text-xs animate-in fade-in">
            <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Event Host Workflow</span>
            </h3>
            <p className="text-slate-700 leading-relaxed font-medium">
              1. Post event requirement ➔ 2. Receive competitive bids from top pros (guaranteed 15%+ savings) ➔ 3. Secure escrow deposit and flawless event delivery!
            </p>
          </div>
        )}

        {/* TAB: FOR ADMIN */}
        {activeTab === 'admin' && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 text-xs animate-in fade-in">
            <h3 className="text-base font-bold text-rose-950 flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-rose-600" />
              <span>Admin Escrow Custody & Governance</span>
            </h3>
            <p className="text-slate-700 leading-relaxed font-medium">
              Comprehensive KYC verification of all service providers, safe custody of escrow funds in banking channels, and automated payout execution upon event completion.
            </p>
          </div>
        )}

        {/* TAB: CALCULATOR */}
        {activeTab === 'calc' && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Interactive Financial Breakdown</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Host Ceiling Budget (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={testBudget}
                  onChange={(e) => setTestBudget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Max Allowed Bid (85%): <strong className="text-amber-700 font-mono">₹{maxAcceptableBid.toLocaleString()}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Quoted Bid (₹)
                </label>
                <input
                  type="number"
                  step="500"
                  value={testBid}
                  onChange={(e) => setTestBid(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
                <span className={`text-[11px] font-bold mt-1 block ${isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isEligible ? `✓ Eligible (${discountPercent}% discount ≥ 15%)` : `✗ Ineligible (${discountPercent}% is < 15%)`}
                </span>
              </div>
            </div>

            {/* Financial Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-bold">Line Item</th>
                    <th className="py-2.5 px-4 text-left font-bold hidden sm:table-cell">Rule / Explanation</th>
                    <th className="py-2.5 px-4 text-right font-bold">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800 font-sans">Vendor Quoted Bid</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans hidden sm:table-cell">As submitted in auction</td>
                    <td className="py-2.5 px-4 text-right text-slate-900 font-bold">₹{testBid.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800 font-sans">Host Platform Escrow Fee (10%)</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans hidden sm:table-cell">Paid by host into vault</td>
                    <td className="py-2.5 px-4 text-right text-amber-700 font-bold">+ ₹{platformFee.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3 px-4 text-slate-900 font-sans">Total Paid by Host</td>
                    <td className="py-3 px-4 text-slate-600 font-sans hidden sm:table-cell">Held in safe escrow</td>
                    <td className="py-3 px-4 text-right text-slate-950 text-sm">₹{totalPayableByRequester.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-emerald-50/70">
                    <td className="py-3 px-4 text-emerald-950 font-sans font-bold">Vendor Payout (On Completion)</td>
                    <td className="py-3 px-4 text-emerald-800 font-sans hidden sm:table-cell">100% Direct to Bank (0% Deduction)</td>
                    <td className="py-3 px-4 text-right text-emerald-800 font-bold text-sm">₹{testBid.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-orange-50/50">
                    <td className="py-2.5 px-4 text-orange-950 font-sans font-bold">Net Host Savings</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans hidden sm:table-cell">Budget - Total Paid</td>
                    <td className="py-2.5 px-4 text-right text-[#f95724] font-bold">₹{netSavings.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>EzGo 100% Escrow Protection</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md cursor-pointer"
          >
            Got It, Close
          </button>
        </div>

      </div>
    </div>
  );
};