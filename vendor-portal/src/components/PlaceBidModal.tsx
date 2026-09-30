import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  UserCheck 
} from 'lucide-react';
import type { Requirement } from '../types';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  providerId: string;
  onSubmit: (reqId: string, bidData: any) => void;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({
  isOpen,
  onClose,
  requirement,
  providerId,
  onSubmit,
}) => {
  if (!isOpen || !requirement) return null;

  const ceiling = requirement.maxAcceptableBid || Math.round(requirement.budget * 0.85);
  const currentLowest = requirement.lowestBid || ceiling;

  const [bidAmount, setBidAmount] = useState<number>(
    Math.min(ceiling, currentLowest > 1000 ? currentLowest - 1000 : ceiling)
  );
  const [proposalNotes, setProposalNotes] = useState('');
  const [includeOperator, setIncludeOperator] = useState(true);
  const [selectedGear, setSelectedGear] = useState<string[]>(requirement.equipmentNeeded || []);

  const isValidBid = bidAmount <= ceiling && bidAmount > 0;
  const discountPercent = Math.round(((requirement.budget - bidAmount) / requirement.budget) * 100);
  const platformFee = Math.round(bidAmount * 0.1);
  const netEarnings = bidAmount - platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBid) return;

    onSubmit(requirement._id, {
      amount: bidAmount,
      proposalNotes: `${proposalNotes}${includeOperator ? ' (Includes on-site expert technician & transport)' : ''}`,
      equipmentDetails: selectedGear.join(', '),
      providerId,
    });
    onClose();
  };

  const handleToggleGear = (item: string) => {
    if (selectedGear.includes(item)) {
      setSelectedGear(selectedGear.filter((g) => g !== item));
    } else {
      setSelectedGear([...selectedGear, item]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#f95724] text-xs font-black border border-orange-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Reverse-Bidding Desk</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{requirement.title}</h2>
            <p className="text-xs text-slate-500">{requirement.location.area}, {requirement.location.city} • {requirement.guestCount} Guests</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 15% Rule Ceiling Box */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Host Budget</div>
            <div className="text-sm font-extrabold text-slate-800 mt-0.5">₹{requirement.budget.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#f95724]">Max Bid Ceiling</div>
            <div className="text-sm font-extrabold text-[#f95724] mt-0.5">≤ ₹{ceiling.toLocaleString()}</div>
            <div className="text-[9px] text-[#f95724]/80 font-semibold">Min 15% Discount</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-600">Current Lowest</div>
            <div className="text-sm font-extrabold text-emerald-600 mt-0.5">
              {requirement.lowestBid ? `₹${requirement.lowestBid.toLocaleString()}` : 'No bids yet'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Bid Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <label className="text-slate-900 flex items-center gap-1">
                <span>Your Reverse Bid Amount (₹)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className={`font-bold ${isValidBid ? 'text-emerald-600' : 'text-rose-500'}`}>
                {discountPercent}% Off Budget
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                ₹
              </div>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min="1000"
                max={ceiling}
                required
                className={`w-full pl-9 pr-4 py-3.5 rounded-2xl bg-white border text-lg font-black text-slate-900 focus:outline-none transition ${
                  isValidBid
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-rose-400 focus:border-rose-500'
                }`}
              />
            </div>

            {/* Validation Message */}
            {isValidBid ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Eligible Bid: Complies with 15% ceiling rule (Max ₹{ceiling.toLocaleString()}).</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Bid too high! Maximum allowed under platform rules is ₹{ceiling.toLocaleString()}.</span>
              </div>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setBidAmount(ceiling)}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
            >
              Match Ceiling (₹{ceiling.toLocaleString()})
            </button>
            {requirement.lowestBid && (
              <button
                type="button"
                onClick={() => setBidAmount(requirement.lowestBid! - 1000)}
                className="px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-[#f95724] font-bold border border-orange-200 transition cursor-pointer"
              >
                Undercut by ₹1,000 (₹{(requirement.lowestBid - 1000).toLocaleString()})
              </button>
            )}
          </div>

          {/* Equipment Checklist */}
          {requirement.equipmentNeeded && requirement.equipmentNeeded.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#f95724]" />
                <span>Confirm Gear Deployment:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {requirement.equipmentNeeded.map((eq) => (
                  <label
                    key={eq}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer hover:border-orange-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGear.includes(eq)}
                      onChange={() => handleToggleGear(eq)}
                      className="rounded accent-[#f95724] w-4 h-4"
                    />
                    <span>{eq}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Operator Staffing Inclusion */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-slate-900">Include Dedicated Sound/Tech Operator</div>
                <div className="text-[11px] text-slate-500">On-site technical support for the full duration</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeOperator}
              onChange={(e) => setIncludeOperator(e.target.checked)}
              className="w-4 h-4 accent-[#f95724]"
            />
          </div>

          {/* Proposal Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900">Proposal Notes & Brand Highlights</label>
            <textarea
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
              placeholder="e.g. Using original JBL VRX active systems with DBX driverack processor. Setup ready 2 hours prior."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f95724]"
            />
          </div>

          {/* Payout Breakdown Summary */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Your Bid Quote:</span>
              <span className="font-bold text-slate-900">₹{bidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Fee (10%):</span>
              <span className="text-rose-600">- ₹{platformFee.toLocaleString()}</span>
            </div>
            <div className="h-px bg-orange-200 my-1" />
            <div className="flex justify-between text-sm font-black text-emerald-700">
              <span>Net Take-Home Payout:</span>
              <span>₹{netEarnings.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-[#f95724]" />
              <span>100% Escrow guaranteed upon host selection.</span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidBid}
              className="px-6 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#f95724]/25 transition active:scale-95 cursor-pointer"
            >
              Broadcast Bid to Host
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};