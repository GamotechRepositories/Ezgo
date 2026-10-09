import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Tag,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  ArrowRight,
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
import type { Category, Requirement, PostRequirementInitialData } from '../types';
import { EVENT_CATEGORIES } from '../data/eventData';
import { api } from '../services/api';

interface PostRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: Partial<Requirement>) => Promise<void>;
  requesterId: string;
  initialData?: string | PostRequirementInitialData;
  initialCategory?: string;
  initialCity?: string;
}

const normalizeCity = (c?: string) => {
  if (!c) return 'Pune';
  return c.split(',')[0].trim();
};

const CATEGORY_ICONS: Record<string, any> = {
  'DJ & Sound Setup': Music,
  'Decoration & Stage Setup': Palette,
  'Photography & 4K Videography': Camera,
  'Catering & Live Food Counters': Utensils,
  'Lighting & Stage Trussing': SunMedium,
  'Purohit & Vedic Ritual Services': Flame,
  'Bridal Mehendi & Henna Art': Heart,
  'Tent, Shamiana & VIP Stage Seating': Tent,
};

const ALL_INDIA_CITIES = [
  'Pune',
  'Mumbai',
  'Delhi NCR',
  'Bangalore',
  'Hyderabad',
  'Nagpur',
  'Nashik',
  'Ahmedabad',
  'Jaipur',
  'Goa',
  'Kolkata',
  'Chennai',
  'Surat',
  'Lucknow',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Pimpri-Chinchwad',
  'Patna',
  'Vadodara',
  'Ghaziabad',
  'Ludhiana',
  'Agra',
  'Faridabad',
  'Meerut',
  'Rajkot',
  'Varanasi',
  'Srinagar',
  'Aurangabad (Chhatrapati Sambhaji Nagar)',
  'Dhanbad',
  'Amritsar',
  'Navi Mumbai',
  'Allahabad (Prayagraj)',
  'Ranchi',
  'Howrah',
  'Coimbatore',
  'Jabalpur',
  'Gwalior',
  'Vijayawada',
  'Jodhpur',
  'Madurai',
  'Raipur',
  'Kota',
  'Chandigarh',
  'Guwahati',
  'Solapur',
  'Hubli-Dharwad',
  'Mysore',
  'Gurgaon (Gurugram)',
  'Noida',
  'Kolhapur',
  'Udaipur',
  'Dehradun',
  'Kochi (Cochin)',
  'Mangalore',
  'Satara',
  'Sangli',
  'Ahmednagar',
  'Jalgaon',
  'Amravati',
  'Nanded',
];

const POPULAR_CITY_SHORTCUTS = [
  'Pune',
  'Mumbai',
  'Delhi NCR',
  'Bangalore',
  'Hyderabad',
  'Nagpur',
  'Nashik',
  'Ahmedabad',
  'Jaipur',
  'Goa',
  'Kolkata',
  'Chennai',
];

const POPULAR_AREAS_BY_CITY: Record<string, string[]> = {
  Pune: ['Wakad', 'Baner', 'Koregaon Park', 'Kothrud', 'Hinjewadi', 'Viman Nagar', 'Hadapsar', 'Aundh', 'Pimple Saudagar', 'Kalyani Nagar'],
  Mumbai: ['Bandra', 'Andheri', 'Juhu', 'Powai', 'Dadar', 'Borivali', 'Thane', 'Navi Mumbai', 'Worli', 'Goregaon'],
  'Delhi NCR': ['Connaught Place', 'South Extension', 'Hauz Khas', 'Dwarka', 'Noida Sector 18', 'Cyber City Gurgaon', 'Rohini', 'Saket'],
  Bangalore: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'JP Nagar', 'Electronic City', 'MG Road', 'Hebbal'],
  Hyderabad: ['Gachibowli', 'Madhapur / Hitec City', 'Banjara Hills', 'Jubilee Hills', 'Kukatpally', 'Kondapur', 'Secunderabad'],
  Nagpur: ['Dharampeth', 'Civil Lines', 'Ramdaspeth', 'Manish Nagar', 'Wardha Road', 'Sitabuldi'],
  Nashik: ['College Road', 'Gangapur Road', 'Indira Nagar', 'Panchavati', 'Mahatma Nagar'],
  Ahmedabad: ['SG Highway', 'Prahlad Nagar', 'Bodakdev', 'Satellite', 'Vastrapur', 'Maninagar'],
  Jaipur: ['C-Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Tonk Road', 'Raja Park'],
  Goa: ['Panaji', 'Calangute', 'Candolim', 'Margao', 'Porvorim', 'Vasco'],
  Kolkata: ['Park Street', 'Salt Lake', 'New Town', 'Ballygunge', 'Alipore'],
  Chennai: ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'OMR', 'Nungambakkam'],
  Kolhapur: ['Tarabai Park', 'Rajarampuri', 'Shahupuri', 'Nagala Park'],
  'Aurangabad (Chhatrapati Sambhaji Nagar)': ['CIDCO', 'Samarth Nagar', 'Garkheda', 'Cannaught Place'],
  Secunderabad: ['Sainikpuri', 'Trimulgherry', 'Marredpally', 'Begumpet', 'Alwal'],
};

