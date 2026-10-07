import React from 'react';

interface AuditLogViewerProps {
  transactions: any[];
}

const typeLabels: Record<string, { label: string; className: string }> = {
  PAYMENT_HELD_ESCROW: { label: 'Host paid', className: 'bg-blue-50 text-blue-800' },
  PAYOUT_RELEASED_PROVIDER: { label: 'Vendor paid', className: 'bg-emerald-50 text-emerald-800' },
  COMMISSION_EARNED: { label: 'EzzyGo fee', className: 'bg-orange-50 text-orange-800' },
  REFUND: { label: 'Refund', className: 'bg-rose-50 text-rose-800' },
};

const personName = (user: any) => user?.businessName || user?.name;

const describe = (t: any) => {
  const from = personName(t.fromUser);
  const to = personName(t.toUser);
  switch (t.type) {
    case 'PAYMENT_HELD_ESCROW':
      return `${from || 'A host'} paid EzzyGo for a booking.`;
    case 'PAYOUT_RELEASED_PROVIDER':
      return `EzzyGo sent the full bid to ${to || 'the vendor'}.`;
    case 'COMMISSION_EARNED':
      return 'EzzyGo kept the 10% fee for a finished event.';
    case 'REFUND':
      return `EzzyGo refunded ${to || 'the host'}.`;
    default:
      return t.type;
  }
};

const formatTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '';

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ transactions }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Money activity</h2>
        <p className="text-base text-slate-600 mt-1">The last 10 payments, payouts, and fees on EzzyGo.</p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No money activity yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {transactions.map((t) => {
              const info = typeLabels[t.type] || { label: t.type, className: 'bg-slate-100 text-slate-700' };
              return (
                <li key={t._id} className="py-4 flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${info.className}`}>{info.label}</span>
                      <span className="text-sm text-slate-500">{formatTime(t.createdAt)}</span>
                      {t.status && t.status !== 'SUCCESS' && (
                        <span className="text-sm text-rose-600">{t.status.toLowerCase()}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{describe(t)}</p>
                    {t.referenceId && <p className="text-xs text-slate-400">Ref {t.referenceId}</p>}
                  </div>
                  <div className="text-base font-semibold text-slate-900 shrink-0">
                    ₹{Number(t.amount || 0).toLocaleString()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
