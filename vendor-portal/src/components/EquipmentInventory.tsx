import React, { useState } from 'react';
import { Sparkles, Plus, Upload, Image as ImageIcon, Loader2, X, Camera } from 'lucide-react';
import { mockEquipmentList, api } from '../services/api';

export const EquipmentInventory: React.FC = () => {
  const [equipment, setEquipment] = useState(mockEquipmentList);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Sound Systems');
  const [newRate, setNewRate] = useState('3500');
  const [newSpecs, setNewSpecs] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleToggle = (id: string) => {
    setEquipment(equipment.map((eq) => (eq.id === id ? { ...eq, isAvailable: !eq.isAvailable } : eq)));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadError('');
        const cloudUrl = await api.uploadImage(file, 'ezgo/equipment');
        setImageUrl(cloudUrl);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload image to Cloudinary');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCardImageChange = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const cloudUrl = await api.uploadImage(file, 'ezgo/equipment');
        setEquipment((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, image: cloudUrl } : item))
        );
      } catch (err: any) {
        alert('Upload failed: ' + err.message);
      }
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setEquipment([
      ...equipment,
      {
        id: 'eq-' + Date.now(),
        name: newName,
        category: newCat,
        specs: newSpecs.trim() || 'Verified professional grade equipment',
        dailyRate: Number(newRate),
        isAvailable: true,
        condition: 'Excellent',
        image: imageUrl.trim() || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80',
      },
    ]);
    setNewName('');
    setNewSpecs('');
    setImageUrl('');
    setNewRate('3500');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#f95724]" />
            <span>Equipment & Inventory Catalog</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registered gear available for reverse-bidding deployments in Pune & PCMC.
          </p>
        </div>

        <button
          onClick={() => {
            setImageUrl('');
            setUploadError('');
            setIsAddOpen(true);
          }}
          className="px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/25 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Equipment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {equipment.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white border border-slate-200 overflow-hidden space-y-3 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition group"
          >
            <div className="space-y-3">
              <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#f95724] shadow-xs">
                  {item.category}
                </span>

                {/* Quick Photo Upload Trigger on Card */}
                <label
                  htmlFor={`card-img-${item.id}`}
                  title="Upload / Change Photo from Device (Cloudinary)"
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-[#f95724] text-white backdrop-blur-md cursor-pointer transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    id={`card-img-${item.id}`}
                    accept="image/*"
                    onChange={(e) => handleCardImageChange(item.id, e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#f95724] transition">{item.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.specs}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Daily Standard Rate</div>
                <div className="text-xs font-black text-[#f95724]">₹{item.dailyRate.toLocaleString()} / day</div>
              </div>

              <button
                onClick={() => handleToggle(item.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  item.isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.isAvailable ? 'Ready for Gigs' : 'In Service'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Equipment with Cloudinary Upload */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Equipment to Gear Catalog</h3>
                <p className="text-[11px] text-slate-500">Upload photos from device and showcase gear for bids</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">Equipment Name & Model *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Yamaha TF5 32-Channel Digital Mixer"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                />
              </div>

              {/* Cloudinary Device Image Upload Section */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#f95724]" />
                    <span>Equipment Photo (Upload from Device)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Stored on Cloudinary</span>
                </label>

                <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-4 bg-slate-50/60 transition text-center">
                  <input
                    type="file"
                    id="equipment-image-upload"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="equipment-image-upload"
                    className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-600 ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 py-2">
                        <Loader2 className="w-6 h-6 text-[#f95724] animate-spin" />
                        <span className="font-bold text-xs text-[#f95724]">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#f95724]" />
                        <span className="font-bold text-xs text-slate-800">
                          {imageUrl ? 'Change Photo from Device' : 'Click to Upload Gear Photo from Device'}
                        </span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WebP up to 10MB</span>
                      </>
                    )}
                  </label>

                  {uploadError && (
                    <p className="text-[11px] text-red-500 font-medium mt-2">{uploadError}</p>
                  )}

                  {imageUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden h-36 border border-slate-200 bg-slate-900 group">
                      <img src={imageUrl} alt="Uploaded equipment" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-white text-xs font-bold bg-emerald-600 px-2.5 py-1 rounded-lg">
                          ✓ Cloudinary Stored
                        </span>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="bg-red-600 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Category *</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                  >
                    <option>Sound Systems</option>
                    <option>DJ Gear</option>
                    <option>Lighting</option>
                    <option>Stage Truss</option>
                    <option>Cameras & Drones</option>
                    <option>Catering & Kitchen</option>
                    <option>Decor & Mandap</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Daily Rental Benchmark (₹) *</label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    required
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Specifications / Gear Details</label>
                <textarea
                  rows={2}
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  placeholder="e.g. 1750W Peak, Dual Active Tops, Flight Case included"
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#f95724]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-[#f95724]/20"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};