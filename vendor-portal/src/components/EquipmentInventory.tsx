import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { mockEquipmentList } from '../services/api';

export const EquipmentInventory: React.FC = () => {
  const [equipment, setEquipment] = useState(mockEquipmentList);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Sound Systems');
  const [newRate, setNewRate] = useState('3500');

  const handleToggle = (id: string) => {
    setEquipment(equipment.map((eq) => eq.id === id ? { ...eq, isAvailable: !eq.isAvailable } : eq));
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
        specs: 'Verified professional grade equipment',
        dailyRate: Number(newRate),
        isAvailable: true,
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80',
      },
    ]);
    setNewName('');
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
          onClick={() => setIsAddOpen(true)}
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
            className="rounded-3xl bg-white border border-slate-200 overflow-hidden space-y-3 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            <div className="space-y-3">
              <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#f95724] shadow-xs">
                  {item.category}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.specs}</p>
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

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Add Equipment to Profile</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Equipment Name & Model</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Yamaha TF5 32-Channel Digital Mixer"
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                >
                  <option>Sound Systems</option>
                  <option>DJ Gear</option>
                  <option>Lighting</option>
                  <option>Stage Truss</option>
                  <option>Cameras & Drones</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Daily Rental Benchmark (₹)</label>
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  required
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#f95724] text-white font-bold"
                >
                  Save Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};