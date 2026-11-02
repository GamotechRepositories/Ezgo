import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
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
      className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
        toast.type === 'success'
          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100 shadow-emerald-500/10'
          : toast.type === 'error'
          ? 'bg-rose-950/90 border-rose-500/30 text-rose-100 shadow-rose-500/10'
          : toast.type === 'warning'
          ? 'bg-amber-950/90 border-amber-500/30 text-amber-100 shadow-amber-500/10'
          : 'bg-slate-900/90 border-cyan-500/30 text-cyan-100 shadow-cyan-500/10'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="font-semibold text-sm leading-tight text-white">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs mt-1 text-slate-300 leading-relaxed break-words">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close"
        className="text-slate-400 hover:text-white transition p-1 shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
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
