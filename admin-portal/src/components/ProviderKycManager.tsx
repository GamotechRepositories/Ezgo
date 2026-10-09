import React, { useState } from 'react';
import { Search, Phone, X, Star } from 'lucide-react';
import type { User } from '../types';

interface ProviderKycManagerProps {
  providers: User[];
  onToggleVerify: (providerId: string, isVerified: boolean) => void;
}

const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="text-base font-medium text-slate-900 mt-0.5 break-words">{value || <span className="text-slate-400">Not added</span>}</div>
  </div>
);

export const ProviderKycManager: React.FC<ProviderKycManagerProps> = ({
  providers,
  onToggleVerify,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null);

  const list = providers || [];
  const pendingCount = list.filter((p) => !p.isVerified).length;
  const verifiedCount = list.filter((p) => p.isVerified).length;

  const q = search.toLowerCase();
  const filtered = list.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(q) ||
      (p.businessName || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(search) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.categories || []).some((c) => c.toLowerCase().includes(q));
    const matchesFilter = filter === 'ALL' ? true : filter === 'VERIFIED' ? p.isVerified : !p.isVerified;
    return matchesSearch && matchesFilter;
  });

  const filters: { id: typeof filter; label: string }[] = [
    { id: 'ALL', label: `All (${list.length})` },
    { id: 'PENDING', label: `To check (${pendingCount})` },
    { id: 'VERIFIED', label: `Approved (${verifiedCount})` },
  ];

  const approve = (provider: User, value: boolean) => {
    onToggleVerify(provider._id, value);
    if (selectedProvider?._id === provider._id) setSelectedProvider({ ...provider, isVerified: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vendor checks</h2>
          <p className="text-base text-slate-600 mt-1">
            Check each vendor's details and bank account, then approve them. Hosts see approved vendors as "Verified".
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                filter === f.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, business, phone, or category"
          className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f95724]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center space-y-3">
          <h3 className="text-base font-semibold text-slate-800">No vendors found</h3>
          <p className="text-sm text-slate-500">Try a different search or filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setFilter('ALL');
            }}
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            Show all vendors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((provider) => (
            <div
              key={provider._id}
              className="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col justify-between gap-5 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {provider.businessName || provider.name}
                    </h3>
                    {provider.businessName && <p className="text-sm text-slate-500 truncate">{provider.name}</p>}
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      {provider.rating ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{provider.rating}</span>
                          <span>·</span>
                        </>
                      ) : null}
                      <span>{provider.completedJobs || 0} jobs done</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 ${
                      provider.isVerified
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    {provider.isVerified ? 'Approved' : 'To check'}
                  </span>
                </div>

                {provider.categories && provider.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {provider.categories.map((cat) => (
                      <span key={cat} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-sm text-slate-600">
                  <span className="text-slate-500">Bank: </span>
                  {provider.bankDetails?.accountNumber || provider.bankDetails?.upiId ? (
                    <span className="text-slate-900">
                      {provider.bankDetails?.accountNumber || provider.bankDetails?.upiId}
                    </span>
                  ) : (
                    <span className="text-rose-600">Not added</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  {provider.phone ? (
                    <a href={`tel:${provider.phone}`} className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{provider.phone}</span>
                    </a>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => setSelectedProvider(provider)}
                    className="font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                  >
                    See details
                  </button>
                </div>

                {provider.isVerified ? (
                  <button
                    onClick={() => approve(provider, false)}
                    className="w-full py-2 rounded-full bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-sm border border-slate-200 transition cursor-pointer"
                  >
                    Remove approval
                  </button>
                ) : (
                  <button
                    onClick={() => approve(provider, true)}
                    className="w-full py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition cursor-pointer"
                  >
                    Approve vendor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProvider && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedProvider.businessName || selectedProvider.name}</h3>
                <p className="text-sm text-slate-500">
                  {selectedProvider.isVerified ? 'Approved' : 'Waiting for your check'}
                </p>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                aria-label="Close"
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <section className="space-y-3">
                <h4 className="text-base font-semibold text-slate-900">Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Owner name" value={selectedProvider.name} />
                  <Field label="Phone" value={selectedProvider.phone} />
                  <Field label="Email" value={selectedProvider.email} />
                  <Field label="Service area" value={selectedProvider.serviceArea} />
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-semibold text-slate-900">Services</h4>
                {selectedProvider.categories && selectedProvider.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.categories.map((cat) => (
                      <span key={cat} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No services added</p>
                )}
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-semibold text-slate-900">Bank account for payouts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Account holder" value={selectedProvider.bankDetails?.accountHolder} />
                  <Field label="Account number" value={selectedProvider.bankDetails?.accountNumber} />
                  <Field label="IFSC" value={selectedProvider.bankDetails?.ifscCode} />
                  <Field label="UPI ID" value={selectedProvider.bankDetails?.upiId} />
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-base font-semibold text-slate-900">KYC Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Aadhaar Number" value={selectedProvider.kycDocuments?.aadhaarNumber} />
                  <Field label="PAN Card Number" value={selectedProvider.kycDocuments?.panNumber} />
                  <Field label="GST Number" value={selectedProvider.kycDocuments?.gstNumber} />
                  <Field label="Business Address" value={selectedProvider.kycDocuments?.businessAddress} />
                </div>
                {(selectedProvider.kycDocuments?.aadhaarFront ||
                  selectedProvider.kycDocuments?.panCard ||
                  selectedProvider.kycDocuments?.gstDoc) && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Uploaded Document Copies</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedProvider.kycDocuments?.aadhaarFront && (
                        <a
                          href={selectedProvider.kycDocuments.aadhaarFront}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 block text-center transition"
                        >
                          <span className="text-xs font-medium text-slate-700 block">Aadhaar Front</span>
                          <span className="text-xs text-[#f95724] font-semibold mt-1 block">View File ↗</span>
                        </a>
                      )}
                      {selectedProvider.kycDocuments?.panCard && (
                        <a
                          href={selectedProvider.kycDocuments.panCard}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 block text-center transition"
                        >
                          <span className="text-xs font-medium text-slate-700 block">PAN Card</span>
                          <span className="text-xs text-[#f95724] font-semibold mt-1 block">View File ↗</span>
                        </a>
                      )}
                      {selectedProvider.kycDocuments?.gstDoc && (
                        <a
                          href={selectedProvider.kycDocuments.gstDoc}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 block text-center transition"
                        >
                          <span className="text-xs font-medium text-slate-700 block">GST Certificate</span>
                          <span className="text-xs text-[#f95724] font-semibold mt-1 block">View File ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
              {selectedProvider.isVerified ? (
                <button
                  onClick={() => approve(selectedProvider, false)}
                  className="px-5 py-2 rounded-full bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 font-semibold text-sm transition cursor-pointer"
                >
                  Remove approval
                </button>
              ) : (
                <button
                  onClick={() => approve(selectedProvider, true)}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition cursor-pointer"
                >
                  Approve vendor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
