import React from 'react';
import { ScrollText } from 'lucide-react';
import type { AuditLog } from '../types';

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2 mins ago',
    actor: 'Swara Sound & FX',
    action: 'PLACED_BID',
    details: 'Placed reverse bid of ₹26,000 on Sangeet Night Sound (ID: req-101) - 25.7% discount applied.',
    amount: 26000,
    status: 'SUCCESS',
  },
  {
    id: 'log-2',
    timestamp: '14 mins ago',
    actor: 'Pooja Deshmukh',
    action: 'POSTED_REQUIREMENT',
    details: 'Broadcasted new Sangeet sound requirement in Koregaon Park Annex with ₹35,000 budget ceiling.',
    amount: 35000,
    status: 'INFO',
  },
  {
    id: 'log-3',
    timestamp: '1 hour ago',
    actor: 'System Admin',
    action: 'ESCROW_RELEASE',
    details: 'Automated 100% escrow payout release of ₹62,000 to Swara Decorators (Booking: bk-502).',
    amount: 62000,
    status: 'SUCCESS',
  },
  {
    id: 'log-4',
    timestamp: '3 hours ago',
    actor: 'System Admin',
    action: 'KYC_APPROVED',
    details: 'Verified Rajesh Pro Audio LLP credentials and linked bank account.',
    status: 'INFO',
  },
];

export const AuditLogViewer: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-slate-500" />
          <span>Marketplace Transaction & Operations Audit Trail</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Immutable chronological ledger of bids, reverse auctions, escrow custody deposits, and platform actions.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="space-y-3">
          {mockAuditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#f95724] uppercase">
                    [{log.action}]
                  </span>
                  <span className="font-bold text-slate-900">{log.actor}</span>
                  <span className="text-slate-400">• {log.timestamp}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{log.details}</p>
              </div>

              {log.amount && (
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Value</div>
                  <div className="text-sm font-black text-slate-900">₹{log.amount.toLocaleString()}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};