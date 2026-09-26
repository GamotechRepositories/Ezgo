import { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2
} from 'lucide-react';
import { SERVICES_DATA } from '../data/landingData';

interface PostRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  initialCity?: string;
  initialBudget?: number;
}

export default function PostRequirementModal({
  isOpen,
  onClose,
  initialService,
  initialCity,
  initialBudget
}: PostRequirementModalProps) {
  const [step, setStep] = useState<'form' | 'bidding' | 'success'>('form');
  const [service, setService] = useState(initialService || 'DJ / Sound');
  const [city, setCity] = useState(initialCity || 'Mumbai');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState(initialBudget || 25000);
  const [guestCount, setGuestCount] = useState('150-300 guests');
  const [notes, setNotes] = useState('');
  const [isSearchingBids, setIsSearchingBids] = useState(false);
  const [bidsReceived, setBidsReceived] = useState<any[]>([]);
  const [selectedBid, setSelectedBid] = useState<any>(null);

  useEffect(() => {
    if (initialService) setService(initialService);
    if (initialCity) setCity(initialCity);
    if (initialBudget) setBudget(initialBudget);
  }, [initialService, initialCity, initialBudget]);

  if (!isOpen) return null;

  const handleSubmitRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('bidding');
    setIsSearchingBids(true);

    // Simulate real-time reverse bids arriving one by one
    setTimeout(() => {
      setBidsReceived([
        {
          id: 'b1',
          name: 'Royal Events & Staging',
          rating: '4.9 ★',
          jobs: '320 jobs',
          amount: Math.round(budget * 0.88),
          savings: Math.round(budget * 0.12),
          time: 'Just now'
        }
      ]);
    }, 1000);

    setTimeout(() => {
      setBidsReceived((prev) => [
        ...prev,
        {
          id: 'b2',
          name: 'Dream Decor & Florals',
          rating: '4.8 ★',
          jobs: '186 jobs',
          amount: Math.round(budget * 0.84),
          savings: Math.round(budget * 0.16),
          time: 'Just now'
        }
      ]);
    }, 2200);

    setTimeout(() => {
      setBidsReceived((prev) => [
        ...prev,
        {
          id: 'b3',
          name: 'Shree Sound & Production',
          rating: '4.9 ★',
          jobs: '420 jobs',
          amount: Math.round(budget * 0.78),
          savings: Math.round(budget * 0.22),
          time: 'Just now',
          isBest: true
        }
      ]);
      setIsSearchingBids(false);
    }, 3500);
  };

  const handleAcceptBid = (bid: any) => {
    setSelectedBid(bid);
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    setBidsReceived([]);
    setSelectedBid(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-[32px] bg-gradient-to-b from-[#07141C] via-[#0D222F] to-[#07141C] border border-white/20 shadow-2xl shadow-black p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: REQUIREMENT FORM */}
        {step === 'form' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[#FF5A1F] text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
                Reverse Bidding
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Post Your Event Requirement
            </h3>
            <p className="text-xs sm:text-sm text-[#FFF8EE]/70 mt-1">
              Set your target budget. Verified providers in your city will bid downwards to win your event.
            </p>

            <form onSubmit={handleSubmitRequirement} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Service */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Event Service
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                  >
                    {SERVICES_DATA.map((s) => (
                      <option key={s.id} value={s.name} className="bg-[#07141C] text-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    City / Venue Location
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                  >
                    {['Mumbai', 'Delhi NCR', 'Bengaluru', 'Jaipur', 'Hyderabad', 'Pune', 'Goa', 'Chennai'].map((c) => (
                      <option key={c} value={c} className="bg-[#07141C] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Event Date */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Expected Gathering Size
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="50-150 guests" className="bg-[#07141C] text-white">50 - 150 guests</option>
                    <option value="150-300 guests" className="bg-[#07141C] text-white">150 - 300 guests</option>
                    <option value="300-600 guests" className="bg-[#07141C] text-white">300 - 600 guests</option>
                    <option value="600+ guests" className="bg-[#07141C] text-white">600+ Royal Gathering</option>
                  </select>
                </div>
              </div>

              {/* Target Budget */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    Your Target Maximum Budget (INR)
                  </label>
                  <span className="font-mono text-base font-bold text-[#FF5A1F]">
                    ₹{budget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF5A1F]"
                />
                <p className="text-[11px] text-[#FFF8EE]/60 mt-1">
                  Providers must submit bids at least 15% below this amount to be eligible.
                </p>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Specific Requirements or Themes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need Punjabi Dhol entry, neon mandap lights, 4K teaser reels..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F] resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7B47] text-white font-bold text-sm shadow-xl shadow-[#FF5A1F]/30 hover:shadow-[#FF5A1F]/50 transition duration-300 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                <span>Request Competing Bids</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: LIVE BIDDING SIMULATION */}
        {step === 'bidding' && (
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF5A1F] block">
                  EzGo Live Reverse Auction
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Incoming Bids for {service}
                </h3>
                <p className="text-xs text-[#FFF8EE]/70 mt-0.5">
                  Target Budget: ₹{budget.toLocaleString()} • {city}
                </p>
              </div>

              {isSearchingBids && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] text-xs font-semibold animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Vetting bids...</span>
                </div>
              )}
            </div>

            {/* Bids received */}
            <div className="space-y-3 my-5">
              {bidsReceived.map((bid) => (
                <div
                  key={bid.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                    bid.isBest
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-white">
                        {bid.name}
                      </span>
                      {bid.isBest && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                          LOWEST BID
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#FFF8EE]/70 mt-0.5">
                      ⭐ {bid.rating} • {bid.jobs}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono font-bold text-lg text-white">
                        ₹{bid.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-400 font-bold">
                        Save ₹{bid.savings.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAcceptBid(bid)}
                      className="px-4 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E44C13] text-white font-bold text-xs shadow-md transition"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isSearchingBids && (
              <p className="text-center text-xs text-[#FFF8EE]/60 py-2">
                Simulating live response from verified providers in {city}...
              </p>
            )}
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && selectedBid && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/60 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Bid Successfully Locked!
            </h3>

            <p className="text-sm text-[#FFF8EE]/80 mt-2 max-w-md mx-auto">
              You selected <strong className="text-white">{selectedBid.name}</strong> for <strong className="text-emerald-400 font-mono">₹{selectedBid.amount.toLocaleString()}</strong>.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto text-left space-y-2 text-xs text-[#FFF8EE]/80">
              <div className="flex justify-between">
                <span>Original Target Budget:</span>
                <span className="font-mono font-bold">₹{budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Total Amount Saved:</span>
                <span className="font-mono">₹{selectedBid.savings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-white font-bold">
                <span>Locked Booking Price:</span>
                <span className="font-mono text-[#FF5A1F]">₹{selectedBid.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>EzGo SafeLock Escrow activated. Funds held securely.</span>
            </div>

            <button
              onClick={handleReset}
              className="mt-8 px-8 py-3.5 rounded-2xl bg-[#FF5A1F] text-white font-bold text-sm shadow-xl hover:bg-[#E44C13] transition"
            >
              Done & Return to Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
