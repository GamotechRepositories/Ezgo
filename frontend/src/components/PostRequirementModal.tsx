import React, { useState, useEffect } from 'react';
import { X, Sparkles, IndianRupee, ShieldCheck, Calendar, Clock, MapPin, Users, Check, ArrowRight } from 'lucide-react';
import type { Category, Requirement } from '../types';
import { EVENT_CATEGORIES } from '../data/eventData';

interface PostRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: Partial<Requirement>) => Promise<void>;
  requesterId: string;
  initialCategory?: string;
}

export const PostRequirementModal: React.FC<PostRequirementModalProps> = ({
  isOpen,
  onClose,
  categories: _categories,
  onSubmit,
  requesterId,
  initialCategory,
}) => {
  const [category, setCategory] = useState(initialCategory || EVENT_CATEGORIES[0]?.name);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [area, setArea] = useState('Gachibowli');
  const [venueAddress, setVenueAddress] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('23:00');
  const [guestCount, setGuestCount] = useState<number>(200);
  const [budget, setBudget] = useState<number>(25000);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync initial category if changed
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  if (!isOpen) return null;

  const activeCategoryData = EVENT_CATEGORIES.find(c => c.name === category) || EVENT_CATEGORIES[0];
  const maxAcceptableBid = Math.floor(budget * 0.85);
  const guaranteedMinSavings = budget - (maxAcceptableBid + Math.round(maxAcceptableBid * 0.10));

  const toggleEquipment = (eq: string) => {
    setSelectedEquipments(prev => 
      prev.includes(eq) ? prev.filter(item => item !== eq) : [...prev, eq]
    );
  };

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
        imageUrl: activeCategoryData.image,
        equipmentNeeded: selectedEquipments,
        location: { city, area, venueAddress },
        eventDate,
        timeWindow: { start: startTime, end: endTime },
        guestCount,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 my-8 animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Post an Event Service Need</h2>
            <p className="text-xs text-slate-500">Verified vendors will compete with ≥15% discounts below your budget ceiling</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Service Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Service Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.name);
                    setSelectedEquipments([]);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    category === cat.name
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold line-clamp-1">{cat.name.split('/')[0]}</span>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">{cat.avgPriceRange.split('-')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Event Requirement Title
            </label>
            <input
              type="text"
              placeholder="e.g. Sangeet DJ with Truss & Moving Head Lights (250 Guests)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          {/* Optional Equipments / Specialties Pills */}
          {activeCategoryData.sampleEquipments && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Include Recommended Equipment / Gear (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeCategoryData.sampleEquipments.map((eq) => {
                  const isSelected = selectedEquipments.includes(eq);
                  return (
                    <button
                      type="button"
                      key={eq}
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{eq}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Specific Needs, Playlists, or Special Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Need mix of Bollywood + Telugu tracks, 2 wireless mics for anchoring, arrival by 5:00 PM for sound check."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          {/* Location Grid */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>City</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Secunderabad">Secunderabad</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Area / Locality
              </label>
              <input
                type="text"
                placeholder="e.g. Gachibowli, Madhapur"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Venue Address (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Fort Grand Convention"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Date, Time & Guests Grid */}
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Event Date</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Est. Guests</span>
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Budget & Live 15% Savings Calculation Box */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-amber-600" />
                <span>Your Maximum Budget Ceiling (₹)</span>
              </label>
              <input
                type="number"
                step="500"
                min="1000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
                className="w-full sm:w-40 px-3 py-2 rounded-xl bg-white border border-amber-300 text-right font-mono font-black text-amber-700 text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Max Acceptable Bid (85%):</span>
                  <strong className="text-slate-900 font-mono text-sm">₹{maxAcceptableBid.toLocaleString()}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Guaranteed Savings:</span>
                  <strong className="text-emerald-700 font-mono text-sm">≥ ₹{guaranteedMinSavings.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs transition shadow-lg shadow-amber-500/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                'Publishing Requirement...'
              ) : (
                <>
                  <span>Publish to Verified Pros</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
