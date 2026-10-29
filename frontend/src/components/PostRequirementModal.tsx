import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ChevronLeft,
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
  FileText,
  Sparkles,
  PartyPopper,
  Briefcase,
  Cake,
  AlertCircle,
  Navigation,
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
  'DJ / Teenmar / Sound & Lighting': Music,
  'Decoration & Stage Setup': Palette,
  'Decoration & Stage Design': Palette,
  'Photography & 4K Videography': Camera,
  'Catering & Live Food Counters': Utensils,
  'Lighting & Stage Trussing': SunMedium,
  'Purohit & Vedic Ritual Services': Flame,
  'Bridal Mehendi & Henna Art': Heart,
  'Tent, Shamiana & VIP Stage Seating': Tent,
};

const ALL_INDIA_CITIES = [
  'Pune', 'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Nagpur', 'Nashik',
  'Ahmedabad', 'Jaipur', 'Goa', 'Kolkata', 'Chennai', 'Surat', 'Lucknow', 'Indore',
  'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi',
  'Srinagar', 'Aurangabad (Chhatrapati Sambhaji Nagar)', 'Dhanbad', 'Amritsar',
  'Navi Mumbai', 'Allahabad (Prayagraj)', 'Ranchi', 'Howrah', 'Coimbatore',
  'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota',
  'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Mysore', 'Gurgaon (Gurugram)',
  'Noida', 'Kolhapur', 'Udaipur', 'Dehradun', 'Kochi (Cochin)', 'Mangalore',
  'Satara', 'Sangli', 'Ahmednagar', 'Jalgaon', 'Amravati', 'Nanded',
];

const POPULAR_CITY_SHORTCUTS = [
  'Pune', 'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Nagpur', 'Nashik', 'Goa',
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
};

const OCCASIONS = [
  { id: 'Wedding', label: 'Wedding', icon: Sparkles },
  { id: 'Sangeet / Haldi', label: 'Sangeet / Haldi', icon: Music },
  { id: 'Reception', label: 'Reception', icon: PartyPopper },
  { id: 'Birthday Party', label: 'Birthday Party', icon: Cake },
  { id: 'Corporate Event', label: 'Corporate Event', icon: Briefcase },
  { id: 'Anniversary', label: 'Anniversary', icon: Heart },
  { id: 'Pooja / Griha Pravesh', label: 'Pooja / Ritual', icon: Flame },
  { id: 'Private Party', label: 'Private Party', icon: Tag },
];

const GUEST_TIERS = [
  { label: 'Intimate Gathering', range: '50 - 100 Guests', count: 80 },
  { label: 'Standard Celebration', range: '150 - 300 Guests', count: 200 },
  { label: 'Grand Royal Affair', range: '400 - 800+ Guests', count: 500 },
];

const BUDGET_PRESETS = [15000, 25000, 50000, 100000, 250000];

