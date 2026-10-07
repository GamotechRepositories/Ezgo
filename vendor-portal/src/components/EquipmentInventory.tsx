import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Upload, Loader2, X, Camera } from 'lucide-react';
import { api } from '../services/api';
import type { EquipmentItem } from '../types';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80';

interface EquipmentInventoryProps {
  vendorId: string;
}

export const EquipmentInventory: React.FC<EquipmentInventoryProps> = ({ vendorId }) => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Sound Systems');
  const [newRate, setNewRate] = useState('3500');
  const [newSpecs, setNewSpecs] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const loadEquipment = useCallback(async () => {
    if (!vendorId) return;
    setIsLoading(true);
    setError('');
    try {
      setEquipment(await api.getEquipment(vendorId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const replaceItem = (updated: EquipmentItem) =>
    setEquipment((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));

  const handleToggle = async (item: EquipmentItem) => {
    setBusyId(item._id);
    setError('');
    try {
      replaceItem(await api.updateEquipment(item._id, { isAvailable: !item.isAvailable }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item: EquipmentItem) => {
    if (!window.confirm(`Remove "${item.name}" from your equipment?`)) return;
    setBusyId(item._id);
    setError('');
    try {
      await api.deleteEquipment(item._id);
      setEquipment((prev) => prev.filter((eq) => eq._id !== item._id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadError('');
        const cloudUrl = await api.uploadImage(file, 'ezzygo/equipment');
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
    e.target.value = '';
    if (file) {
      setBusyId(itemId);
      setError('');
      try {
        const cloudUrl = await api.uploadImage(file, 'ezzygo/equipment');
        replaceItem(await api.updateEquipment(itemId, { image: cloudUrl }));
      } catch (err: any) {
        setError('Photo not changed: ' + err.message);
      } finally {
        setBusyId(null);
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !vendorId) return;
    setIsSaving(true);
    setUploadError('');
    try {
      const saved = await api.addEquipment(vendorId, {
        name: newName.trim(),
        category: newCat,
        specs: newSpecs.trim(),
        dailyRate: Number(newRate),
        isAvailable: true,
        condition: 'Excellent',
        image: imageUrl.trim() || DEFAULT_IMAGE,
      });
      setEquipment((prev) => [saved, ...prev]);
      setNewName('');
      setNewSpecs('');
      setImageUrl('');
      setNewRate('3500');
      setIsAddOpen(false);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My equipment</h2>
          <p className="text-base text-slate-600 mt-1">
            List what you own so you can quickly mention it in your bids.
          </p>
        </div>

        <button
          onClick={() => {
            setImageUrl('');
            setUploadError('');
            setIsAddOpen(true);
          }}
          disabled={!vendorId}
          className="px-5 py-2.5 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold text-sm flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add equipment</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm">{error}</p>
          <button
            onClick={loadEquipment}
            className="px-4 py-2 rounded-full bg-white border border-rose-200 text-sm font-semibold hover:bg-rose-100 transition cursor-pointer shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {(isLoading || !vendorId) && !error && (
        <div className="py-16 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your equipment...</span>
        </div>
      )}

      {!isLoading && vendorId && !error && equipment.length === 0 && (
        <div className="py-16 px-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center space-y-2">
          <p className="text-base font-semibold text-slate-800">You have not added any equipment yet</p>
          <p className="text-sm text-slate-500">Click "Add equipment" to list speakers, lights, cameras or anything else you rent out.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {equipment.map((item) => (
          <div
            key={item._id}
            className="rounded-3xl bg-white border border-slate-200 overflow-hidden space-y-3 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition group"
          >
            <div className="space-y-3">
              <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100">
                <img src={item.image || DEFAULT_IMAGE} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 text-xs font-medium text-slate-700">
                  {item.category}
                </span>

                {/* Quick Photo Upload Trigger on Card */}
                <label
                  htmlFor={`card-img-${item._id}`}
                  title="Change photo"
                  aria-label="Change photo"
                  className={`absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-[#f95724] text-white cursor-pointer transition ${busyId === item._id ? 'pointer-events-none opacity-60' : ''}`}
                >
                  {busyId === item._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  <input
                    type="file"
                    id={`card-img-${item._id}`}
                    accept="image/*"
                    onChange={(e) => handleCardImageChange(item._id, e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
                {item.specs && <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{item.specs}</p>}
                <button
                  onClick={() => handleRemove(item)}
                  disabled={busyId === item._id}
                  className="mt-1 text-xs text-slate-400 hover:text-rose-600 underline underline-offset-2 cursor-pointer disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Rent per day</div>
                <div className="text-sm font-semibold text-slate-900">₹{item.dailyRate.toLocaleString()}</div>
              </div>

              <button
                onClick={() => handleToggle(item)}
                disabled={busyId === item._id}
                title="Click to change"
                className={`px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer disabled:opacity-50 ${
                  item.isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {item.isAvailable ? 'Available' : 'Not available'}
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
                <h3 className="text-lg font-bold text-slate-900">Add equipment</h3>
                <p className="text-sm text-slate-500">Add a name, photo, and daily rent</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-sm">
              <div>
                <label className="font-medium text-slate-700">Name and model</label>
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
                <p className="font-medium text-slate-700">Photo (optional)</p>

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
                        <span className="font-medium text-sm text-[#f95724]">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#f95724]" />
                        <span className="font-medium text-sm text-slate-800">
                          {imageUrl ? 'Change photo' : 'Upload a photo'}
                        </span>
                        <span className="text-xs text-slate-500">PNG, JPG or WebP, up to 10 MB</span>
                      </>
                    )}
                  </label>

                  {uploadError && (
                    <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                  )}

                  {imageUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden h-36 border border-slate-200 bg-slate-900">
                      <img src={imageUrl} alt="Uploaded equipment" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 bg-white/90 text-slate-800 text-sm px-2.5 py-1 rounded-lg hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700">Category</label>
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
                  <label className="font-medium text-slate-700">Rent per day (₹)</label>
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
                <label className="font-medium text-slate-700">Details (optional)</label>
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
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || isSaving}
                  className="px-6 py-2 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};