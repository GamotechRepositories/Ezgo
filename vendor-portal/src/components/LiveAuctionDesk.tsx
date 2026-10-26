import React, { useState } from 'react';
import {
  CheckCircle2,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Trophy,
  AlertTriangle,
  Info,
  Flame,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  ArrowUpDown,
} from 'lucide-react';
import type { Requirement, User, Bid } from '../types';
import { CardImageGallery } from './CardImageGallery';

export type SortOption =
  | 'EVENT_DATE_ASC'
  | 'NEWEST'
  | 'BUDGET_DESC'
  | 'BUDGET_ASC'
  | 'FEWEST_BIDS'
  | 'MOST_BIDS';

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
  const rawServiceArea = currentUser.serviceArea || currentUser.kycDocuments?.businessAddress || '';
  const vendorCity = rawServiceArea ? rawServiceArea.split(',')[0].trim() : '';

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('EVENT_DATE_ASC');
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'MY_CITY' | 'MY_BIDS' | 'OUTBID'>('ALL');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Helper to normalize city names (handles Bangalore/Bengaluru, Delhi/NCR, case differences)
  const normalizeCity = (c?: string) => {
    if (!c) return '';
    const s = c.toLowerCase().trim();
    if (s.includes('bengaluru') || s.includes('bangalore')) return 'bengaluru';
    if (s.includes('delhi') || s.includes('ncr')) return 'delhi';
    return s.split(' ')[0].replace(/[^a-z]/g, '');
  };

  const didAutoCity = React.useRef(false);
  React.useEffect(() => {
    if (didAutoCity.current || !vendorCity) return;
    const open = requirements.filter((r) => r.status === 'OPEN');
    const local = open.filter(
      (r) => normalizeCity(r.location?.city) === normalizeCity(vendorCity)
    );
    if (local.length > 0) {
      setSelectedCity(vendorCity);
      setActiveFilterTab('MY_CITY');
      didAutoCity.current = true;
    } else if (open.length > 0) {
      setSelectedCity('ALL');
      setActiveFilterTab('ALL');
      didAutoCity.current = true;
    }
  }, [vendorCity, requirements]);

  const canonicalCityName = (c: string) => {
    const norm = normalizeCity(c);
    if (norm === 'bengaluru') return 'Bengaluru';
    if (norm === 'delhi') return 'Delhi NCR';
    return c.trim();
  };

  // Only OPEN requirements are available for live reverse bidding
  const openReqs = requirements.filter((req) => req.status === 'OPEN');

  // Categories list scoped to selected city so numbers match what is actually available!
  const scopedCityReqs = openReqs.filter((req) => {
    if (selectedCity === 'ALL') return true;
    return normalizeCity(req.location?.city) === normalizeCity(selectedCity);
  });
  const categories = ['ALL', ...Array.from(new Set(scopedCityReqs.map((r) => r.category).filter(Boolean))).sort()];

  // Cities list deduplicated by normalized city
  const defaultCities = ['Pune', 'Mumbai', 'Hyderabad', 'Bengaluru', 'Delhi NCR', 'Nagpur', 'Goa', 'Jaipur'];
  const reqCities = openReqs.map((r) => r.location?.city).filter(Boolean) as string[];
  const rawCities = [...(vendorCity ? [vendorCity] : []), ...defaultCities, ...reqCities];
  const uniqueCitiesMap = new Map<string, string>();
  rawCities.forEach((city) => {
    const norm = normalizeCity(city);
    if (norm && !uniqueCitiesMap.has(norm)) {
      uniqueCitiesMap.set(norm, canonicalCityName(city));
    }
  });
  const cities = ['ALL', ...Array.from(uniqueCitiesMap.values())];

  // Helper to extract vendor's bid on a requirement
  const getMyBid = (req: Requirement): Bid | undefined => {
    return req.bids?.find((b) => {
      const pId = typeof b.providerId === 'object' ? b.providerId?._id : b.providerId;
      return String(pId) === String(currentUser._id);
    });
  };

  // Metrics
  const myBidsReqs = openReqs.filter((r) => !!getMyBid(r));
  const leadingBidsReqs = openReqs.filter((r) => {
    const myBid = getMyBid(r);
    return myBid && r.lowestBid && myBid.amount === r.lowestBid;
  });
  const outbidReqs = openReqs.filter((r) => {
    const myBid = getMyBid(r);
    return myBid && r.lowestBid && myBid.amount > r.lowestBid;
  });
  const myCityReqs = openReqs.filter((r) =>
    vendorCity && r.location?.city && r.location.city.toLowerCase().includes(vendorCity.toLowerCase())
  );

  // Filtered requirements
  const filteredReqs = openReqs.filter((req) => {
    const myBid = getMyBid(req);
    const isOutbid = myBid && req.lowestBid && myBid.amount > req.lowestBid;

    // Filter tab
    if (activeFilterTab === 'MY_CITY') {
      if (!vendorCity || normalizeCity(req.location?.city) !== normalizeCity(vendorCity)) {
        return false;
      }
    } else if (activeFilterTab === 'MY_BIDS') {
      if (!myBid) return false;
    } else if (activeFilterTab === 'OUTBID') {
      if (!isOutbid) return false;
    }

    // City dropdown/pill filter with normalized matching
    const matchesCity =
      selectedCity === 'ALL' ||
      normalizeCity(req.location?.city) === normalizeCity(selectedCity);

    // Category filter
    const matchesCat = selectedCategory === 'ALL' || req.category === selectedCategory;

    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      req.title.toLowerCase().includes(q) ||
      (req.description && req.description.toLowerCase().includes(q)) ||
      (req.location.city && req.location.city.toLowerCase().includes(q)) ||
      (req.location.area && req.location.area.toLowerCase().includes(q)) ||
      (req.eventType && req.eventType.toLowerCase().includes(q)) ||
      (req.category && req.category.toLowerCase().includes(q));

    return matchesCity && matchesCat && matchesSearch;
  });

  // Sorting logic based on user's active choice
  const sortedReqs = [...filteredReqs].sort((a, b) => {
    if (sortBy === 'EVENT_DATE_ASC') {
      const dateA = a.eventDate ? new Date(a.eventDate).getTime() : Infinity;
      const dateB = b.eventDate ? new Date(b.eventDate).getTime() : Infinity;
      return dateA - dateB;
    }
    if (sortBy === 'NEWEST') {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    }
    if (sortBy === 'BUDGET_DESC') {
      return (b.budget || 0) - (a.budget || 0);
    }
    if (sortBy === 'BUDGET_ASC') {
      return (a.budget || 0) - (b.budget || 0);
    }
    if (sortBy === 'FEWEST_BIDS') {
      return (a.bidsCount || 0) - (b.bidsCount || 0);
    }
    if (sortBy === 'MOST_BIDS') {
      return (b.bidsCount || 0) - (a.bidsCount || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">

      {/* Top Banner: Real-Time Market Overview & Quick Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-700/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Live Reverse Bidding Market
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Event Leads & Reverse Auctions
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Hosts have posted these verified event requirements with budgets. Submit your lowest eligible quote (<span className="text-orange-400 font-semibold">at least 15% below host budget</span>). When accepted, you receive <span className="text-emerald-400 font-semibold">100% of your bid</span> directly into your bank via EzzyGo Escrow!
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="px-4 py-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-4 h-4 text-orange-400" />
              <span>{showHowItWorks ? 'Hide Rules' : 'How Bidding Works'}</span>
            </button>
            <button
              onClick={onOpenExplainer}
              className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>15% Rule Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Summary Metric Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium">Open Leads</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{openReqs.length}</div>
            <div className="text-[11px] text-slate-400">Ready for bids</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium">In {vendorCity || 'Your City'}</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-400 mt-0.5">{myCityReqs.length}</div>
            <div className="text-[11px] text-slate-400">Local opportunities</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium">Your Active Bids</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-0.5">{myBidsReqs.length}</div>
            <div className="text-[11px] text-slate-400">Events bid on</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium">Leading (Lowest)</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">{leadingBidsReqs.length}</div>
            <div className="text-[11px] text-emerald-300">Ranked #1 to win</div>
          </div>
        </div>
      </div>

      {/* Expandable "How Reverse Bidding Works" Educational Box */}
      {showHowItWorks && (
        <div className="rounded-3xl bg-orange-50/90 border border-orange-200/80 p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-slate-900 text-base">Simple 4-Step Reverse Bidding Process</h3>
            </div>
            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
              Host Pays · EzzyGo Protects
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-white border border-orange-100 space-y-1.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">1</div>
              <h4 className="font-bold text-slate-900">Host Sets Budget</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Client posts the requirement with their maximum target budget (e.g. ₹50,000).
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-orange-100 space-y-1.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">2</div>
              <h4 className="font-bold text-slate-900">15% Rule Ceiling</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Your bid must be at least 15% lower than host budget (e.g. ₹42,500 or below).
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-orange-100 space-y-1.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">3</div>
              <h4 className="font-bold text-slate-900">Lowest Bid Leads</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Other vendors will compete. The lowest bid holds the winning position. You can revise anytime!
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-orange-100 space-y-1.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">4</div>
              <h4 className="font-bold text-slate-900">100% Guaranteed Payout</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                When accepted, host funds escrow upfront. After event, you get 100% of your bid with 0% vendor deduction!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Navigation Tabs */}
      <div className="space-y-4">
        {/* Quick Filter Views */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveFilterTab('ALL');
              setSelectedCity('ALL');
            }}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilterTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Open Leads</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-extrabold">{openReqs.length}</span>
          </button>

          {vendorCity && (
            <button
              type="button"
              onClick={() => {
                setActiveFilterTab('MY_CITY');
                setSelectedCity(vendorCity);
              }}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeFilterTab === 'MY_CITY'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>In {vendorCity}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 text-[11px] font-extrabold">{myCityReqs.length}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveFilterTab('MY_BIDS')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilterTab === 'MY_BIDS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>My Placed Bids</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[11px] font-extrabold">{myBidsReqs.length}</span>
          </button>

          {outbidReqs.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilterTab('OUTBID')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer animate-pulse ${
                activeFilterTab === 'OUTBID'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Outbid Alerts!</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[11px] font-extrabold">{outbidReqs.length}</span>
            </button>
          )}
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, area, city or occasion"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-orange-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs min-w-0">
          <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0 mr-1">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>City:</span>
          </span>
          {cities.map((c) => {
            const isMatch = selectedCity === c || (c !== 'ALL' && normalizeCity(c) === normalizeCity(selectedCity));
            const isVendorCity = vendorCity && c !== 'ALL' && normalizeCity(c) === normalizeCity(vendorCity);
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedCity(c);
                  if (isVendorCity) {
                    setActiveFilterTab('MY_CITY');
                  } else if (c === 'ALL') {
                    setActiveFilterTab('ALL');
                  } else if (activeFilterTab === 'MY_CITY') {
                    setActiveFilterTab('ALL');
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 active:scale-95 ${
                  isMatch
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{c === 'ALL' ? 'All Cities' : c}</span>
                {isVendorCity && (
                  <span className={`text-[10px] px-1 py-0.2 rounded-full font-bold uppercase ${isMatch ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>
                    My City
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none min-w-0">
          {categories.map((cat) => {
            const count = cat === 'ALL' ? scopedCityReqs.length : scopedCityReqs.filter((r) => r.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active City Filter Alert Banner */}
      {selectedCity !== 'ALL' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200 text-xs sm:text-sm text-orange-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              Showing requests in <strong>{selectedCity}</strong>
              {vendorCity && selectedCity.toLowerCase() === vendorCity.toLowerCase() && ' (Your Operating City)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCity('ALL');
              setActiveFilterTab('ALL');
            }}
            className="text-xs font-bold text-orange-700 hover:text-orange-900 underline cursor-pointer self-start sm:self-auto"
          >
            Show All Cities Across India ({openReqs.length})
          </button>
        </div>
      )}

      {/* Results Indicator & Multi-Option Sorting Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1 pt-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-900">{sortedReqs.length}</strong> active event leads
            {selectedCity !== 'ALL' && ` in ${selectedCity}`}
            {selectedCategory !== 'ALL' && ` for ${selectedCategory}`}
          </span>
          {sortedReqs.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-600 font-semibold ml-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Bidding Open
            </span>
          )}
        </div>

        {/* Sorting Dropdown Control */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span className="font-semibold text-slate-700 whitespace-nowrap">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-orange-500 shadow-2xs cursor-pointer"
          >
            <option value="EVENT_DATE_ASC">📅 Event Date (Soonest First)</option>
            <option value="NEWEST">🕒 Recently Posted (Newest)</option>
            <option value="BUDGET_DESC">💰 Highest Budget (₹ High to Low)</option>
            <option value="BUDGET_ASC">📉 Lowest Budget (₹ Low to High)</option>
            <option value="FEWEST_BIDS">🎯 Fewest Bids (Less Competition)</option>
            <option value="MOST_BIDS">🔥 Most Bids (Popular)</option>
          </select>
        </div>
      </div>

      {/* Requirements List (The Open Listings) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedReqs.map((req) => {
          const myBid = getMyBid(req);
          const hasIBidded = !!myBid;
          const isLowestBidMine = hasIBidded && req.lowestBid && myBid.amount === req.lowestBid;
          const isOutbid = hasIBidded && req.lowestBid && myBid.amount > req.lowestBid;

          const isDateBlocked = (currentUser.unavailableDates || []).some(
            (d) => d.date === req.eventDate || (req.eventDate && d.date === req.eventDate.split('T')[0])
          );

          // 15% Rule ceiling calculation
          const ceiling = req.maxAcceptableBid || Math.floor(req.budget * 0.85);

          // City match check
          const isLocalLead = vendorCity && req.location?.city?.toLowerCase().includes(vendorCity.toLowerCase());

          // Formatted event date
          let formattedDate = req.eventDate;
          try {
            if (req.eventDate) {
              formattedDate = new Date(req.eventDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
            }
          } catch (e) {
            formattedDate = req.eventDate;
          }

          return (
            <div
              key={req._id}
              className={`group relative rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-xl ${
                isLowestBidMine
                  ? 'border-emerald-300 ring-2 ring-emerald-500/10 hover:border-emerald-400'
                  : isOutbid
                  ? 'border-amber-300 ring-2 ring-amber-500/10 hover:border-amber-400'
                  : 'border-slate-200/90 hover:border-orange-300'
              } p-5 sm:p-6`}
            >
              <div className="space-y-4">

                {/* 1. Header Badges: Category, Occasion, Local City Match & Auction Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Category Pill */}
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wide flex items-center gap-1">
                      <span>{req.category}</span>
                    </span>

                    {/* Occasion / Event Type Pill */}
                    {req.eventType && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 flex items-center gap-1">
                        <span>🎪 {req.eventType}</span>
                      </span>
                    )}

                    {/* Local City Match Badge */}
                    {isLocalLead && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>In Your City</span>
                      </span>
                    )}
                  </div>

                  {/* Bids Count Badge */}
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {req.bidsCount && req.bidsCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-600" />
                        <span>{req.bidsCount} {req.bidsCount === 1 ? 'Bid' : 'Bids'} Placed</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span>Be First Bidder!</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Image Gallery with Multi-Image Support */}
                <CardImageGallery
                  images={req.images && req.images.length > 0 ? req.images : [req.imageUrl || (
                    req.category?.toLowerCase().includes('sound') || req.category?.toLowerCase().includes('dj')
                      ? 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
                      : req.category?.toLowerCase().includes('decor') || req.category?.toLowerCase().includes('mandap') || req.category?.toLowerCase().includes('stage')
                      ? 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
                      : req.category?.toLowerCase().includes('photo') || req.category?.toLowerCase().includes('drone') || req.category?.toLowerCase().includes('camera')
                      ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
                      : req.category?.toLowerCase().includes('cater') || req.category?.toLowerCase().includes('food')
                      ? 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80'
                  )]}
                  fallbackImage="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80"
                  alt={req.title}
                  className="w-full aspect-16/9 max-h-52 rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs"
                  badge={
                    <div className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                      {req.category}
                    </div>
                  }
                />

                {/* 3. Title & Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-orange-600 transition leading-snug">
                    {req.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                {/* 4. Event Specifications Grid (Date, Venue, Guests, Time) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      <span>Event Date</span>
                    </span>
                    <div className="font-bold text-slate-800 truncate">{formattedDate}</div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>Location</span>
                    </span>
                    <div className="font-bold text-slate-800 truncate" title={`${req.location.area}, ${req.location.city}`}>
                      {req.location.area}, {req.location.city}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-orange-500" />
                      <span>Guests</span>
                    </span>
                    <div className="font-bold text-slate-800">{req.guestCount || 0} People</div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      <span>Time Window</span>
                    </span>
                    <div className="font-bold text-slate-800 truncate">
                      {req.timeWindow?.start && req.timeWindow?.end
                        ? `${req.timeWindow.start} - ${req.timeWindow.end}`
                        : 'Standard'}
                    </div>
                  </div>
                </div>

                {/* 5. Equipment & Items Needed */}
                {req.equipmentNeeded && req.equipmentNeeded.length > 0 && (
                  <div className="space-y-1.5 pt-0.5">
                    <div className="text-xs font-semibold text-slate-500">
                      Required Equipment / Gear Checklist:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {req.equipmentNeeded.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-orange-50/70 text-slate-700 text-xs font-medium border border-orange-200/60 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-orange-600" />
                          <span>{eq}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Transparent Reverse Bidding Price Dashboard */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                  <div className="px-3.5 py-1.5 bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Reverse Bidding Pricing Desk</span>
                    <span className="text-orange-600 font-semibold lowercase">15% discount rule applies</span>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-slate-200 p-3 text-center sm:text-left sm:p-3.5">
                    {/* Host Budget */}
                    <div className="px-1.5 sm:px-2 space-y-0.5">
                      <div className="text-[11px] text-slate-500 font-medium">Host Budget</div>
                      <div className="text-sm sm:text-base font-bold text-slate-700">
                        ₹{req.budget.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">Target budget</div>
                    </div>

                    {/* Max Allowed Bid (15% Rule Ceiling) */}
                    <div className="px-1.5 sm:px-2 space-y-0.5 bg-orange-50/40">
                      <div className="text-[11px] text-orange-700 font-bold">Bid Up To (Max)</div>
                      <div className="text-sm sm:text-base font-extrabold text-orange-600">
                        ₹{ceiling.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-orange-700">Min 15% discount</div>
                    </div>

                    {/* Current Lowest Bid */}
                    <div className="px-1.5 sm:px-2 space-y-0.5">
                      <div className="text-[11px] text-emerald-700 font-bold">Winning Bid</div>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-700">
                        {req.lowestBid ? `₹${req.lowestBid.toLocaleString()}` : 'None Yet'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {req.lowestBid ? 'Lowest quote right now' : 'First bid has edge'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Vendor Personal Bid Status Banner (CRITICAL FOR CLARITY!) */}
                {hasIBidded && myBid && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                      isLowestBidMine
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isOutbid
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                    {isLowestBidMine ? (
                      <Trophy className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : isOutbid ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Your Current Bid: ₹{myBid.amount.toLocaleString()}</span>
                        {isLowestBidMine ? (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px] uppercase">
                            🏆 Leading #1
                          </span>
                        ) : isOutbid ? (
                          <span className="px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px] uppercase">
                            ⚠️ Outbid
                          </span>
                        ) : null}
                      </div>

                      {isLowestBidMine ? (
                        <p className="text-[11px] text-emerald-800">
                          Great job! Your bid is currently the lowest quote. The host can accept your bid anytime to start escrow payment.
                        </p>
                      ) : isOutbid ? (
                        <p className="text-[11px] text-amber-800">
                          Another vendor bid lower (<strong>₹{req.lowestBid?.toLocaleString()}</strong>). Click below to lower your bid to <strong>₹{(req.lowestBid! - 500).toLocaleString()}</strong> or less to reclaim the winning spot!
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* 8. Calendar Date Conflict Notice */}
                {isDateBlocked && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Schedule Conflict:</strong> You marked yourself unavailable on {req.eventDate} in your Availability Calendar.
                    </span>
                  </div>
                )}

              </div>

              {/* 9. Card Bottom Action Bar: Guarantee Note & Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Escrow Protection · Zero vendor deduction</span>
                </div>

                <div className="shrink-0">
                  {isDateBlocked ? (
                    <button
                      disabled
                      className="w-full sm:w-auto px-5 py-2.5 min-h-[42px] rounded-full bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Date Blocked</span>
                    </button>
                  ) : hasIBidded ? (
                    <button
                      onClick={() => onOpenBidModal(req)}
                      className={`w-full sm:w-auto px-5 py-2.5 min-h-[42px] rounded-full font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                        isOutbid
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 animate-pulse'
                          : isLowestBidMine
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isOutbid ? (
                        <>
                          <Flame className="w-4 h-4 text-white" />
                          <span>Lower Bid to Win (Outbid)</span>
                        </>
                      ) : isLowestBidMine ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>You're Leading · Revise Bid</span>
                        </>
                      ) : (
                        <span>Revise Your Bid</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenBidModal(req)}
                      className="w-full sm:w-auto px-6 py-2.5 min-h-[42px] rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/25"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Place a Bid (Max ₹{ceiling.toLocaleString()})</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedReqs.length === 0 && (
        <div className="rounded-3xl bg-white border border-slate-200 p-10 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-800">
              {selectedCity !== 'ALL'
                ? `No open requests in ${selectedCity} right now`
                : 'No matching open requests right now'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {selectedCity !== 'ALL' ? (
                <>
                  There are currently no active host requests posted in <strong>{selectedCity}</strong>. However, there are <strong>{openReqs.length}</strong> active requests posted in other cities (Pune, Mumbai, etc.).
                </>
              ) : (
                'There are no open event leads matching your current category or search filters.'
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedCity('ALL');
              setActiveFilterTab('ALL');
              setSearchQuery('');
            }}
            className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold transition cursor-pointer shadow-md shadow-orange-500/20 active:scale-95"
          >
            {selectedCity !== 'ALL'
              ? `View All Leads Across India (${openReqs.length})`
              : 'Reset All Filters'}
          </button>
        </div>
      )}

    </div>
  );
};