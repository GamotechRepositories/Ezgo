import { Mail, MapPin, MessageCircle, Phone, ShieldCheck, Star, X } from 'lucide-react';
import type { Booking, User } from '../types';

const phoneDigits = (phone?: string) => (phone || '').replace(/[^0-9]/g, '');

const waLink = (phone: string, name: string, eventTitle: string) => {
  let digits = phoneDigits(phone);
  if (digits.length === 10) digits = `91${digits}`;
  const text = encodeURIComponent(`Hi ${name || 'there'}, this is regarding my EzzyGo booking for ${eventTitle || 'my event'}.`);
  return `https://wa.me/${digits}?text=${text}`;
};

export const vendorFromBooking = (booking: Booking): User | null => {
  const provider = booking.providerId;
  if (!provider || typeof provider === 'string') return null;
  return provider;
};

export const VendorUnlockedCard: React.FC<{
  booking: Booking;
  compact?: boolean;
}> = ({ booking, compact }) => {
  const vendor = vendorFromBooking(booking);
  const name = vendor?.businessName || vendor?.name || 'Your vendor';
  const phone = vendor?.phone || '';
  const email = vendor?.email || '';
  const digits = phoneDigits(phone);
  const eventTitle = booking.requirementId && typeof booking.requirementId !== 'string'
    ? booking.requirementId.title
    : 'my event';

  return (
    <div className={`rounded-2xl border text-left ${compact ? 'p-4' : 'p-5'} bg-slate-50/80 border-slate-200 space-y-4`}>
      <div className="flex items-start gap-3">
        {vendor?.avatar ? (
          <img src={vendor.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover border border-slate-200" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-[#f07d4a] text-white font-black text-xl flex items-center justify-center">
            {name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-800">Your vendor</p>
          <h4 className="text-lg font-bold text-slate-900 leading-tight truncate">{name}</h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 mt-1">
            {vendor?.isVerified && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
            {vendor?.rating ? (
              <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {vendor.rating.toFixed(1)}
                {vendor.reviewCount ? ` (${vendor.reviewCount})` : ''}
              </span>
            ) : null}
            {vendor?.serviceArea && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                {vendor.serviceArea}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white border border-slate-100 p-2.5 text-center">
          <div className="text-lg font-black text-slate-900">{vendor?.completedJobs ?? 0}</div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Events done</div>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 p-2.5 text-center">
          <div className="text-lg font-black text-slate-900">{vendor?.rating?.toFixed(1) ?? '—'}</div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Rating</div>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 p-2.5 text-center">
          <div className="text-lg font-black text-slate-900">{vendor?.reviewCount ?? 0}</div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Reviews</div>
        </div>
      </div>

      {vendor?.categories && vendor.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {vendor.categories.map((cat) => (
            <span key={cat} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
              {cat}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-1 text-sm">
        {phone ? (
          <p className="font-semibold text-emerald-700">{phone}</p>
        ) : (
          <p className="text-slate-500">Phone not added</p>
        )}
        {email ? <p className="text-slate-700">{email}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {digits ? (
          <a
            href={`tel:${digits}`}
            className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        ) : (
          <span className="py-3 px-3 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            Call
          </span>
        )}
        {digits ? (
          <a
            href={waLink(phone, vendor?.name || name, eventTitle || '')}
            target="_blank"
            rel="noreferrer"
            className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        ) : (
          <span className="py-3 px-3 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </span>
        )}
      </div>
      {email && (
        <a
          href={`mailto:${email}`}
          className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition"
        >
          <Mail className="w-4 h-4" />
          Email vendor
        </a>
      )}
    </div>
  );
};

export const VendorProfileModal: React.FC<{
  booking: Booking | null;
  onClose: () => void;
}> = ({ booking, onClose }) => {
  if (!booking) return null;
  const vendor = vendorFromBooking(booking);
  const name = vendor?.businessName || vendor?.name || 'Vendor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl my-6">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-slate-900 pr-10">Vendor profile</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">Unlocked after your escrow payment for {name}.</p>
        <VendorUnlockedCard booking={booking} />
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-[#f07d4a] hover:bg-[#de6a3a] text-white font-semibold cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
