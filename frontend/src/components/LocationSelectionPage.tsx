import React, { useState, useMemo } from 'react';
import { MapPin, Search, Navigation, ArrowRight, ArrowLeft, X, Building2, Check } from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';

interface LocationSelectionPageProps {
  onSelect: (city: string) => void;
  onBack?: () => void;
}

interface CityData {
  name: string;
  state: string;
  landmark: string;
  image?: string;
  color: string;
  accent: string;
}

const CITIES: CityData[] = [
  {
    name: 'Pune',
    state: 'Maharashtra',
    landmark: 'Shaniwar Wada',
    image: '/images/cities/city_pune.png',
    color: '#FFECEB',
    accent: '#FF3838',
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    landmark: 'Gateway of India',
    image: '/images/cities/city_mumbai.png',
    color: '#E8F4FD',
    accent: '#2563EB',
  },
  {
    name: 'Bengaluru',
    state: 'Karnataka',
    landmark: 'Vidhana Soudha',
    image: '/images/cities/city_bengaluru.png',
    color: '#E8F8F0',
    accent: '#10B981',
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    landmark: 'Charminar',
    image: '/images/cities/city_hyderabad.png',
    color: '#FFF0F5',
    accent: '#EC4899',
  },
  {
    name: 'Delhi',
    state: 'NCR',
    landmark: 'India Gate',
    image: '/images/cities/city_delhi.png',
    color: '#FFF4E8',
    accent: '#F59E0B',
  },
  {
    name: 'Nagpur',
    state: 'Maharashtra',
    landmark: 'Zero Mile Stone',
    image: '/images/cities/city_nagpur.png',
    color: '#F0ECFC',
    accent: '#7C3AED',
  },
  {
    name: 'Goa',
    state: 'Goa Coast',
    landmark: 'Panaji Church & Palms',
    image: '/images/cities/city_goa.png',
    color: '#E8F4FD',
    accent: '#06B6D4',
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    landmark: 'Hawa Mahal Palace',
    image: '/images/cities/city_jaipur.png',
    color: '#FFF1EB',
    accent: '#EA580C',
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    landmark: 'Marina Beach',
    color: '#ECFDF5',
    accent: '#059669',
  },
  {
    name: 'Kolkata',
    state: 'West Bengal',
    landmark: 'Victoria Memorial',
    color: '#FEF3C7',
    accent: '#D97706',
  },
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    landmark: 'Sabarmati Ashram',
    color: '#FFF5F4',
    accent: '#EF4444',
  },
  {
    name: 'Surat',
    state: 'Gujarat',
    landmark: 'Surat Castle',
    color: '#EDE9FE',
    accent: '#8B5CF6',
  },
];

export const LocationSelectionPage: React.FC<LocationSelectionPageProps> = ({ onSelect, onBack }) => {
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [searchQuery, setSearchQuery] = useState('');
  const [detecting, setDetecting] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.landmark.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleDetect = () => {
    setDetecting(true);
    setTimeout(() => {
      setSelectedCity('Pune');
      setDetecting(false);
    }, 1200);
  };

  const selectedData = CITIES.find((c) => c.name === selectedCity);

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* AppBar */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex flex-col">
            <EzzyGoLogo variant="host" size="md" />
            <div className="mt-1 h-[3px] w-10 rounded-full" style={{ background: '#FF5722' }} />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-5 pt-5 pb-4 overflow-y-auto max-w-5xl mx-auto w-full">
        {/* Headline */}
        <h1 className="text-2xl sm:text-[32px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
          Where are you
          <br />
          planning your event?
        </h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2 h-12 px-4 rounded-full bg-slate-100 border border-transparent focus-within:border-[#FF5722] focus-within:bg-white transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city or landmark..."
              className="flex-1 bg-transparent text-[14.5px] font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Detect My Location */}
        <button
          onClick={handleDetect}
          disabled={detecting}
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-[#FF5722]/30 bg-[#FFF8F5] mb-5 w-full text-left hover:bg-[#FFF3ED] transition cursor-pointer disabled:opacity-60"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FFECEB] flex items-center justify-center shrink-0">
            {detecting ? (
              <div className="w-5 h-5 border-2 border-[#FF5722] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation className="w-5 h-5 text-[#FF5722]" />
            )}
          </div>
          <div>
            <div className="text-[14px] font-bold text-slate-900">
              {detecting ? 'Detecting current location...' : 'Use my current location'}
            </div>
            <div className="text-[12px] text-slate-500">
              Auto-detect city for verified local vendors
            </div>
          </div>
        </button>

        {/* Nearby Cities Label */}
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
            {searchQuery ? 'Search Results' : 'Popular Cities'}
          </span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* City Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No cities match your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filtered.map((city) => {
              const isSel = selectedCity === city.name;
              return (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city.name)}
                  className={`group relative rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                    isSel
                      ? 'border-[2px] shadow-md scale-[1.01]'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                  style={
                    isSel
                      ? {
                          backgroundColor: city.color,
                          borderColor: city.accent,
                          boxShadow: `0 6px 16px ${city.accent}25`,
                        }
                      : {}
                  }
                >
                  {/* City Landmark Image / Icon Thumbnail */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center bg-white shadow-sm border border-slate-100 shrink-0">
                    {city.image ? (
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: city.color }}
                      >
                        <Building2 className="w-5 h-5" style={{ color: city.accent }} />
                      </div>
                    )}
                  </div>

                  <div
                    className="text-[15px] font-extrabold leading-tight"
                    style={{ color: isSel ? city.accent : '#0F172A' }}
                  >
                    {city.name}
                  </div>
                  <div className="text-[11.5px] text-slate-500 mt-0.5 font-medium leading-tight">
                    {city.state}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate font-normal">
                    {city.landmark}
                  </div>

                  {isSel && (
                    <div
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: city.accent }}
                    >
                      <Check className="w-3 h-3 text-white stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 pt-4 pb-6 shadow-lg shadow-slate-200/50">
        <div className="max-w-lg mx-auto">
          {selectedData && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: selectedData.accent }} />
              <span className="text-sm text-slate-600 font-medium">
                Selected:{' '}
                <strong style={{ color: selectedData.accent }} className="font-bold">
                  {selectedData.name}, {selectedData.state}
                </strong>
              </span>
            </div>
          )}
          <button
            onClick={() => onSelect(selectedCity)}
            className="w-full h-14 rounded-2xl text-white font-extrabold text-[16px] flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all duration-150 shadow-md"
            style={{
              background: selectedData?.accent || '#FF5722',
              boxShadow: `0 6px 20px ${selectedData?.accent || '#FF5722'}40`,
            }}
          >
            Explore Vendors in {selectedCity}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
