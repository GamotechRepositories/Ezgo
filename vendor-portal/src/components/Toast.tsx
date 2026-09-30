import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-900/10'
              : toast.type === 'error'
              ? 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-900/10'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/10'
          }`}
        >
          <div className="mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#f95724]" />}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold">{toast.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};