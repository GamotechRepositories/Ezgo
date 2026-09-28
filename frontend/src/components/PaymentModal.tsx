import { useState } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, Smartphone, CreditCard, Building2, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 my-8 animate-in fade-in zoom-in-95">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">EzGo Escrow Checkout</h2>
            <p className="text-xs text-slate-500">Your funds remain safely locked until you confirm completion</p>
          </div>
        </div>

        {/* Financial Breakdown Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mb-5">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Accepted Vendor Bid Amount:</span>
            <span className="font-mono font-bold text-slate-900">₹{booking.bidAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span>Platform Escrow Fee (10%):</span>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Paid by host</span>
            </span>
            <span className="font-mono font-bold text-amber-700">+ ₹{booking.platformFee.toLocaleString()}</span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-extrabold text-slate-900 block">Total Payable into Escrow:</span>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                100% Refundable Before Event Date
              </span>
            </div>
            <span className="font-mono text-2xl font-black text-emerald-700">
              ₹{booking.totalPaid.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Escrow Guarantee Info Box */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 mb-5 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <strong>Escrow Safety Promise:</strong> The provider receives ₹{booking.bidAmount.toLocaleString()} only after your event is successfully delivered. Phone numbers & WhatsApp are revealed immediately after this step.
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Select Payment Method
          </label>

          <label
            onClick={() => setPaymentMethod('UPI (Google Pay / PhonePe / Paytm)')}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
              paymentMethod.includes('UPI')
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold">UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              paymentMethod.includes('UPI') ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
            }`}>
              {paymentMethod.includes('UPI') && <Check className="w-3 h-3 text-white" />}
            </div>
          </label>

          <label
            onClick={() => setPaymentMethod('Credit / Debit Card (Visa, MasterCard, RuPay)')}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
              paymentMethod.includes('Card')
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold">Credit / Debit Cards (Visa, MasterCard, RuPay)</span>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              paymentMethod.includes('Card') ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
            }`}>
              {paymentMethod.includes('Card') && <Check className="w-3 h-3 text-white" />}
            </div>
          </label>

          <label
            onClick={() => setPaymentMethod('Net Banking (All Major Indian Banks)')}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
              paymentMethod.includes('Banking')
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold">Net Banking (HDFC, ICICI, SBI, Axis)</span>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              paymentMethod.includes('Banking') ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
            }`}>
              {paymentMethod.includes('Banking') && <Check className="w-3 h-3 text-white" />}
            </div>
          </label>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
        >
          {loading ? (
            'Depositing into Escrow...'
          ) : (
            <>
              <span>Pay ₹{booking.totalPaid.toLocaleString()} into Escrow & Unmask Contact</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};
