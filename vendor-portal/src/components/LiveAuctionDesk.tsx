import React, { useState } from 'react';
import { 
  Radio, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles, 
  ArrowDownRight, 
  CheckCircle2, 
  Flame,
  Search,
  ChevronRight
} from 'lucide-react';
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

  const categories = ['ALL', 'DJ & Sound Systems', 'Stage & Mandap Decoration', '4K Photography & Drone', 'Lighting & Trussing', 'Catering Buffets'];

  const filteredReqs = requirements.filter((req) => {
    const matchesCat = selectedCategory === 'ALL' || req.category === selectedCategory;
    const matchesSearch = 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 4-Step Visual Vendor Roadmap */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-900/5 border border-amber-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-amber-200/60">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f95724]/10 border border-[#f95724]/20 text-[#f95724] text-xs font-black">
              <Radio className="w-3.5 h-3.5 text-[#f95724] animate-pulse" />
              <span>HOW TO WIN & GET PAID ON EZGO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Live Reverse-Bidding Marketplace
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Customers post their event requirements. Vendors place competitive bids (minimum 15% discount required). The host selects the best bid and deposits 100% money in escrow before contact is unlocked.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenExplainer}
              className="px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#f95724]/25 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Detailed Platform Rules</span>
            </button>
          </div>
        </div>

        {/* 4 Step Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-orange-100 text-[#f95724] font-black text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">Step 1</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">1. Browse Live Demands</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Review event date, venue, guest scale, and required equipment list posted by hosts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">Step 2</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">2. Submit Lowest Bid</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Quote ≤ 85% of host budget and select the verified equipment you will supply.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">Step 3</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">3. Escrow Locked (100%)</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Host selects your bid and deposits full payment into safe escrow. Contact number is instantly unmasked!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                4
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">Step 4</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">4. Complete & Get Paid</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Execute service at event venue. Host approves and funds are directly disbursed to your bank account.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, venue, or area..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-[#f95724]"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#f95724] text-white shadow-sm shadow-[#f95724]/30'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReqs.map((req) => {
          const isLowestBidMine = req.bids?.some(
            (b) => b.providerId._id === currentUser._id && b.amount === req.lowestBid
          );
          const hasIBidded = req.bids?.some((b) => b.providerId._id === currentUser._id);
          const ceiling = req.maxAcceptableBid || Math.round(req.budget * 0.85);

          return (
            <div
              key={req._id}
              className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-orange-300 p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className="space-y-4">
                
                {/* Header: Category Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#f95724] text-xs font-bold">
                      {req.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <Flame className="w-3 h-3 text-emerald-600 animate-pulse" />
                      <span>{req.bidsCount} Active Bids</span>
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Live Auction</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#f95724] transition">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#f95724]" />
                      <span>Location</span>
                    </div>
                    <div className="font-bold text-slate-800 mt-0.5 truncate">
                      {req.location.area}, {req.location.city}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#f95724]" />
                      <span>Event Date</span>
                    </div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {req.eventDate}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#f95724]" />
                      <span>Guest Scale</span>
                    </div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {req.guestCount} Guests
                    </div>
                  </div>
                </div>

                {/* Equipment Check Requirements */}
                {req.equipmentNeeded && req.equipmentNeeded.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Required Equipment Specs:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {req.equipmentNeeded.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200"
                        >
                          ✓ {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer: Price Targets & Place Bid CTA */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Price Benchmark Column */}
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Host Budget</div>
                    <div className="text-sm font-extrabold text-slate-700">
                      ₹{req.budget.toLocaleString()}
                    </div>
                  </div>

                  <div className="w-px h-8 bg-slate-200" />

                  <div>
                    <div className="text-[10px] font-bold uppercase text-[#f95724] flex items-center gap-0.5">
                      <span>Max Ceiling (15% Off)</span>
                    </div>
                    <div className="text-sm font-black text-[#f95724]">
                      ≤ ₹{ceiling.toLocaleString()}
                    </div>
                  </div>

                  {req.lowestBid && (
                    <>
                      <div className="w-px h-8 bg-slate-200" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-0.5">
                          <ArrowDownRight className="w-3 h-3" />
                          <span>Lowest Bid</span>
                        </div>
                        <div className="text-sm font-black text-emerald-600">
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
                      className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isLowestBidMine ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">Lowest Bidder</span>
                        </>
                      ) : (
                        <>
                          <span>Revise Lower Bid</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenBidModal(req)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/25 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Place Lowest Bid</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};