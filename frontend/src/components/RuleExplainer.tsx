import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Percent, 
  Lock, 
  RefreshCw, 
  X, 
  Users, 
  Truck, 
  Shield, 
  Sparkles, 
  BadgeCheck 
} from 'lucide-react';

interface RuleExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleExplainer: React.FC<RuleExplainerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'vendor' | 'admin' | 'calc'>('overview');
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
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#f95724] text-[11px] font-black tracking-wide uppercase mb-1">
              How EzGo Works • Platform Guide
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              EzGo Simple 3-Way Ecosystem (Host, Vendor & Admin)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Transparent live bidding, 100% safe escrow protection, and guaranteed 15%+ savings!
            </p>
          </div>
        </div>

        {/* Navigation Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f95724]" />
            <span>Complete Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('user')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'user'
                ? 'bg-white text-orange-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#f95724]" />
            <span>1. For Event Hosts</span>
          </button>

          <button
            onClick={() => setActiveTab('vendor')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
              activeTab === 'vendor'
                ? 'bg-white text-blue-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>2. For Vendors</span>
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
            <span>3. For Admin & Escrow</span>
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
            <span>Savings Calculator</span>
          </button>
        </div>

        {/* TAB 1: FULL OVERVIEW FLOWCHART */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Visual Step Timeline */}
            <div className="grid sm:grid-cols-3 gap-4">
              
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-orange-50/70 to-amber-50/40 border border-orange-200 relative">
                <div className="w-8 h-8 rounded-full bg-[#f95724] text-white flex items-center justify-center font-black text-xs shadow-md mb-3">
                  1
                </div>
                <div className="text-xs font-extrabold uppercase tracking-wide text-[#f95724] mb-1">
                  Step 1: Host Posts Need
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Post Event & Set Budget
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your event date, city, guest count, and maximum budget ceiling (e.g. ₹40,000 for Sound & DJ).
                </p>
                <div className="mt-3 pt-2.5 border-t border-orange-200/60 text-[11px] font-bold text-orange-900 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#f95724]" />
                  <span>15% minimum discount rule applies automatically!</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-indigo-50/40 border border-blue-200 relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md mb-3">
                  2
                </div>
                <div className="text-xs font-extrabold uppercase tracking-wide text-blue-600 mb-1">
                  Step 2: Vendors Live Bid
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Verified Pros Submit Quotes
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Local KYC-verified vendors compete by submitting their lowest prices along with detailed equipment packages.
                </p>
                <div className="mt-3 pt-2.5 border-t border-blue-200/60 text-[11px] font-bold text-blue-900 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Host chooses the best package & quote</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/70 to-teal-50/40 border border-emerald-200 relative">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md mb-3">
                  3
                </div>
                <div className="text-xs font-extrabold uppercase tracking-wide text-emerald-600 mb-1">
                  Step 3: Escrow & Delivery
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Safe Escrow & Full Payout
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Host funds are locked safely in Escrow. Once the event finishes successfully, 100% of the bid is released to the vendor.
                </p>
                <div className="mt-3 pt-2.5 border-t border-emerald-200/60 text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero risk for host, guaranteed payout for vendor!</span>
                </div>
              </div>

            </div>

            {/* Complete Flow Infographic Banner */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-white/10 text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Zero Risk for Hosts, Zero Commission Deduction for Vendors
                  </h4>
                  <p className="text-xs text-slate-300">
                    No middleman commissions or price bargaining — pure transparent reverse auctions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('calc')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f95724] to-amber-500 hover:opacity-95 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
              >
                View Savings Calculator ➔
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: FOR USER / HOST */}
        {activeTab === 'user' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200">
              <h3 className="text-base font-bold text-orange-950 flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-[#f95724]" />
                <span>Event Host Workflow (3 Simple Steps)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Post Requirement with Budget:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Specify event date, location, guest count, and your maximum ceiling budget (e.g. ₹30,000). Takes less than 60 seconds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Receive Discounted Bids (Min 15% Off):</strong>
                    <p className="text-slate-600 mt-0.5">
                      Under EzGo rules, every vendor bid must start at least 15% lower than your ceiling budget. Review their equipment gear list, past ratings, and photos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Deposit in Escrow & Release on Completion:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Your payment stays safely locked in EzGo RBI Escrow. Only after the vendor completes the service on your event day do you approve release of funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOR VENDOR */}
        {activeTab === 'vendor' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
              <h3 className="text-base font-bold text-blue-950 flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Service Vendor Workflow (3 Simple Steps)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Live Local Event Broadcasts:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Browse newly posted DJ, sound, lighting, and decor requirements in your city (Pune, Mumbai, Hyderabad, etc.) in real time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Place Bid with Gear Packages:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Quote a competitive price within the 15% discount threshold and highlight your equipment inventory (e.g. JBL Line Arrays, Sharpies, Trusses).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">100% Direct Payouts (0% Commission Cut):</strong>
                    <p className="text-slate-600 mt-0.5">
                      Once the host accepts, funds are secured in escrow. Upon job sign-off, receive 100% of your quoted bid directly into your Bank/UPI with zero deductions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FOR ADMIN */}
        {activeTab === 'admin' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200">
              <h3 className="text-base font-bold text-rose-950 flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-rose-600" />
                <span>Admin & Escrow Custody Protection</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-rose-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Provider KYC & Gear Verification:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Only verified vendors with authenticated GST/Aadhaar and validated bank accounts can place bids on requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-rose-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Smart Escrow Vault Custody:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Host payments remain held in secure escrow custody, ensuring complete financial safety for both event hosts and service providers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-rose-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">Dispute Resolution & Instant Payouts:</strong>
                    <p className="text-slate-600 mt-0.5">
                      Automated payout releases upon event completion, backed by 24/7 admin support in case of disputes or cancellations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CALCULATOR */}
        {activeTab === 'calc' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Interactive Financial & Savings Calculator</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Host Maximum Budget Ceiling (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  value={testBudget}
                  onChange={(e) => setTestBudget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 shadow-2xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Maximum Acceptable Bid (85% Limit): <strong className="text-amber-700 font-mono">₹{maxAcceptableBid.toLocaleString()}</strong>
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 shadow-2xs"
                />
                <span className={`text-[11px] font-bold mt-1 block ${isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isEligible
                    ? `✓ Eligible Bid (${discountPercent}% discount ≥ 15%)`
                    : `✗ Ineligible Bid (${discountPercent}% discount is less than required 15%)`}
                </span>
              </div>
            </div>

            {/* Financial Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-bold">Item Description</th>
                    <th className="py-2.5 px-4 text-left font-bold hidden sm:table-cell">Rule / Explanation</th>
                    <th className="py-2.5 px-4 text-right font-bold">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800 font-sans">Accepted Vendor Bid</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans hidden sm:table-cell">Quoted by vendor</td>
                    <td className="py-2.5 px-4 text-right text-slate-900 font-bold">₹{testBid.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800 font-sans">Platform Escrow Fee (10%)</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans hidden sm:table-cell">Escrow vault custody & insurance</td>
                    <td className="py-2.5 px-4 text-right text-amber-700 font-bold">+ ₹{platformFee.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3 px-4 text-slate-900 font-sans">Total Paid by Host (Into Escrow)</td>
                    <td className="py-3 px-4 text-slate-600 font-sans hidden sm:table-cell">Bid + 10% Platform Fee</td>
                    <td className="py-3 px-4 text-right text-slate-950 text-sm">₹{totalPayableByRequester.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-emerald-50/70">
                    <td className="py-3 px-4 text-emerald-950 font-sans font-bold">Vendor Payout (On Completion)</td>
                    <td className="py-3 px-4 text-emerald-800 font-sans hidden sm:table-cell">100% Payout (0% Commission Cut)</td>
                    <td className="py-3 px-4 text-right text-emerald-800 font-bold text-sm">₹{testBid.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-orange-50/50">
                    <td className="py-2.5 px-4 text-orange-950 font-sans font-bold">Net Host Savings</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans hidden sm:table-cell">Original Budget - Total Paid</td>
                    <td className="py-2.5 px-4 text-right text-[#f95724] font-bold">
                      ₹{netSavings.toLocaleString()} ({Math.round((netSavings / testBudget) * 100)}% Net Savings)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Close Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>EzGo 100% Escrow Protection Guaranteed</span>
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
