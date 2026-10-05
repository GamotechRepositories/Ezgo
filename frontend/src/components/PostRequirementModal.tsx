import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
  Lock,
  Building2,
  Music,
  Camera,
  Utensils,
  Flame,
  Heart,
  Tent,
  SunMedium,
  Plus,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import type { Category, Requirement } from '../types';
import { EVENT_CATEGORIES } from '../data/eventData';
import { api } from '../services/api';

interface PostRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: Partial<Requirement>) => Promise<void>;
  requesterId: string;
  initialCategory?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  'DJ & Sound Setup': Music,
  'Decoration & Stage Setup': Sparkles,
  'Photography & 4K Videography': Camera,
  'Catering & Live Food Counters': Utensils,
  'Lighting & Stage Trussing': SunMedium,
  'Purohit & Vedic Ritual Services': Flame,
  'Bridal Mehendi & Henna Art': Heart,
  'Tent, Shamiana & VIP Stage Seating': Tent,
};

const POPULAR_AREAS_BY_CITY: Record<string, string[]> = {
  Hyderabad: ['Gachibowli', 'Madhapur / Hitec City', 'Banjara Hills', 'Jubilee Hills', 'Kukatpally', 'Kondapur', 'Shamshabad'],
  Bangalore: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'JP Nagar', 'Electronic City', 'Yelahanka'],
  Mumbai: ['Bandra West', 'Andheri East', 'Juhu', 'Powai', 'Thane West', 'Navi Mumbai', 'Worli'],
  Pune: ['Koregaon Park', 'Baner', 'Wakad', 'Kothrud', 'Viman Nagar', 'Hadapsar', 'Hinjewadi'],
  Secunderabad: ['Sainikpuri', 'Trimulgherry', 'Marredpally', 'Begumpet', 'Alwal'],
  Chennai: ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'OMR / ECR', 'Nungambakkam'],
};

const GUEST_TIERS = [
  { label: 'Small / Intimate', range: '50 - 100 Guests', count: 80 },
  { label: 'Medium Party / Sangeet', range: '150 - 300 Guests', count: 200 },
  { label: 'Grand Wedding / Reception', range: '400 - 800+ Guests', count: 500 },
];

