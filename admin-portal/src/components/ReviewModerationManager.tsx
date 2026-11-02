import React, { useState } from 'react';
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Search,
  MessageSquare,
  AlertTriangle,
  User as UserIcon,
  Briefcase,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type { Review } from '../types';

interface ReviewModerationManagerProps {
  reviews: Review[];
  onToggleHide: (reviewId: string, isHidden: boolean, moderationReason?: string) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onRefresh: () => void;
}

export const ReviewModerationManager: React.FC<ReviewModerationManagerProps> = ({
  reviews,
  onToggleHide,
  onDeleteReview,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [actionId, setActionId] = useState<string | null>(null);

  const [hideModal, setHideModal] = useState<{
    review: Review;
    reason: string;
  } | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compute aggregate statistics
  const totalReviews = reviews.length;
  const visibleReviews = reviews.filter((r) => !r.isHidden).length;
  const hiddenReviews = reviews.filter((r) => r.isHidden).length;
  const lowRatedCount = reviews.filter((r) => r.rating <= 2).length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  // Filtered reviews
  const filtered = reviews.filter((r) => {
    if (ratingFilter !== 'ALL' && String(r.rating) !== ratingFilter) return false;
    if (statusFilter === 'VISIBLE' && r.isHidden) return false;
    if (statusFilter === 'HIDDEN' && !r.isHidden) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const commentMatch = r.comment?.toLowerCase().includes(q);
      const hostMatch = r.fromUserId?.name?.toLowerCase().includes(q) || r.fromUserId?.email?.toLowerCase().includes(q);
      const vendorMatch = r.toUserId?.name?.toLowerCase().includes(q) || r.toUserId?.businessName?.toLowerCase().includes(q);
      const reqMatch = r.bookingId?.requirementId?.title?.toLowerCase().includes(q);
      if (!commentMatch && !hostMatch && !vendorMatch && !reqMatch) return false;
    }
    return true;
  });

  const handleConfirmHide = async () => {
    if (!hideModal) return;
    setActionId(hideModal.review._id);
    try {
      await onToggleHide(hideModal.review._id, true, hideModal.reason);
      setHideModal(null);
    } finally {
      setActionId(null);
    }
  };

  const handleUnhide = async (review: Review) => {
    setActionId(review._id);
    try {
      await onToggleHide(review._id, false);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    setActionId(reviewId);
    try {
      await onDeleteReview(reviewId);
      setDeleteConfirmId(null);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Review & Rating Moderation</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Audit customer feedback, hide inappropriate content, and maintain marketplace trust standards.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
        >
          Refresh Reviews
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Total Reviews</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalReviews}</div>
          <div className="text-xs text-slate-400">All submitted feedback</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Platform Average</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{avgRating} / 5.0</div>
          <div className="text-xs text-slate-400">Overall host satisfaction</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Public Visible</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{visibleReviews}</div>
          <div className="text-xs text-slate-400">Active on vendor profiles</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hidden / Moderated</span>
          </div>
          <div className="text-2xl font-bold text-rose-700">{hiddenReviews}</div>
          <div className="text-xs text-slate-400">Excluded from scores</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Ratings (≤2⭐)</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{lowRatedCount}</div>
          <div className="text-xs text-slate-400">Candidate review cases</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by comment, host, vendor, or event..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff5c28] focus:ring-2 focus:ring-[#ff5c28]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            {(['ALL', 'VISIBLE', 'HIDDEN'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'ALL' ? 'All' : s === 'VISIBLE' ? 'Visible' : 'Hidden'}
              </button>
            ))}
          </div>

          {/* Star Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Stars:</span>
            {(['ALL', '5', '4', '3', '2', '1'] as const).map((star) => (
              <button
                key={star}
                onClick={() => setRatingFilter(star)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-0.5 ${
                  ratingFilter === star
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{star}</span>
                {star !== 'ALL' && <Star className="w-3 h-3 fill-current" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700">No reviews found matching your filter criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing search keywords or switching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rev) => {
            const isHidden = rev.isHidden;
            const isDeleting = actionId === rev._id;

            return (
              <div
                key={rev._id}
                className={`p-5 rounded-2xl border transition shadow-xs space-y-4 flex flex-col justify-between ${
                  isHidden
                    ? 'bg-rose-50/40 border-rose-200'
                    : rev.rating <= 2
                    ? 'bg-amber-50/30 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Stars & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-bold text-slate-700">{rev.rating}.0</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isHidden ? (
                        <span className="text-[11px] bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </span>
                      ) : (
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="text-sm text-slate-800 leading-relaxed font-normal bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    {rev.comment ? (
                      `"${rev.comment}"`
                    ) : (
                      <span className="text-slate-400 italic">No written comment provided with rating.</span>
                    )}
                  </div>

                  {/* Moderation note if hidden */}
                  {isHidden && rev.moderationReason && (
                    <div className="p-2.5 rounded-xl bg-rose-100/60 border border-rose-200 text-xs text-rose-800 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>Moderation Note:</strong> {rev.moderationReason}</span>
                    </div>
                  )}

                  {/* Parties Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Host (Reviewer)</span>
                      <div className="font-semibold text-slate-800 truncate flex items-center gap-1 mt-0.5">
                        <UserIcon className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{rev.fromUserId?.name || 'Customer'}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">{rev.fromUserId?.email || rev.fromUserId?.phone || ''}</div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Vendor (Reviewed)</span>
                      <div className="font-semibold text-slate-800 truncate flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3 text-[#ff5c28] shrink-0" />
                        <span className="truncate">{rev.toUserId?.businessName || rev.toUserId?.name || 'Vendor'}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">Rating: {rev.toUserId?.rating || '—'} ⭐</div>
                    </div>
                  </div>

                  {/* Event requirement reference */}
                  {rev.bookingId?.requirementId && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="truncate">Event: {rev.bookingId.requirementId.title} ({rev.bookingId.requirementId.location?.city || 'India'})</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <div className="text-[11px] text-slate-400">
                    Posted {new Date(rev.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {isHidden ? (
                      <button
                        type="button"
                        onClick={() => handleUnhide(rev)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setHideModal({ review: rev, reason: '' })}
                        disabled={isDeleting}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(rev._id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer"
                      title="Permanently Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hide Reason Modal */}
      {hideModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hide Review</h3>
                <p className="text-xs text-slate-500">Content Moderation & Trust Standards</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              This review will be immediately hidden from public vendor profile pages and excluded from the vendor's average rating calculation.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Moderation Reason (internal record):</label>
              <textarea
                value={hideModal.reason}
                onChange={(e) => setHideModal({ ...hideModal, reason: e.target.value })}
                placeholder="e.g. Inappropriate language, spam, extortion, off-platform dispute..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setHideModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHide}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xs cursor-pointer"
              >
                Confirm Hide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Review Permanently</h3>
                <p className="text-xs text-slate-500">Irreversible Action</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to completely erase this review from the database? The vendor's average rating will be automatically recalculated based on remaining reviews.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-xs cursor-pointer"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

