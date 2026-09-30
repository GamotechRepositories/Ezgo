import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Check, 
  Building2, 
  Phone, 
  Star 
} from 'lucide-react';
import type { User } from '../types';

interface ProviderKycManagerProps {
  providers: User[];
  onToggleVerify: (providerId: string, isVerified: boolean) => void;
}

export const ProviderKycManager: React.FC<ProviderKycManagerProps> = ({
  providers,
  onToggleVerify,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  const filtered = (providers || []).filter((p) => {
    const nameMatch = (p.name || '').toLowerCase().includes(search.toLowerCase());
    const businessMatch = (p.businessName || '').toLowerCase().includes(search.toLowerCase());
    const phoneMatch = (p.phone || '').includes(search);
    const matchesSearch = nameMatch || businessMatch || phoneMatch;
    const matchesFilter =
      filter === 'ALL' ? true : filter === 'VERIFIED' ? p.isVerified : !p.isVerified;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <span>Provider KYC & Equipment Verification Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review vendor legal registrations, verified sound & stage equipment inventory, and bank settlement accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All ({providers.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === 'PENDING' ? 'bg-rose-500 text-white' : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            Pending Verification
          </button>
          <button
            onClick={() => setFilter('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Verified ({providers.filter((p) => p.isVerified).length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search provider by name, business, phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-[#f95724]"
        />
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((provider) => {
          // Generate initials if avatar fails or is missing
          const initials = (provider.name || 'Vendor')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <div
              key={provider._id}
              className="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="space-y-4">
                
                {/* Header: Avatar, Name, Rating & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {provider.avatar ? (
                        <img
                          src={provider.avatar}
                          alt={provider.name}
                          className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-sm flex items-center justify-center ring-2 ring-orange-100 shadow-xs">
                          {initials}
                        </div>
                      )}
                      {provider.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white" title="Identity & KYC Verified">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {provider.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {provider.businessName || 'Registered Vendor'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1">
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded-md">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{provider.rating || 4.9}</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-medium">
                          {provider.completedJobs || 0} jobs delivered
                        </span>
                      </div>
                    </div>
                  </div>

                  {provider.isVerified ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center gap-1 shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                      <span>Action Required</span>
                    </span>
                  )}
                </div>

                {/* Service Categories */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Authorized Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.categories && provider.categories.length > 0 ? (
                      provider.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2.5 py-1 rounded-xl bg-slate-100/90 text-slate-700 text-[11px] font-semibold border border-slate-200/80"
                        >
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">General Event Services</span>
                    )}
                  </div>
                </div>

                {/* Settlement Bank Account Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#f95724]" />
                      <span>Settlement Bank Account</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Direct Payout
                    </span>
                  </div>

                  <div className="text-xs">
                    <div className="font-bold text-slate-900">
                      {provider.bankDetails?.accountHolder || provider.businessName || provider.name}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 mt-0.5">
                      <span>{provider.bankDetails?.accountNumber || '••••••••9812'}</span>
                      <span>•</span>
                      <span className="text-[#f95724] font-medium">{provider.bankDetails?.upiId || 'Direct Bank Deposit'}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Checks */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Identity Verified</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Gear Inspected</span>
                  </span>
                </div>

              </div>

              {/* Verification Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <a
                  href={`tel:${provider.phone}`}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider.phone}</span>
                </a>

                {provider.isVerified ? (
                  <button
                    onClick={() => onToggleVerify(provider._id, false)}
                    className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs border border-slate-200 transition cursor-pointer"
                  >
                    Revoke KYC
                  </button>
                ) : (
                  <button
                    onClick={() => onToggleVerify(provider._id, true)}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Activate</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};