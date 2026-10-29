import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Requirement } from '../types';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  providerId: string;
  onSubmit: (reqId: string, bidData: any) => void;
  existingBid?: any;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({ isOpen, requirement, existingBid, ...rest }) => {
  if (!isOpen || !requirement) return null;
  return <PlaceBidForm key={requirement._id} requirement={requirement} existingBid={existingBid} {...rest} />;
};

interface PlaceBidFormProps extends Omit<PlaceBidModalProps, 'isOpen' | 'requirement'> {
  requirement: Requirement;
  existingBid?: any;
}

const PlaceBidForm: React.FC<PlaceBidFormProps> = ({
  onClose,
  requirement,
  providerId,
  onSubmit,
  existingBid,
}) => {
  const ceiling = requirement.maxAcceptableBid || Math.floor(requirement.budget * 0.85);
  const currentLowest = requirement.lowestBid || ceiling;
  const [bidAmount, setBidAmount] = useState<number | ''>(
    existingBid
      ? existingBid.amount
      : Math.min(ceiling, currentLowest > 1000 ? currentLowest - 1000 : ceiling)
  );
  const [proposalNotes, setProposalNotes] = useState(existingBid?.proposalNotes || '');
  const [includeOperator, setIncludeOperator] = useState(true);
  const [selectedGear, setSelectedGear] = useState<string[]>(requirement.equipmentNeeded || []);

  const numericBid = typeof bidAmount === 'number' ? bidAmount : 0;
  const isValidBid = typeof bidAmount === 'number' && bidAmount > 1000 && bidAmount <= ceiling && requirement.status !== 'EXPIRED';
  const discountPercent = typeof bidAmount === 'number' && bidAmount > 0
    ? Math.round(((requirement.budget - bidAmount) / requirement.budget) * 100)
    : 0;
  const hostFee = Math.round(numericBid * 0.1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBid || typeof bidAmount !== 'number') return;

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
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[#17233d]">{existingBid ? 'Revise Your Bid' : 'Place a bid'}</p>
              {existingBid && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                  Current: ₹{existingBid.amount.toLocaleString()}
                </span>
              )}
            </div>
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
            <div className="text-xs text-slate-500 font-medium">Host Budget</div>
            <div className="text-base font-bold text-slate-800 mt-0.5">₹{requirement.budget.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400">Target posted</div>
          </div>
          <div className="bg-slate-50/60 p-2 -my-2 rounded-xl border border-slate-200/60">
            <div className="text-xs text-slate-700 font-bold">Max Eligible Bid</div>
            <div className="text-base font-extrabold text-slate-700 mt-0.5">₹{ceiling.toLocaleString()}</div>
            <div className="text-[11px] text-slate-700">Min 15% discount</div>
          </div>
          <div>
            <div className="text-xs text-emerald-700 font-bold">Current Best Bid</div>
            <div className="text-base font-extrabold text-emerald-700 mt-0.5">
              {requirement.lowestBid ? `₹${requirement.lowestBid.toLocaleString()}` : 'No bids yet'}
            </div>
            <div className="text-[11px] text-slate-500">{requirement.lowestBid ? 'Quote to beat' : 'Be 1st bidder!'}</div>
          </div>
        </div>

        {existingBid && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Bid Revision Rule: </span>
              Your current bid is <strong>₹{existingBid.amount.toLocaleString()}</strong>. You can update notes, or bid lower to stay competitive.
            </div>
          </div>
        )}
        {requirement.status === 'EXPIRED' && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>This reverse auction has closed/expired. New bids are locked.</span>
          </div>
        )}
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
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setBidAmount('');
                  } else {
                    const parsed = parseInt(val, 10);
                    setBidAmount(isNaN(parsed) ? '' : parsed);
                  }
                }}
                onWheel={(e) => e.currentTarget.blur()}
                min="1000"
                max={ceiling}
                placeholder="Enter price"
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
              className="px-4 py-2.5 min-h-[40px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer active:scale-95 flex items-center justify-center"
            >
              Use limit (₹{ceiling.toLocaleString()})
            </button>
            {requirement.lowestBid && (
              <button
                type="button"
                onClick={() => setBidAmount(requirement.lowestBid! - 1000)}
                className="px-4 py-2.5 min-h-[40px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer active:scale-95 flex items-center justify-center"
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
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 cursor-pointer hover:border-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGear.includes(eq)}
                      onChange={() => handleToggleGear(eq)}
                      className="rounded accent-[#ff5c28] w-4 h-4"
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
              className="w-4 h-4 accent-[#ff5c28]"
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
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#17233d]"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-2">
            <div className="flex justify-between text-base font-semibold text-emerald-700">
              <span>You receive</span>
              <span>₹{numericBid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Host pays (your bid + 10% EzzyGo fee)</span>
              <span>₹{(numericBid + hostFee).toLocaleString()}</span>
            </div>
            <p className="text-slate-500">
              EzzyGo holds the host's payment and sends you the full bid after the event.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidBid}
              className="w-full sm:w-auto px-7 py-3 min-h-[44px] rounded-full bg-[#ff5c28] hover:bg-[#e64814] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition active:scale-95 cursor-pointer shadow-md shadow-slate-900/12 text-center"
            >
              {existingBid ? 'Update reverse bid' : 'Submit reverse bid'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
