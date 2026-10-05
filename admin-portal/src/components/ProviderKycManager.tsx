import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Check, 
  Building2, 
  Phone, 
  Star,
  FileText,
  X,
  CreditCard,
  Sparkles,
  MapPin,
  Clock
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
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null);

  const pendingCount = (providers || []).filter((p) => !p.isVerified).length;
  const verifiedCount = (providers || []).filter((p) => p.isVerified).length;

  const filtered = (providers || []).filter((p) => {
    const nameMatch = (p.name || '').toLowerCase().includes(search.toLowerCase());
    const businessMatch = (p.businessName || '').toLowerCase().includes(search.toLowerCase());
    const phoneMatch = (p.phone || '').includes(search);
    const emailMatch = (p.email || '').toLowerCase().includes(search.toLowerCase());
    const catMatch = (p.categories || []).some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchesSearch = nameMatch || businessMatch || phoneMatch || emailMatch || catMatch;
    
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
              filter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All ({providers.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'PENDING' ? 'bg-rose-500 text-white shadow-xs' : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>Pending Verification</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              filter === 'PENDING' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setFilter('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'VERIFIED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>Verified</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              filter === 'VERIFIED' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {verifiedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verification Queue</div>
            <div className="text-xl font-black text-rose-600 mt-0.5">{pendingCount} Action Required</div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Verified Pros</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{verifiedCount} Vendors Ready</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Approval Speed</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">&lt; 2 Hours</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search provider by name, business, category, phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-[#f95724]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Provider Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <ShieldCheck className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Providers Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No providers matched your current search &quot;{search}&quot; or filter &quot;{filter}&quot;.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setFilter('ALL');
            }}
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((provider) => {
            const initials = (provider.name || 'Vendor')
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={provider._id}
                className={`rounded-3xl bg-white border p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
                  provider.isVerified ? 'border-slate-200' : 'border-rose-200/80 ring-1 ring-rose-100'
                }`}
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        provider.isVerified 
                          ? 'text-emerald-700 bg-emerald-100/80' 
                          : 'text-amber-700 bg-amber-100/80'
                      }`}>
                        {provider.isVerified ? 'Direct Payout Ready' : 'Pending Approval'}
                      </span>
                    </div>

                    <div className="text-xs">
                      <div className="font-bold text-slate-900">
                        {provider.bankDetails?.accountHolder || provider.businessName || provider.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 mt-0.5">
                        <span>{provider.bankDetails?.accountNumber || '••••••••9812'}</span>
                        {provider.bankDetails?.ifscCode && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 font-bold">{provider.bankDetails.ifscCode}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-[#f95724] font-medium">{provider.bankDetails?.upiId || 'Direct Bank Deposit'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status Checks (Accurate per status) */}
                  <div className="flex items-center gap-2 text-[11px] font-medium pt-1">
                    {provider.isVerified ? (
                      <>
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Identity Verified</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Gear Inspected</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1 text-amber-700 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Docs Under Review</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-rose-600 font-bold">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Awaiting Admin Sign-off</span>
                        </span>
                      </>
                    )}
                  </div>

                </div>

                {/* Verification Actions & Dossier Button */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={`tel:${provider.phone}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{provider.phone}</span>
                    </a>

                    <button
                      onClick={() => setSelectedProvider(provider)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {provider.isVerified ? (
                      <button
                        onClick={() => onToggleVerify(provider._id, false)}
                        className="w-full py-2 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-bold text-xs border border-slate-200 transition cursor-pointer"
                      >
                        Revoke KYC
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleVerify(provider._id, true)}
                        className="w-full py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Activate Pro</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* KYC Inspection Dossier Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 text-white">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black">{selectedProvider.name}</h3>
                  <p className="text-xs text-slate-300">{selectedProvider.businessName || 'Vendor Profile Dossier'}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
              
              {/* Status Header Pill */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-500">Current KYC Verification State:</span>
                {selectedProvider.isVerified ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>VERIFIED & ACTIVE</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>PENDING VERIFICATION</span>
                  </span>
                )}
              </div>

              {/* Provider Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Contact Phone</div>
                  <div className="font-bold text-slate-900 text-sm">{selectedProvider.phone}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Email Address</div>
                  <div className="font-bold text-slate-900 text-sm">{selectedProvider.email || 'support@vendor.in'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Service Area</div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#f95724]" />
                    <span>{selectedProvider.serviceArea || 'Pune & PCMC'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Track Record</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedProvider.completedJobs || 0} jobs completed • {selectedProvider.rating || 4.9} ★ rating
                  </div>
                </div>
              </div>

              {/* Authorized Categories */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Approved Event Service Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedProvider.categories || ['General Event Services']).map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 text-[#f95724] border border-orange-200 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{cat}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Settlement Bank Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-[#f95724]" />
                    <span>Bank Account & IMPS / UPI Settlement Profile</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Zero Deductions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 font-bold">Account Holder</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {selectedProvider.bankDetails?.accountHolder || selectedProvider.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold">Bank Account Number</div>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">
                      {selectedProvider.bankDetails?.accountNumber || '••••••••9812'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold">IFSC Code</div>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">
                      {selectedProvider.bankDetails?.ifscCode || 'HDFC0001234'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Linked UPI VPA Handle:</span>
                  <span className="font-mono font-bold text-[#f95724]">
                    {selectedProvider.bankDetails?.upiId || 'vendor@okhdfc'}
                  </span>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Compliance & Verification Checklist
                </div>
                
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${selectedProvider.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Government Identity Proof (Aadhaar / PAN)</div>
                        <div className="text-[10px] text-slate-400">Document matches business owner KYC records</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedProvider.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedProvider.isVerified ? 'Passed' : 'Pending'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${selectedProvider.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Sound / Stage Equipment Condition Check</div>
                        <div className="text-[10px] text-slate-400">Inventory specs & daily rental rates validated</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedProvider.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedProvider.isVerified ? 'Passed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedProvider.isVerified ? (
                  <button
                    onClick={() => {
                      onToggleVerify(selectedProvider._id, false);
                      setSelectedProvider({ ...selectedProvider, isVerified: false });
                    }}
                    className="px-5 py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition cursor-pointer"
                  >
                    Revoke KYC Status
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onToggleVerify(selectedProvider._id, true);
                      setSelectedProvider({ ...selectedProvider, isVerified: true });
                    }}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Activate Vendor</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};