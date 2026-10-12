import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Phone,
  MessageCircle,
  Star,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { Booking, Category } from '../types';

type Tab = 'current' | 'finished' | 'cancelled';

interface MyBookingsPageProps {
  bookings: Booking[];
  categories: Category[];
  onBack: () => void;
  onOpenPostModal: (initialCategory?: string) => void;
  onOpenPaymentModal: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onCompleteBooking: (bookingId: string) => Promise<void>;
  onOpenReviewModal: (booking: Booking) => void;
  onRaiseDispute?: (bookingId: string, reason: string) => Promise<void>;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80';

const rupees = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;

const formatDate = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const phoneDigits = (phone?: string) => (phone || '').replace(/[^0-9]/g, '');

const isFinished = (b: Booking) => b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED';

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  bookings,
  categories,
  onBack,
  onOpenPostModal,
  onOpenPaymentModal,
  onCancelBooking,
  onCompleteBooking,
  onOpenReviewModal,
  onRaiseDispute,
}) => {
  const toPay = bookings.filter((b) => b.status === 'AWAITING_PAYMENT');
  const upcoming = bookings.filter((b) => b.status === 'ACTIVE');
  const disputed = bookings.filter((b) => b.status === 'DISPUTED');
  const finished = bookings.filter(isFinished);
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED');
  const totalPaid = [...upcoming, ...finished].reduce((sum, b) => sum + b.totalPaid, 0);

  const [tab, setTab] = useState<Tab>(() =>
    toPay.length + upcoming.length > 0 || finished.length === 0 ? 'current' : 'finished'
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [disputeBookingModal, setDisputeBookingModal] = useState<Booking | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const disputeReasonsPreset = [
    'Vendor did not show up',
    'Severe delay / missed critical event time',
    'Poor quality or damaged equipment delivered',
    'Demanding extra charges not in agreed bid',
    'Unprofessional conduct / incomplete service'
  ];

  const handleOpenDispute = (b: Booking) => {
    setDisputeBookingModal(b);
    setDisputeReasonText('');
  };

  const handleConfirmDispute = async () => {
    if (!disputeBookingModal || !disputeReasonText.trim()) return;
    if (!onRaiseDispute) return;
    setSubmittingDispute(true);
    try {
      await onRaiseDispute(disputeBookingModal._id, disputeReasonText.trim());
      setDisputeBookingModal(null);
    } catch {
      // toast shown by parent
    } finally {
      setSubmittingDispute(false);
    }
  };


  const current = [...toPay, ...upcoming, ...disputed].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'AWAITING_PAYMENT' ? -1 : 1;
    return (a.requirementId?.eventDate || '').localeCompare(b.requirementId?.eventDate || '');
  });

  const imageFor = (b: Booking) => {
    const req = b.requirementId;
    if (req?.imageUrl) return req.imageUrl;
    const cat = categories.find((c) => c.name.toLowerCase() === (req?.category || '').toLowerCase());
    return cat?.image || FALLBACK_IMAGE;
  };

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } catch {
      // The app shows an error toast.
    } finally {
      setBusyId(null);
    }
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'current', label: 'Current', count: current.length },
    { id: 'finished', label: 'Finished', count: finished.length },
    { id: 'cancelled', label: 'Cancelled', count: cancelled.length },
  ];

  const renderMeta = (b: Booking) => {
    const req = b.requirementId;
    if (!req) return null;
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
        {req.eventDate && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(req.eventDate)}
          </span>
        )}
        {req.timeWindow?.start && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            {req.timeWindow.start}
            {req.timeWindow.end ? ` – ${req.timeWindow.end}` : ''}
          </span>
        )}
        {req.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            {[req.location.area, req.location.city].filter(Boolean).join(', ')}
          </span>
        )}
        {req.guestCount > 0 && (
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            {req.guestCount} guests
          </span>
        )}
      </div>
    );
  };

  const vendorName = (b: Booking) => b.providerId?.businessName || b.providerId?.name || 'Vendor';

  const renderCurrent = (b: Booking) => {
    const isPaid = b.status === 'ACTIVE';
    const isDisputed = b.status === 'DISPUTED';
    const phone = phoneDigits(b.providerId?.phone);
    const busy = busyId === b._id;

    return (
      <article key={b._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <img
            src={imageFor(b)}
            alt=""
            className="w-full md:w-60 h-40 md:h-auto object-cover bg-slate-100 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />

          <div className="flex-1 p-5 sm:p-6 space-y-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-2 min-w-0">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    isPaid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {isPaid ? 'Paid · EzzyGo is holding your money' : 'Payment pending'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 break-words">
                  {b.requirementId?.title || 'Event booking'}
                </h3>
                {renderMeta(b)}
              </div>
              <div className="sm:text-right shrink-0">
                <div className="text-sm text-slate-500">{isPaid ? 'You paid' : 'You pay'}</div>
                <div className="text-2xl font-bold text-slate-900">{rupees(b.totalPaid)}</div>
              </div>
            </div>

            <ol className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm font-medium">
              <li className="space-y-1.5">
                <div className="h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-800">Vendor chosen</span>
              </li>
              <li className="space-y-1.5">
                <div className={`h-2 rounded-full ${isPaid || isDisputed ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span className={isPaid || isDisputed ? 'text-emerald-800' : 'text-amber-800'}>{isPaid || isDisputed ? 'Paid' : 'Pay now'}</span>
              </li>
              <li className="space-y-1.5">
                <div className={`h-2 rounded-full ${isDisputed ? 'bg-rose-500' : 'bg-slate-200'}`} />
                <span className={isDisputed ? 'text-rose-700 font-semibold' : 'text-slate-500'}>{isDisputed ? 'In Dispute' : 'Event done'}</span>
              </li>
            </ol>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-sm text-slate-500">Your vendor</div>
                <div className="flex items-center gap-3">
                  {b.providerId?.avatar ? (
                    <img
                      src={b.providerId.avatar}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#f95724] font-bold flex items-center justify-center">
                      {vendorName(b).charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{vendorName(b)}</div>
                    {b.providerId?.rating ? (
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {b.providerId.rating} · {b.providerId.completedJobs || 0} jobs done
                      </div>
                    ) : null}
                  </div>
                </div>

                {b.isContactRevealed && phone ? (
                  <div className="space-y-2">
                    <div className="font-semibold text-slate-900">{b.providerId?.phone}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${phone}`}
                        className="py-3 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
                      >
                        <Phone className="w-4 h-4" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(`Hi, this is about my EzzyGo booking: ${b.requirementId?.title || ''}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">The vendor's phone number shows here after you pay.</p>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <dt>Vendor's price</dt>
                    <dd className="font-medium text-slate-900">{rupees(b.bidAmount)}</dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>EzzyGo fee (10%)</dt>
                    <dd className="font-medium text-slate-900">{rupees(b.platformFee)}</dd>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-100 font-semibold text-slate-900">
                    <dt>Total</dt>
                    <dd>{rupees(b.totalPaid)}</dd>
                  </div>
                </dl>

                {isDisputed ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-sm text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        Dispute Under Review
                      </div>
                      <p className="text-xs text-rose-700">
                        Reason: {b.disputeReason || b.disputeDetails?.reason || 'Service dispute reported.'}
                      </p>
                      <p className="text-[11px] text-rose-600/90 pt-1 border-t border-rose-200">
                        Escrow funds ({rupees(b.totalPaid)}) are secured. EzzyGo support is mediating with the vendor.
                      </p>
                    </div>
                  </div>
                ) : isPaid ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">
                      After the event, click below. The vendor then gets {rupees(b.bidAmount)}.
                    </p>
                    <button
                      disabled={busy}
                      onClick={() =>
                        run(b._id, async () => {
                          await onCompleteBooking(b._id);
                          onOpenReviewModal(b);
                        })
                      }
                      className="w-full py-3.5 min-h-[46px] rounded-xl bg-[#f95724] hover:bg-[#e04818] disabled:opacity-60 text-white font-semibold text-sm cursor-pointer active:scale-95 transition"
                    >
                      Event done. Release payment
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`Cancel this booking? You will get ${rupees(b.totalPaid)} back.`)) {
                          run(b._id, () => onCancelBooking(b._id));
                        }
                      }}
                      className="w-full py-2.5 min-h-[40px] rounded-xl text-rose-700 hover:bg-rose-50 disabled:opacity-60 font-semibold text-xs sm:text-sm cursor-pointer transition flex items-center justify-center active:scale-95"
                    >
                      Cancel and get a full refund
                    </button>
                    {onRaiseDispute && (
                      <button
                        disabled={busy}
                        onClick={() => handleOpenDispute(b)}
                        className="w-full py-2.5 min-h-[40px] rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-60 font-semibold text-xs sm:text-sm cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Report Issue / Raise Dispute
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled={busy}
                      onClick={() => onOpenPaymentModal(b)}
                      className="w-full py-3.5 min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm cursor-pointer active:scale-95 transition"
                    >
                      Pay {rupees(b.totalPaid)}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm('Cancel this vendor and choose another bid?')) {
                          run(b._id, () => onCancelBooking(b._id));
                        }
                      }}
                      className="w-full py-2.5 rounded-xl text-rose-700 hover:bg-rose-50 disabled:opacity-60 font-semibold text-sm cursor-pointer"
                    >
                      Cancel and choose another vendor
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const renderFinished = (b: Booking) => (
    <article key={b._id} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-5">
      <img
        src={imageFor(b)}
        alt=""
        className="w-full md:w-32 h-32 md:h-24 rounded-2xl object-cover bg-slate-100 shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
        }}
      />
      <div className="flex-1 min-w-0 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Event done
        </span>
        <h3 className="text-lg font-bold text-slate-900 break-words">{b.requirementId?.title || 'Event booking'}</h3>
        {renderMeta(b)}
        <p className="text-sm text-slate-600">
          {vendorName(b)} · You paid <strong className="text-slate-900">{rupees(b.totalPaid)}</strong>
          {b.completedAt ? ` · Finished ${formatDate(b.completedAt)}` : ''}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
        {b.myRating ? (
          <span className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-sm font-semibold flex items-center justify-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> You rated {b.myRating}
          </span>
        ) : (
          <button
            onClick={() => onOpenReviewModal(b)}
            className="px-4 py-3 min-h-[44px] rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Rate vendor
          </button>
        )}
        <button
          onClick={() => onOpenPostModal(b.requirementId?.category)}
          className="px-4 py-3 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
        >
          <RotateCcw className="w-4 h-4" /> Book again
        </button>
      </div>
    </article>
  );

  const renderCancelled = (b: Booking) => {
    const refunded = b.paymentDetails?.escrowStatus === 'REFUNDED';
    return (
      <article key={b._id} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">{b.requirementId?.title || 'Event booking'}</h3>
          <p className="text-sm text-slate-600">
            {vendorName(b)}
            {b.requirementId?.eventDate ? ` · ${formatDate(b.requirementId.eventDate)}` : ''}
          </p>
        </div>
        <div className={`text-sm font-semibold sm:text-right shrink-0 ${refunded ? 'text-emerald-700' : 'text-slate-500'}`}>
          {refunded ? `${rupees(b.totalPaid)} refunded to you` : 'Cancelled before payment'}
        </div>
      </article>
    );
  };

  const list = tab === 'current' ? current : tab === 'finished' ? finished : cancelled;

  const empty: Record<Tab, { title: string; text: string }> = {
    current: {
      title: 'No current bookings',
      text: 'Post a request, then choose a vendor from the bids. Your booking will show here.',
    },
    finished: {
      title: 'No finished events yet',
      text: 'After you click "Event done", the booking moves here so you can rate the vendor.',
    },
    cancelled: {
      title: 'No cancelled bookings',
      text: 'Bookings you cancel show here with their refund status.',
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">My bookings</h1>
          <p className="text-slate-600">Pay your vendor, call them, and release the payment after the event.</p>
        </div>
        <button
          onClick={() => onOpenPostModal()}
          className="w-full sm:w-auto px-5 py-3 min-h-[44px] rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" /> Post a new request
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'To pay', value: String(toPay.length), tone: 'text-amber-700' },
          { label: 'Upcoming', value: String(upcoming.length), tone: 'text-emerald-700' },
          { label: 'Finished', value: String(finished.length), tone: 'text-indigo-700' },
          { label: 'Total paid', value: rupees(totalPaid), tone: 'text-slate-900' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-white border border-slate-200">
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {toPay.length > 0 && tab !== 'current' && (
        <button
          onClick={() => setTab('current')}
          className="w-full text-left p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium cursor-pointer"
        >
          {toPay.length === 1 ? '1 booking is' : `${toPay.length} bookings are`} waiting for payment. Open current bookings.
        </button>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer transition ${
              tab === t.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${tab === t.id ? 'bg-white/20' : 'bg-slate-100'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#f95724] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{empty[tab].title}</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">{empty[tab].text}</p>
          {tab === 'current' && (
            <button
              onClick={() => onOpenPostModal()}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Post a request
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tab === 'current' && list.map(renderCurrent)}
          {tab === 'finished' && list.map(renderFinished)}
          {tab === 'cancelled' && list.map(renderCancelled)}
        </div>
      )}
      {/* Dispute Modal */}
      {disputeBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Raise a Dispute</h3>
                  <p className="text-xs text-slate-500">Hold payment & request EzzyGo mediation</p>
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
                If the vendor did not deliver as promised or had serious issues, let us know. Escrow payout of{' '}
                <strong className="text-slate-900">{rupees(disputeBookingModal.totalPaid)}</strong> will be immediately held.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Common reasons:</label>
                <div className="flex flex-wrap gap-1.5">
                  {disputeReasonsPreset.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDisputeReasonText(r)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
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
                  Describe the issue in detail:
                </label>
                <textarea
                  value={disputeReasonText}
                  onChange={(e) => setDisputeReasonText(e.target.value)}
                  placeholder="Provide specific details about what happened during the event..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDisputeBookingModal(null)}
                disabled={submittingDispute}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispute}
                disabled={!disputeReasonText.trim() || submittingDispute}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-sm transition cursor-pointer flex items-center gap-1.5"
              >
                {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
