import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  TrendingDown, 
  ShieldCheck, 
  Clock,
  ArrowDownRight
} from 'lucide-react';
import { LIVE_BIDS_INITIAL } from '../data/landingData';
import type { LiveBidItem } from '../data/landingData';

interface LiveBidsCardProps {
  onSelectBid?: (bid: LiveBidItem) => void;
}

export default function LiveBidsCard({ onSelectBid }: LiveBidsCardProps) {
  const [bids] = useState<LiveBidItem[]>(LIVE_BIDS_INITIAL);
  const [activeHighlight, setActiveHighlight] = useState<string>('bid-2');
  const [secondsRemaining, setSecondsRemaining] = useState(48);

  // Simulate dynamic bidding timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto group">
      {/* Ambient background glow behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#FF5A1F]/30 via-amber-500/20 to-teal-500/20 rounded-[28px] blur-xl opacity-80 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative rounded-[24px] bg-gradient-to-b from-[#FFF8EE]/95 via-white/95 to-[#F8EBDD]/90 p-5 sm:p-6 shadow-2xl shadow-black/40 border border-white/60 backdrop-blur-2xl text-[#07141C]">
        
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#07141C]/10">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A1F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF5A1F]"></span>
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#07141C] tracking-tight">
                Live Bids on Your Requirement
              </h3>
              <p className="text-[11px] text-[#07141C]/60 font-medium flex items-center gap-1">
                <span>Requirement: </span>
                <span className="font-semibold text-[#07141C]">Wedding DJ & Staging</span>
                <span className="text-slate-400">•</span>
                <span className="text-[#FF5A1F] font-semibold">Budget ₹10,000</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] text-[11px] font-semibold">
            <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            <span>00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}</span>
          </div>
        </div>

        {/* Live Reverse Bids List */}
        <div className="mt-4 space-y-3">
          {bids.map((bid) => {
            const isLowest = bid.id === 'bid-2';
            return (
              <div
                key={bid.id}
                onClick={() => {
                  setActiveHighlight(bid.id);
                  if (onSelectBid) onSelectBid(bid);
                }}
                className={`relative p-3.5 rounded-2xl transition-all duration-300 cursor-pointer border ${
                  activeHighlight === bid.id
                    ? 'bg-white shadow-lg shadow-[#07141C]/8 border-[#FF5A1F]/40 scale-[1.02]'
                    : 'bg-white/60 hover:bg-white/90 border-[#07141C]/5'
                }`}
              >
                {isLowest && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm">
                    <TrendingDown className="w-2.5 h-2.5" />
                    Lowest Bid
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  {/* Left: Provider info */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bid.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-md`}>
                      {bid.avatarText}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#07141C] tracking-tight">
                          {bid.providerName}
                        </span>
                        {bid.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#07141C]/65 mt-0.5">
                        <span className="font-semibold text-amber-600 flex items-center gap-0.5">
                          ⭐ {bid.rating}
                        </span>
                        <span>•</span>
                        <span>{bid.reviewsCount} jobs</span>
                        <span>•</span>
                        <span className="text-[10px] text-slate-400">{bid.bidTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Bid Price & Savings */}
                  <div className="text-right">
                    <div className="font-mono font-bold text-base text-[#07141C] tracking-tight">
                      ₹{bid.bidAmount.toLocaleString()}
                    </div>
                    <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 text-[10px] font-bold mt-0.5">
                      <ArrowDownRight className="w-3 h-3 text-emerald-700" />
                      Save ₹{bid.savings.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card Bottom Micro Bar */}
        <div className="mt-4 pt-3.5 border-t border-[#07141C]/10 flex items-center justify-between text-xs text-[#07141C]/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-[11px]">All bids ≥15% lower guaranteed</span>
          </div>

          <span className="text-[11px] font-bold text-[#FF5A1F] hover:underline cursor-pointer flex items-center gap-0.5">
            Compare 4 Bids →
          </span>
        </div>
      </div>
    </div>
  );
}
