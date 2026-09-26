import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, ArrowRight, Smartphone, CreditCard, Building2 } from 'lucide-react';
import type { Booking } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaySuccess: (bookingId: string, paymentMethod: string) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaySuccess,
}) => {
  if (!isOpen || !booking) return null;

  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / Paytm)');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await onPaySuccess(booking._id, paymentMethod);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">EzGo Escrow Checkout</h2>
            <p className="text-xs text-slate-400">Funds are held safely until you confirm completion</p>
          </div>
        </div>

        {/* Financial Breakdown Card */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 mb-6">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Accepted Vendor Bid:</span>
            <span className="font-mono font-semibold text-white">₹{booking.bidAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <span>Platform Escrow Fee (10%):</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 rounded">Paid by requester</span>
            </span>
            <span className="font-mono font-semibold text-amber-400">+ ₹{booking.platformFee.toLocaleString()}</span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-bold text-white block">Total Payable Now:</span>
              <span className="text-[10px] text-slate-500">Includes 100% Escrow Protection</span>
            </div>
            <span className="font-mono text-xl font-black text-emerald-400">
              ₹{booking.totalPaid.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Escrow Badge */}
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 mb-6 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200 leading-relaxed">
            <strong>How Escrow Works:</strong> Your money is held in EzGo's RBI-compliant Escrow account. The provider is NOT paid until you mark the booking Completed after your event.
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Select Payment Method
          </label>

          <label
            onClick={() => setPaymentMethod('UPI (Google Pay / PhonePe / Paytm)')}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
              paymentMethod.includes('UPI')
                ? 'bg-slate-800/90 border-emerald-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold">UPI (GPay / PhonePe / Paytm / BHIM)</span>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              paymentMethod.includes('UPI') ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
            }`}>
              {paymentMethod.includes('UPI') && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </label>

          <label
            onClick={() => setPaymentMethod('Credit / Debit Card (Visa, MasterCard, RuPay)')}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
              paymentMethod.includes('Card')
                ? 'bg-slate-800/90 border-emerald-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold">Credit / Debit Cards</span>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              paymentMethod.includes('Card') ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
            }`}>
              {paymentMethod.includes('Card') && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </label>

          <label
            onClick={() => setPaymentMethod('Net Banking (All Indian Banks)')}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
              paymentMethod.includes('Banking')
                ? 'bg-slate-800/90 border-emerald-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold">Net Banking</span>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              paymentMethod.includes('Banking') ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
            }`}>
              {paymentMethod.includes('Banking') && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </label>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Processing Escrow Payment...'
          ) : (
            <>
              <span>Pay ₹{booking.totalPaid.toLocaleString()} & Reveal Contact</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};
