import React, { useState } from 'react';
import { Plus, Image as ImageIcon, Upload, X, Check, Camera, Trash2, Loader2 } from 'lucide-react';
import type { Occasion } from '../types';
import { api } from '../services/api';

interface OccasionManagerProps {
  occasions: Occasion[];
  onAddOccasion: (occ: Partial<Occasion>) => void;
  onUpdateOccasion: (id: string, occ: Partial<Occasion>) => Promise<void> | void;
  onDeleteOccasion?: (id: string) => void;
}

const PRESET_OCCASION_IMAGES = [
  { name: 'Weddings', url: '/occasion_weddings.jpg' },
  { name: 'Festivals', url: '/occasion_festivals.jpg' },
  { name: 'Corporate Events', url: '/occasion_corporate.jpg' },
  { name: 'Private Parties', url: '/occasion_parties.jpg' },
  { name: 'Birthdays', url: '/occasion_birthdays.jpg' },
  { name: 'Sangeet / Haldi', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Concert & Music', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80' },
  { name: 'Pooja / Traditional', url: 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=600&auto=format&fit=crop&q=80' },
];

export const OccasionManager: React.FC<OccasionManagerProps> = ({
  occasions,
  onAddOccasion,
  onUpdateOccasion,
  onDeleteOccasion,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [iconType, setIconType] = useState<Occasion['iconType']>('sparkles');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadError('');
        const cloudUrl = await api.uploadImage(file, 'ezzygo/occasions');
        setImageUrl(cloudUrl);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload photo to Cloudinary');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCardImageChange = async (occ: Occasion, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUpdatingId(occ._id || occ.id || occ.slug);
        const cloudUrl = await api.uploadImage(file, 'ezzygo/occasions');
        if (!occ._id) throw new Error('This occasion is not saved on the server yet');
        await onUpdateOccasion(occ._id, { image: cloudUrl });
      } catch (err: any) {
        alert('Upload failed: ' + err.message);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const finalImage = imageUrl.trim() || '/occasion_parties.jpg';
    onAddOccasion({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      image: finalImage,
      iconType: iconType || 'sparkles',
      isActive: true,
    });
    setName('');
    setImageUrl('');
    setIconType('sparkles');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Occasions</h2>
          <p className="text-base text-slate-600 mt-1">
            Event types (weddings, festivals, parties) shown as picture cards on the host home page.
          </p>
        </div>

        <button
          onClick={() => {
            setImageUrl('');
            setUploadError('');
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-sm flex items-center gap-1.5 cursor-pointer transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add occasion</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {occasions.map((occ) => {
          const occKey = occ._id || occ.id || occ.slug;
          const isUpdatingThis = updatingId === occKey;

          return (
            <div
              key={occKey}
              className="relative h-64 rounded-3xl overflow-hidden shadow-md group border border-slate-200 bg-slate-900 flex flex-col justify-between p-4"
            >
              {/* Background Image */}
              <img
                src={occ.image}
                alt={occ.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/occasion_parties.jpg';
                }}
              />

              {/* Gradient lighting overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />

              {/* Top Bar: Slug badge + Actions */}
              <div className="relative z-10 flex items-center justify-between">
                <span />

                <div className="flex items-center gap-1">
                  {/* Change Photo Button */}
                  <label
                    htmlFor={`occ-img-${occKey}`}
                    title="Change photo"
                    aria-label="Change photo"
                    className="p-1.5 rounded-full bg-black/60 hover:bg-[#f95724] text-white backdrop-blur-md cursor-pointer transition shadow"
                  >
                    {isUpdatingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    <input
                      type="file"
                      id={`occ-img-${occKey}`}
                      accept="image/*"
                      disabled={isUpdatingThis}
                      onChange={(e) => handleCardImageChange(occ, e)}
                      className="hidden"
                    />
                  </label>

                  {/* Delete Button */}
                  {onDeleteOccasion && (
                    <button
                      onClick={() => {
                        if (occ._id && window.confirm(`Remove "${occ.name}" from the host app?`)) onDeleteOccasion(occ._id);
                      }}
                      title="Remove occasion"
                      aria-label="Remove occasion"
                      className="p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md transition shadow cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Badge & Occasion Name */}
              <div className="relative z-10">
                <h4 className="text-base font-semibold text-white drop-shadow-md truncate">
                  {occ.name}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Occasion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add occasion</h3>
                <p className="text-sm text-slate-500">Name, icon, and a picture</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Haldi & Sangeet Ceremony"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Icon</label>
                <select
                  value={iconType}
                  onChange={(e) => setIconType(e.target.value as any)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                >
                  <option value="sparkles">General</option>
                  <option value="rings">Weddings</option>
                  <option value="lotus">Festivals</option>
                  <option value="corporate">Corporate</option>
                  <option value="party">Parties</option>
                  <option value="birthday">Birthdays</option>
                  <option value="music">Music and concerts</option>
                  <option value="camera">Photo shoots</option>
                  <option value="food">Food and dining</option>
                </select>
              </div>

              {/* Photo / Image Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#f95724]" />
                    <span>Card Photo Banner *</span>
                  </label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${imageTab === 'upload' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('preset')}
                      className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${imageTab === 'preset' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${imageTab === 'url' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageTab === 'upload' && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-orange-300 transition bg-slate-50/50">
                    <input
                      type="file"
                      id="occasion-file-upload"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="occasion-file-upload"
                      className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-600 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-1">
                          <Loader2 className="w-6 h-6 border-2 border-[#f95724] border-t-transparent rounded-full animate-spin" />
                          <span className="font-medium text-sm text-[#f95724]">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-[#f95724]" />
                          <span className="font-bold text-xs text-slate-800">
                            {imageUrl ? 'Change Photo from Device' : 'Click to upload photo from your device'}
                          </span>
                          <span className="text-xs text-slate-500">PNG, JPG or WebP, up to 10 MB</span>
                        </>
                      )}
                    </label>
                    {uploadError && (
                      <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                    )}
                  </div>
                )}

                {imageTab === 'preset' && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1.5">Pick a picture:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_OCCASION_IMAGES.map((preset) => {
                        const isSelected = imageUrl === preset.url;
                        return (
                          <button
                            type="button"
                            key={preset.name}
                            onClick={() => setImageUrl(preset.url)}
                            className={`relative h-16 rounded-xl overflow-hidden border-2 text-left group transition cursor-pointer ${isSelected ? 'border-[#f95724] ring-2 ring-[#f95724]/30' : 'border-slate-200 hover:border-slate-400'}`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                              <span className="text-xs font-medium text-white truncate drop-shadow">{preset.name}</span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-[#f95724] text-white rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {imageTab === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or any high-res image link"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                    />
                  </div>
                )}

                {/* Live Preview Box */}
                {imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden h-28 border border-slate-200 bg-slate-900 group">
                    <img src={imageUrl} alt="Occasion preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white font-medium">
                      Preview
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-[#f95724]/20"
                >
                  Create Occasion Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
