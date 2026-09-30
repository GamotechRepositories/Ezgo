import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Calendar,
  Layers
} from 'lucide-react';
import type { Booking } from '../types';

interface ActiveOrdersDeskProps {
  bookings: Booking[];
  onCompleteBooking: (bookingId: string) => void;
}

export const ActiveOrdersDesk: React.FC<ActiveOrdersDeskProps> = ({
  bookings,
  onCompleteBooking,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Active Confirmed Bookings & Orders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Events where the host accepted your bid and deposited 100% payment in escrow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Escrow Protected & Guaranteed</span>
          </span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active orders yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Place competitive bids on live event auctions. Once a host selects your bid and deposits escrow, your confirmed order and direct customer contact details will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const req = booking.requirementId;
            const isCompleted = booking.status === 'COMPLETED' || booking.status === 'PAYOUT_RELEASED';

            return (
              <div
                key={booking._id}
                className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#f95724] text-xs font-bold">
                        {req.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Order #{booking._id.substring(0, 8)}
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed & Paid ✓</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        <span>Stage 3 of 4: In Execution</span>
                      </span>
                    )}
                  </div>

                  {/* Order Progress Steps Indicator */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Order Milestones</div>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="space-y-1">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center mx-auto">
                          ✓
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 block leading-tight">Bid Won</span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center mx-auto">
                          ✓
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 block leading-tight">Escrow Locked</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-5 h-5 rounded-full ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white animate-pulse'} text-[10px] font-bold flex items-center justify-center mx-auto`}>
                          {isCompleted ? '✓' : '3'}
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 block leading-tight">Service Delivery</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-5 h-5 rounded-full ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'} text-[10px] font-bold flex items-center justify-center mx-auto`}>
                          {isCompleted ? '✓' : '4'}
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 block leading-tight">Payout Disbursed</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Event Time */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{req.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.eventDate} ({req.timeWindow?.start || '18:00'} – {req.timeWindow?.end || '23:30'})</span>
                    </div>
                  </div>

                  {/* Unmasked Customer Contact Details */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase font-bold text-[#f95724] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#f95724]" />
                        <span>Direct Host Contact (Escrow Verified)</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Unlocked ✓
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{booking.requesterId.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{booking.requesterId.phone}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${booking.requesterId.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Host</span>
                        </a>
                        <a
                          href={`tel:${booking.requesterId.phone}`}
                          className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                          title="Call Host"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {req.location.venueAddress && (
                      <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-700 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#f95724] shrink-0 mt-0.5" />
                        <span>{req.location.venueAddress}, {req.location.area}, {req.location.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Agreed Bid Amount</div>
                      <div className="text-sm font-black text-slate-900">₹{booking.bidAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Platform Fee (10%)</div>
                      <div className="text-xs font-bold text-slate-600">₹{booking.platformFee.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-700 font-bold uppercase">Your Total Payout</div>
                      <div className="text-sm font-black text-emerald-700">₹{(booking.bidAmount).toLocaleString()}</div>
                    </div>
                  </div>

                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-slate-100 mt-4">
                  {!isCompleted ? (
                    <button
                      onClick={() => onCompleteBooking(booking._id)}
                      className="w-full py-3 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/25 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Step 4: Mark Event Finished & Request Escrow Payout</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-800">
                      ✓ Service completed and payment processed to your bank account.
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};