import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, AlertCircle, XCircle } from 'lucide-react';
import type { Booking } from '../types';
import { api } from '../services/api';
import { openRazorpayCheckout } from '../utils/razorpay';
import { VendorUnlockedCard } from './VendorProfileModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaySuccess: (bookingId: string, paymentMethod: string, transactionId?: string, verifiedBooking?: Booking) => Promise<void>;
  onCancelBooking?: (bookingId: string) => Promise<void>;
  onNavigateToBookings?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaySuccess,
  onCancelBooking,
  onNavigateToBookings,
}) => {
  const [step, setStep] = useState<'checkout' | 'success' | 'failed'>('checkout');
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paidAfterVerifyError, setPaidAfterVerifyError] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paidBooking, setPaidBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setLoading(false);
      setCancelling(false);
      setErrorMessage(null);
      setPaidAfterVerifyError(false);
      setTransactionId(null);
      setPaidBooking(null);
    }
  }, [isOpen, booking?._id]);

  if (!isOpen || !booking) return null;

  const provider = booking.providerId as any;
  const requester = booking.requesterId as any;
  const providerName = provider?.businessName || provider?.name || 'your vendor';

  const fail = (message: string, moneyMayBeTaken = false) => {
    setErrorMessage(message);
    setPaidAfterVerifyError(moneyMayBeTaken);
    setStep('failed');
    setLoading(false);
  };

  const completeDemoPay = async () => {
    const confirmed = await api.payBooking(booking._id, 'Demo UPI');
    setPaidBooking(confirmed);
    setTransactionId(confirmed?.paymentDetails?.transactionId || 'DEMO');
    await onPaySuccess(booking._id, 'Demo UPI', confirmed?.paymentDetails?.transactionId || 'DEMO', confirmed);
    setStep('success');
    setLoading(false);
  };

  const handlePay = async () => {
    setLoading(true);
    setErrorMessage(null);
    setPaidAfterVerifyError(false);

    try {
      const amountInPaise = Math.round(booking.totalPaid * 100);
      if (amountInPaise < 100) {
        throw new Error('The amount must be at least ₹1.');
      }

      try {
        const orderData = await api.createRazorpayOrder({
          amount: amountInPaise,
          currency: 'INR',
          bookingId: booking._id,
          receipt: `rcpt_bkg_${booking._id.toString().slice(-8)}`,
          notes: {
            bookingId: booking._id,
            bidAmount: booking.bidAmount.toString(),
            platformFee: booking.platformFee.toString(),
          },
        });

        const liveKey = (orderData?.key_id || '').startsWith('rzp_live_');
        if (liveKey && orderData?.order_id) {
          await openRazorpayCheckout({
            key: orderData.key_id,
            amount: orderData.amount || amountInPaise,
            currency: orderData.currency || 'INR',
            order_id: orderData.order_id,
            name: 'EzzyGo',
            description: `Booking payment for ${providerName}`,
            prefill: {
              name: requester?.name || '',
              email: requester?.email || '',
              contact: requester?.phone || '',
            },
            onSuccess: async (response) => {
              try {
                const verifyRes = await api.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: booking._id,
                });

                if (!verifyRes.success) {
                  fail('We could not confirm this payment.', true);
                  return;
                }
                setTransactionId(response.razorpay_payment_id);
                const confirmed = verifyRes.data?.booking || booking;
                setPaidBooking(confirmed);
                await onPaySuccess(booking._id, 'Razorpay Standard Checkout', response.razorpay_payment_id, verifyRes.data?.booking);
                setStep('success');
                setLoading(false);
              } catch (verifyErr: any) {
                fail(verifyErr.message || 'We could not confirm this payment.', true);
              }
            },
            onDismiss: () => {
              fail('You closed the payment window. No money was taken.');
            },
            onFailure: (err) => {
              fail(`Payment failed: ${err?.description || err?.message || 'please try again.'}`);
            },
          });
          return;
        }
      } catch {
        // Test/demo keys: confirm escrow without Razorpay checkout.
      }

      await completeDemoPay();
    } catch (err: any) {
      fail(err.message || 'Could not start the payment.');
    }
  };

  const handleRevokeAcceptance = async () => {
    if (!window.confirm('Cancel this vendor and choose another bid?')) return;
    setCancelling(true);
    try {
      if (onCancelBooking) {
        await onCancelBooking(booking._id);
      } else {
        await api.cancelBooking(booking._id, 'Acceptance cancelled by host');
      }
      onClose();
    } catch (err: any) {
      if (!onCancelBooking) setErrorMessage(err.message || 'Could not cancel.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 my-6 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          disabled={loading || cancelling}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'success' && (
          <div className="space-y-5 text-center animate-in fade-in slide-in-from-bottom-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Vendor booked</h2>
              <p className="text-base text-slate-600 mt-1">
                ₹{booking.totalPaid.toLocaleString()} is held by EzzyGo until the event is done.
              </p>
              {transactionId && (
                <p className="text-xs font-mono text-slate-400 mt-1">Payment ref: {transactionId}</p>
              )}
            </div>

            <VendorUnlockedCard booking={paidBooking || booking} />

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-sm font-semibold text-slate-900 mb-1.5">What happens next</p>
              <ol className="text-sm space-y-1 text-slate-600 list-decimal list-inside leading-relaxed">
                <li>Call the vendor and share the event time and address.</li>
                <li>Your money stays with EzzyGo until the event is over.</li>
                <li>After the event, click "Event done" and the vendor gets paid.</li>
              </ol>
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigateToBookings?.();
              }}
              className="w-full py-3.5 rounded-2xl bg-[#f07d4a] hover:bg-[#de6a3a] text-white font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View my bookings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'failed' && (
          <div className="space-y-5 text-center animate-in fade-in slide-in-from-bottom-2">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Payment not completed</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">{errorMessage}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-sm text-slate-700 leading-relaxed">
              {paidAfterVerifyError
                ? 'If money was taken from your account, do not pay again. Open My bookings in a minute to check the status, or contact EzzyGo support with the payment ref.'
                : 'You can try again, pay later from My bookings, or choose another vendor.'}
            </div>

            <div className="space-y-2.5">
              {!paidAfterVerifyError && (
                <button
                  onClick={handlePay}
                  disabled={loading || cancelling}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Opening payment...' : `Try again: pay ₹${booking.totalPaid.toLocaleString()}`}
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onNavigateToBookings?.();
                }}
                disabled={loading || cancelling}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition cursor-pointer"
              >
                {paidAfterVerifyError ? 'Go to My bookings' : 'Pay later from My bookings'}
              </button>

              {!paidAfterVerifyError && (
                <button
                  onClick={handleRevokeAcceptance}
                  disabled={loading || cancelling}
                  className="w-full py-2.5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel this vendor and choose another'}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pr-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 text-white">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Pay to confirm the booking</h2>
                <p className="text-sm text-slate-600">EzzyGo holds this money until you confirm the event is done.</p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-sm text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Vendor price</span>
                <span className="font-semibold text-slate-900">₹{booking.bidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>EzzyGo fee (10%)</span>
                <span className="font-semibold text-slate-900">+ ₹{booking.platformFee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-base font-semibold text-slate-900">Total to pay</span>
                <span className="text-2xl font-bold text-emerald-700">₹{booking.totalPaid.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Demo payment is on. Escrow confirms instantly and vendor contact unlocks. Live UPI/card starts after Razorpay live keys.
            </p>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming demo payment...
                </span>
              ) : (
                <>
                  <span>Confirm demo payment · ₹{booking.totalPaid.toLocaleString()}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
