import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Requirement } from '../types';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  providerId: string;
  onSubmit: (reqId: string, bidData: any) => void;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({ isOpen, requirement, ...rest }) => {
  if (!isOpen || !requirement) return null;
  return <PlaceBidForm key={requirement._id} requirement={requirement} {...rest} />;
};

interface PlaceBidFormProps extends Omit<PlaceBidModalProps, 'isOpen' | 'requirement'> {
  requirement: Requirement;
}

const PlaceBidForm: React.FC<PlaceBidFormProps> = ({
  onClose,
  requirement,
  providerId,
  onSubmit,
}) => {
  const ceiling = requirement.maxAcceptableBid || Math.floor(requirement.budget * 0.85);
  const currentLowest = requirement.lowestBid || ceiling;

  const [bidAmount, setBidAmount] = useState<number>(
    Math.min(ceiling, currentLowest > 1000 ? currentLowest - 1000 : ceiling)
  );
  const [proposalNotes, setProposalNotes] = useState('');
  const [includeOperator, setIncludeOperator] = useState(true);
  const [selectedGear, setSelectedGear] = useState<string[]>(requirement.equipmentNeeded || []);

  const isValidBid = bidAmount <= ceiling && bidAmount > 0;
  const discountPercent = Math.round(((requirement.budget - bidAmount) / requirement.budget) * 100);
  const hostFee = Math.round(bidAmount * 0.1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBid) return;

    onSubmit(requirement._id, {
      amount: bidAmount,
      proposalNotes: `${proposalNotes}${includeOperator ? ' (Includes on-site technician & transport)' : ''}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#f95724]">Place a bid</p>
            <h2 className="text-xl font-bold text-slate-900">{requirement.title}</h2>
            <p className="text-sm text-slate-500">
              {requirement.location.area}, {requirement.location.city} · {requirement.guestCount} guests · {requirement.eventDate}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm">
          <div>
            <div className="text-xs text-slate-500">Host budget</div>
            <div className="text-base font-semibold text-slate-800 mt-0.5">₹{requirement.budget.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-[#f95724]">Bid up to</div>
            <div className="text-base font-semibold text-[#f95724] mt-0.5">₹{ceiling.toLocaleString()}</div>
            <div className="text-xs text-slate-500">15% below budget</div>
          </div>
          <div>
            <div className="text-xs text-emerald-700">Lowest bid now</div>
            <div className="text-base font-semibold text-emerald-700 mt-0.5">
              {requirement.lowestBid ? `₹${requirement.lowestBid.toLocaleString()}` : 'No bids yet'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="bid-amount" className="font-semibold text-slate-900">
                Your price (₹)
              </label>
              <span className={`font-medium ${isValidBid ? 'text-emerald-700' : 'text-rose-600'}`}>
                {discountPercent >= 0
                  ? `${discountPercent}% below budget`
                  : `${Math.abs(discountPercent)}% above budget`}
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-base">
                ₹
              </div>
              <input
                id="bid-amount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min="1000"
                max={ceiling}
                required
                className={`w-full pl-9 pr-4 py-3.5 rounded-2xl bg-white border text-lg font-semibold text-slate-900 focus:outline-none transition ${
                  isValidBid
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-rose-400 focus:border-rose-500'
                }`}
              />
            </div>

            {isValidBid ? (
              <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Good. This bid is within the ₹{ceiling.toLocaleString()} limit.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Too high. Bid ₹{ceiling.toLocaleString()} or less.</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => setBidAmount(ceiling)}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
            >
              Use limit (₹{ceiling.toLocaleString()})
            </button>
            {requirement.lowestBid && (
              <button
                type="button"
                onClick={() => setBidAmount(requirement.lowestBid! - 1000)}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
              >
                ₹1,000 below lowest (₹{(requirement.lowestBid - 1000).toLocaleString()})
              </button>
            )}
          </div>

          {requirement.equipmentNeeded && requirement.equipmentNeeded.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Equipment you will bring</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {requirement.equipmentNeeded.map((eq) => (
                  <label
                    key={eq}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 cursor-pointer hover:border-orange-300"
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

          <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <div className="text-sm font-semibold text-slate-900">Operator included</div>
              <div className="text-sm text-slate-500">Someone from your team runs the setup at the event</div>
            </div>
            <input
              type="checkbox"
              checked={includeOperator}
              onChange={(e) => setIncludeOperator(e.target.checked)}
              className="w-4 h-4 accent-[#f95724]"
            />
          </label>

          <div className="space-y-1.5">
            <label htmlFor="bid-notes" className="text-sm font-semibold text-slate-900">
              Note to host (optional)
            </label>
            <textarea
              id="bid-notes"
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
              placeholder="e.g. JBL speakers, setup ready 2 hours before the event."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f95724]"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-2">
            <div className="flex justify-between text-base font-semibold text-emerald-700">
              <span>You receive</span>
              <span>₹{bidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Host pays (your bid + 10% EzzyGo fee)</span>
              <span>₹{(bidAmount + hostFee).toLocaleString()}</span>
            </div>
            <p className="text-slate-500">
              EzzyGo holds the host's payment and sends you the full bid after the event.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidBid}
              className="px-6 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition active:scale-95 cursor-pointer"
            >
              Send bid
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
