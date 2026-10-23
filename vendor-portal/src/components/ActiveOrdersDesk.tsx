import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, AlertTriangle, X } from 'lucide-react';
import type { Booking } from '../types';
import { CardImageGallery } from './CardImageGallery';

interface ActiveOrdersDeskProps {
  bookings: Booking[];
  onRaiseDispute?: (bookingId: string, reason: string) => Promise<void>;
}

const statusInfo: Record<string, { label: string; className: string; step: number }> = {
  AWAITING_PAYMENT: { label: 'Waiting for host payment', className: 'bg-amber-50 border-amber-200 text-amber-800', step: 1 },
  ACTIVE: { label: 'Booked and paid', className: 'bg-blue-50 border-blue-200 text-blue-800', step: 2 },
  COMPLETED: { label: 'Done, you are paid', className: 'bg-emerald-50 border-emerald-200 text-emerald-800', step: 4 },
  PAYOUT_RELEASED: { label: 'Done, you are paid', className: 'bg-emerald-50 border-emerald-200 text-emerald-800', step: 4 },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 border-slate-200 text-slate-600', step: 0 },
  DISPUTED: { label: 'Under review by EzzyGo', className: 'bg-rose-50 border-rose-200 text-rose-800', step: 3 },
};

const steps = ['Host picked you', 'Host paid EzzyGo', 'Event day', 'You get paid'];

