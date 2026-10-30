import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  TrendingDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Users,
  Sparkles,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import type { Requirement, Bid } from '../types';
import { CardImageGallery } from './CardImageGallery';

interface RequirementManagerProps {
  requirements: (Requirement & { bids?: Bid[] })[];
  onDeleteRequirement: (id: string) => Promise<void>;
  onUpdateRequirement?: (id: string, data: Partial<any>) => Promise<void>;
  onRefresh: () => void;
}

export const RequirementManager: React.FC<RequirementManagerProps> = ({
  requirements,
  onDeleteRequirement,
  onUpdateRequirement,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editBudgetVal, setEditBudgetVal] = useState<number>(0);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Extract unique categories and cities
  const categories = Array.from(new Set(requirements.map((r) => r.category).filter(Boolean)));
  const cities = Array.from(
    new Set(
      requirements
        .map((r) => r.location?.city)
        .filter((c): c is string => Boolean(c && typeof c === 'string'))
    )
  );

  // Filter logic
  const filtered = requirements.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && req.category !== categoryFilter) return false;
    if (cityFilter !== 'ALL') {
      const reqCity = req.location?.city?.toLowerCase() || '';
      const filterKey = cityFilter.toLowerCase().split(' ')[0];
      if (!reqCity.includes(filterKey)) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = req.title?.toLowerCase().includes(q);
      const descMatch = req.description?.toLowerCase().includes(q);
      const areaMatch = req.location?.area?.toLowerCase().includes(q);
      const cityMatch = req.location?.city?.toLowerCase().includes(q);
      const hostMatch =
        typeof req.requesterId === 'object' && req.requesterId?.name?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !areaMatch && !cityMatch && !hostMatch) return false;
    }
    return true;
  });

  // Aggregate stats
  const totalOpen = requirements.filter((r) => r.status === 'OPEN').length;
  const totalAccepted = requirements.filter((r) => r.status === 'ACCEPTED' || r.status === 'ACTIVE').length;
  const totalBidsCount = requirements.reduce((acc, r) => acc + (r.bids?.length || r.bidsCount || 0), 0);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await onDeleteRequirement(id);
      setDeleteConfirmId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Live Requests & Bidding</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Event requirements posted by hosts with real-time reverse bids from verified vendors.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
        >
          Refresh Feed
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</div>
          <div className="text-2xl font-bold text-slate-900">{requirements.length}</div>
          <div className="text-xs text-slate-400">All posted host requirements</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-[#ff5c28] uppercase tracking-wider">Open for Bidding</div>
          <div className="text-2xl font-bold text-[#ff5c28]">{totalOpen}</div>
          <div className="text-xs text-slate-400">Actively receiving vendor quotes</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Booked / Active</div>
          <div className="text-2xl font-bold text-blue-700">{totalAccepted}</div>
          <div className="text-xs text-slate-400">Bid accepted by host</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Bids Placed</div>
          <div className="text-2xl font-bold text-emerald-700">{totalBidsCount}</div>
          <div className="text-xs text-slate-400">Competitive reverse offers</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, host, venue, or area..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff5c28] focus:ring-2 focus:ring-[#ff5c28]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#ff5c28]"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN (Bidding)</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#ff5c28]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#ff5c28]"
          >
            <option value="ALL">All Cities ({requirements.length})</option>
            {cities.map((city) => {
              const count = requirements.filter(
                (r) => r.location?.city?.toLowerCase().includes(city.toLowerCase().split(' ')[0])
              ).length;
              return (
                <option key={city} value={city}>
                  {city} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Feed List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-base font-semibold text-slate-700">No event requirements match your filters</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing the search or changing status/category filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const isExpanded = expandedId === req._id;
            const host = typeof req.requesterId === 'object' ? req.requesterId : null;
            const bids = req.bids || [];
            const budget = req.budget || 0;
            const maxBid = req.maxAcceptableBid || Math.floor(budget * 0.85);
            const lowestBid = (req as any).lowestBid || (bids.length > 0 ? Math.min(...bids.map((b) => b.amount)) : null);
            const hasBids = lowestBid !== null && lowestBid > 0;
            const actualSavings = hasBids && budget > 0 ? Math.max(0, budget - lowestBid) : Math.max(0, budget - maxBid);
            const actualSavingsPercent = budget > 0 ? Math.round((actualSavings / budget) * 100) : 15;
            const minSavings = Math.max(0, budget - maxBid);
            const savingsPercent = budget > 0 ? Math.round((minSavings / budget) * 100) : 15;

            return (
              <div
                key={req._id}
                className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden transition hover:border-slate-300"
              >
                {/* Main Card Summary */}
                <div className="p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
                  {/* Left: Card Thumbnail with Multi-Image Support */}
                  <div className="w-full sm:w-48 lg:w-44 h-36 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                    <CardImageGallery
                      images={req.images && req.images.length > 0 ? req.images : [req.imageUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80']}
                      fallbackImage="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80"
                      alt={req.title}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {req.location?.city || 'Pune'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200/80">
                        {req.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          req.status === 'OPEN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'ACCEPTED' || req.status === 'ACTIVE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : req.status === 'EXPIRED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Posted {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{req.title}</h3>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {req.location?.area}, {req.location?.city || 'Pune'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Date: {req.eventDate}</span>
                      </div>
                      {req.guestCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{req.guestCount} Guests</span>
                        </div>
                      )}
                      {host && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <span>Host:</span>
                          <strong className="text-slate-800">{host.name}</strong>
                          {host.phone && <span>({host.phone})</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial & Bid Count Column */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 min-w-[240px] space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BUDGET CEILING</span>
                            {onUpdateRequirement && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingReqId(req._id);
                                  setEditBudgetVal(budget);
                                }}
                                className="text-slate-400 hover:text-[#ff5c28] hover:bg-orange-50 p-1 rounded-md transition cursor-pointer"
                                title="Edit Budget Ceiling Price"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="text-base font-extrabold text-slate-900">₹{budget.toLocaleString()}</div>
                        </div>

                        <div className="text-right">
                          <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center justify-end gap-1 ${hasBids ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {hasBids ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>LOWEST BID</span>
                              </>
                            ) : (
                              <span>MAX ALLOWED BID</span>
                            )}
                          </div>
                          <div className={`text-base font-extrabold ${hasBids ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>
                            ₹{(hasBids ? lowestBid : maxBid).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {hasBids ? (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300/90 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 text-emerald-950 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Live Savings ({bids.length} {bids.length === 1 ? 'Bid' : 'Bids'})</span>
                          </div>
                          <span className="text-xs font-black text-emerald-700 whitespace-nowrap">
                            Save ₹{actualSavings.toLocaleString()} ({actualSavingsPercent}% OFF)
                          </span>
                        </div>
                      ) : (
                        <div className="bg-[#eafbf3] border border-emerald-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 text-emerald-900 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Minimum Guaranteed Savings</span>
                          </div>
                          <span className="text-xs font-black text-emerald-700 whitespace-nowrap">
                            &ge; ₹{minSavings.toLocaleString()} ({savingsPercent}% OFF)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : req._id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                          isExpanded
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{bids.length} Bids</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(req._id)}
                        title="Delete Requirement"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Bids & Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 bg-slate-50/70 border-t border-slate-100 space-y-4">
                    {req.description && (
                      <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                        <strong className="text-slate-800 block mb-1">Host Notes / Requirements:</strong>
                        <p className="whitespace-pre-line leading-relaxed">{req.description}</p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Vendor Reverse Bids ({bids.length})
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Reverse-bidding rule: Must be &le; ₹{maxBid.toLocaleString()}
                        </span>
                      </div>

                      {bids.length === 0 ? (
                        <div className="p-6 text-center rounded-xl bg-white border border-slate-200 text-xs text-slate-400">
                          No vendors have submitted bids for this event yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {bids.map((bid) => {
                            const discountAmount = budget - bid.amount;
                            const discountPct = Math.round((discountAmount / budget) * 100);
                            const vendor = typeof bid.providerId === 'object' ? bid.providerId : null;

                            return (
                              <div
                                key={bid._id}
                                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-bold text-sm text-slate-900">
                                      {vendor?.businessName || vendor?.name || 'Verified Vendor'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {vendor?.name} {vendor?.phone ? `• ${vendor.phone}` : ''}
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      bid.status === 'ACCEPTED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {bid.status}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                  <div>
                                    <div className="text-base font-extrabold text-emerald-700">
                                      ₹{bid.amount.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-700">
                                      <TrendingDown className="w-3 h-3" />
                                      {discountPct}% OFF
                                    </span>
                                    <div className="text-[10px] text-slate-400">
                                      Saved ₹{discountAmount.toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                {bid.message && (
                                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                                    "{bid.message}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirmId === req._id && (
                  <div className="p-4 bg-rose-50 border-t border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-900 text-sm font-semibold">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>Are you sure you want to delete this event requirement and all its bids?</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(req._id)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Edit Budget Price Modal */}
      {editingReqId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Update Budget Ceiling</h3>
                <p className="text-xs text-slate-500 mt-0.5">Adjust ceiling price and 15% discount rule</p>
              </div>
              <button
                onClick={() => setEditingReqId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Budget Ceiling (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={editBudgetVal || ''}
                    onChange={(e) => setEditBudgetVal(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#ff5c28] focus:outline-none text-xl font-black text-slate-900 font-mono transition"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {[15000, 25000, 40000, 50000, 75000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEditBudgetVal(preset)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      editBudgetVal === preset
                        ? 'bg-[#ff5c28] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ₹{(preset / 1000)}k
                  </button>
                ))}
              </div>

              {/* Dynamic Calculation Preview */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">New Max Allowed Bid (85%):</span>
                  <span className="font-extrabold text-emerald-700 font-mono">
                    ₹{Math.floor((editBudgetVal || 0) * 0.85).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Guaranteed Min. Savings (15%):</span>
                  <span className="font-extrabold text-emerald-700 font-mono">
                    ≥ ₹{Math.floor((editBudgetVal || 0) * 0.15).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingReqId(null)}
                disabled={isSavingEdit}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingEdit || editBudgetVal < 1000}
                onClick={async () => {
                  if (!onUpdateRequirement || !editingReqId) return;
                  setIsSavingEdit(true);
                  try {
                    await onUpdateRequirement(editingReqId, { budget: editBudgetVal });
                    setEditingReqId(null);
                  } finally {
                    setIsSavingEdit(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#ff5c28] hover:bg-[#e04816] text-white text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingEdit ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Update Price</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
