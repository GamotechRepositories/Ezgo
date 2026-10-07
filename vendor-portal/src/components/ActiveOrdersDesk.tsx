import React from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import type { Booking } from '../types';

interface ActiveOrdersDeskProps {
  bookings: Booking[];
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

export const ActiveOrdersDesk: React.FC<ActiveOrdersDeskProps> = ({ bookings }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My bookings</h2>
        <p className="text-base text-slate-600 mt-1">
          Jobs where a host picked your bid. You see the host's phone number once they pay.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200 space-y-2">
          <h3 className="text-base font-semibold text-slate-800">No bookings yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Bid on open requests. When a host picks your bid, the booking shows up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => {
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-500">{req.category}</span>
                    <span className={`px-3 py-1 rounded-full border text-sm font-medium ${info.className}`}>
                      {info.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{req.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {req.eventDate}
                      {req.timeWindow?.start && ` · ${req.timeWindow.start}–${req.timeWindow.end}`}
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
                              className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-1.5 transition"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${phone}`}
                              aria-label="Call host"
                              className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
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

                {booking.status === 'ACTIVE' && (
                  <p className="pt-4 border-t border-slate-100 text-sm text-slate-600">
                    After the event, the host confirms it is done. Then EzzyGo sends you ₹{booking.bidAmount.toLocaleString()}.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
