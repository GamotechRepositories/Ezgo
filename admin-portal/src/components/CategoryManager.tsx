import React, { useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import type { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (cat: Partial<Category>) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avgPrice, setAvgPrice] = useState('₹10,000 - ₹50,000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddCategory({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description,
      avgPriceRange: avgPrice,
      icon: 'Sparkles',
      isActive: true,
    });
    setName('');
    setDescription('');
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
            Manage service categories displayed on the host posting wizard and vendor reverse-bidding feeds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/25 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                  {cat.slug}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active ✓</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Benchmark Range</span>
              <span className="font-extrabold text-[#f95724]">{cat.avgPriceRange}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Create New Event Category</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. LED Video Walls & Truss"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Description & Equipment Scope</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. P3 Indoor LED screens, Novastar processors, aluminum truss frames"
                  rows={2}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Recommended Price Range</label>
                <input
                  type="text"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="e.g. ₹15,000 - ₹75,000"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#f95724] text-white font-bold shadow-md shadow-[#f95724]/25"
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