import { Check, ArrowRight, Edit3, Bell, Search } from 'lucide-react';
import ezgoLogo from '../assets/ezgo-logo.png';

interface BiddingShowcaseProps {
  onOpenPostModal: () => void;
}

export default function BiddingShowcase({ onOpenPostModal }: BiddingShowcaseProps) {
  const checkItems = [
    'At least 15% lower than your budget',
    'Verified and rated providers',
    'No hidden charges',
    'Secure payments and refunds'
  ];

  const appBids = [
    {
      name: 'Royal Events',
      rating: '4.9 (320 jobs)',
      price: '22,000',
      savings: '3,000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'Pixel Stories',
      rating: '4.8 (186 jobs)',
      price: '20,500',
      savings: '4,500',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'Dream Decor',
      rating: '4.7 (150 jobs)',
      price: '21,000',
      savings: '4,000',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'Shree Sound',
      rating: '4.6 (90 jobs)',
      price: '19,500',
      savings: '5,500',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <section id="reverse-bidding" className="relative py-16 sm:py-24 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column: Benefits & Action (5.5 cols on lg) */}
          <div className="lg:col-span-5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-[1.5px] bg-[#FF5A1F]" />
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#FF5A1F] uppercase">
                BUILT FOR YOUR BUDGET
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Let Providers <br />
              Compete for You
            </h2>

            <p className="mt-4 text-xs sm:text-sm text-white/80 leading-relaxed max-w-md">
              Get the same event service at better prices through reverse bidding. More competition. More savings.
            </p>

            {/* Checklist items */}
            <div className="mt-6 space-y-3">
              {checkItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                  <div className="w-4 h-4 rounded-full bg-[#FF5A1F] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <button
                onClick={onOpenPostModal}
                className="px-6 py-3 rounded-full bg-[#FF5A1F] hover:bg-[#E44C13] text-white font-semibold text-xs sm:text-sm shadow-xl shadow-[#FF5A1F]/30 transition flex items-center gap-2"
              >
                <span>Post a Requirement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Column: Phone Mockup (5 cols on lg) */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-[280px] sm:w-[310px] rounded-[42px] p-3 bg-black border-4 border-slate-700/80 shadow-2xl shadow-black">
              
              {/* Dynamic island notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20" />

              {/* Screen */}
              <div className="rounded-[34px] bg-white text-[#07141C] p-4 pt-7 overflow-hidden font-sans">
                
                {/* In-app Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <img src={ezgoLogo} alt="EzGo" className="h-5 w-auto object-contain" />
                  <div className="flex items-center gap-2 text-slate-500">
                    <Search className="w-3.5 h-3.5" />
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Budget Header */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Your Budget
                    </span>
                    <span className="font-bold text-base text-[#07141C]">
                      ₹25,000
                    </span>
                  </div>
                  <button className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-medium text-slate-600 shadow-sm">
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 4 Competing Bids inside Phone */}
                <div className="space-y-2">
                  {appBids.map((bid, bIdx) => (
                    <div
                      key={bIdx}
                      className="p-2 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={bid.avatar}
                          alt={bid.name}
                          className="w-7 h-7 rounded-full object-cover border"
                        />
                        <div className="text-left">
                          <p className="font-bold text-[11px] text-[#07141C] leading-none">
                            {bid.name}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            ★ {bid.rating}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-xs text-[#07141C]">
                          ₹{bid.price}
                        </p>
                        <p className="text-[9px] text-emerald-600 font-semibold">
                          Save ₹{bid.savings}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Handwritten Luxury Script (2.5 cols on lg) */}
          <div className="lg:col-span-3 text-center lg:text-left hidden lg:block">
            <div className="font-script text-3xl sm:text-4xl text-white/90 leading-tight">
              More Bids <br />
              <span className="text-amber-200">Better Prices</span> <br />
              For Your Event
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
