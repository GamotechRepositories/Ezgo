import React, { useState } from 'react';
import {
  Plus,
  X,
  Check,
  Camera,
  Trash2,
  Loader2,
  Megaphone,
  ExternalLink,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Monitor,
  Smartphone,
} from 'lucide-react';
import type { Banner } from '../types';
import { api } from '../services/api';

interface BannerManagerProps {
  banners: Banner[];
  onAddBanner: (banner: Partial<Banner>) => Promise<void> | void;
  onUpdateBanner: (id: string, banner: Partial<Banner>) => Promise<void> | void;
  onDeleteBanner?: (id: string) => Promise<void> | void;
  onRefresh?: () => void;
}

export const BannerManager: React.FC<BannerManagerProps> = ({
  banners,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('FEATURED OFFER');
  const [imageUrl, setImageUrl] = useState('');
  const [desktopImageUrl, setDesktopImageUrl] = useState('');
  const [uploadSlot, setUploadSlot] = useState<'mobile' | 'desktop'>('mobile');
  const [targetUrl, setTargetUrl] = useState('#services-grid');
  const [ctaText, setCtaText] = useState('Claim Deal');
  const [city, setCity] = useState('ALL');
  const [placement, setPlacement] = useState<'hero_banner' | 'featured_banner' | 'all'>('hero_banner');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter States
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterPlacement, setFilterPlacement] = useState('ALL');

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge('SPONSORED');
    setImageUrl('');
    setDesktopImageUrl('');
    setTargetUrl('#services-grid');
    setCtaText('Claim Deal');
    setCity('ALL');
    setPlacement('hero_banner');
    setDiscountPercent(20);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setBadge(b.badge || 'FEATURED OFFER');
    setImageUrl(b.imageUrl);
    setDesktopImageUrl(b.desktopImageUrl || '');
    setTargetUrl(b.targetUrl || '');
    setCtaText(b.ctaText || 'Claim Deal');
    setCity(b.city || 'ALL');
    setPlacement(b.placement || 'hero_banner');
    setDiscountPercent(b.discountPercent ?? 15);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: 'mobile' | 'desktop') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadSlot(slot);
        setUploadError('');
        const cloudUrl = await api.uploadImage(file, 'ezzygo/banners');
        if (slot === 'desktop') setDesktopImageUrl(cloudUrl);
        else setImageUrl(cloudUrl);
      } catch (err: any) {
        setUploadError(err.message || 'Image upload failed. You can also paste an image URL directly.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleQuickImageReplace = async (b: Banner, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUpdatingId(b._id);
        const cloudUrl = await api.uploadImage(file, 'ezzygo/banners');
        await onUpdateBanner(b._id, { imageUrl: cloudUrl });
      } catch (err: any) {
        alert('Upload failed: ' + err.message);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      setUpdatingId(b._id);
      await onUpdateBanner(b._id, { isActive: !b.isActive });
    } catch (err: any) {
      alert('Could not change status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!imageUrl.trim() && !desktopImageUrl.trim())) {
      alert('Please provide a title and at least one banner image (mobile or desktop).');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<Banner> = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        imageUrl: imageUrl.trim() || desktopImageUrl.trim(),
        desktopImageUrl: desktopImageUrl.trim() || imageUrl.trim(),
        targetUrl: targetUrl.trim(),
        ctaText: ctaText.trim() || 'Claim Deal',
        city,
        placement,
        discountPercent: Number(discountPercent) || 0,
        isActive: true,
      };

      if (editingBanner) {
        await onUpdateBanner(editingBanner._id, payload);
      } else {
        await onAddBanner(payload);
      }

      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Failed to save ad: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredBanners = banners.filter((b) => {
    const matchesCity = filterCity === 'ALL' || b.city === 'ALL' || b.city?.toLowerCase() === filterCity.toLowerCase();
    const matchesPlacement = filterPlacement === 'ALL' || b.placement === 'all' || b.placement === filterPlacement;
    return matchesCity && matchesPlacement;
  });

  const activeCount = banners.filter((b) => b.isActive).length;
  const heroCount = banners.filter((b) => b.placement === 'hero_banner' || b.placement === 'all').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-[#ff5c28] flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Promotional Banners & Ads</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-50 text-[#ff5c28] border border-slate-200 font-bold">
                  User Side
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Live ads show the image only. Upload two sizes: mobile 1080×540 px and desktop 1920×600 px.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff5c28] to-orange-500 hover:from-[#e64814] hover:to-[#ff5c28] text-white text-xs sm:text-sm font-black shadow-md shadow-slate-900/15 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New Ad Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-[#ff5c28] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-slate-900">Mobile app banner</p>
            <p className="text-xs text-slate-600 mt-0.5">Exact size: <span className="font-bold text-slate-900">1080 × 540 px</span> (2:1) · JPG / PNG / WebP · max 4 MB</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <Monitor className="w-5 h-5 text-[#ff5c28] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-slate-900">Desktop website banner</p>
            <p className="text-xs text-slate-600 mt-0.5">Exact size: <span className="font-bold text-slate-900">1920 × 600 px</span> (16:5) · JPG / PNG / WebP · max 4 MB</p>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Ads</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{banners.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Active Live</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Hero Top Space</span>
          <span className="text-2xl font-black text-slate-700 mt-1 block">{heroCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cities Covered</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">All Major</span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <span className="text-slate-500 font-bold mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#ff5c28]" />
            <span>Target City:</span>
          </span>
          {['ALL', 'Pune', 'Mumbai', 'Hyderabad', 'Bengaluru', 'Delhi NCR'].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCity(c)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                filterCity === c
                  ? 'bg-[#ff5c28] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c === 'ALL' ? 'All Cities' : c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-bold mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#ff5c28]" />
            <span>Placement:</span>
          </span>
          {[
            { id: 'ALL', label: 'All Placements' },
            { id: 'hero_banner', label: 'Hero Ad' },
            { id: 'featured_banner', label: 'Mid-Page' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPlacement(p.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                filterPlacement === p.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ad Banners Grid */}
      {filteredBanners.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-[#ff5c28] flex items-center justify-center mx-auto">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No advertisements found</h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            No ads match your selected filters. Click below to add a new advertisement banner for the user side.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-full bg-[#ff5c28] hover:bg-[#e64814] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Ad</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBanners.map((ad) => {
            const isUpdating = updatingId === ad._id;

            return (
              <div
                key={ad._id}
                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl ${
                  ad.isActive ? 'border-slate-200/90' : 'border-slate-200/60 opacity-70'
                }`}
              >
                {/* Visual Ad Banner Preview with Dynamic Overlays */}
                <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-950 group">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  
                  {/* Subtle Gradient Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#ff5c28] shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-600" />
                      <span>{ad.badge || 'FEATURED'}</span>
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs ${
                        ad.isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-700/90 text-slate-300'
                      }`}
                    >
                      {ad.isActive ? 'Active Live' : 'Disabled'}
                    </span>
                  </div>

                  {/* Quick Change Photo Button */}
                  <label className="absolute top-12 right-3.5 p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs cursor-pointer shadow-md transition flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-bold">Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQuickImageReplace(ad, e)}
                      className="hidden"
                      disabled={isUpdating}
                    />
                  </label>

                  {/* Ad Bottom Details on Photo */}
                  <div className="absolute bottom-3 inset-x-3.5 text-white space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      <span>📍 {ad.city === 'ALL' ? 'All Cities' : ad.city}</span>
                      <span>•</span>
                      <span>
                        {ad.placement === 'hero_banner'
                          ? 'Hero Top Ad'
                          : ad.placement === 'featured_banner'
                          ? 'Mid-Page Banner'
                          : 'All Placements'}
                      </span>
                      {ad.discountPercent ? (
                        <>
                          <span>•</span>
                          <span className="text-emerald-300 font-black">
                            {ad.discountPercent}% Savings
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h3 className="font-editorial text-lg font-black text-white leading-tight line-clamp-1 drop-shadow-sm">
                      {ad.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content & Action Controls */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {ad.subtitle || 'Promotional ad banner active on user portal with reverse-bidding benefits.'}
                    </p>
                    {ad.targetUrl && (
                      <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 pt-1">
                        <ExternalLink className="w-3 h-3 text-[#ff5c28] shrink-0" />
                        <span className="truncate">Links to: {ad.targetUrl}</span>
                      </div>
                    )}
                  </div>

                  {/* Controls Toolbar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    
                    {/* Active Switch */}
                    <button
                      onClick={() => handleToggleActive(ad)}
                      disabled={isUpdating}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        ad.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ad.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{ad.isActive ? 'Active' : 'Turn On'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(ad)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
                      >
                        Edit Details
                      </button>

                      {onDeleteBanner && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ad "${ad.title}"?`)) {
                              onDeleteBanner(ad._id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                          title="Delete Ad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT AD BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6 p-6 sm:p-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-[#ff5c28] flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingBanner ? 'Edit Advertisement' : 'Create New Ad Banner'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Upload separate images for mobile (1080×540) and desktop (1920×600). No text overlay on the live ad.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Field 1: Ad Headline / Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Ad Headline / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Festive & Wedding Sound Setup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#ff5c28] focus:bg-white transition"
                />
              </div>

              {/* Field 2: Subtitle / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Subtitle / Promo Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. High-output Line Arrays, JBL Bass & Pioneer Consoles with reverse-bidding savings."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ff5c28] focus:bg-white transition"
                />
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 space-y-1.5">
                <p className="font-black uppercase tracking-wide text-[11px]">Exact banner sizes</p>
                <p><span className="font-bold">Mobile app:</span> 1080 × 540 px (ratio 2:1) · JPG / PNG / WebP · max 4 MB</p>
                <p><span className="font-bold">Desktop website:</span> 1920 × 600 px (ratio 16:5) · JPG / PNG / WebP · max 4 MB</p>
                <p className="text-amber-800">Put all offer text inside the image. The app and website show the photo only — no overlay text.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#ff5c28]" />
                    Mobile banner <span className="text-rose-500">*</span>
                  </label>
                  <label className="block cursor-pointer">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Mobile preview" className="w-full h-[120px] object-cover rounded-xl border border-slate-200" />
                    ) : (
                      <div className="w-full h-[120px] rounded-xl border-2 border-dashed border-[#ff5c28]/50 bg-white flex flex-col items-center justify-center gap-1 px-3 text-center">
                        <span className="text-[11px] font-bold text-slate-500">Click to upload</span>
                        <span className="text-sm font-black text-slate-900">1080 × 540 px</span>
                        <span className="text-[10px] text-slate-500">JPG / PNG / WebP · max 4 MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(e, 'mobile')}
                    />
                  </label>
                  <p className="text-[11px] font-bold text-slate-700 text-center">Required size: 1080 × 540 px</p>
                  {isUploading && uploadSlot === 'mobile' && (
                    <p className="text-[11px] text-[#ff5c28] font-bold text-center">Uploading…</p>
                  )}
                  <input
                    type="url"
                    placeholder="or paste mobile image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-mono"
                  />
                </div>

                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-[#ff5c28]" />
                    Desktop banner
                  </label>
                  <label className="block cursor-pointer">
                    {desktopImageUrl ? (
                      <img src={desktopImageUrl} alt="Desktop preview" className="w-full h-[120px] object-cover rounded-xl border border-slate-200" />
                    ) : (
                      <div className="w-full h-[120px] rounded-xl border-2 border-dashed border-[#ff5c28]/50 bg-white flex flex-col items-center justify-center gap-1 px-3 text-center">
                        <span className="text-[11px] font-bold text-slate-500">Click to upload</span>
                        <span className="text-sm font-black text-slate-900">1920 × 600 px</span>
                        <span className="text-[10px] text-slate-500">JPG / PNG / WebP · max 4 MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(e, 'desktop')}
                    />
                  </label>
                  <p className="text-[11px] font-bold text-slate-700 text-center">Required size: 1920 × 600 px</p>
                  {isUploading && uploadSlot === 'desktop' && (
                    <p className="text-[11px] text-[#ff5c28] font-bold text-center">Uploading…</p>
                  )}
                  <input
                    type="url"
                    placeholder="or paste desktop image URL"
                    value={desktopImageUrl}
                    onChange={(e) => setDesktopImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-mono"
                  />
                </div>
              </div>
              {uploadError && <p className="text-xs text-rose-500 font-semibold">{uploadError}</p>}

              {/* Row 4: Badge, Discount %, Placement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Badge Text</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. SPONSORED, LIMITED"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ff5c28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Discount % (Opt)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ff5c28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Placement Zone</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ff5c28]"
                  >
                    <option value="hero_banner">Hero Ad (Right Side)</option>
                    <option value="featured_banner">Mid-Page Banner</option>
                    <option value="all">Both Zones</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Target City, CTA text & Destination link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Target City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ff5c28]"
                  >
                    <option value="ALL">All Cities (Pan-India)</option>
                    <option value="Pune">Pune, MH</option>
                    <option value="Hyderabad">Hyderabad, TS</option>
                    <option value="Mumbai">Mumbai, MH</option>
                    <option value="Bengaluru">Bengaluru, KA</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Nagpur">Nagpur, MH</option>
                    <option value="Goa">Goa</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Claim Deal / Book Now"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ff5c28]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Destination Action</label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="#services-grid or URL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ff5c28]"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || (!imageUrl.trim() && !desktopImageUrl.trim())}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5c28] to-orange-500 hover:from-[#e64814] hover:to-[#ff5c28] text-white text-xs font-bold shadow-md shadow-slate-900/12 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                  <span>{editingBanner ? 'Save Changes' : 'Publish Ad Banner'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
