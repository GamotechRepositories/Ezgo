import { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  TrendingDown, 
  Percent
} from 'lucide-react';

interface BiddingShowcaseProps {
  onOpenPostModal: (budget?: number) => void;
}

export default function BiddingShowcase({ onOpenPostModal }: BiddingShowcaseProps) {
  const [userBudget, setUserBudget] = useState<number>(25000);

  // Dynamic competing bids based on user budget
  const competingBids = [
    {
      name: 'Royal Events & Staging',
      rating: '4.9 ★',
      jobs: '320 jobs',
      price: Math.round(userBudget * 0.88),
      savings: Math.round(userBudget * 0.12),
      badge: 'Fastest Response'
    },
    {
      name: 'Dream Decor & Florals',
      rating: '4.8 ★',
      jobs: '186 jobs',
      price: Math.round(userBudget * 0.84),
      savings: Math.round(userBudget * 0.16),
      badge: 'Popular Choice'
    },
    {
      name: 'Pixel Stories Studios',
      rating: '4.9 ★',
      jobs: '265 jobs',
      price: Math.round(userBudget * 0.82),
      savings: Math.round(userBudget * 0.18),
      badge: 'High Value'
    },
    {
      name: 'Shree Sound & Stage',
      rating: '4.7 ★',
      jobs: '420 jobs',
      price: Math.round(userBudget * 0.78),
      savings: Math.round(userBudget * 0.22),
      badge: 'Lowest Bid',
      isBest: true
    }
  ];

  const benefits = [
    'At least 15% lower than your target budget guaranteed',
    '100% Verified, vetted and star-rated providers',
    'Zero hidden fees — transparent line-item pricing',
    'Escrow protection — 100% refundable before service milestone'
  ];

  return (
    <section id="reverse-bidding" className="relative py-20 sm:py-28 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: USP Pitch & Benefits (5 cols on lg) */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#FF5A1F] text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-6">
              <Percent className="w-3.5 h-3.5" />
              <span>EzGo's Core USP</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Let Providers <br />
              <span className="text-[#FF5A1F] italic font-normal">Compete for You</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-[#FFF8EE]/80 leading-relaxed">
              Traditional event agencies inflate quotes. On EzGo, verified professionals place reverse bids downwards to win your booking. <strong className="text-white font-semibold">More competition means maximum savings for you.</strong>
            </p>

            {/* Benefits List */}
            <div className="mt-8 space-y-3.5">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm sm:text-base text-[#FFF8EE]/90">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10">
              <button
                onClick={() => onOpenPostModal(userBudget)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7B47] text-white font-semibold text-sm shadow-xl shadow-[#FF5A1F]/30 hover:shadow-[#FF5A1F]/50 transition duration-300 hover:scale-105 active:scale-95"
              >
                <span>Post Your Budget Requirement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Realistic Reverse Bidding Interactive UI (7 cols on lg) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[32px] p-6 sm:p-8 bg-gradient-to-b from-[#07141C]/90 via-[#07141C]/80 to-[#07141C]/95 border border-white/20 backdrop-blur-2xl shadow-2xl shadow-black/80">
              
              {/* Budget Slider Header */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-white/50 font-bold block">
                      Simulate Your Event Budget
                    </span>
                    <span className="text-xs text-[#FFF8EE]/70">
                      Drag to see how much verified vendors will bid:
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-white">
                      ₹{userBudget.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Slider Input */}
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={userBudget}
                  onChange={(e) => setUserBudget(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF5A1F]"
                />
                <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1">
                  <span>₹10,000</span>
                  <span>₹75,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>

              {/* Competing Bids Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/50 px-2 font-bold">
                  <span>Verified Vendor</span>
                  <span>Reverse Bid / Savings</span>
                </div>

                {competingBids.map((bid, bIdx) => (
                  <div
                    key={bIdx}
                    className={`p-4 rounded-2xl transition-all duration-300 flex items-center justify-between gap-3 border ${
                      bid.isBest
                        ? 'bg-gradient-to-r from-emerald-950/50 to-[#07141C]/80 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-serif font-bold text-sm text-[#FF5A1F] shrink-0">
                        0{bIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {bid.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/80">
                            {bid.badge}
                          </span>
                        </div>
                        <div className="text-xs text-white/60 mt-0.5 flex items-center gap-2">
                          <span className="text-amber-400 font-semibold">{bid.rating}</span>
                          <span>•</span>
                          <span>{bid.jobs}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Savings */}
                    <div className="text-right">
                      <div className="font-mono font-bold text-base sm:text-lg text-white">
                        ₹{bid.price.toLocaleString()}
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold mt-0.5">
                        <TrendingDown className="w-3 h-3" />
                        Save ₹{bid.savings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Summary Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#FFF8EE]/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Maximum Savings on ₹{userBudget.toLocaleString()}: <strong className="text-emerald-400 font-mono text-sm">₹{Math.round(userBudget * 0.22).toLocaleString()}</strong></span>
                </div>
                <button
                  onClick={() => onOpenPostModal(userBudget)}
                  className="text-[#FF5A1F] font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  Accept Best Bid →
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
