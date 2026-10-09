import React, { useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import type { Requirement, User } from '../types';

interface LiveAuctionDeskProps {
  requirements: Requirement[];
  currentUser: User;
  onOpenBidModal: (requirement: Requirement) => void;
  onOpenExplainer: () => void;
}

export const LiveAuctionDesk: React.FC<LiveAuctionDeskProps> = ({
  requirements,
  currentUser,
  onOpenBidModal,
  onOpenExplainer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const openReqs = requirements.filter((req) => req.status === 'OPEN');
  const categories = ['ALL', ...Array.from(new Set(openReqs.map((r) => r.category).filter(Boolean))).sort()];

  const filteredReqs = openReqs.filter((req) => {
    const matchesCat = selectedCategory === 'ALL' || req.category === selectedCategory;
    const matchesSearch = 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              How you win a job
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              The host sets a budget. Bid at or below the "Bid up to" price to be eligible. If the host picks you, you get your full bid after the event.
            </p>
          </div>
          <button
            onClick={onOpenExplainer}
            className="px-5 py-2.5 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition cursor-pointer shrink-0"
          >
            Full rules
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-sm font-semibold text-[#f95724]">1</span>
            <h3 className="text-base font-semibold text-slate-900">Pick a request</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Check the date, place, guests, and budget.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-sm font-semibold text-[#f95724]">2</span>
            <h3 className="text-base font-semibold text-slate-900">Bid at least 15% lower</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your bid must be at or below the "Bid up to" price.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-sm font-semibold text-[#f95724]">3</span>
            <h3 className="text-base font-semibold text-slate-900">Host picks and pays</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              EzzyGo holds the payment. You then see the host's phone number.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-sm font-semibold text-[#f95724]">4</span>
            <h3 className="text-base font-semibold text-slate-900">Do the event, get paid</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When the host confirms it is done, you get your full bid.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event, city, or area"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f95724]"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#f95724] text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReqs.map((req) => {
          const isLowestBidMine = req.bids?.some(
            (b) => b.providerId?._id === currentUser._id && b.amount === req.lowestBid
          );
          const hasIBidded = req.bids?.some((b) => b.providerId?._id === currentUser._id);
          const ceiling = req.maxAcceptableBid || Math.round(req.budget * 0.85);

          return (
            <div
              key={req._id}
              className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-orange-300 p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className="space-y-4">
                
                {/* Header: Category Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                    {req.category}
                  </span>
                  <span className="text-sm text-slate-500">
                    {req.bidsCount || 0} {req.bidsCount === 1 ? 'bid' : 'bids'}
                  </span>
                </div>

                {/* Image Banner */}
                <div className="mb-3.5 w-full aspect-[16/9] max-h-52 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-2xs relative group/img">
                  <img
                    src={
                      req.imageUrl ||
                      (req.category?.toLowerCase().includes('sound') || req.category?.toLowerCase().includes('dj')
                        ? 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
                        : req.category?.toLowerCase().includes('decor') || req.category?.toLowerCase().includes('mandap') || req.category?.toLowerCase().includes('stage')
                        ? 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
                        : req.category?.toLowerCase().includes('photo') || req.category?.toLowerCase().includes('drone') || req.category?.toLowerCase().includes('camera')
                        ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
                        : req.category?.toLowerCase().includes('cater') || req.category?.toLowerCase().includes('food')
                        ? 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80'
                        : req.category?.toLowerCase().includes('light')
                        ? 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80')
                    }
                    alt={req.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                    {req.category}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#f95724] transition">
                    {req.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Place</div>
                    <div className="font-medium text-slate-800 mt-0.5 truncate">
                      {req.location.area}, {req.location.city}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Date</div>
                    <div className="font-medium text-slate-800 mt-0.5">
                      {req.eventDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Guests</div>
                    <div className="font-medium text-slate-800 mt-0.5">
                      {req.guestCount}
                    </div>
                  </div>
                </div>

                {/* Equipment Check Requirements */}
                {req.equipmentNeeded && req.equipmentNeeded.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs text-slate-500">
                      Equipment needed
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {req.equipmentNeeded.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-sm border border-slate-200"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer: Price Targets & Place Bid CTA */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Price Benchmark Column */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 p-2 sm:p-0 rounded-2xl bg-slate-50 sm:bg-transparent">
                  <div>
                    <div className="text-xs text-slate-500">Host budget</div>
                    <div className="text-base font-semibold text-slate-700">
                      ₹{req.budget.toLocaleString()}
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-8 bg-slate-200" />

                  <div>
                    <div className="text-xs text-[#f95724]">Bid up to</div>
                    <div className="text-base font-semibold text-[#f95724]">
                      ₹{ceiling.toLocaleString()}
                    </div>
                  </div>

                  {req.lowestBid && (
                    <>
                      <div className="hidden sm:block w-px h-8 bg-slate-200" />
                      <div>
                        <div className="text-xs text-emerald-700">Lowest bid</div>
                        <div className="text-base font-semibold text-emerald-700">
                          ₹{req.lowestBid.toLocaleString()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Action CTA */}
                <div className="flex items-center gap-2">
                  {hasIBidded ? (
                    <button
                      onClick={() => onOpenBidModal(req)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isLowestBidMine ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">Your bid is lowest · Change</span>
                        </>
                      ) : (
                        <span>Change my bid</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenBidModal(req)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Place a bid</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {filteredReqs.length === 0 && (
        <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center">
          <h3 className="text-base font-semibold text-slate-800">No open requests right now</h3>
          <p className="text-sm text-slate-500 mt-1">
            New host requests will show up here. Try another category or clear the search.
          </p>
        </div>
      )}

    </div>
  );
};