export const ActiveOrdersDesk: React.FC<ActiveOrdersDeskProps> = ({ bookings, onRaiseDispute }) => {
  const [cityFilter, setCityFilter] = useState('ALL');
  const [disputeBookingModal, setDisputeBookingModal] = useState<Booking | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const availableCities = Array.from(new Set(bookings.map((b) => b.requirementId?.location?.city).filter(Boolean)));

  const filteredBookings = bookings.filter((b) => {
    if (cityFilter === 'ALL') return true;
    const reqCity = b.requirementId?.location?.city || '';
    return reqCity.toLowerCase().includes(cityFilter.toLowerCase().split(' ')[0]);
  });

  const vendorDisputePresets = [
    'Host unreachable / venue closed on event day',
    'Host cancelled event on arrival without notice',
    'Host demanding unagreed tasks outside bid scope',
    'Host refused entry / dispute on service delivery',
  ];

  const handleOpenDispute = (b: Booking) => {
    setDisputeBookingModal(b);
    setDisputeReasonText('');
  };

  const handleConfirmDispute = async () => {
    if (!disputeBookingModal || !disputeReasonText.trim() || !onRaiseDispute) return;
    setSubmittingDispute(true);
    try {
      await onRaiseDispute(disputeBookingModal._id, disputeReasonText.trim());
      setDisputeBookingModal(null);
    } catch {
      // handled in parent toast
    } finally {
      setSubmittingDispute(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My bookings</h2>
        <p className="text-base text-slate-600 mt-1">
          Jobs where a host picked your bid. You see the host's phone number once they pay.
        </p>
      </div>

      {/* City Filter Pills */}
      {availableCities.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0 mr-1">
            <MapPin className="w-3.5 h-3.5 text-[#f95724]" />
            <span>Operating City:</span>
          </span>
          {['ALL', ...availableCities].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCityFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 active:scale-95 ${
                cityFilter === c
                  ? 'bg-[#f95724] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {c !== 'ALL' && <MapPin className="w-3 h-3 opacity-70" />}
              <span>{c === 'ALL' ? 'All Cities' : c}</span>
            </button>
          ))}
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200 space-y-2">
          <h3 className="text-base font-semibold text-slate-800">No bookings in selected city</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {cityFilter !== 'ALL' ? `No bookings found for ${cityFilter}. Switch to All Cities.` : 'Bid on open requests. When a host picks your bid, the booking shows up here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => {
            const req = booking.requirementId;
            const info = statusInfo[booking.status] || statusInfo.ACTIVE;
            const isPaid = info.step >= 2;
            const isDone = info.step === 4;
            const phone = booking.requesterId?.phone || '';

            return (
              <div
                key={booking._id}
                className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <CardImageGallery
                    images={req?.images && req.images.length > 0 ? req.images : [req?.imageUrl || (
                      req?.category?.toLowerCase().includes('sound') || req?.category?.toLowerCase().includes('dj')
                        ? 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
                        : req?.category?.toLowerCase().includes('decor') || req?.category?.toLowerCase().includes('mandap') || req?.category?.toLowerCase().includes('stage')
                        ? 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
                        : req?.category?.toLowerCase().includes('photo') || req?.category?.toLowerCase().includes('drone') || req?.category?.toLowerCase().includes('camera')
                        ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
                        : req?.category?.toLowerCase().includes('cater') || req?.category?.toLowerCase().includes('food')
                        ? 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80'
                    )]}
                    fallbackImage="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80"
                    alt={req?.title || 'Event'}
                    className="w-full h-40 rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs"
                    badge={
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-xs font-semibold text-slate-800 shadow-xs">
                        {req?.category}
                      </span>
                    }
                  />

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{req?.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {req?.eventDate}
                      {req?.timeWindow?.start && ` · ${req.timeWindow.start}–${req.timeWindow.end}`}
                    </p>
                  </div>

                  {info.step > 0 && (
                    <ol className="grid grid-cols-4 gap-2">
                      {steps.map((label, i) => {
                        const reached = info.step >= i + 1;
                        return (
                          <li key={label} className="space-y-1.5">
                            <div className={`h-1.5 rounded-full ${reached ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            <span className={`text-xs block leading-tight ${reached ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                              {label}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {isPaid && booking.status !== 'CANCELLED' ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="text-sm text-slate-500">Host contact</div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-900">{booking.requesterId?.name}</div>
                          <div className="text-sm text-slate-600 mt-0.5">{phone}</div>
                        </div>
                        {phone && (
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/91${phone.replace(/[^0-9]/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2.5 min-h-[42px] rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${phone}`}
                              aria-label="Call host"
                              className="p-2.5 min-h-[42px] min-w-[42px] rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center justify-center active:scale-95"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                      {req.location.venueAddress && (
                        <div className="pt-3 border-t border-slate-200 text-sm text-slate-700 flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{req.location.venueAddress}, {req.location.area}, {req.location.city}</span>
                        </div>
                      )}
                    </div>
                  ) : booking.status === 'AWAITING_PAYMENT' ? (
                    <p className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                      The host picked your bid but has not paid yet. Their phone number appears here after payment.
                    </p>
                  ) : null}

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm">
                    <div>
                      <div className="text-slate-500">{isDone ? 'You were paid' : 'You will get'}</div>
                      <div className="text-lg font-semibold text-emerald-700">₹{booking.bidAmount.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500">Host paid</div>
                      <div className="text-base font-medium text-slate-700">
                        ₹{(booking.totalPaid || booking.bidAmount + booking.platformFee).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">includes 10% EzzyGo fee</div>
                    </div>
                  </div>
                </div>

                {booking.status === 'DISPUTED' && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-sm text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        Dispute in Mediation
                      </div>
                      <p className="text-xs text-rose-700">
                        Reason: {booking.disputeReason || booking.disputeDetails?.reason || 'Service dispute under mediation.'}
                      </p>
                      <p className="text-[11px] text-rose-600/90 pt-1 border-t border-rose-200">
                        EzzyGo support is reviewing this booking. Escrow funds (?{booking.bidAmount.toLocaleString()}) remain safely held until resolution.
                      </p>
                    </div>
                  </div>
                )}

                {booking.status === 'ACTIVE' && (
                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <p className="text-sm text-slate-600">
                      After the event, the host confirms it is done. Then EzzyGo sends you ?{booking.bidAmount.toLocaleString()}.
                    </p>
                    {onRaiseDispute && (
                      <button
                        type="button"
                        onClick={() => handleOpenDispute(booking)}
                        className="w-full sm:w-auto px-4 py-2.5 min-h-[42px] rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Report Issue / Dispute to Support
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Vendor Dispute Modal */}
      {disputeBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Report Booking Issue</h3>
                  <p className="text-xs text-slate-500">Alert EzzyGo Support & hold escrow release</p>
                </div>
              </div>
              <button
                onClick={() => setDisputeBookingModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Facing an issue with the host or event logistics? Let support mediate before completion.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Common issues:</label>
                <div className="flex flex-wrap gap-1.5">
                  {vendorDisputePresets.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDisputeReasonText(r)}
                      className={`text-xs px-3.5 py-2 min-h-[38px] rounded-full border transition cursor-pointer active:scale-95 flex items-center justify-center ${
                        disputeReasonText === r
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe what happened:
                </label>
                <textarea
                  value={disputeReasonText}
                  onChange={(e) => setDisputeReasonText(e.target.value)}
                  placeholder="Explain the problem in detail for EzzyGo mediation..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDisputeBookingModal(null)}
                disabled={submittingDispute}
                className="w-full sm:w-auto px-5 py-3 min-h-[44px] rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispute}
                disabled={!disputeReasonText.trim() || submittingDispute}
                className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 text-center shadow-md shadow-rose-500/20"
              >
                {submittingDispute ? 'Submitting...' : 'Submit Issue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
