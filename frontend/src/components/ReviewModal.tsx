import React, { useState } from 'react';
import { X, Star, Sparkles, Check } from 'lucide-react';
import type { Booking } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmitReview: (data: {
    bookingId: string;
    fromUserId: string;
    toUserId: string;
    rating: number;
    comment: string;
    role: 'requester_to_provider' | 'provider_to_requester';
  }) => Promise<void>;
  fromUserId: string;
}

const COMPLIMENT_TAGS = [
  'Punctual & On-Time',
  'Superb Sound Quality',
  'Crowd Loved It!',
  'Neat & Clean Setup',
  'Polite & Professional',
  'High-End Equipment',
  'Great Song Transitions',
  '10/10 Value for Money'
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitReview,
  fromUserId,
}) => {
  if (!isOpen || !booking) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual & On-Time', 'Crowd Loved It!']);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullComment = selectedTags.length > 0 
        ? `${comment ? comment + ' • ' : ''}Highlights: ${selectedTags.join(', ')}`
        : comment;

      await onSubmitReview({
        bookingId: booking._id,
        fromUserId,
        toUserId: booking.providerId._id,
        rating,
        comment: fullComment,
        role: 'requester_to_provider',
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 my-8 animate-in fade-in zoom-in-95 text-center">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 mb-4">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-1">Rate Your Event Experience</h2>
        <p className="text-xs text-slate-500 mb-5">
          How was the service delivered by <strong className="text-slate-800">{booking.providerId?.businessName || booking.providerId?.name}</strong>?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Star Rating */}
          <div className="flex justify-center items-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-300 transition hover:scale-125 cursor-pointer"
              >
                <Star
                  className={`w-9 h-9 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center text-xs font-bold text-amber-700">
            {rating === 5 && '🌟 Outstanding Experience!'}
            {rating === 4 && '👍 Great Job & Seamless Delivery'}
            {rating === 3 && '😐 Average / As Expected'}
            {rating <= 2 && '👎 Needs Improvement'}
          </div>

          {/* Compliment Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              What went great? (Select highlights)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMPLIMENT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-amber-600" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detailed Feedback / Review
            </label>
            <textarea
              rows={3}
              placeholder="e.g. DJ was punctual, great Telugu and Bollywood curation, and the sound quality was crystal clear!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs transition shadow-lg shadow-amber-500/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting Review...' : 'Submit Rating'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
