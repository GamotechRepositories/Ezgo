import React, { useState } from 'react';
import { Search, Phone, X, Star, Eye, FileText, Download, ShieldCheck, Clock, AlertCircle, Zap } from 'lucide-react';
import type { User } from '../types';

interface ProviderKycManagerProps {
  providers: User[];
  onToggleVerify: (providerId: string, isVerified: boolean, notes?: string, rejectionReason?: string) => void;
}

const getDocPreviewUrl = (url?: string | null): string => {
  if (!url) return '';
  // Cloudinary automatically renders page 1 of PDFs as high-quality JPG when extension or format is changed to .jpg
  if (url.includes('res.cloudinary.com') && /\.pdf($|\?)/i.test(url)) {
    return url.replace(/\.pdf($|\?)/i, '.jpg$1');
  }
  return url;
};

const isPdfDocument = (url?: string | null): boolean => {
  if (!url) return false;
  return /\.pdf($|\?)/i.test(url);
};

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
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REMINDERS'>('ALL');
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
  const [rejectModalProvider, setRejectModalProvider] = useState<User | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  const list = providers || [];
  const pendingCount = list.filter((p) => !p.isVerified).length;
  const verifiedCount = list.filter((p) => p.isVerified).length;

  const isReminder = (p: User) =>
    !p.isVerified &&
    Boolean(
      p.kycDocuments?.reviewRequestedAt ||
      p.verificationAudit?.some(
        (a) => a.reviewedByName === 'Vendor Reminder' || a.action === 'PROVIDER_REVIEW_REMINDER'
      )
    );

  const reminderCount = list.filter(isReminder).length;

  const q = search.toLowerCase();
  const filtered = list
    .filter((p) => {
      const matchesSearch =
        (p.name || '').toLowerCase().includes(q) ||
        (p.businessName || '').toLowerCase().includes(q) ||
        (p.phone || '').includes(search) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.categories || []).some((c) => c.toLowerCase().includes(q));
      const matchesFilter =
        filter === 'ALL'
          ? true
          : filter === 'VERIFIED'
          ? p.isVerified
          : filter === 'REMINDERS'
          ? isReminder(p)
          : !p.isVerified;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aRem = isReminder(a) ? 1 : 0;
      const bRem = isReminder(b) ? 1 : 0;
      if (aRem !== bRem) return bRem - aRem;
      return 0;
    });

  const filters: { id: typeof filter; label: string }[] = [
    { id: 'ALL', label: `All (${list.length})` },
    { id: 'PENDING', label: `To check (${pendingCount})` },
    ...(reminderCount > 0 ? [{ id: 'REMINDERS' as const, label: `⚡ Reminders (${reminderCount})` }] : []),
    { id: 'VERIFIED', label: `Approved (${verifiedCount})` },
  ];

  const approve = (provider: User, value: boolean, reason?: string) => {
    onToggleVerify(provider._id, value, reason, reason);
    if (selectedProvider?._id === provider._id) {
      setSelectedProvider({
        ...provider,
        isVerified: value,
        kycDocuments: provider.kycDocuments
          ? { ...provider.kycDocuments, rejectionReason: value ? '' : (reason || '') }
          : undefined,
      });
    }
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
          className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff5c28] focus:ring-2 focus:ring-[#ff5c28]/15"
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
              className={`rounded-3xl bg-white border p-6 flex flex-col justify-between gap-5 shadow-sm transition-all ${
                isReminder(provider)
                  ? 'border-amber-300 ring-2 ring-amber-400/30 bg-amber-50/10'
                  : 'border-slate-200'
              }`}
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
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full border text-xs font-bold ${
                        provider.isVerified
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      {provider.isVerified ? 'Approved' : 'To check'}
                    </span>
                    {isReminder(provider) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] shadow-xs animate-pulse">
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Reminder ⚡</span>
                      </span>
                    )}
                  </div>
                </div>

                {isReminder(provider) && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                      <span>Priority Review Requested!</span>
                    </div>
                    {provider.kycDocuments?.reviewRequestedMessage && (
                      <p className="text-[11px] text-amber-800 italic line-clamp-2">
                        "{provider.kycDocuments.reviewRequestedMessage}"
                      </p>
                    )}
                    {provider.kycDocuments?.reviewRequestedAt && (
                      <p className="text-[10px] text-amber-700">
                        Requested: {new Date(provider.kycDocuments.reviewRequestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                )}

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
              {isReminder(selectedProvider) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/70 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-amber-900 flex items-center gap-1.5">
                        <span>⚡ Priority Review Reminder Sent by Vendor</span>
                      </h5>
                      {selectedProvider.kycDocuments?.reviewRequestedAt && (
                        <span className="text-[11px] font-semibold text-amber-800">
                          {new Date(selectedProvider.kycDocuments.reviewRequestedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed bg-white/90 p-2.5 rounded-xl border border-amber-200 text-slate-900 font-medium text-xs">
                      "{selectedProvider.kycDocuments?.reviewRequestedMessage || 'Vendor requested urgent priority review of submitted KYC documents.'}"
                    </p>
                    <p className="text-[11px] text-amber-800">
                      The vendor sent this ping to request urgent compliance review. Please verify documents below and approve or request changes.
                    </p>
                  </div>
                </div>
              )}

              {selectedProvider.kycDocuments?.rejectionReason && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-rose-900 mb-0.5">Active Rejection Reason:</h5>
                    <p className="leading-relaxed">{selectedProvider.kycDocuments.rejectionReason}</p>
                  </div>
                </div>
              )}

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
                  selectedProvider.kycDocuments?.aadhaarBack ||
                  selectedProvider.kycDocuments?.panCard ||
                  selectedProvider.kycDocuments?.gstDoc) && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                      Uploaded Document Copies (Click to Preview)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Aadhaar Front */}
                      {selectedProvider.kycDocuments?.aadhaarFront && (
                        <div
                          onClick={() =>
                            setPreviewDoc({
                              title: `Aadhaar Front - ${selectedProvider.name}`,
                              url: selectedProvider.kycDocuments!.aadhaarFront!,
                            })
                          }
                          className="group relative p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 transition cursor-pointer flex flex-col items-center justify-between text-center overflow-hidden"
                        >
                          <div className="w-full h-24 mb-2 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center relative">
                            <img
                              src={getDocPreviewUrl(selectedProvider.kycDocuments.aadhaarFront)}
                              alt="Aadhaar Front"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon-af');
                                if (fb) fb.classList.remove('hidden');
                              }}
                            />
                            <div className="fallback-icon-af hidden flex flex-col items-center justify-center p-2">
                              <FileText className="w-8 h-8 text-slate-600" />
                              <span className="text-[10px] text-slate-500 font-semibold mt-1">PDF File</span>
                            </div>
                            {isPdfDocument(selectedProvider.kycDocuments.aadhaarFront) && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                                PDF
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Aadhaar Front</span>
                          <span className="text-xs text-[#ff5c28] font-medium mt-0.5 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View Preview
                          </span>
                        </div>
                      )}

                      {/* Aadhaar Back */}
                      {selectedProvider.kycDocuments?.aadhaarBack && (
                        <div
                          onClick={() =>
                            setPreviewDoc({
                              title: `Aadhaar Back - ${selectedProvider.name}`,
                              url: selectedProvider.kycDocuments!.aadhaarBack!,
                            })
                          }
                          className="group relative p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 transition cursor-pointer flex flex-col items-center justify-between text-center overflow-hidden"
                        >
                          <div className="w-full h-24 mb-2 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center relative">
                            <img
                              src={getDocPreviewUrl(selectedProvider.kycDocuments.aadhaarBack)}
                              alt="Aadhaar Back"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon-ab');
                                if (fb) fb.classList.remove('hidden');
                              }}
                            />
                            <div className="fallback-icon-ab hidden flex flex-col items-center justify-center p-2">
                              <FileText className="w-8 h-8 text-slate-600" />
                              <span className="text-[10px] text-slate-500 font-semibold mt-1">PDF File</span>
                            </div>
                            {isPdfDocument(selectedProvider.kycDocuments.aadhaarBack) && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                                PDF
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Aadhaar Back</span>
                          <span className="text-xs text-[#ff5c28] font-medium mt-0.5 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View Preview
                          </span>
                        </div>
                      )}

                      {/* PAN Card */}
                      {selectedProvider.kycDocuments?.panCard && (
                        <div
                          onClick={() =>
                            setPreviewDoc({
                              title: `PAN Card - ${selectedProvider.name}`,
                              url: selectedProvider.kycDocuments!.panCard!,
                            })
                          }
                          className="group relative p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 transition cursor-pointer flex flex-col items-center justify-between text-center overflow-hidden"
                        >
                          <div className="w-full h-24 mb-2 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center relative">
                            <img
                              src={getDocPreviewUrl(selectedProvider.kycDocuments.panCard)}
                              alt="PAN Card"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon-pan');
                                if (fb) fb.classList.remove('hidden');
                              }}
                            />
                            <div className="fallback-icon-pan hidden flex flex-col items-center justify-center p-2">
                              <FileText className="w-8 h-8 text-slate-600" />
                              <span className="text-[10px] text-slate-500 font-semibold mt-1">PDF File</span>
                            </div>
                            {isPdfDocument(selectedProvider.kycDocuments.panCard) && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                                PDF
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-800">PAN Card</span>
                          <span className="text-xs text-[#ff5c28] font-medium mt-0.5 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View Preview
                          </span>
                        </div>
                      )}

                      {/* GST Doc */}
                      {selectedProvider.kycDocuments?.gstDoc && (
                        <div
                          onClick={() =>
                            setPreviewDoc({
                              title: `GST Certificate - ${selectedProvider.businessName || selectedProvider.name}`,
                              url: selectedProvider.kycDocuments!.gstDoc!,
                            })
                          }
                          className="group relative p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 transition cursor-pointer flex flex-col items-center justify-between text-center overflow-hidden"
                        >
                          <div className="w-full h-24 mb-2 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center relative">
                            <img
                              src={getDocPreviewUrl(selectedProvider.kycDocuments.gstDoc)}
                              alt="GST"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon-gst');
                                if (fb) fb.classList.remove('hidden');
                              }}
                            />
                            <div className="fallback-icon-gst hidden flex flex-col items-center justify-center p-2">
                              <FileText className="w-8 h-8 text-slate-600" />
                              <span className="text-[10px] text-slate-500 font-semibold mt-1">PDF File</span>
                            </div>
                            {isPdfDocument(selectedProvider.kycDocuments.gstDoc) && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                                PDF
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-800">GST Certificate</span>
                          <span className="text-xs text-[#ff5c28] font-medium mt-0.5 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View Preview
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

                {/* Verification Audit Trail Section (Module 04, Task 10) */}
                <section className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Verification Audit Trail</span>
                    </h4>
                    {selectedProvider.verificationAudit && selectedProvider.verificationAudit.length > 0 && (
                      <span className="text-xs text-slate-400">
                        {selectedProvider.verificationAudit.length} event(s) logged
                      </span>
                    )}
                  </div>

                  {!selectedProvider.verificationAudit || selectedProvider.verificationAudit.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      No verification audit history recorded yet. Approving or revoking will log an immutable audit event.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedProvider.verificationAudit.map((log, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  log.reviewedByName === 'Vendor Reminder'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : log.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {log.reviewedByName === 'Vendor Reminder' ? '⚡ REMINDER' : log.status}
                              </span>
                              <span className="font-semibold text-slate-700">
                                by {log.reviewedByName || "Administrator"}
                              </span>
                            </div>
                            <p className="text-slate-600">{log.notes}</p>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {new Date(log.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
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
                  onClick={() => {
                    setRejectModalProvider(selectedProvider);
                    setRejectionReasonText('');
                  }}
                  className="px-5 py-2 rounded-full bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 font-semibold text-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Revoke Approval</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRejectModalProvider(selectedProvider);
                      setRejectionReasonText(selectedProvider.kycDocuments?.rejectionReason || '');
                    }}
                    className="px-4 py-2 rounded-full bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 font-semibold text-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Reject / Need Changes</span>
                  </button>
                  <button
                    onClick={() => approve(selectedProvider, true)}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve Vendor</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* In-Place Full Screen Document Preview Lightbox */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[70] flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#ff5c28]" />
                <div>
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg">{previewDoc.title}</h4>
                  {isPdfDocument(previewDoc.url) && (
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      PDF Document Preview (Page 1)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Open or Download Original File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Viewer Area */}
            <div className="flex-1 bg-slate-900 flex items-center justify-center p-4 overflow-auto min-h-[350px] max-h-[75vh]">
              <img
                src={getDocPreviewUrl(previewDoc.url)}
                alt={previewDoc.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('modal-doc-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div id="modal-doc-fallback" className="hidden text-center text-white p-8 space-y-3">
                <FileText className="w-16 h-16 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold">Could not render inline image</p>
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff5c28] text-white text-xs font-bold"
                >
                  <Download className="w-4 h-4" /> Download / Open Document
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Previewing uploaded KYC document inline</span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection / Need Changes Reason Modal */}
      {rejectModalProvider && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{rejectModalProvider.isVerified ? 'Revoke Vendor Verification' : 'Reject KYC Verification'}</span>
              </h3>
              <button
                onClick={() => setRejectModalProvider(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Explain why the verification for <strong>{rejectModalProvider.businessName || rejectModalProvider.name}</strong> is being {rejectModalProvider.isVerified ? 'revoked' : 'rejected'}. This reason will be shown directly on the vendor's dashboard so they know exactly what to correct.
            </p>

            {/* Quick preset chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Aadhaar document copy is blurry / not readable',
                  'PAN card name does not match proprietor name',
                  'Bank account IFSC code or account number is invalid',
                  'GSTIN certificate details mismatch',
                  'Complete registered business address is missing',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReasonText(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition text-left cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Reason for Vendor *
              </label>
              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="Enter reason for rejection or needed corrections..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalProvider(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReasonText.trim()}
                onClick={() => {
                  const reason = rejectionReasonText.trim();
                  approve(rejectModalProvider, false, reason);
                  setRejectModalProvider(null);
                }}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Confirm Rejection & Send Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
