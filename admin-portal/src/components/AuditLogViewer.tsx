import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  Info,
  Clock,
  Layers,
  FileText,
  UserCheck,
  CreditCard,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import type { AuditLog } from '../types';

interface AuditLogViewerProps {
  logs?: AuditLog[];
  transactions?: any[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

type ViewSubTab = 'audit' | 'ledger';
type ActionFilter = 'ALL' | 'KYC' | 'ESCROW' | 'CATALOG';

const actionMeta: Record<string, { label: string; className: string; icon: any }> = {
  PROVIDER_KYC_APPROVED: { label: 'KYC Approved', className: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: UserCheck },
  PROVIDER_KYC_REVOKED: { label: 'KYC Revoked', className: 'bg-rose-50 text-rose-800 border-rose-200', icon: AlertTriangle },
  KYC_DOCUMENT_VIEWED: { label: 'KYC Doc Inspected', className: 'bg-sky-50 text-sky-800 border-sky-200', icon: FileText },
  PAYOUT_RELEASED: { label: 'Payout Released', className: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CreditCard },
  REFUND_ISSUED: { label: 'Refund Issued', className: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertCircle },
  BOOKING_CANCELLED: { label: 'Booking Cancelled', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: AlertCircle },
  DISPUTE_RESOLVED: { label: 'Dispute Resolved', className: 'bg-purple-50 text-purple-800 border-purple-200', icon: ShieldCheck },
  DISPUTE_DISMISSED: { label: 'Dispute Dismissed', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: Info },
  CATEGORY_CREATED: { label: 'Category Added', className: 'bg-blue-50 text-blue-800 border-blue-200', icon: Layers },
  CATEGORY_UPDATED: { label: 'Category Updated', className: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Layers },
  CATEGORY_DELETED: { label: 'Category Deleted', className: 'bg-rose-50 text-rose-800 border-rose-200', icon: AlertTriangle },
  OCCASION_CREATED: { label: 'Occasion Added', className: 'bg-teal-50 text-teal-800 border-teal-200', icon: Tag },
  OCCASION_UPDATED: { label: 'Occasion Updated', className: 'bg-teal-50 text-teal-800 border-teal-200', icon: Tag },
  OCCASION_DELETED: { label: 'Occasion Deleted', className: 'bg-rose-50 text-rose-800 border-rose-200', icon: AlertTriangle },
};

const txLabels: Record<string, { label: string; className: string }> = {
  PAYMENT_HELD_ESCROW: { label: 'Host Escrow Paid', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  PAYOUT_RELEASED_PROVIDER: { label: 'Vendor Payout', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  COMMISSION_EARNED: { label: 'EzzyGo Fee', className: 'bg-orange-50 text-orange-800 border-orange-200' },
  REFUND: { label: 'Host Refund', className: 'bg-rose-50 text-rose-800 border-rose-200' },
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const personName = (user: any) => user?.businessName || user?.name;

const describeTx = (t: any) => {
  const from = personName(t.fromUser);
  const to = personName(t.toUser);
  switch (t.type) {
    case 'PAYMENT_HELD_ESCROW':
      return `${from || 'Host'} deposited funds into EzzyGo escrow.`;
    case 'PAYOUT_RELEASED_PROVIDER':
      return `Escrow released full bid amount to ${to || 'the vendor'}.`;
    case 'COMMISSION_EARNED':
      return '10% platform service fee retained by EzzyGo upon event completion.';
    case 'REFUND':
      return `Escrow refunded to ${to || 'the host'}.`;
    default:
      return t.type;
  }
};

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs = [],
  transactions = [],
  onRefresh,
  isLoading = false,
}) => {
  const [subTab, setSubTab] = useState<ViewSubTab>('audit');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Action filter
      if (actionFilter === 'KYC' && !log.action.includes('KYC')) return false;
      if (actionFilter === 'ESCROW' && !log.action.includes('PAYOUT') && !log.action.includes('REFUND') && !log.action.includes('DISPUTE')) return false;
      if (actionFilter === 'CATALOG' && !log.action.includes('CATEGORY') && !log.action.includes('OCCASION')) return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const actorName = typeof log.actor === 'string' ? log.actor : log.actor?.name || '';
        const match =
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          actorName.toLowerCase().includes(q) ||
          (log.targetType && log.targetType.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [logs, actionFilter, search]);

  const filteredTxs = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter((t) => {
      return (
        t.type?.toLowerCase().includes(q) ||
        describeTx(t).toLowerCase().includes(q) ||
        t.referenceId?.toLowerCase().includes(q)
      );
    });
  }, [transactions, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit Trail & Money Activity</h2>
          <p className="text-base text-slate-600 mt-1">
            Tamper-evident logs of administrative actions, KYC decisions, and platform financial transactions.
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#f95724]' : 'text-slate-500'}`} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>
        )}
      </div>

      {/* Primary Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('audit')}
          className={`pb-2 px-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            subTab === 'audit'
              ? 'border-[#f95724] text-[#f95724]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Mutation Logs</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${subTab === 'audit' ? 'bg-orange-50 text-[#f95724]' : 'bg-slate-100 text-slate-600'}`}>
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('ledger')}
          className={`pb-2 px-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            subTab === 'ledger'
              ? 'border-[#f95724] text-[#f95724]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Financial Transaction Ledger</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${subTab === 'ledger' ? 'bg-orange-50 text-[#f95724]' : 'bg-slate-100 text-slate-600'}`}>
            {transactions.length}
          </span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={subTab === 'audit' ? 'Search actions, actors, or details...' : 'Search transaction references...'}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f95724]/20 focus:border-[#f95724]"
          />
        </div>

        {subTab === 'audit' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'KYC', 'ESCROW', 'CATALOG'] as ActionFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActionFilter(filter)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
                  actionFilter === filter
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter === 'ALL'
                  ? 'All Actions'
                  : filter === 'KYC'
                  ? 'KYC & Verification'
                  : filter === 'ESCROW'
                  ? 'Escrow & Disputes'
                  : 'Categories & Occasions'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Body */}
      {subTab === 'audit' ? (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-600 font-medium">No administrative audit records found.</p>
              <p className="text-xs text-slate-400">Mutations like KYC approvals, dispute settlements, and category edits will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log, idx) => {
                const meta = actionMeta[log.action] || {
                  label: log.action.replace(/_/g, ' '),
                  className: 'bg-slate-100 text-slate-700 border-slate-200',
                  icon: Info,
                };
                const IconComponent = meta.icon;
                const actorName = typeof log.actor === 'string' ? log.actor : log.actor?.name || 'Administrator';
                const timeString = formatTime(log.createdAt || log.timestamp);

                return (
                  <div key={log._id || log.id || idx} className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
                        <IconComponent className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${meta.className}`}>
                            {meta.label}
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeString}
                          </span>
                          {log.status === 'WARNING' && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              WARNING
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-slate-900 leading-snug break-words">
                          {log.details}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                          <span>
                            Actor: <strong className="text-slate-700 font-semibold">{actorName}</strong>
                          </span>
                          {log.targetType && (
                            <span>
                              Target: <span className="text-slate-600">{log.targetType}</span>
                            </span>
                          )}
                          {log.ipAddress && log.ipAddress !== '::1' && (
                            <span>
                              IP: <span className="font-mono text-slate-500">{log.ipAddress}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {log.amount !== null && log.amount !== undefined && (
                      <div className="md:text-right shrink-0">
                        <div className="text-xs text-slate-400">Transaction Value</div>
                        <div className="text-base font-bold text-slate-900">
                          ?{Number(log.amount).toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          {filteredTxs.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No financial transactions recorded.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredTxs.map((t) => {
                const info = txLabels[t.type] || { label: t.type, className: 'bg-slate-100 text-slate-700 border-slate-200' };
                return (
                  <li key={t._id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${info.className}`}>
                          {info.label}
                        </span>
                        <span className="text-sm text-slate-500">{formatTime(t.createdAt)}</span>
                        {t.status && t.status !== 'SUCCESS' && (
                          <span className="text-xs font-semibold text-rose-600 uppercase">{t.status}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">{describeTx(t)}</p>
                      {t.referenceId && <p className="text-xs font-mono text-slate-400">Ref: {t.referenceId}</p>}
                    </div>
                    <div className="text-base font-bold text-slate-900 shrink-0">
                      ?{Number(t.amount || 0).toLocaleString()}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
