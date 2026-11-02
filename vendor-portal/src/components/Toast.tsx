import React, { useEffect, useState } from 'react';
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

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const duration = toast.type === 'error' ? 5500 : 4000;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.type, isPaused, onDismiss]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
        toast.type === 'success'
          ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-900/10'
          : toast.type === 'error'
          ? 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-900/10'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/10'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-[#17233d]" />}
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-sm font-bold leading-snug">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close"
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  // Never show more than 3 toasts stacked at once
  const visibleToasts = toasts.slice(-3);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none">
      {visibleToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
