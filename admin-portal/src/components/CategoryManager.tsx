import React, { useState } from 'react';
import { Plus, Image as ImageIcon, Upload, X, Check, Camera, Loader2 } from 'lucide-react';
import type { Category } from '../types';
import { api } from '../services/api';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (cat: Partial<Category>) => void;
  onUpdateCategory: (id: string, cat: Partial<Category>) => Promise<void> | void;
}

const PRESET_IMAGES = [
  { name: 'DJ & Sound', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mandap / Decor', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80' },
  { name: 'Photography', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80' },
  { name: 'Catering', url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format&fit=crop&q=80' },
  { name: 'Lighting', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { name: 'Purohit', url: 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mehendi', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Tent & Stage', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80' },
];

export const getResolvedCategoryImage = (cat: Partial<Category>): string => {
  if (cat.image && typeof cat.image === 'string' && cat.image.trim().length > 0) {
    return cat.image.trim();
  }
  const name = (cat.name || '').toLowerCase();
  const slug = (cat.slug || '').toLowerCase();
  if (slug.includes('dj') || name.includes('dj') || name.includes('sound')) return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';
  if (slug.includes('decor') || name.includes('decor') || name.includes('mandap')) return 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80';
  if (slug.includes('photo') || name.includes('photo') || name.includes('drone')) return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80';
  if (slug.includes('cater') || name.includes('cater') || name.includes('food')) return 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format&fit=crop&q=80';
  if (slug.includes('light') || name.includes('light')) return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80';
  if (slug.includes('purohit') || name.includes('purohit') || name.includes('priest')) return 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=600&auto=format&fit=crop&q=80';
  if (slug.includes('mehendi') || name.includes('mehendi') || name.includes('makeup')) return 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';
  if (slug.includes('tent') || name.includes('tent') || name.includes('stage')) return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80';
};

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avgPrice, setAvgPrice] = useState('₹10,000 - ₹50,000');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<'preset' | 'url' | 'upload'>('preset');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [updatingCatId, setUpdatingCatId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadError('');
        const cloudUrl = await api.uploadImage(file, 'ezzygo/categories');
        setImageUrl(cloudUrl);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload to Cloudinary');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCardImageChange = async (cat: Category, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUpdatingCatId(cat._id);
        const cloudUrl = await api.uploadImage(file, 'ezzygo/categories');
        await onUpdateCategory(cat._id, { image: cloudUrl });
      } catch (err: any) {
        alert('Upload failed: ' + err.message);
      } finally {
        setUpdatingCatId(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const finalImage = imageUrl.trim() || getResolvedCategoryImage({ name, slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') });
    onAddCategory({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description,
      avgPriceRange: avgPrice,
      image: finalImage,
      icon: 'Palette',
      isActive: true,
    });
    setName('');
    setDescription('');
    setImageUrl('');
    setAvgPrice('₹10,000 - ₹50,000');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
          <p className="text-base text-slate-600 mt-1">
            Services hosts can ask for when they post a request. Vendors see the same list.
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
          <span>Add category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const bannerUrl = getResolvedCategoryImage(cat);
          const isUpdatingThis = updatingCatId === cat._id;

          return (
            <div
              key={cat._id}
              className="rounded-3xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition group"
            >
              {/* Category Photo Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={bannerUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Dark Vignette Overlay for Crisp Typography */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                </div>

                {/* Direct Cloudinary Change Button on Hover */}
                <label
                  htmlFor={`cat-img-${cat._id}`}
                  title="Change photo"
                  className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-[#f95724] text-white cursor-pointer transition flex items-center gap-1 text-xs font-medium"
                >
                  {isUpdatingThis ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    id={`cat-img-${cat._id}`}
                    accept="image/*"
                    disabled={isUpdatingThis}
                    onChange={(e) => handleCardImageChange(cat, e)}
                    className="hidden"
                  />
                </label>

                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <h3 className="text-base font-bold text-white drop-shadow-md truncate">{cat.name}</h3>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {cat.description || <span className="text-slate-400">No description</span>}
                </p>

                {cat.avgPriceRange && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Usual price</span>
                    <span className="font-semibold text-slate-900">{cat.avgPriceRange}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Category with Image Provision */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add category</h3>
                <p className="text-sm text-slate-500">Name, photo, short description, and usual price</p>
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
                  placeholder="e.g. LED Video Walls & Trussing"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                />
              </div>

              {/* Photo / Image Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#f95724]" />
                    <span>Category Photo / Banner *</span>
                  </label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
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
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${imageTab === 'upload' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {imageTab === 'preset' && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1.5">Pick a picture:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_IMAGES.map((preset) => {
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

                {imageTab === 'upload' && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-orange-300 transition bg-slate-50/50">
                    <input
                      type="file"
                      id="category-file-upload"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="category-file-upload"
                      className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-600 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-6 h-6 border-2 border-[#f95724] border-t-transparent rounded-full animate-spin" />
                          <span className="font-medium text-sm text-[#f95724]">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-[#f95724]" />
                          <span className="font-bold text-xs text-slate-800">Click to upload photo from your device</span>
                          <span className="text-xs text-slate-500">PNG, JPG or WebP, up to 10 MB</span>
                        </>
                      )}
                    </label>
                    {uploadError && (
                      <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                    )}
                  </div>
                )}

                {/* Live Preview Box */}
                {imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden h-28 border border-slate-200 bg-slate-100">
                    <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white font-medium">
                      Preview
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-medium text-slate-700">Short description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. P3 Indoor LED screens, Novastar processors, aluminum truss frames, flight case cables"
                  rows={2}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Usual price (shown to hosts)</label>
                <input
                  type="text"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="e.g. ₹15,000 - ₹80,000"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                />
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
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};