const findCategory = <T extends { name: string }>(list: T[], name?: string): T | undefined => {
  if (!name) return undefined;
  const wanted = name.toLowerCase();
  return (
    list.find((c) => c.name.toLowerCase() === wanted) ||
    list.find((c) => {
      const keyword = c.name.toLowerCase().split(/[\s/&,]+/)[0];
      return keyword.length >= 2 && wanted.includes(keyword);
    })
  );
};

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayIso = () => isoDate(new Date());
const twoWeeksFromNowIso = () => isoDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));

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
  initialData,
  initialCategory,
  initialCity,
}) => {
  const initialCleanCity = normalizeCity(
    (initialData && typeof initialData !== 'string' && initialData.city) || initialCity
  );
  const [category, setCategory] = useState(
    (initialData && (typeof initialData === 'string' ? initialData : initialData.category)) ||
      initialCategory ||
      EVENT_CATEGORIES[0]?.name
  );
  const [title, setTitle] = useState(
    (initialData && typeof initialData !== 'string' && initialData.title) || ''
  );
  const [description, setDescription] = useState(
    (initialData && typeof initialData !== 'string' && initialData.description) || ''
  );
  const [city, setCity] = useState(initialCleanCity);
  const [area, setArea] = useState(POPULAR_AREAS_BY_CITY[initialCleanCity]?.[0] || 'Main Area');
  const [venueAddress, setVenueAddress] = useState('');
  const [eventDate, setEventDate] = useState(twoWeeksFromNowIso);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('23:00');
  const [guestCount, setGuestCount] = useState<number | ''>(
    (initialData && typeof initialData !== 'string' && typeof initialData.guestCount === 'number')
      ? initialData.guestCount
      : 200
  );
  const [budget, setBudget] = useState<number | ''>(
    (initialData && typeof initialData !== 'string' && typeof initialData.budget === 'number')
      ? initialData.budget
      : 25000
  );
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>(
    (initialData && typeof initialData !== 'string' && initialData.selectedEquipments)
      ? initialData.selectedEquipments
      : []
  );
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [packageSummary, setPackageSummary] = useState<PostRequirementInitialData['packageSummary'] | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingImage(true);
        setUploadError('');
        const cloudUrl = await api.uploadImage(file, 'ezzygo/requirements');
        setCustomImageUrl(cloudUrl);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload photo to Cloudinary');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  // Sync initial data, package builder, category and city when opened or changed
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      if (typeof initialData === 'string') {
        setCategory(initialData);
        const isRealCategory = (_categories || []).some((c) => c.name.toLowerCase() === initialData.toLowerCase());
        if (!isRealCategory) {
          setTitle((prev) => prev || initialData);
        }
        setPackageSummary(null);
      } else {
        if (initialData.category) setCategory(initialData.category);
        if (initialData.title) setTitle(initialData.title);
        if (initialData.description) setDescription(initialData.description);
        if (typeof initialData.budget === 'number' && initialData.budget > 0) setBudget(initialData.budget);
        if (typeof initialData.guestCount === 'number' && initialData.guestCount > 0) setGuestCount(initialData.guestCount);
        if (initialData.selectedEquipments && initialData.selectedEquipments.length > 0) {
          setSelectedEquipments(initialData.selectedEquipments);
        }
        if (initialData.city) {
          const cleanCity = normalizeCity(initialData.city);
          setCity(cleanCity);
          if (POPULAR_AREAS_BY_CITY[cleanCity]?.[0]) {
            setArea(POPULAR_AREAS_BY_CITY[cleanCity][0]);
          }
        }
        if (initialData.packageSummary) {
          setPackageSummary(initialData.packageSummary);
        } else {
          setPackageSummary(null);
        }
      }
    } else if (initialCategory) {
      setCategory(initialCategory);
      const isRealCategory = (_categories || []).some((c) => c.name.toLowerCase() === initialCategory.toLowerCase());
      if (!isRealCategory) {
        setTitle((prev) => prev || initialCategory);
      }
      setPackageSummary(null);
    } else {
      setPackageSummary(null);
    }

    if (initialCity && (!initialData || typeof initialData === 'string' || !initialData.city)) {
      const cleanCity = normalizeCity(initialCity);
      setCity(cleanCity);
      if (POPULAR_AREAS_BY_CITY[cleanCity]?.[0]) {
        setArea(POPULAR_AREAS_BY_CITY[cleanCity][0]);
      }
    }
  }, [initialData, initialCategory, initialCity, isOpen, _categories]);

  if (!isOpen) return null;

  const mergedCategories = (_categories && _categories.length > 0)
    ? _categories
    : EVENT_CATEGORIES.map((c) => ({
        _id: c.id,
        name: c.name,
        slug: c.id,
        icon: 'Palette',
        image: c.image,
        description: c.description,
        avgPriceRange: c.avgPriceRange,
        isActive: true,
      }));

  const activeCategoryData = findCategory(mergedCategories, category) || mergedCategories[0] || {
    name: 'Event Services',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
    avgPriceRange: '₹10,000 - ₹50,000',
  };
  const numericBudget = typeof budget === 'number' ? budget : 0;
  const maxAcceptableBid = Math.floor(numericBudget * 0.85);
  const guaranteedMinSavings = numericBudget - maxAcceptableBid;

  const toggleEquipment = (eq: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const handleClearPackage = () => {
    setPackageSummary(null);
    const catData = EVENT_CATEGORIES.find((c) => c.name === category);
    if (catData && catData.sampleEquipments && catData.sampleEquipments.length > 0) {
      setSelectedEquipments(catData.sampleEquipments.slice(0, 2));
    } else {
      setSelectedEquipments([]);
    }
    setTitle(`${category.split('&')[0].trim()} for ${guestCount || 200} Guests in ${area}`);
    setDescription('');
    setBudget(25000);
  };

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    const catData = EVENT_CATEGORIES.find((c) => c.name === catName);
    if (catData && catData.sampleEquipments && catData.sampleEquipments.length > 0) {
      setSelectedEquipments(catData.sampleEquipments.slice(0, 2));
    } else {
      setSelectedEquipments([]);
    }
    if (packageSummary) {
      setPackageSummary(null);
      setDescription('');
      setBudget(25000);
    }
    setTitle(`${catName.split('&')[0].trim()} for ${guestCount || 200} Guests in ${area}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBudget = typeof budget === 'number' ? budget : 0;
    const finalGuestCount = typeof guestCount === 'number' ? guestCount : 50;
    if (!title || finalBudget <= 0 || !eventDate || !area) return;
    setLoading(true);
    try {
      await onSubmit({
        requesterId,
        category: activeCategoryData.name,
        title,
        description,
        imageUrl: customImageUrl || activeCategoryData.image,
        equipmentNeeded: selectedEquipments,
        location: { city, area, venueAddress },
        eventDate,
        timeWindow: { start: startTime, end: endTime },
        guestCount: finalGuestCount,
        budget: finalBudget,
      });
      onClose();
    } catch (_) {
      // Error toast already shown; keep the form open so nothing is lost
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] overflow-y-auto w-full min-h-screen text-slate-900 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-900">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 lg:px-12 py-3.5 shadow-xs">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-800">
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
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8">
        
        {/* Simple & Friendly Intro Banner */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/90 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            <span>Ezzygo Reverse Bidding</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
            Post Your Event Requirement
          </h1>
          
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-3xl">
            Tell us what you need and set your maximum budget ceiling. Verified vendors in your area will compete with their lowest bids.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Pre-loaded from Package Builder Alert Banner */}
          {packageSummary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f95724] to-[#ea4a17] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {packageSummary.eventType} Custom Package Loaded
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider bg-[#f95724] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                      {packageSummary.servicesCount} Services Selected
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    Included: <span className="text-slate-800 font-bold">{packageSummary.serviceNames.join(', ')}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-orange-200/60 pt-2 sm:pt-0 sm:pl-4 justify-between sm:justify-end">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Standard Rate</span>
                  <span className="text-xs text-slate-400 line-through font-mono font-bold">₹{packageSummary.retailTotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Target Reverse-Bid</span>
                  <span className="text-base font-black text-[#f95724] font-mono">₹{packageSummary.targetBid.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearPackage}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-bold transition cursor-pointer shrink-0 ml-2 shadow-2xs"
                  title="Switch back to single service"
                >
                  Clear Package ✕
                </button>
              </div>
            </div>
          )}
          
          {/* STEP 1: What service do you need? */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  What service do you need?
                </h2>
              </div>
              <span className="text-xs sm:text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                {category}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 lg:gap-4">
              {mergedCategories.map((cat) => {
                const isSelected = activeCategoryData.name === cat.name;
                const Icon = CATEGORY_ICONS[cat.name] || Tag;
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
                        ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20 shadow-md shadow-orange-500/10 scale-[1.02]'
                        : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-md hover:scale-[1.01]'
                    }`}
                  >
                    {/* Category Image Thumbnail */}
                    <div className="relative h-24 sm:h-28 lg:h-32 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-100 border border-slate-100">
                      <img
                        src={catImg}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      
                      <div className="absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/95 backdrop-blur-md flex items-center justify-center text-[#f95724] shadow-xs">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-md">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="px-1 pb-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight truncate">
                        {cat.name}
                      </span>
                      <span className="text-[11px] sm:text-xs font-semibold text-[#f95724] block mt-0.5 truncate">
                        Avg. {cat.avgPriceRange || '₹10,000 - ₹50,000'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Event Location (All India Enabled) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  2
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    Where will the event take place?
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Available across all cities, districts & towns in India 🇮🇳
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>City / Town / District *</span>
                </label>
                <input
                  type="text"
                  list="all-india-cities-list"
                  placeholder="e.g. Pune, Mumbai, Delhi NCR, Nagpur, Goa..."
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    if (POPULAR_AREAS_BY_CITY[newCity]?.[0]) {
                      setArea(POPULAR_AREAS_BY_CITY[newCity][0]);
                    }
                  }}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                />
                <datalist id="all-india-cities-list">
                  {ALL_INDIA_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Area / Locality / PIN Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wakad, Baner, PIN 411057..."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                  list="area-suggestions"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
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
                  <span>Venue Name / Address (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hotel Sayaji, Grand Ballroom, Lawn, Home"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Popular City Shortcuts */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-400 text-xs font-medium">Quick Select:</span>
                {POPULAR_CITY_SHORTCUTS.map((popCity) => (
                  <button
                    key={popCity}
                    type="button"
                    onClick={() => {
                      setCity(popCity);
                      if (POPULAR_AREAS_BY_CITY[popCity]?.[0]) {
                        setArea(POPULAR_AREAS_BY_CITY[popCity][0]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      city === popCity
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {popCity}
                  </button>
                ))}
              </div>

              {/* Localities Shortcuts for selected city */}
              {POPULAR_AREAS_BY_CITY[city] && POPULAR_AREAS_BY_CITY[city].length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-400 text-xs font-medium">Popular in {city}:</span>
                  {POPULAR_AREAS_BY_CITY[city].slice(0, 8).map((popArea) => (
                    <button
                      key={popArea}
                      type="button"
                      onClick={() => setArea(popArea)}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        area === popArea
                          ? 'bg-orange-100 text-orange-900 font-bold border border-orange-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {popArea}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: Date, Time & Estimated Guests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                3
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                When is the event & how many guests?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>Event Date *</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  min={todayIso()}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition"
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition"
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition"
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
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setGuestCount('');
                    } else {
                      const parsed = parseInt(val, 10);
                      setGuestCount(isNaN(parsed) ? '' : parsed);
                    }
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="e.g. 200"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Quick Guest Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {GUEST_TIERS.map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setGuestCount(tier.count)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    guestCount === tier.count
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="text-xs sm:text-sm block font-bold">{tier.label}</span>
                    <span className="text-[11px] text-slate-500">{tier.range}</span>
                  </div>
                  {guestCount === tier.count && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: Maximum Budget Ceiling & Savings */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-50 border-2 border-amber-300 p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  4
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    What is your maximum budget ceiling?
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-900/80 mt-0.5">
                    Vendors cannot bid higher than this. You will only receive lower, reverse-discounted bids.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-5 flex items-center bg-white border-2 border-amber-500 rounded-2xl px-5 py-3 shadow-xs">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 mr-3">₹</span>
                <input
                  type="number"
                  step="500"
                  min="2000"
                  value={budget}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setBudget('');
                    } else {
                      const parsed = parseInt(val, 10);
                      setBudget(isNaN(parsed) ? '' : parsed);
                    }
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Enter budget"
                  required
                  className="w-full text-right font-black text-slate-900 text-2xl sm:text-3xl focus:outline-none bg-transparent"
                />
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                  <span className="text-xs text-slate-500 block font-semibold">Max Winning Bid (85% Ceiling):</span>
                  <span className="text-slate-900 font-extrabold text-lg sm:text-xl mt-1">₹{maxAcceptableBid.toLocaleString()}</span>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md flex flex-col justify-between">
                  <span className="text-xs text-emerald-100 block font-semibold">Guaranteed Savings (Min 15%):</span>
                  <span className="text-white font-extrabold text-lg sm:text-xl mt-1">≥ ₹{guaranteedMinSavings.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5: Title, Notes & Reference Image (Spacious Multi-Column on Laptop) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                5
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Requirement Details & Venue Reference
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column on Desktop: Title, Equipment & Notes */}
              <div className="lg:col-span-7 space-y-4">
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>

                {/* Smart Equipment Tags */}
                {(activeCategoryData as any).sampleEquipments && (activeCategoryData as any).sampleEquipments.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Equipment Needed (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(activeCategoryData as any).sampleEquipments.map((eq: string) => {
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
                    rows={3}
                    placeholder="e.g. Need mix of Bollywood and regional songs, 2 cordless microphones, setup ready by 5:00 PM."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Right Column on Desktop: Cloudinary Device Image Upload */}
              <div className="lg:col-span-5 space-y-3">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>Venue / Inspiration Photo (Optional)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Cloudinary CDN</span>
                </label>

                <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-5 bg-slate-50/60 transition text-center min-h-[160px] flex flex-col items-center justify-center">
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
                    className={`cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-600 ${isUploadingImage ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-3">
                        <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
                        <span className="font-bold text-xs text-orange-600">Uploading photo to Cloudinary CDN...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-800">
                          {customImageUrl ? 'Change Uploaded Photo' : 'Choose Photo from Phone / PC'}
                        </span>
                        <span className="text-[11px] text-slate-400">JPG, PNG, WebP up to 10MB</span>
                      </>
                    )}
                  </label>

                  {uploadError && (
                    <p className="text-xs text-red-500 font-medium mt-2">{uploadError}</p>
                  )}

                  {customImageUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden h-36 w-full border border-slate-200 bg-slate-900 group">
                      <img src={customImageUrl} alt="Uploaded venue reference" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-white text-xs font-bold bg-emerald-600 px-3 py-1 rounded-lg">
                          ✓ Uploaded
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomImageUrl('')}
                          className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-lg hover:bg-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs sm:text-sm block">100% Free to Post · Escrow Safe</span>
                <span className="text-slate-500 text-[11px] sm:text-xs">You will receive 5-10 quotes directly from verified local pros.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-[#f95724] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