export const PostRequirementModal: React.FC<PostRequirementModalProps> = ({
  isOpen,
  onClose,
  categories: _categories,
  onSubmit,
  requesterId,
  initialCategory,
}) => {
  const [category, setCategory] = useState(initialCategory || EVENT_CATEGORIES[0]?.name);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [area, setArea] = useState('Gachibowli');
  const [venueAddress, setVenueAddress] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('23:00');
  const [guestCount, setGuestCount] = useState<number>(200);
  const [budget, setBudget] = useState<number>(25000);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingImage(true);
        setUploadError('');
        const cloudUrl = await api.uploadImage(file, 'ezgo/requirements');
        setCustomImageUrl(cloudUrl);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload photo to Cloudinary');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  // Sync initial category if changed
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  if (!isOpen) return null;

  const mergedCategories = (_categories && _categories.length > 0)
    ? _categories
    : EVENT_CATEGORIES.map((c) => ({
        _id: c.id,
        name: c.name,
        slug: c.id,
        icon: 'Sparkles',
        image: c.image,
        description: c.description,
        avgPriceRange: c.avgPriceRange,
        isActive: true,
      }));

  const activeCategoryData = mergedCategories.find((c) => c.name === category) || mergedCategories[0] || {
    name: 'Event Services',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
    avgPriceRange: '₹10,000 - ₹50,000',
  };
  const maxAcceptableBid = Math.floor(budget * 0.85);
  const guaranteedMinSavings = budget - maxAcceptableBid;

  const toggleEquipment = (eq: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    const catData = EVENT_CATEGORIES.find((c) => c.name === catName);
    if (catData && catData.sampleEquipments && catData.sampleEquipments.length > 0) {
      setSelectedEquipments(catData.sampleEquipments.slice(0, 2));
    } else {
      setSelectedEquipments([]);
    }
    if (!title || title.includes('Guests in') || title.includes('for ')) {
      setTitle(`${catName.split('&')[0].trim()} for ${guestCount} Guests in ${area}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget || !eventDate || !area) return;
    setLoading(true);
    try {
      await onSubmit({
        requesterId,
        category,
        title,
        description,
        imageUrl: customImageUrl || activeCategoryData.image,
        equipmentNeeded: selectedEquipments,
        location: { city, area, venueAddress },
        eventDate,
        timeWindow: { start: startTime, end: endTime },
        guestCount,
        budget,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] overflow-y-auto w-full min-h-screen text-slate-900 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-900">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Home</span>
          </button>
          
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Post Event Requirement
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed 15% Minimum Savings</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Simple & Friendly Intro Banner */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/90 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Ezgo Reverse Bidding</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Post Your Event Requirement
          </h1>
          
          <p className="text-slate-600 text-sm sm:text-base mt-1.5">
            Tell us what you need and set your maximum budget ceiling. Verified vendors in your area will compete with their lowest bids.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: What service do you need? */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  What service do you need?
                </h2>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                {category}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {mergedCategories.map((cat) => {
                const isSelected = category === cat.name;
                const Icon = CATEGORY_ICONS[cat.name] || Sparkles;
                const catImg = cat.image && cat.image.trim().length > 0
                  ? cat.image
                  : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&auto=format&fit=crop&q=80';

                return (
                  <button
                    key={cat._id || cat.name}
                    type="button"
                    onClick={() => handleSelectCategory(cat.name)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group overflow-hidden ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20 shadow-md shadow-orange-500/10'
                        : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Category Image Thumbnail */}
                    <div className="relative h-24 w-full rounded-xl overflow-hidden mb-2 bg-slate-100 border border-slate-100">
                      <img
                        src={catImg}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md flex items-center justify-center text-[#f95724] shadow-xs">
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="px-1 pb-1">
                      <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-semibold text-[#f95724] block mt-0.5 truncate">
                        Avg. {cat.avgPriceRange || '₹10,000 - ₹50,000'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Location & Venue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Where will the event take place?
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>City *</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    const defaultArea = POPULAR_AREAS_BY_CITY[newCity]?.[0] || 'Central Area';
                    setArea(defaultArea);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Secunderabad">Secunderabad</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Area / Locality *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gachibowli, Hitec City"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                  list="area-suggestions"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                />
                <datalist id="area-suggestions">
                  {(POPULAR_AREAS_BY_CITY[city] || []).map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Venue Name (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fort Grand Convention / Home"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Popular Localities Shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
              <span className="text-slate-400 text-[11px] font-medium">Quick Pick in {city}:</span>
              {(POPULAR_AREAS_BY_CITY[city] || []).slice(0, 5).map((popArea) => (
                <button
                  key={popArea}
                  type="button"
                  onClick={() => setArea(popArea)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
                    area === popArea ? 'bg-orange-100 text-orange-900 font-bold border border-orange-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {popArea}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Date, Time & Estimated Guests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                When is the event & how many guests?
              </h2>
            </div>

            <div className="grid sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>Event Date *</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Start Time</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                  <span>Estimated Guests *</span>
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Quick Guest Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {GUEST_TIERS.map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setGuestCount(tier.count)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    guestCount === tier.count
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="text-xs block font-bold">{tier.label}</span>
                    <span className="text-[11px] text-slate-500">{tier.range}</span>
                  </div>
                  {guestCount === tier.count && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: Maximum Budget Ceiling & Savings */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-50 border-2 border-amber-300 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-heading">
                    What is your maximum budget ceiling?
                  </h2>
                  <p className="text-xs text-amber-900/80 mt-0.5">
                    Vendors cannot bid higher than this. You will only receive lower, discounted bids.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center bg-white border-2 border-amber-500 rounded-xl px-4 py-2 shadow-xs">
                <span className="text-xl font-bold text-amber-600 mr-2">₹</span>
                <input
                  type="number"
                  step="500"
                  min="2000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                  className="w-36 text-right font-bold text-slate-900 text-xl focus:outline-none bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="bg-white p-3 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Max Winning Bid (85%):</span>
                  <span className="text-slate-900 font-bold text-sm">₹{maxAcceptableBid.toLocaleString()}</span>
                </div>

                <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs">
                  <span className="text-[11px] text-emerald-100 block font-medium">Guaranteed Savings:</span>
                  <span className="text-white font-bold text-sm">≥ ₹{guaranteedMinSavings.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5: Title & Gear Requirements */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Requirement Title & Specific Gear
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Requirement Title *
              </label>
              <input
                type="text"
                placeholder="e.g. DJ Sound & Lights for Sangeet (250 Guests in Gachibowli)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            {/* Smart Equipment Tags */}
            {activeCategoryData.sampleEquipments && activeCategoryData.sampleEquipments.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Equipment Needed (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeCategoryData.sampleEquipments.map((eq: string) => {
                    const isSelected = selectedEquipments.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? 'bg-orange-500 border-orange-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        <span>{eq}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Need mix of Bollywood and regional songs, 2 cordless microphones, setup ready by 5:00 PM."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            {/* Cloudinary Device Image Upload */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                  <span>Venue Photo / Inspiration Reference (Optional)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Stored securely on Cloudinary</span>
              </label>

              <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-4 bg-slate-50/60 transition text-center">
                <input
                  type="file"
                  id="req-custom-image-upload"
                  accept="image/*"
                  disabled={isUploadingImage}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="req-custom-image-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 text-slate-600 ${isUploadingImage ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                      <span className="font-bold text-xs text-orange-600">Uploading image to Cloudinary...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-orange-500" />
                      <span className="font-bold text-xs text-slate-800">
                        {customImageUrl ? 'Change Photo from Device' : 'Click to Upload Venue / Reference Photo from Device'}
                      </span>
                      <span className="text-[10px] text-slate-400">Supports JPG, PNG, WebP up to 10MB</span>
                    </>
                  )}
                </label>

                {uploadError && (
                  <p className="text-[11px] text-red-500 font-medium mt-2">{uploadError}</p>
                )}

                {customImageUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden h-36 border border-slate-200 bg-slate-900 group">
                    <img src={customImageUrl} alt="Uploaded venue reference" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-white text-xs font-bold bg-emerald-600 px-2.5 py-1 rounded-lg">
                        ✓ Cloudinary Uploaded
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomImageUrl('')}
                        className="bg-red-600 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">100% Free to Post · Escrow Safe</span>
                <span className="text-slate-500 text-[11px]">You will receive 5-10 quotes directly from verified pros.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  'Publishing...'
                ) : (
                  <>
                    <span>Submit Requirement & Get Bids</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
};
