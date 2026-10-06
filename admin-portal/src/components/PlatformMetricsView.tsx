import React from 'react';
import type { AdminMetrics } from '../types';

interface PlatformMetricsViewProps {
  metrics: AdminMetrics;
}

const steps = [
  { title: 'Host posts a request', body: 'Sets the event details and a budget.' },
  { title: 'Vendors bid 15% lower or more', body: 'Only bids at 85% of the budget or less can be picked.' },
  { title: 'Host picks and pays', body: 'Host pays the bid + 10% fee. EzGo holds the money.' },
  { title: 'Event done, vendor paid', body: 'Vendor gets 100% of the bid. EzGo keeps the 10% fee.' },
];

export const PlatformMetricsView: React.FC<PlatformMetricsViewProps> = ({ metrics }) => {
  const gmv = metrics?.totalGMV || 0;
  const commission = metrics?.totalCommissionEarned || 0;
  const escrowHeld = metrics?.totalEscrowHeld || 0;
  const totalProviders = metrics?.totalProviders || 0;
  const pendingKyc = metrics?.pendingVerificationCount || 0;
  const totalReqs = metrics?.totalRequirements || 0;
  const activeBookings = metrics?.activeBookings || 0;
  const completedBookings = metrics?.completedBookings || 0;

  const moneyCards = [
    { label: 'Paid by hosts', value: `₹${gmv.toLocaleString()}`, note: 'All bookings that were paid, including the 10% fee', tone: 'text-slate-900' },
    { label: 'EzGo fees earned', value: `₹${commission.toLocaleString()}`, note: 'The 10% fee from finished events', tone: 'text-emerald-700' },
    { label: 'Money EzGo is holding', value: `₹${escrowHeld.toLocaleString()}`, note: 'Paid bookings whose event is not done yet', tone: 'text-blue-700' },
    { label: 'Vendors', value: String(totalProviders), note: pendingKyc > 0 ? `${pendingKyc} waiting for your check` : 'All checked', tone: 'text-slate-900' },
  ];

  const countCards = [
    { label: 'Requests posted', value: totalReqs, note: 'All host requests so far' },
    { label: 'Booked, event not done', value: activeBookings, note: 'Host has paid. Waiting for the event.' },
    { label: 'Finished', value: completedBookings, note: 'Event done and vendor paid' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-base text-slate-600 mt-1">
          Money and bookings across EzGo. Hosts pay the bid plus a 10% fee. Vendors get the full bid.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {moneyCards.map((card) => (
          <div key={card.label} className="rounded-3xl bg-white border border-slate-200 p-6 space-y-2 shadow-sm">
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className={`text-2xl sm:text-3xl font-bold ${card.tone}`}>{card.value}</div>
            <div className="text-sm text-slate-500">{card.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {countCards.map((card) => (
          <div key={card.label} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="text-3xl font-bold text-slate-900">{card.value}</div>
            <p className="text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-slate-900">How a booking works</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <li key={step.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-sm font-semibold text-[#f95724]">{i + 1}</span>
              <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
