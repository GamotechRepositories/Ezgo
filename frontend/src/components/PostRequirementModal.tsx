import React, { useState } from 'react';
import { X, Sparkles, IndianRupee, ShieldCheck } from 'lucide-react';
import type { Category, Requirement } from '../types';

interface PostRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: Partial<Requirement>) => Promise<void>;
  requesterId: string;
}

export const PostRequirementModal: React.FC<PostRequirementModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSubmit,
  requesterId,
}) => {
  const [category, setCategory] = useState(categories[0]?.name || 'DJ / Teenmar / Sound & Lighting');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [area, setArea] = useState('Gachibowli');
  const [eventDate, setEventDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('23:00');
  const [budget, setBudget] = useState<number>(15000);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const maxAcceptableBid = Math.floor(budget * 0.85);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget || !eventDate || !area) return;
    setLoading(true);
    try {
      await onSubmit({
        requesterId,
        category,
        title,
        description,
        location: { city, area, venueAddress: '' },
        eventDate,
        timeWindow: { start: startTime, end: endTime },
        guestCount: 200,
        budget,
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
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Post an Event Service Need</h2>
            <p className="text-xs text-slate-400">Providers will compete by bidding below your budget</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Service Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Service Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name} ({c.avgPriceRange})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Event Requirement Title
            </label>
            <input
              type="text"
              placeholder="e.g. Sangeet DJ with Truss & Moving Head Lights"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Specific Needs / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Details about playlist genre, food dietary requirements, special theme..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Location Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Secunderabad">Secunderabad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Area / Locality
              </label>
              <input
                type="text"
                placeholder="e.g. Madhapur, Jubilee Hills, Banjara Hills"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Event Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Budget & 15% Rule Preview */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-amber-400" />
                <span>Your Maximum Budget (₹)</span>
              </label>
              <input
                type="number"
                step="500"
                min="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
                className="w-36 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-right font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-semibold">15% Rule Guaranteed Savings:</strong> Only vendor bids at or below{' '}
                <span className="font-mono text-white font-bold">₹{maxAcceptableBid.toLocaleString()}</span> are eligible to accept.
              </div>
            </div>
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs transition shadow-lg shadow-amber-500/25 disabled:opacity-50"
            >
              {loading ? 'Posting Requirement...' : 'Publish to Verified Providers'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
