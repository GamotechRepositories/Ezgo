import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileText,
  Zap,
  Eye,
  CreditCard,
  Edit3,
  Download,
  RotateCcw,
} from 'lucide-react';
import type { User } from '../types';
import { api } from '../services/api';

interface VendorVerificationModalProps {
  vendor: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVendor: (user: User) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const getDocPreviewUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && /\.pdf($|\?)/i.test(url)) {
    return url.replace(/\.pdf($|\?)/i, '.jpg$1');
  }
  return url;
};

const isPdfDoc = (url?: string | null): boolean => {
  if (!url) return false;
  return /\.pdf($|\?)/i.test(url);
};

export const VendorVerificationModal: React.FC<VendorVerificationModalProps> = ({
  vendor,
  isOpen,
  onClose,
  onUpdateVendor,
  onShowToast,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReminding, setIsReminding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);

  // Re-apply Form States
  const [aadhaarNumber, setAadhaarNumber] = useState(vendor.kycDocuments?.aadhaarNumber || '');
  const [panNumber, setPanNumber] = useState(vendor.kycDocuments?.panNumber || '');
  const [gstNumber, setGstNumber] = useState(vendor.kycDocuments?.gstNumber || '');
  const [businessAddress, setBusinessAddress] = useState(vendor.kycDocuments?.businessAddress || '');

  const [aadhaarFront, setAadhaarFront] = useState(vendor.kycDocuments?.aadhaarFront || '');
  const [aadhaarBack, setAadhaarBack] = useState(vendor.kycDocuments?.aadhaarBack || '');
  const [panCard, setPanCard] = useState(vendor.kycDocuments?.panCard || '');
  const [gstDoc, setGstDoc] = useState(vendor.kycDocuments?.gstDoc || '');

  const [accountHolder, setAccountHolder] = useState(vendor.bankDetails?.accountHolder || vendor.name || '');
  const [accountNumber, setAccountNumber] = useState(vendor.bankDetails?.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(vendor.bankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(vendor.bankDetails?.ifscCode || '');
  const [upiId, setUpiId] = useState(vendor.bankDetails?.upiId || '');

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadField, setActiveUploadField] = useState<string | null>(null);

  if (!isOpen) return null;

  const rejectionReason = vendor.kycDocuments?.rejectionReason?.trim();
  const isRejected = !vendor.isVerified && Boolean(rejectionReason);

  const triggerUpload = (field: string) => {
    setActiveUploadField(field);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadField) return;

    setUploadingDoc(activeUploadField);
    try {
      const url = await api.uploadImage(file, 'ezzygo/kyc');
      if (activeUploadField === 'aadhaarFront') setAadhaarFront(url);
      else if (activeUploadField === 'aadhaarBack') setAadhaarBack(url);
      else if (activeUploadField === 'panCard') setPanCard(url);
      else if (activeUploadField === 'gstDoc') setGstDoc(url);
      onShowToast('success', 'Document Uploaded', 'New document copy attached successfully.');
    } catch (err: any) {
      onShowToast('error', 'Upload Failed', err.message || 'Could not upload document.');
    } finally {
      setUploadingDoc(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendReminder = async () => {
    setIsReminding(true);
    try {
      const updatedUser = await api.requestVerificationReview(
        `Priority review requested by vendor ${vendor.businessName || vendor.name} (+91 ${vendor.phone})`
      );
      onUpdateVendor(updatedUser);
      onShowToast(
        'success',
        'Review Reminder Sent! ⚡',
        'Our admin team has received your priority verification request and will review your profile shortly.'
      );
    } catch (err: any) {
      onShowToast('error', 'Could not send reminder', err.message);
    } finally {
      setIsReminding(false);
    }
  };

  const handleSubmitReapply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aadhaarNumber.trim() || aadhaarNumber.replace(/\D/g, '').length !== 12) {
      onShowToast('error', 'Invalid Aadhaar', 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!panNumber.trim() || panNumber.trim().length !== 10) {
      onShowToast('error', 'Invalid PAN', 'Please enter a valid 10-character PAN number.');
      return;
    }
    if (!businessAddress.trim()) {
      onShowToast('error', 'Address Required', 'Please enter your complete business / studio address.');
      return;
    }
    if (accountNumber && accountNumber !== confirmAccountNumber) {
      onShowToast('error', 'Account Numbers Mismatch', 'Account numbers do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await api.submitKyc({
        aadhaarNumber: aadhaarNumber.trim(),
        aadhaarFront: aadhaarFront || undefined,
        aadhaarBack: aadhaarBack || undefined,
        panNumber: panNumber.trim().toUpperCase(),
        panCard: panCard || undefined,
        gstNumber: gstNumber.trim().toUpperCase() || undefined,
        gstDoc: gstDoc || undefined,
        businessAddress: businessAddress.trim(),
        bankDetails: accountNumber.trim()
          ? {
              accountHolder: accountHolder.trim(),
              accountNumber: accountNumber.trim(),
              ifscCode: ifscCode.trim().toUpperCase(),
              upiId: upiId.trim(),
            }
          : undefined,
      });

      onUpdateVendor(updatedUser);
      setIsEditMode(false);
      onShowToast(
        'success',
        'KYC Re-applied Successfully! 📄',
        'Your updated verification documents have been submitted to the admin team for review.'
      );
    } catch (err: any) {
      onShowToast('error', 'Re-apply Failed', err.message || 'Could not update verification details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in overflow-y-auto">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf"
        className="hidden"
      />

      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
              vendor.isVerified
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isRejected
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {vendor.isVerified ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : isRejected ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Vendor Verification Status</h2>
              <p className="text-xs text-slate-300 font-medium">
                {vendor.businessName || vendor.name} · Official EzzyGo Partner Program
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Banner */}
          {vendor.isVerified ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified & Active Partner</span>
                </div>
                <h3 className="text-base font-bold text-emerald-900 mt-2">
                  Your Account is 100% Verified
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-lg">
                  Your business KYC documents and payout bank account have been reviewed and approved by EzzyGo. You have full bidding privileges on all event requirements.
                </p>
              </div>
            </div>
          ) : isRejected ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 via-rose-50/70 to-orange-50/40 border border-rose-200 text-rose-950 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Action Required · Verification Rejected</span>
                </div>
                <span className="text-xs font-medium text-rose-700">Please review & re-apply</span>
              </div>

              {/* Rejection Reason Callout */}
              <div className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-xs">
                <div className="text-[11px] font-bold text-rose-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>Reason from EzzyGo Verification Team:</span>
                </div>
                <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                  "{rejectionReason}"
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-xs text-rose-800">
                  You can update your document copies or corrected details below and submit again for instant re-review.
                </p>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Fix Details & Re-apply Now</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50/20 border border-amber-200/90 text-amber-950 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Verification Under Review</span>
                </div>
                <span className="text-xs font-medium text-amber-800">Standard turnaround: 2-4 hours</span>
              </div>

              <p className="text-xs text-amber-900 leading-relaxed">
                Your business documents have been received by our compliance team. Verification ensures trust and 100% milestone payment guarantee for your event bids.
              </p>

              {/* Action Buttons: Remind / Double Request & Edit */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isReminding}
                  onClick={handleSendReminder}
                  className="px-4 py-2 rounded-full bg-[#f07d4a] hover:bg-[#de6a3a] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isReminding ? 'Sending Request...' : 'Send Review Reminder to Admin'}</span>
                </button>

                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="px-4 py-2 rounded-full border border-amber-300 hover:bg-amber-100/60 text-amber-900 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Submitted Documents</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* EDIT / RE-APPLY FORM */}
          {isEditMode ? (
            <form onSubmit={handleSubmitReapply} className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#17233d]" />
                  <span>Update & Re-apply KYC Documents</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel Edit
                </button>
              </div>

              {/* Identity Documents */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Aadhaar Card Number *</span>
                    <input
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      required
                      maxLength={12}
                      placeholder="12-digit Aadhaar"
                      className="mt-1.5 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">PAN Card Number *</span>
                    <input
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                      required
                      maxLength={10}
                      placeholder="10-digit PAN (e.g. ABCDE1234F)"
                      className="mt-1.5 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono uppercase focus:outline-none focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">GSTIN Number (Optional)</span>
                    <input
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase().slice(0, 15))}
                      maxLength={15}
                      placeholder="15-digit GSTIN"
                      className="mt-1.5 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono uppercase focus:outline-none focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Business / Studio Address *</span>
                    <input
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      required
                      placeholder="Full operating business address"
                      className="mt-1.5 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#17233d] focus:ring-2 focus:ring-[#17233d]/10"
                    />
                  </label>
                </div>

                {/* Document Copy Uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Aadhaar Front */}
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {aadhaarFront ? (
                          <img
                            src={getDocPreviewUrl(aadhaarFront)}
                            alt="Aadhaar Front"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-400" />
                        )}
                        {isPdfDoc(aadhaarFront) && (
                          <span className="absolute bottom-0 right-0 px-1 text-[8px] font-bold bg-rose-600 text-white rounded-tl">PDF</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">Aadhaar Front</div>
                        <div className="text-[10px] text-slate-500">{aadhaarFront ? 'Attached' : 'Not uploaded'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={uploadingDoc === 'aadhaarFront'}
                      onClick={() => triggerUpload('aadhaarFront')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition cursor-pointer shrink-0"
                    >
                      {uploadingDoc === 'aadhaarFront' ? 'Uploading...' : aadhaarFront ? 'Replace' : 'Upload'}
                    </button>
                  </div>

                  {/* Aadhaar Back */}
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {aadhaarBack ? (
                          <img
                            src={getDocPreviewUrl(aadhaarBack)}
                            alt="Aadhaar Back"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-400" />
                        )}
                        {isPdfDoc(aadhaarBack) && (
                          <span className="absolute bottom-0 right-0 px-1 text-[8px] font-bold bg-rose-600 text-white rounded-tl">PDF</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">Aadhaar Back</div>
                        <div className="text-[10px] text-slate-500">{aadhaarBack ? 'Attached' : 'Not uploaded'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={uploadingDoc === 'aadhaarBack'}
                      onClick={() => triggerUpload('aadhaarBack')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition cursor-pointer shrink-0"
                    >
                      {uploadingDoc === 'aadhaarBack' ? 'Uploading...' : aadhaarBack ? 'Replace' : 'Upload'}
                    </button>
                  </div>

                  {/* PAN Card */}
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {panCard ? (
                          <img
                            src={getDocPreviewUrl(panCard)}
                            alt="PAN Card"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-400" />
                        )}
                        {isPdfDoc(panCard) && (
                          <span className="absolute bottom-0 right-0 px-1 text-[8px] font-bold bg-rose-600 text-white rounded-tl">PDF</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">PAN Card</div>
                        <div className="text-[10px] text-slate-500">{panCard ? 'Attached' : 'Not uploaded'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={uploadingDoc === 'panCard'}
                      onClick={() => triggerUpload('panCard')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition cursor-pointer shrink-0"
                    >
                      {uploadingDoc === 'panCard' ? 'Uploading...' : panCard ? 'Replace' : 'Upload'}
                    </button>
                  </div>

                  {/* GST Document */}
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {gstDoc ? (
                          <img
                            src={getDocPreviewUrl(gstDoc)}
                            alt="GST"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-400" />
                        )}
                        {isPdfDoc(gstDoc) && (
                          <span className="absolute bottom-0 right-0 px-1 text-[8px] font-bold bg-rose-600 text-white rounded-tl">PDF</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">GST Certificate</div>
                        <div className="text-[10px] text-slate-500">{gstDoc ? 'Attached' : 'Optional'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={uploadingDoc === 'gstDoc'}
                      onClick={() => triggerUpload('gstDoc')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition cursor-pointer shrink-0"
                    >
                      {uploadingDoc === 'gstDoc' ? 'Uploading...' : gstDoc ? 'Replace' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bank Details section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#17233d]" />
                  <span>Payout Bank Account Details</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Account Holder Name</span>
                    <input
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="As per bank passbook"
                      className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#17233d]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">IFSC Code</span>
                    <input
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase().slice(0, 11))}
                      placeholder="11-digit IFSC (e.g. HDFC0001234)"
                      className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono uppercase focus:outline-none focus:border-[#17233d]"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Bank Account Number</span>
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.trim())}
                      placeholder="Account number"
                      className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono focus:outline-none focus:border-[#17233d]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Confirm Account Number</span>
                    <input
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value.trim())}
                      placeholder="Re-enter account number"
                      className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono focus:outline-none focus:border-[#17233d]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">UPI ID (Optional)</span>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value.trim())}
                      placeholder="e.g. name@okhdfcbank"
                      className="mt-1 w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono focus:outline-none focus:border-[#17233d]"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Re-apply button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#f07d4a] hover:bg-[#de6a3a] text-white font-bold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting Updated Documents...' : 'Submit Updated KYC for Review'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE: Submitted details & document copies */
            <div className="space-y-6">
              {/* Profile Details Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Submitted Business & KYC Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">Aadhaar Card Number</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                      {vendor.kycDocuments?.aadhaarNumber ? (
                        `XXXX-XXXX-${vendor.kycDocuments.aadhaarNumber.slice(-4)}`
                      ) : (
                        <span className="text-slate-400 font-sans font-normal">Not added</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">PAN Card Number</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono uppercase">
                      {vendor.kycDocuments?.panNumber || <span className="text-slate-400 font-sans font-normal">Not added</span>}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">GSTIN Number</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono uppercase">
                      {vendor.kycDocuments?.gstNumber || <span className="text-slate-400 font-sans font-normal">Not added / Optional</span>}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">Business Address</span>
                    <div className="text-sm font-medium text-slate-900 mt-0.5 truncate">
                      {vendor.kycDocuments?.businessAddress || <span className="text-slate-400">Not added</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Document Thumbnails */}
              {(vendor.kycDocuments?.aadhaarFront ||
                vendor.kycDocuments?.aadhaarBack ||
                vendor.kycDocuments?.panCard ||
                vendor.kycDocuments?.gstDoc) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Uploaded Document Copies (Click to Preview)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Aadhaar Front */}
                    {vendor.kycDocuments?.aadhaarFront && (
                      <div
                        onClick={() =>
                          setPreviewDoc({
                            title: 'Aadhaar Front Copy',
                            url: vendor.kycDocuments!.aadhaarFront!,
                          })
                        }
                        className="group relative p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 transition cursor-pointer text-center overflow-hidden"
                      >
                        <div className="w-full h-20 mb-1.5 rounded-xl bg-white border border-slate-100 overflow-hidden relative flex items-center justify-center">
                          <img
                            src={getDocPreviewUrl(vendor.kycDocuments.aadhaarFront)}
                            alt="Aadhaar Front"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {isPdfDoc(vendor.kycDocuments.aadhaarFront) && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                              PDF
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                            <Eye className="w-3.5 h-3.5" /> View
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 truncate block">Aadhaar Front</span>
                      </div>
                    )}

                    {/* Aadhaar Back */}
                    {vendor.kycDocuments?.aadhaarBack && (
                      <div
                        onClick={() =>
                          setPreviewDoc({
                            title: 'Aadhaar Back Copy',
                            url: vendor.kycDocuments!.aadhaarBack!,
                          })
                        }
                        className="group relative p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 transition cursor-pointer text-center overflow-hidden"
                      >
                        <div className="w-full h-20 mb-1.5 rounded-xl bg-white border border-slate-100 overflow-hidden relative flex items-center justify-center">
                          <img
                            src={getDocPreviewUrl(vendor.kycDocuments.aadhaarBack)}
                            alt="Aadhaar Back"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {isPdfDoc(vendor.kycDocuments.aadhaarBack) && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                              PDF
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                            <Eye className="w-3.5 h-3.5" /> View
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 truncate block">Aadhaar Back</span>
                      </div>
                    )}

                    {/* PAN Card */}
                    {vendor.kycDocuments?.panCard && (
                      <div
                        onClick={() =>
                          setPreviewDoc({
                            title: 'PAN Card Copy',
                            url: vendor.kycDocuments!.panCard!,
                          })
                        }
                        className="group relative p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 transition cursor-pointer text-center overflow-hidden"
                      >
                        <div className="w-full h-20 mb-1.5 rounded-xl bg-white border border-slate-100 overflow-hidden relative flex items-center justify-center">
                          <img
                            src={getDocPreviewUrl(vendor.kycDocuments.panCard)}
                            alt="PAN Card"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {isPdfDoc(vendor.kycDocuments.panCard) && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                              PDF
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                            <Eye className="w-3.5 h-3.5" /> View
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 truncate block">PAN Card</span>
                      </div>
                    )}

                    {/* GST Doc */}
                    {vendor.kycDocuments?.gstDoc && (
                      <div
                        onClick={() =>
                          setPreviewDoc({
                            title: 'GST Certificate Copy',
                            url: vendor.kycDocuments!.gstDoc!,
                          })
                        }
                        className="group relative p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 transition cursor-pointer text-center overflow-hidden"
                      >
                        <div className="w-full h-20 mb-1.5 rounded-xl bg-white border border-slate-100 overflow-hidden relative flex items-center justify-center">
                          <img
                            src={getDocPreviewUrl(vendor.kycDocuments.gstDoc)}
                            alt="GST"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {isPdfDoc(vendor.kycDocuments.gstDoc) && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white shadow-xs">
                              PDF
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <Eye className="w-3.5 h-3.5" /> View
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 truncate block">GST Certificate</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {vendor.isVerified
              ? 'Status: Verified & Protected'
              : isRejected
              ? 'Status: Revision Needed'
              : 'Status: Pending Verification Review'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>

      {/* Full-Screen Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[90] flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#17233d]" />
                <h4 className="font-bold text-slate-900 text-base">{previewDoc.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto min-h-[350px] max-h-[75vh]">
              <img
                src={getDocPreviewUrl(previewDoc.url)}
                alt={previewDoc.title}
                className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
