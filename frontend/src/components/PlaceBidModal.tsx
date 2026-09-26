import React, { useState } from 'react';
import { X, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Requirement } from '../types';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  providerId: string;
  onSubmit: (data: {
    requirementId: string;
    providerId: string;
    amount: number;
    proposalNotes: string;
    equipmentDetails: string;
  }) => Promise<void>;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({
  isOpen,
  onClose,
  requirement,
  providerId,
  onSubmit,
}) => {
  if (!isOpen || !requirement) return null;

  const [amount, setAmount] = useState<number>(requirement.maxAcceptableBid);
  const [proposalNotes, setProposalNotes] = useState('');
  const [equipmentDetails, setEquipmentDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const discountAmount = requirement.budget - amount;
  const discountPercent = Math.round((discountAmount / requirement.budget) * 100);
  const isEligible = amount <= requirement.maxAcceptableBid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      await onSubmit({
        requirementId: requirement._id,
        providerId,
        amount,
        proposalNotes,
        equipmentDetails,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Submit Reverse Bid</h2>
            <p className="text-xs text-slate-400">{requirement.title}</p>
          </div>
        </div>

        {/* Requester Budget Overview */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-4 mb-5 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Requester's Budget:</span>
            <span className="font-mono text-base font-bold text-white">₹{requirement.budget.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">15% Max Acceptable Bid:</span>
            <span className="font-mono text-base font-bold text-amber-400">
              ₹{requirement.maxAcceptableBid.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Bid Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Your Competitive Bid Quote (₹)
              </label>
              <span className={`text-[11px] font-bold ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {discountPercent}% Discount vs Budget
              </span>
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="100"
                value={amount}
                max={requirement.budget - 1}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-lg focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Eligibility Indicator */}
            <div className={`mt-2 p-3 rounded-xl border text-xs flex items-start gap-2 ${
              isEligible
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}>
              {isEligible ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Eligible for Acceptance!</strong> At ₹{amount.toLocaleString()}, your quote delivers a {discountPercent}% discount, satisfying the 15% rule. You will receive 100% of this quote on event completion with 0% deduction.
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Ineligible under the 15% Rule:</strong> The requester's budget is ₹{requirement.budget.toLocaleString()}. You must bid at or below ₹{requirement.maxAcceptableBid.toLocaleString()} for the client to be able to accept your bid.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Proposal Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pitch / Proposal Inclusions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Includes 4 hours DJ performance, Punjabi + Telugu mixes, backup controller, wireless mics..."
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Equipment Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Equipment / Brand Specifications
            </label>
            <input
              type="text"
              placeholder="e.g. JBL VRX line array + Pioneer DDJ-1000 + 4 Moving Heads"
              value={equipmentDetails}
              onChange={(e) => setEquipmentDetails(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-violet-500/25 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Competitive Bid'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
