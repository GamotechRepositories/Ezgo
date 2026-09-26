import type { LiveBidItem } from '../data/landingData';

interface LiveBidsCardProps {
  onSelectBid?: (bid: LiveBidItem) => void;
}

export default function LiveBidsCard({ onSelectBid }: LiveBidsCardProps) {
  const bids = [
    {
      id: 'bid-1',
      name: 'Royal Events',
      rating: '4.9',
      jobs: '320 jobs',
      price: '8,500',
      savings: '1,500',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'bid-2',
      name: 'Dream Decor',
      rating: '4.8',
      jobs: '186 jobs',
      price: '7,900',
      savings: '2,100',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'bid-3',
      name: 'Shree Sound',
      rating: '4.7',
      jobs: '420 jobs',
      price: '9,200',
      savings: '800',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="w-full max-w-[340px] sm:max-w-[370px]">
      <div className="rounded-2xl bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-2xl border border-white/80 text-[#07141C]">
        
        {/* Card Title */}
        <h3 className="font-semibold text-xs sm:text-sm text-[#07141C] mb-3 text-left">
          Live Bids on Your Requirement
        </h3>

        {/* 3 Live Bids */}
        <div className="space-y-2.5">
          {bids.map((bid) => (
            <div
              key={bid.id}
              onClick={() => onSelectBid && onSelectBid(bid as any)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8EE]/60 hover:bg-[#FFF8EE] border border-slate-100 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              {/* Left: Avatar + Details */}
              <div className="flex items-center gap-2.5">
                <img
                  src={bid.avatarUrl}
                  alt={bid.name}
                  className="w-9 h-9 rounded-full object-cover border border-white shadow-sm"
                />
                <div className="text-left">
                  <h4 className="font-bold text-xs text-[#07141C]">
                    {bid.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <span className="text-amber-500 font-semibold flex items-center">
                      ★ {bid.rating}
                    </span>
                    <span>•</span>
                    <span>{bid.jobs}</span>
                  </p>
                </div>
              </div>

              {/* Right: Price & Savings */}
              <div className="text-right">
                <div className="font-bold text-xs sm:text-sm text-[#07141C]">
                  ₹{bid.price}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                  Save ₹{bid.savings}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
