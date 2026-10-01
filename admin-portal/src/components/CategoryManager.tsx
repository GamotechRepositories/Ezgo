import React, { useState } from 'react';
import { FolderKanban, Plus, Image as ImageIcon, Upload, Sparkles, X, Check } from 'lucide-react';
import type { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (cat: Partial<Category>) => void;
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

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avgPrice, setAvgPrice] = useState('₹10,000 - ₹50,000');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<'preset' | 'url' | 'upload'>('preset');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddCategory({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description,
      avgPriceRange: avgPrice,
      image: imageUrl.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
      icon: 'Sparkles',
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
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-purple-600" />
            <span>Event Categories & Benchmark Pricing</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage service categories and banner photos displayed on host posting wizard and vendor reverse-bidding feeds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/25 flex items-center gap-1.5 cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="rounded-3xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition group"
          >
            {/* Category Photo Banner */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-100">
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50 text-slate-400">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[11px] font-medium text-slate-400">No Image Set</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-purple-900 text-[10px] font-bold shadow">
                  /{cat.slug}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow">
                  Active ✓
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-bold text-white drop-shadow-md truncate">{cat.name}</h3>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {cat.description || 'Verified event vendor service equipment & professional crew.'}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Benchmark Price</span>
                <span className="font-extrabold text-[#f95724] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                  {cat.avgPriceRange}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Category with Image Provision */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-[#f95724] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Event Category</h3>
                  <p className="text-[11px] text-slate-500">Add service name, image/photo, scope & price benchmark</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">Category Name *</label>
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
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageTab('preset')}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${imageTab === 'preset' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${imageTab === 'url' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${imageTab === 'upload' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {imageTab === 'preset' && (
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1.5">Choose from curated event service images:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_IMAGES.map((preset) => {
                        const isSelected = imageUrl === preset.url;
                        return (
                          <button
                            type="button"
                            key={preset.name}
                            onClick={() => setImageUrl(preset.url)}
                            className={`relative h-16 rounded-xl overflow-hidden border-2 text-left group transition ${isSelected ? 'border-[#f95724] ring-2 ring-[#f95724]/30' : 'border-slate-200 hover:border-slate-400'}`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                              <span className="text-[9px] font-bold text-white truncate drop-shadow">{preset.name}</span>
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
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="category-file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-600"
                    >
                      <Upload className="w-6 h-6 text-[#f95724]" />
                      <span className="font-bold text-xs text-slate-800">Click to upload photo from your device</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WebP up to 5MB</span>
                    </label>
                  </div>
                )}

                {/* Live Preview Box */}
                {imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden h-28 border border-slate-200 bg-slate-100">
                    <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                      ✓ Image Preview
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700">Description & Equipment Scope</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. P3 Indoor LED screens, Novastar processors, aluminum truss frames, flight case cables"
                  rows={2}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Recommended Price Benchmark Range</label>
                <input
                  type="text"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="e.g. ₹15,000 - ₹75,000"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold shadow-md shadow-[#f95724]/25 transition cursor-pointer"
                >
                  Publish Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};