const STEP_TITLES = [
  { num: 1, title: 'Occasion & Services', subtitle: 'What you need' },
  { num: 2, title: 'Date & Location', subtitle: 'When & where' },
  { num: 3, title: 'Specs & Photos', subtitle: 'Details & references' },
  { num: 4, title: 'Budget & Review', subtitle: 'Ceiling & submit' },
];

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayIso = () => isoDate(new Date());
const twoWeeksFromNowIso = () => isoDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));

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

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [eventType, setEventType] = useState('Wedding');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Decoration & Stage Design']);
  const [customServiceName, setCustomServiceName] = useState('');
  const [city, setCity] = useState(initialCleanCity);
  const [area, setArea] = useState(POPULAR_AREAS_BY_CITY[initialCleanCity]?.[0] || 'Main Area');
  const [venueAddress, setVenueAddress] = useState('');
  const [eventDate, setEventDate] = useState(twoWeeksFromNowIso);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('23:00');
  const [guestCount, setGuestCount] = useState<number | ''>(200);
  const [title, setTitle] = useState('');
  const [isTitleManual, setIsTitleManual] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [budget, setBudget] = useState<number | ''>(25000);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [packageSummary, setPackageSummary] = useState<PostRequirementInitialData['packageSummary'] | null>(null);

  // Sync incoming props / prefilled data
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      if (typeof initialData === 'string') {
        const isOther = initialData.trim().toLowerCase() === 'other';
        const cats = isOther
          ? ['Other']
          : initialData.includes('+')
            ? initialData.split('+').map((s) => s.trim()).filter(Boolean)
            : [initialData];
        setSelectedCategories(cats);
        setCustomServiceName('');
      } else {
        if (initialData.category) {
          const cats = initialData.category.includes('+')
            ? initialData.category.split('+').map((s) => s.trim()).filter(Boolean)
            : [initialData.category];
          setSelectedCategories(cats);
        }
        if (initialData.eventType) setEventType(initialData.eventType);
        if (initialData.title) {
          setTitle(initialData.title);
          setIsTitleManual(true);
        }
        if (initialData.description) setDescription(initialData.description);
        if (typeof initialData.budget === 'number' && initialData.budget > 0) setBudget(initialData.budget);
        if (typeof initialData.guestCount === 'number' && initialData.guestCount > 0)
          setGuestCount(initialData.guestCount);
        if (initialData.selectedEquipments && initialData.selectedEquipments.length > 0) {
          setSelectedEquipments(initialData.selectedEquipments);
        }
        if (initialData.city) {
          const c = normalizeCity(initialData.city);
          setCity(c);
          if (POPULAR_AREAS_BY_CITY[c]?.[0]) setArea(POPULAR_AREAS_BY_CITY[c][0]);
        }
        if (initialData.packageSummary) setPackageSummary(initialData.packageSummary);
      }
    } else if (initialCategory) {
      const cats = initialCategory.includes('+')
        ? initialCategory.split('+').map((s) => s.trim()).filter(Boolean)
        : [initialCategory];
      setSelectedCategories(cats);
    }

    if (initialCity && (!initialData || typeof initialData === 'string' || !initialData.city)) {
      const c = normalizeCity(initialCity);
      setCity(c);
      if (POPULAR_AREAS_BY_CITY[c]?.[0]) setArea(POPULAR_AREAS_BY_CITY[c][0]);
    }
  }, [isOpen, initialData, initialCategory, initialCity]);

  // Merged categories list
  const mergedCategories = useMemo(() => {
    if (_categories && _categories.length > 0) return _categories;
    return EVENT_CATEGORIES.map((c) => ({
      _id: c.id,
      name: c.name,
      slug: c.id,
      icon: 'Palette',
      image: c.image,
      description: c.description,
      avgPriceRange: c.avgPriceRange,
      isActive: true,
    }));
  }, [_categories]);

  // Combined sample equipment list based on selected categories
  const combinedSampleEquipments = useMemo(() => {
    return Array.from(
      new Set(
        selectedCategories.flatMap((catName) => {
          const found = EVENT_CATEGORIES.find(
            (c) =>
              c.name.toLowerCase().includes(catName.toLowerCase()) ||
              catName.toLowerCase().includes(c.name.toLowerCase())
          );
          return found?.sampleEquipments || [];
        })
      )
    );
  }, [selectedCategories]);

  // Smart auto-generation of Title unless manually edited
  useEffect(() => {
    if (isTitleManual) return;
    const catShort = selectedCategories
      .map((c) => (c === 'Other' ? customServiceName.trim() || 'Custom Need' : c.split('&')[0].split('/')[0].trim()))
      .slice(0, 2)
      .join(' + ');
    const displayCat = selectedCategories.length > 2 ? `${catShort} + more` : catShort;
    const guestPart = guestCount ? `(${guestCount} Guests)` : '';
    const locPart = area || city ? `in ${area || city}` : '';
    const autoTitle = `${displayCat || 'Event Services'} for ${eventType || 'Event'} ${guestPart} ${locPart}`.trim();
    setTitle(autoTitle);
  }, [selectedCategories, customServiceName, eventType, guestCount, area, city, isTitleManual]);

  if (!isOpen) return null;

  const numericBudget = typeof budget === 'number' ? budget : 0;
  const maxAcceptableBid = Math.floor(numericBudget * 0.85);
  const guaranteedMinSavings = numericBudget - maxAcceptableBid;

  const activeCategory =
    mergedCategories.find((c) => c.name.toLowerCase() === (selectedCategories[0] || '').toLowerCase()) ||
    mergedCategories[0] || {
      name: 'Event Services',
      image: '/hero_wedding_4k.jpg',
      avgPriceRange: '₹15,000 - ₹50,000',
    };

  const handleToggleCategory = (catName: string) => {
    setValidationError('');
    setSelectedCategories((prev) => {
      const exists = prev.includes(catName);
      if (exists) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== catName);
      }
      return [...prev, catName];
    });
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipments((prev) => (prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setIsUploadingImage(true);
      setUploadError('');
      const uploadPromises = files.map((file) => api.uploadImage(file, 'ezzygo/requirements'));
      const urls = await Promise.all(uploadPromises);
      setCustomImages((prev) => [...prev, ...urls].slice(0, 8));
      if (urls.length > 0 && !customImageUrl) {
        setCustomImageUrl(urls[0]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo. Please retry.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setValidationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        // Default to current city
        setCity((prev) => prev || 'Pune');
      },
      () => {
        setValidationError('Location access denied. Please select your city manually.');
      }
    );
  };

  const setDateShortcut = (daysFromNow: number) => {
    const d = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    setEventDate(isoDate(d));
  };

  // Step transitions with clean inline validation
  const handleNextStep = () => {
    setValidationError('');

    if (currentStep === 1) {
      if (selectedCategories.length === 0) {
        setValidationError('Please select at least one service category.');
        return;
      }
      if (selectedCategories.includes('Other') && !customServiceName.trim()) {
        setValidationError('Please specify which custom service you need.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!eventDate) {
        setValidationError('Please choose an event date.');
        return;
      }
      if (!city.trim() || !area.trim()) {
        setValidationError('Please provide your city and locality / area.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!title.trim()) {
        setValidationError('Please enter a requirement title.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleSaveDraft = async () => {
    const finalBudget = typeof budget === 'number' && budget > 0 ? budget : 1000;
    const finalGuestCount = typeof guestCount === 'number' ? guestCount : 50;
    if (!title.trim()) {
      setValidationError('Please enter a title to save a draft.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        requesterId,
        category: selectedCategories.join(' + ') || 'Event Services',
        eventType: eventType || undefined,
        title,
        description,
        imageUrl: customImages[0] || customImageUrl || activeCategory.image,
        images: customImages,
        equipmentNeeded: selectedEquipments,
        location: { city, area: area || 'Downtown', venueAddress },
        eventDate: eventDate || todayIso(),
        timeWindow: { start: startTime, end: endTime },
        guestCount: finalGuestCount,
        budget: Math.max(finalBudget, 1000),
        status: 'DRAFT',
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (!numericBudget || numericBudget < 1000) {
      setValidationError('Please enter a valid budget ceiling of at least ₹1,000.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        requesterId,
        category: selectedCategories.join(' + '),
        eventType: eventType || undefined,
        title,
        description,
        imageUrl: customImages[0] || customImageUrl || activeCategory.image,
        images: customImages.length > 0 ? customImages : customImageUrl ? [customImageUrl] : [],
        equipmentNeeded: selectedEquipments,
        location: { city, area, venueAddress },
        eventDate,
        timeWindow: { start: startTime, end: endTime },
        guestCount: typeof guestCount === 'number' ? guestCount : 50,
        budget: numericBudget,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to post requirement. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] overflow-y-auto w-full min-h-screen text-slate-900 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 lg:px-12 py-3.5 shadow-2xs">
        <div className="w-full max-w-[1500px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f07d4a] animate-pulse" />
            <span className="text-sm font-extrabold text-slate-900">Post Event Requirement</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Min. 15% Reverse Bidding Savings Guaranteed</span>
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

      {/* Main Container */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {/* Intro Banner */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#f07d4a] text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#f07d4a]" />
            <span>Fast Vendor Reverse-Bidding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Tell Us What You Need For Your Event
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Set your budget ceiling. Verified local decorators, DJs, caterers and photographers compete with live discounted bids.
          </p>
        </div>

        {/* 4-Step Interactive Progress Bar */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {STEP_TITLES.map((s) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num as any);
                  }}
                  className={`text-left p-2.5 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'border-[#f07d4a] bg-white ring-2 ring-orange-500/20 shadow-sm'
                      : isPassed
                        ? 'border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/60'
                        : 'border-slate-200 bg-white/70 opacity-60 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-black flex items-center justify-center ${
                        isCurrent
                          ? 'bg-[#f07d4a] text-white shadow-xs'
                          : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPassed ? '✓' : s.num}
                    </span>
                    <span className="hidden sm:inline text-[10.5px] font-bold text-slate-400">Step {s.num}</span>
                  </div>
                  <div className="mt-1.5">
                    <div className={`text-xs sm:text-sm font-extrabold truncate ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                      {s.title}
                    </div>
                    <div className="hidden sm:block text-[11px] text-slate-500 font-medium truncate">{s.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Validation Banner */}
        {validationError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{validationError}</span>
          </div>
        )}

        {/* 2-Column Desktop Layout: Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Wizard Form Column (8 cols on desktop) */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ========================================================================= */}
              {/* STEP 1: OCCASION & SERVICES                                               */}
              {/* ========================================================================= */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Package Summary alert if pre-loaded */}
                  {packageSummary && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">✨</span>
                        <div>
                          <p className="text-xs sm:text-sm font-black text-slate-900">
                            Pre-filled {packageSummary.eventType} Package ({packageSummary.servicesCount} Services)
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                            Target Bid: <span className="font-bold text-emerald-700">₹{packageSummary.targetBid.toLocaleString()}</span> (Retail ~₹{packageSummary.retailTotal.toLocaleString()})
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPackageSummary(null)}
                        className="text-[11px] font-bold text-slate-600 hover:text-rose-600 underline cursor-pointer"
                      >
                        Reset Package
                      </button>
                    </div>
                  )}

                  {/* 1. Pick Occasion */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                      <span className="w-6 h-6 rounded-full bg-[#17233d] text-white text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Which occasion are you planning?</h2>
                        <p className="text-xs text-slate-500 font-medium">Select your event type for tailored vendor proposals</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {OCCASIONS.map((occ) => {
                        const Icon = occ.icon;
                        const isSel = eventType === occ.id;
                        return (
                          <button
                            key={occ.id}
                            type="button"
                            onClick={() => {
                              setEventType(occ.id);
                              setValidationError('');
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 active:scale-95 ${
                              isSel
                                ? 'bg-[#fff5f0] border-[#f07d4a] ring-2 ring-orange-500/20 shadow-xs'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSel ? 'bg-[#f07d4a] text-white' : 'bg-white text-slate-700'}`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className={`text-xs font-bold leading-tight ${isSel ? 'text-[#f07d4a]' : 'text-slate-800'}`}>
                              {occ.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Select Services Needed */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#17233d] text-white text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">Select Services Needed (Multi-Select)</h2>
                          <p className="text-xs text-slate-500 font-medium">You can select multiple services for a single combined booking</p>
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-[#f07d4a] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                        {selectedCategories.length} Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                      {mergedCategories.map((cat) => {
                        const isSelected = selectedCategories.includes(cat.name);
                        const Icon = CATEGORY_ICONS[cat.name] || Tag;

                        return (
                          <button
                            key={cat._id || cat.name}
                            type="button"
                            onClick={() => handleToggleCategory(cat.name)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between overflow-hidden relative ${
                              isSelected
                                ? 'border-[#f07d4a] bg-[#fffbf9] ring-2 ring-orange-500/25 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                            }`}
                          >
                            <div className="relative h-24 sm:h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-100">
                              <img
                                src={cat.image || '/hero_wedding_4k.jpg'}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-2xs">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#f07d4a] ring-2 ring-white flex items-center justify-center text-white shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight truncate">
                                {cat.name}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
                                {cat.avgPriceRange || 'Avg. ₹15,000 - ₹50,000'}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      {/* Other Service card */}
                      <button
                        type="button"
                        onClick={() => handleToggleCategory('Other')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedCategories.includes('Other')
                            ? 'border-[#f07d4a] bg-[#fffbf9] ring-2 ring-orange-500/25 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="relative h-24 sm:h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-orange-50 border border-orange-200 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-[#f07d4a]" />
                          {selectedCategories.includes('Other') && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#f07d4a] ring-2 ring-white flex items-center justify-center text-white shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">Other Services</p>
                          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Custom requirement</p>
                        </div>
                      </button>
                    </div>

                    {selectedCategories.includes('Other') && (
                      <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-1.5 animate-in fade-in">
                        <label className="block text-xs font-bold text-slate-800">Which other service do you need? *</label>
                        <input
                          type="text"
                          value={customServiceName}
                          onChange={(e) => setCustomServiceName(e.target.value)}
                          placeholder="e.g. Anchor / MC, Drone Show, Valet Parking, Dhol Tasha..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: DATE, TIME & LOCATION                                            */}
              {/* ========================================================================= */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Location Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#17233d] text-white text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">Where is the event venue?</h2>
                          <p className="text-xs text-slate-500 font-medium">Verified local vendors in your area will compete</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#f07d4a]" />
                        <span>Detect Location</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#f07d4a]" />
                          <span>City / District *</span>
                        </label>
                        <input
                          type="text"
                          list="post-req-cities-list"
                          placeholder="e.g. Pune, Mumbai, Delhi..."
                          value={city}
                          onChange={(e) => {
                            const c = e.target.value;
                            setCity(c);
                            if (POPULAR_AREAS_BY_CITY[c]?.[0]) setArea(POPULAR_AREAS_BY_CITY[c][0]);
                          }}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                        />
                        <datalist id="post-req-cities-list">
                          {ALL_INDIA_CITIES.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>

                        {/* City Shortcuts */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-2">
                          {POPULAR_CITY_SHORTCUTS.map((popCity) => (
                            <button
                              key={popCity}
                              type="button"
                              onClick={() => {
                                setCity(popCity);
                                if (POPULAR_AREAS_BY_CITY[popCity]?.[0]) setArea(POPULAR_AREAS_BY_CITY[popCity][0]);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                city === popCity ? 'bg-[#f07d4a] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {popCity}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Area / Locality / PIN *</label>
                        <input
                          type="text"
                          placeholder="e.g. Baner, Wakad, Bandra, Connaught Place..."
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          required
                          list="post-req-areas-list"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                        />
                        <datalist id="post-req-areas-list">
                          {(POPULAR_AREAS_BY_CITY[city] || []).map((a) => (
                            <option key={a} value={a} />
                          ))}
                        </datalist>

                        {/* Popular Areas chips for selected city */}
                        {POPULAR_AREAS_BY_CITY[city] && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-2">
                            {POPULAR_AREAS_BY_CITY[city].slice(0, 6).map((popArea) => (
                              <button
                                key={popArea}
                                type="button"
                                onClick={() => setArea(popArea)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                  area === popArea ? 'bg-orange-100 text-[#f07d4a] border border-orange-300 font-bold' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {popArea}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Venue Name / Address (Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grand Ballroom, JW Marriott, Hotel Sayaji, Private Lawn, Home..."
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Date, Time & Guests Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                      <span className="w-6 h-6 rounded-full bg-[#17233d] text-white text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Event Date, Timing & Guest Count</h2>
                        <p className="text-xs text-slate-500 font-medium">Helps vendors plan inventory and crew availability</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#f07d4a]" />
                          <span>Event Date *</span>
                        </label>
                        <input
                          type="date"
                          value={eventDate}
                          min={todayIso()}
                          onChange={(e) => setEventDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                        />

                        {/* Quick Date Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-2">
                          <button
                            type="button"
                            onClick={() => setDateShortcut(7)}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            +1 Week
                          </button>
                          <button
                            type="button"
                            onClick={() => setDateShortcut(14)}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            +2 Weeks
                          </button>
                          <button
                            type="button"
                            onClick={() => setDateShortcut(30)}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            +1 Month
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Time Window</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                          />
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStartTime('09:00');
                              setEndTime('15:00');
                            }}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700"
                          >
                            Morning
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStartTime('18:00');
                              setEndTime('23:00');
                            }}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700"
                          >
                            Evening
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStartTime('09:00');
                              setEndTime('22:00');
                            }}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700"
                          >
                            Full Day
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#f07d4a]" />
                          <span>Estimated Guests *</span>
                        </label>
                        <input
                          type="number"
                          min="10"
                          step="10"
                          value={guestCount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGuestCount(val === '' ? '' : parseInt(val, 10) || 50);
                          }}
                          placeholder="e.g. 200"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                        />

                        <div className="flex items-center gap-1.5 pt-2">
                          {[50, 150, 250, 500].map((count) => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setGuestCount(count)}
                              className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition cursor-pointer ${
                                guestCount === count ? 'bg-[#f07d4a] text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Guest Tier cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {GUEST_TIERS.map((tier) => (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => setGuestCount(tier.count)}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between active:scale-95 ${
                            guestCount === tier.count
                              ? 'border-[#f07d4a] bg-orange-50/60 text-slate-900 font-bold'
                              : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block">{tier.label}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{tier.range}</span>
                          </div>
                          {guestCount === tier.count && <Check className="w-4 h-4 text-[#f07d4a] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: SPECS, EQUIPMENT & PHOTOS                                         */}
              {/* ========================================================================= */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#17233d] text-white text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">Requirement Title & Special Notes</h2>
                          <p className="text-xs text-slate-500 font-medium">Smart auto-generated title (editable anytime)</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">Step 3 of 4</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Requirement Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setIsTitleManual(true);
                        }}
                        required
                        placeholder="e.g. Stage Mandap Decor & DJ Sound for Wedding (200 Guests in Baner)"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                      />
                    </div>

                    {/* Equipment Checklist */}
                    {combinedSampleEquipments.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                          Recommended Equipments & Features (Click to include):
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {combinedSampleEquipments.map((eq) => {
                            const isSelected = selectedEquipments.includes(eq);
                            return (
                              <button
                                key={eq}
                                type="button"
                                onClick={() => toggleEquipment(eq)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border active:scale-95 ${
                                  isSelected
                                    ? 'bg-[#17233d] border-[#17233d] text-white shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                                <span>{eq}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Special Notes / Instructions for Vendors (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Looking for pastel roses and fairy light ceiling. Setup must be complete by 4:00 PM for pooja."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition"
                      />
                    </div>

                    {/* Photo Upload Card */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#f07d4a]" />
                          <span>Venue / Theme Inspiration Photos (Optional)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">Max 8 photos</span>
                      </label>

                      <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-5 bg-slate-50/70 transition text-center flex flex-col items-center justify-center">
                        <input
                          type="file"
                          id="req-custom-image-upload"
                          accept="image/*"
                          multiple
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
                              <Loader2 className="w-7 h-7 text-[#f07d4a] animate-spin" />
                              <span className="font-bold text-xs text-slate-700">Uploading photos to CDN...</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-full bg-white text-[#f07d4a] flex items-center justify-center shadow-xs">
                                <Upload className="w-5 h-5" />
                              </div>
                              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                                {customImages.length > 0 ? '+ Add More Photos' : 'Click to Upload Inspiration Images'}
                              </span>
                              <span className="text-[11px] text-slate-400">Supports JPG, PNG, WebP</span>
                            </>
                          )}
                        </label>

                        {uploadError && <p className="text-xs text-rose-600 font-medium mt-2">{uploadError}</p>}

                        {customImages.length > 0 && (
                          <div className="mt-4 w-full grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {customImages.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                {idx === 0 && (
                                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8.5px] font-black bg-[#f07d4a] text-white">
                                    Cover
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCustomImages((prev) => prev.filter((_, i) => i !== idx));
                                    if (idx === 0) setCustomImageUrl(customImages[1] || '');
                                  }}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer opacity-80 hover:opacity-100"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 4: BUDGET & REVERSE BIDDING SIMULATOR                                */}
              {/* ========================================================================= */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Budget Ceiling & Savings Simulator Card */}
                  <div className="rounded-3xl bg-gradient-to-br from-[#fffbf8] via-amber-50/50 to-[#fffbf8] border-2 border-amber-300 p-5 sm:p-7 shadow-xs space-y-5">
                    <div className="border-b border-amber-200 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#f07d4a] text-white text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <div>
                          <h2 className="text-base font-black text-slate-900">What is your maximum budget ceiling?</h2>
                          <p className="text-xs text-amber-900/80 font-medium">Vendors cannot bid higher than this. You will only receive lower, reverse-discounted bids.</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Min. 15% OFF Guaranteed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      <div className="sm:col-span-5 flex items-center bg-white border-2 border-[#f07d4a] rounded-2xl px-5 py-3.5 shadow-sm">
                        <span className="text-2xl sm:text-3xl font-black text-[#f07d4a] mr-2.5">₹</span>
                        <input
                          type="number"
                          step="500"
                          min="1000"
                          value={budget}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBudget(val === '' ? '' : parseInt(val, 10) || 0);
                          }}
                          placeholder="25000"
                          required
                          className="w-full text-right font-black text-slate-900 text-2xl sm:text-3xl focus:outline-none bg-transparent"
                        />
                      </div>

                      <div className="sm:col-span-7 grid grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                          <span className="text-[10.5px] text-slate-500 font-bold uppercase tracking-wider block">Max Allowed Vendor Bid</span>
                          <span className="text-slate-900 font-black text-lg sm:text-xl block mt-0.5 font-mono">
                            ₹{maxAcceptableBid.toLocaleString()}
                          </span>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl shadow-sm">
                          <span className="text-[10.5px] text-emerald-100 font-bold uppercase tracking-wider block">Your Guaranteed Savings</span>
                          <span className="text-white font-black text-lg sm:text-xl block mt-0.5 font-mono">
                            ≥ ₹{guaranteedMinSavings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Budget Presets */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-xs font-bold text-slate-500">Suggested Ceilings:</span>
                      {BUDGET_PRESETS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setBudget(amt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                            budget === amt ? 'bg-[#f07d4a] text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          ₹{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Review Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-base font-extrabold text-slate-900">Summary Review Before Posting</h3>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Ready to Receive Quotes
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9.5px] tracking-wider block mb-0.5">Occasion</span>
                        <span className="font-extrabold text-slate-900 block truncate">{eventType}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9.5px] tracking-wider block mb-0.5">Services</span>
                        <span className="font-extrabold text-slate-900 block truncate">{selectedCategories.join(', ')}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9.5px] tracking-wider block mb-0.5">Date & Venue</span>
                        <span className="font-extrabold text-slate-900 block truncate">{eventDate} • {area}, {city}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9.5px] tracking-wider block mb-0.5">Ceiling & Guests</span>
                        <span className="font-black text-emerald-700 block truncate">Max ₹{numericBudget.toLocaleString()} ({guestCount} Guests)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                      <p className="font-bold text-slate-900">Title: <span className="font-medium text-slate-700">{title}</span></p>
                      {description && <p className="text-slate-500 mt-1 font-medium">Notes: {description}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 safe-bottom">
                <div className="flex items-center gap-3 text-xs text-slate-600 w-full sm:w-auto">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm block truncate">100% Free to Post • Escrow Protected</span>
                    <span className="text-slate-500 text-[11px] sm:text-xs hidden sm:block">Zero obligation. Vendors compete to offer at least 15% discount.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                      className="px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="px-3.5 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 transition cursor-pointer border border-amber-200 flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="hidden sm:inline">Save Draft</span>
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 sm:flex-none px-6 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-orange-500 via-[#f07d4a] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 sm:flex-none px-7 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-orange-500 via-[#f07d4a] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <span>Publish & Get Bids</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column (4 cols on desktop): Live Dynamic Preview Card */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Live Marketplace Preview</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> What Vendors See
                </span>
              </div>

              {/* Card Thumbnail */}
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={customImages[0] || customImageUrl || activeCategory.image || '/hero_wedding_4k.jpg'}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#fff5f0] text-[#f07d4a] border border-[#ffd7c2]">
                  OPEN FOR BIDS
                </span>
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold">
                  {eventType}
                </span>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-xs font-bold flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 drop-shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    {area || city}
                  </span>
                  <span className="inline-flex items-center gap-1 drop-shadow-sm">
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    {guestCount || 200} guests
                  </span>
                </div>
              </div>

              {/* Title & Services */}
              <div>
                <p className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                  {title || 'Requirement Title Preview'}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {selectedCategories.slice(0, 3).map((cat) => (
                    <span key={cat} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                      {cat}
                    </span>
                  ))}
                  {selectedCategories.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-bold">+{selectedCategories.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Budget vs Max Allowed Bid */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget Ceiling</span>
                  <span className="text-base font-black text-slate-900 font-mono">₹{numericBudget.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Max Allowed Bid</span>
                  <span className="text-base font-black text-emerald-600 font-mono">₹{maxAcceptableBid.toLocaleString()}</span>
                </div>
              </div>

              {/* Guaranteed Savings Highlight */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                <span className="text-[11px] font-black text-emerald-800 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Minimum Guaranteed Savings
                </span>
                <span className="text-lg font-black text-emerald-700 font-mono block">
                  ≥ ₹{guaranteedMinSavings.toLocaleString()} (15% OFF)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
