import React, { useState, useRef } from 'react';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Palette,
  Tag,
  PartyPopper,
  Phone, 
  Star, 
  ArrowRight, 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Camera, 
  Volume2, 
  Utensils, 
  Flame, 
  Heart, 
  Tent, 
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Check,
  IndianRupee,
  X,
  Headphones,
  ArrowDown,
  ArrowUpRight,
  Percent,
  Package,
  Minus,
  Lock,
  Music,
  Cake,
  Briefcase,
  MoreHorizontal
} from 'lucide-react';
import type { Requirement, Booking, User, Category, Occasion } from '../types';
import { EVENT_CATEGORIES, FAQS, OCCASION_CARDS } from '../data/eventData';

const EVENT_TYPE_OPTIONS = [
  { 
    id: 'Wedding', 
    name: 'Wedding', 
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80'
  },
  { 
    id: 'Sangeet & Haldi', 
    name: 'Sangeet & Haldi', 
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80'
  },
  { 
    id: 'Reception', 
    name: 'Reception', 
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=80'
  },
  { 
    id: 'Birthday Bash', 
    name: 'Birthday Bash', 
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop&q=80'
  },
  { 
    id: 'Corporate Gala', 
    name: 'Corporate Gala', 
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=80'
  },
  { 
    id: 'Other Events', 
    name: 'Other Events', 
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&auto=format&fit=crop&q=80'
  },
];

const PACKAGE_SERVICE_OPTIONS = [
  { 
    id: 'decor', 
    name: 'Stage Decor', 
    price: 25000, 
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80',
    iconType: 'mandap' 
  },
  { 
    id: 'dj', 
    name: 'Sound & DJ', 
    price: 18000, 
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    iconType: 'speaker' 
  },
  { 
    id: 'catering', 
    name: 'Catering', 
    price: 45000, 
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=300&auto=format&fit=crop&q=80',
    iconType: 'catering' 
  },
  { 
    id: 'photo', 
    name: 'Photography', 
    price: 30000, 
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80',
    iconType: 'camera' 
  },
  { 
    id: 'video', 
    name: 'Videography', 
    price: 35000, 
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80',
    iconType: 'video' 
  },
  { 
    id: 'lighting', 
    name: 'Lighting & Truss', 
    price: 18000, 
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    iconType: 'lightbulb' 
  },
  { 
    id: 'mehendi', 
    name: 'Mehendi Artist', 
    price: 10000, 
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80',
    iconType: 'mehendi' 
  },
  { 
    id: 'makeup', 
    name: 'Makeup Artist', 
    price: 12000, 
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&auto=format&fit=crop&q=80',
    iconType: 'makeup' 
  },
  { 
    id: 'priest', 
    name: 'Priest & Rituals', 
    price: 12000, 
    image: 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=300&auto=format&fit=crop&q=80',
    iconType: 'priest' 
  },
];

interface RequesterViewProps {
  requirements: Requirement[];
  bookings: Booking[];
  categories: Category[];
  occasions?: Occasion[];
  currentUser: User;
  onOpenPostModal: (initialCategory?: string) => void;
  onAcceptBid: (requirementId: string, bidId: string) => Promise<void>;
  onOpenBookings: () => void;
  onOpenExplainer: () => void;
}

export const RequesterView: React.FC<RequesterViewProps> = ({
  requirements,
  bookings,
  categories = [],
  occasions = [],
  currentUser: _currentUser,
  onOpenPostModal,
  onAcceptBid,
  onOpenBookings,
  onOpenExplainer: _onOpenExplainer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Dynamic Occasions passed from Admin
  const displayOccasions: (Occasion | typeof OCCASION_CARDS[0])[] = (occasions && occasions.length > 0) ? occasions : OCCASION_CARDS;

  const renderOccasionIcon = (iconType?: string) => {
    switch (iconType) {
      case 'rings':
        return (
          <svg className="w-5 h-5 text-[#f95724]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="9" cy="12" r="4.5" />
            <circle cx="15" cy="12" r="4.5" />
          </svg>
        );
      case 'lotus':
        return (
          <svg className="w-5 h-5 text-[#f95724]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3C12 3 10 7.5 10 11C10 13.5 12 15 12 15C12 15 14 13.5 14 11C14 7.5 12 3 12 3Z" />
            <path d="M12 15C9.5 15 5 12 4 8C7 8 10 10.5 12 15Z" />
            <path d="M12 15C14.5 15 19 12 20 8C17 8 14 10.5 12 15Z" />
            <path d="M3 18C7 16 17 16 21 18" />
          </svg>
        );
      case 'corporate':
        return (
          <svg className="w-5 h-5 text-[#f95724]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'party':
        return (
          <svg className="w-5 h-5 text-[#f95724]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 21h8" />
            <path d="M12 15v6" />
            <path d="M5 4l7 7 7-7H5z" />
            <circle cx="12" cy="7" r="1" fill="currentColor" />
          </svg>
        );
      case 'birthday':
        return (
          <svg className="w-5 h-5 text-[#f95724]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
            <path d="M4 16s4-1 8-1 8 1 8 1" />
            <path d="M12 7V3" />
            <circle cx="12" cy="3" r="1" fill="currentColor" />
          </svg>
        );
      case 'music':
        return <Music className="w-5 h-5 text-[#f95724]" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-[#f95724]" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-[#f95724]" />;
      default:
        return <Calendar className="w-5 h-5 text-[#f95724]" />;
    }
  };

  // Search Bar States in Hero
  const [heroService, setHeroService] = useState('Decoration');
  const [heroLocation, setHeroLocation] = useState('Pune, Maharashtra');
  const [heroDate, setHeroDate] = useState('');

  // Interactive Event Package Builder State
  const [packageEventType, setPackageEventType] = useState('Wedding');
  const [packageGuests, setPackageGuests] = useState<number>(200);
  const [selectedPackageServices, setSelectedPackageServices] = useState<string[]>(['decor', 'dj', 'photo']);
  const [serviceFilterTab, setServiceFilterTab] = useState<'all' | 'popular' | 'decor' | 'entertainment' | 'food' | 'photo'>('all');
  const occasionScrollRef = useRef<HTMLDivElement>(null);

  const scrollOccasions = (direction: 'left' | 'right') => {
    if (occasionScrollRef.current) {
      occasionScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth'
      });
    }
  };

  const togglePackageService = (id: string) => {
    setSelectedPackageServices((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((s) => s !== id) : prev) : [...prev, id]
    );
  };

  // Base retail calculation with guest scaling for catering
  const baseRetailTotal = PACKAGE_SERVICE_OPTIONS
    .filter((s) => selectedPackageServices.includes(s.id))
    .reduce((acc, curr) => {
      if (curr.id === 'catering') {
        // Catering scales realistically with guest count (base ₹45,000 for 100 guests = ₹450/plate)
        const cateringPrice = Math.round((packageGuests / 100) * curr.price);
        return acc + cateringPrice;
      }
      return acc + curr.price;
    }, 0);

  const packageRetailTotal = baseRetailTotal;
  const estimatedWinningBid = Math.round(packageRetailTotal * 0.74); // 26% avg reverse-bidding savings
  const estimatedSavings = packageRetailTotal - estimatedWinningBid;

  const openReqs = requirements.filter((r) => r.status === 'OPEN' || r.status === 'ACCEPTED');
  const activeBookings = bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'AWAITING_PAYMENT');

  // Filtered requirements
  const filteredOpenReqs = openReqs.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.location.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || r.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.includes('DJ') || categoryName.includes('Sound')) return <Volume2 className="w-4 h-4 text-amber-500" />;
    if (categoryName.includes('Decor')) return <Palette className="w-4 h-4 text-pink-500" />;
    if (categoryName.includes('Photo')) return <Camera className="w-4 h-4 text-indigo-500" />;
    if (categoryName.includes('Cater')) return <Utensils className="w-4 h-4 text-emerald-500" />;
    if (categoryName.includes('Purohit') || categoryName.includes('Priest')) return <Flame className="w-4 h-4 text-orange-500" />;
    if (categoryName.includes('Mehendi')) return <Heart className="w-4 h-4 text-rose-500" />;
    if (categoryName.includes('Lighting')) return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    if (categoryName.includes('Tent') || categoryName.includes('Stage')) return <Tent className="w-4 h-4 text-cyan-500" />;
    return <Tag className="w-4 h-4 text-amber-500" />;
  };

  const getCategoryImage = (categoryName: string) => {
    const fromProps = (categories || []).find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (fromProps && fromProps.image) return fromProps.image;
    const match = EVENT_CATEGORIES.find(c => c.name.toLowerCase().includes(categoryName.toLowerCase()) || categoryName.toLowerCase().includes(c.name.toLowerCase()));
    return match ? match.image : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80';
  };

  return (
    <div className="w-full overflow-x-hidden bg-[#fdfbf7]">
      
      {/* ========================================================================= */}
      {/* 1. EXACT FULL-SCREEN HERO SECTION (Full Wide Screen 4K Canvas)            */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#fdfbf7] pt-20 sm:pt-32 lg:pt-36 pb-12 sm:pb-20 lg:pb-28">
        
        {/* Full-bleed Ultra 4K Luxury Floral Wedding Pavilion Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-[center_right] lg:bg-right bg-no-repeat pointer-events-none opacity-80 sm:opacity-100"
          style={{ backgroundImage: `url('/hero_wedding_bg.jpg')` }}
        >
          {/* Multi-stage luxury gradient fade for maximum text clarity & wide-screen elegance */}
          <div className="w-full h-full bg-gradient-to-r from-[#fdfbf7] via-[#fdfbf7]/98 sm:via-[#fdfbf7]/95 md:via-[#fdfbf7]/80 lg:via-[#fdfbf7]/45 to-transparent" />
        </div>

        {/* Subtle Ambient Warm Glow */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content Container (Expansive Full Wide Screen) */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-14">
          <div className="max-w-3xl space-y-3 sm:space-y-5">
            
            {/* Main Headline - Exactly 3 Clean Lines with Expanded Mobile Height */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0f172a] leading-[1.15] tracking-tight">
              Post your budget.<br />
              Vendors bid lower.<br />
              <span className="text-[#f95724]">You pick the best one.</span>
            </h1>

            <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-xl">
              You set the most you will pay. A vendor can win only by bidding at least 15% below that. You pay the bid plus a 10% fee, and EzzyGo holds the money until the event is done.
            </p>

            {/* Redesigned 100% Responsive Interactive Search / Requirement Bar */}
            <div className="w-full max-w-4xl bg-white rounded-2xl lg:rounded-full p-2 lg:p-2 lg:pl-6 lg:pr-2.5 shadow-xl shadow-slate-900/5 border border-slate-200/90 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 lg:gap-2">
              
              {/* Field 1: Service */}
              <div className="flex-1 bg-slate-50/60 lg:bg-transparent rounded-xl lg:rounded-none px-3.5 py-2.5 lg:p-0 lg:py-1.5 lg:px-2 flex items-center gap-3 min-w-0 border border-slate-100 lg:border-none">
                <div className="w-7 h-7 rounded-lg lg:rounded-none bg-orange-100/70 lg:bg-transparent flex items-center justify-center text-[#f95724] shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] lg:text-[13px] font-bold text-slate-900 leading-tight">
                    What service do you need?
                  </label>
                  <input
                    type="text"
                    value={heroService}
                    onChange={(e) => setHeroService(e.target.value)}
                    placeholder="e.g. Decoration, Catering, DJ..."
                    className="w-full text-xs text-slate-700 font-medium placeholder-slate-400 focus:outline-none bg-transparent pt-0.5 truncate"
                  />
                </div>
              </div>

              {/* Vertical Divider 1 */}
              <div className="hidden lg:block h-8 w-[1px] bg-slate-200/90 shrink-0 mx-1" />

              {/* Sub-grid for Location & Date on mobile/tablet */}
              <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-2 flex-[1.4] min-w-0">
                
                {/* Field 2: Location */}
                <div className="flex-1 bg-slate-50/60 lg:bg-transparent rounded-xl lg:rounded-none px-3 py-2.5 lg:p-0 lg:py-1.5 lg:px-3 flex items-center gap-2.5 min-w-0 border border-slate-100 lg:border-none">
                  <div className="w-6 h-6 rounded-md lg:rounded-none bg-orange-100/70 lg:bg-transparent flex items-center justify-center text-[#f95724] shrink-0">
                    <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] lg:text-[13px] font-bold text-slate-900 leading-tight">
                      Location
                    </label>
                    <div className="relative flex items-center cursor-pointer pt-0.5 w-full">
                      <select
                        value={heroLocation}
                        onChange={(e) => setHeroLocation(e.target.value)}
                        className="text-xs text-slate-700 font-medium focus:outline-none bg-transparent cursor-pointer appearance-none pr-4 w-full truncate"
                      >
                        <option value="Pune, Maharashtra">Pune, MH</option>
                        <option value="Hyderabad, Telangana">Hyderabad, TS</option>
                        <option value="Mumbai, Maharashtra">Mumbai, MH</option>
                        <option value="Bangalore, Karnataka">Bangalore, KA</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 pointer-events-none shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Vertical Divider 2 */}
                <div className="hidden lg:block h-8 w-[1px] bg-slate-200/90 shrink-0 mx-1" />

                {/* Field 3: Date */}
                <div className="flex-1 bg-slate-50/60 lg:bg-transparent rounded-xl lg:rounded-none px-3 py-2.5 lg:p-0 lg:py-1.5 lg:px-3 flex items-center gap-2.5 min-w-0 relative border border-slate-100 lg:border-none">
                  <div className="w-6 h-6 rounded-md lg:rounded-none bg-orange-100/70 lg:bg-transparent flex items-center justify-center text-[#f95724] shrink-0">
                    <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] lg:text-[13px] font-bold text-slate-900 leading-tight">
                      Event Date
                    </label>
                    <div className="relative pt-0.5">
                      <span className="text-xs text-slate-700 font-medium block truncate">
                        {heroDate ? new Date(heroDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Pick date'}
                      </span>
                      <input
                        type="date"
                        value={heroDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setHeroDate(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Submit Action Button */}
              <button
                onClick={() => onOpenPostModal(heroService)}
                className="w-full lg:w-auto px-6 py-3.5 rounded-xl lg:rounded-full bg-gradient-to-r from-[#f95724] to-orange-500 hover:from-[#e04818] hover:to-[#f95724] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <span>Post Requirement</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>

        {/* Organic Wave Divider Transition (Blends into Section 2) */}
        <div className="absolute bottom-0 inset-x-0 overflow-hidden leading-none z-0">
          <svg
            className="relative block w-full h-8 sm:h-12 text-[#fffbf7]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. FOR EVERY OCCASION - FIND THE RIGHT PROFESSIONALS (Seamless Arc Flow)   */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#fffbf7] via-[#fdf5eb] to-[#fbf0e2] pt-6 sm:pt-10 pb-16 sm:pb-22">
        
        {/* Curvy Flowing 3D Golden Silk Ribbon Background Waves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Silk Wave */}
          <svg className="absolute top-0 left-0 w-full h-36 opacity-30 text-[#e6b980]" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
            <path d="M0,40 C320,130 640,-30 960,60 C1280,150 1380,40 1440,20 L1440,0 L0,0 Z" fill="url(#silk-grad-top)" />
            <defs>
              <linearGradient id="silk-grad-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#fb923c" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Smooth Golden Glow Ribbon */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-amber-200/30 via-orange-100/40 to-transparent rounded-[100%] blur-3xl transform -rotate-12" />

          {/* Bottom Silk Wave */}
          <svg className="absolute bottom-0 left-0 w-full h-32 opacity-35 text-[#e6b980]" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="none">
            <path d="M0,120 C360,30 720,160 1080,70 C1260,25 1380,90 1440,110 L1440,180 L0,180 Z" fill="url(#silk-grad-bot)" />
            <defs>
              <linearGradient id="silk-grad-bot" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Decorative Botanical Corner Foliage (Top-Left) */}
        <div className="absolute top-0 left-0 w-40 sm:w-56 h-40 sm:h-56 opacity-45 pointer-events-none">
          <svg viewBox="0 0 220 220" fill="none">
            <path d="M0,0 C70,25 130,90 150,160 C110,180 45,135 0,70 Z" fill="#4d7c0f" fillOpacity="0.35" />
            <path d="M25,0 C80,35 120,100 110,170 C75,135 35,80 15,25 Z" fill="#65a30d" fillOpacity="0.4" />
            <circle cx="55" cy="55" r="16" fill="#f87171" fillOpacity="0.45" />
            <circle cx="50" cy="50" r="11" fill="#fca5a5" fillOpacity="0.55" />
            <circle cx="95" cy="85" r="9" fill="#fb923c" fillOpacity="0.5" />
          </svg>
        </div>

        {/* Decorative Botanical Corner Foliage (Bottom-Left) */}
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 opacity-50 pointer-events-none">
          <svg viewBox="0 0 260 260" fill="none">
            <circle cx="35" cy="225" r="50" fill="#fb923c" fillOpacity="0.25" />
            <circle cx="75" cy="190" r="38" fill="#f43f5e" fillOpacity="0.3" />
            <circle cx="80" cy="185" r="24" fill="#fda4af" fillOpacity="0.4" />
            <circle cx="125" cy="220" r="18" fill="#f97316" fillOpacity="0.35" />
            <path d="M0,195 C45,150 130,160 155,225 C90,260 25,235 0,195 Z" fill="#365314" fillOpacity="0.3" />
            <path d="M35,160 C75,130 140,140 130,195 Z" fill="#4d7c0f" fillOpacity="0.3" />
          </svg>
        </div>

        {/* Decorative Botanical Corner Foliage (Bottom-Right) */}
        <div className="absolute bottom-0 right-0 w-48 sm:w-64 h-48 sm:h-64 opacity-45 pointer-events-none rotate-180">
          <svg viewBox="0 0 220 220" fill="none">
            <path d="M0,0 C70,25 130,90 150,160 C110,180 45,135 0,70 Z" fill="#4d7c0f" fillOpacity="0.35" />
            <path d="M25,0 C80,35 120,100 110,170 C75,135 35,80 15,25 Z" fill="#65a30d" fillOpacity="0.4" />
            <circle cx="65" cy="65" r="8" fill="#f87171" fillOpacity="0.6" />
            <circle cx="105" cy="95" r="6" fill="#fb923c" fillOpacity="0.5" />
          </svg>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading & Curvy Pill CTA */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-5 sm:space-y-6">
              
              {/* Eyebrow with horizontal line */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#f95724]">
                  FOR EVERY OCCASION
                </span>
                <div className="w-12 h-[2.5px] bg-[#f95724] rounded-full" />
              </div>

              {/* Headline in Editorial Serif */}
              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-[56px] font-black text-[#0f172a] leading-[1.06] tracking-tight">
                Find the Right <br />
                <span className="text-[#f95724]">Professionals</span>
              </h2>

              {/* Subtitle */}
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-md font-medium">
                From weddings to festivals, get the best deals from trusted local professionals.
              </p>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenPostModal()}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#f95724] to-[#ff6b3d] hover:from-[#e04818] hover:to-[#f95724] text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50 hover:scale-[1.03] active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>Explore All Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Column: 3D Curved Panoramic Arc Gallery Track */}
            <div className="lg:col-span-8 xl:col-span-8 relative">
              
              {/* Left Floating Carousel Navigation Arrow */}
              <button
                onClick={() => {
                  const track = document.getElementById('occasion-cards-track');
                  if (track) track.scrollBy({ left: -280, behavior: 'smooth' });
                }}
                aria-label="Previous occasions"
                className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-2xl shadow-slate-900/25 border border-amber-100 flex items-center justify-center text-[#f95724] hover:bg-orange-50 hover:scale-115 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Right Floating Carousel Navigation Arrow */}
              <button
                onClick={() => {
                  const track = document.getElementById('occasion-cards-track');
                  if (track) track.scrollBy({ left: 280, behavior: 'smooth' });
                }}
                aria-label="Next occasions"
                className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-2xl shadow-slate-900/25 border border-amber-100 flex items-center justify-center text-[#f95724] hover:bg-orange-50 hover:scale-115 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* 3D Panoramic Arc Track */}
              <div
                id="occasion-cards-track"
                className="flex items-center gap-5 sm:gap-6 overflow-x-auto py-10 px-6 sm:px-8 scrollbar-none scroll-smooth [perspective:1400px] [transform-style:preserve-3d]"
              >
                {displayOccasions.map((occ, idx) => {
                  // Pre-calculated 3D arc transforms for the panoramic curve matching the screenshot
                  const get3DTransform = () => {
                    if (idx === 0) return 'lg:[transform:rotateY(14deg)_translateY(-8px)_rotateZ(-2.5deg)_scale(0.97)] lg:hover:[transform:rotateY(0deg)_translateY(-16px)_translateZ(40px)_scale(1.05)]';
                    if (idx === 1) return 'lg:[transform:rotateY(6deg)_translateY(-2px)_rotateZ(-1deg)_scale(0.99)] lg:hover:[transform:rotateY(0deg)_translateY(-16px)_translateZ(40px)_scale(1.05)]';
                    if (idx === 2) return 'lg:[transform:rotateY(0deg)_translateY(4px)_scale(1.02)] lg:hover:[transform:rotateY(0deg)_translateY(-16px)_translateZ(45px)_scale(1.06)]';
                    if (idx === 3) return 'lg:[transform:rotateY(-8deg)_translateY(-2px)_rotateZ(1.5deg)_scale(0.99)] lg:hover:[transform:rotateY(0deg)_translateY(-16px)_translateZ(40px)_scale(1.05)]';
                    return 'lg:[transform:rotateY(-16deg)_translateY(-8px)_rotateZ(3deg)_scale(0.96)] lg:hover:[transform:rotateY(0deg)_translateY(-16px)_translateZ(40px)_scale(1.05)]';
                  };

                  const occKey = (occ as any)._id || occ.id || occ.slug || `occ-${idx}`;

                  return (
                    <div
                      key={occKey}
                      onClick={() => onOpenPostModal(occ.name)}
                      className={`relative w-[185px] sm:w-[230px] lg:w-[252px] h-[260px] sm:h-[340px] lg:h-[380px] shrink-0 rounded-2xl sm:rounded-[34px] lg:rounded-[38px] overflow-hidden group cursor-pointer transition-all duration-500 ease-out border border-white/40 shadow-md sm:shadow-[0_22px_45px_-12px_rgba(30,20,10,0.28)] hover:shadow-[0_35px_65px_-15px_rgba(249,87,36,0.35)] ${get3DTransform()}`}
                    >
                      {/* Background Card Image with subtle zoom on hover */}
                      <img
                        src={occ.image}
                        alt={occ.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/occasion_parties.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                      />

                      {/* 3D Cylindrical lighting overlay: Glass top reflection + deep dark bottom */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/85 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

                      {/* Top Curvy Glass Highlight Sheen */}
                      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />

                      {/* Bottom Occasion Badge & Circular Action Arrow */}
                      <div className="absolute bottom-5 inset-x-3.5 sm:inset-x-4 flex items-center justify-between z-10">
                        
                        {/* Left side: Circular White Icon Badge + Occasion Name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#f95724] shadow-lg shadow-black/30 shrink-0 group-hover:scale-105 transition-transform">
                            {renderOccasionIcon(occ.iconType)}
                          </div>
                          <span className="font-editorial text-base sm:text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight truncate">
                            {occ.name}
                          </span>
                        </div>

                        {/* Right side: Circular Action Arrow */}
                        <div className="w-8 h-8 rounded-full border border-white/70 bg-black/35 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-[#f95724] group-hover:border-[#f95724] group-hover:scale-110 shadow-md transition-all duration-300">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2.5 VERIFIED EVENT SERVICE CATEGORIES CATALOG (Live Dynamic Grid)         */}
      {/* ========================================================================= */}
      <section id="services-grid" className="relative w-full overflow-hidden bg-gradient-to-b from-[#fbf0e2] to-[#fffbf7] py-10 sm:py-14">
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-14">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#f95724]">
                  SERVICE CATALOG
                </span>
                <div className="w-12 h-[2.5px] bg-[#f95724] rounded-full" />
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
                Explore Event Services & <span className="text-[#f95724]">Benchmark Rates</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
                Browse verified category catalogs. Select any category to post your requirement and watch verified vendors bid with lower prices.
              </p>
            </div>

            <button
              onClick={() => onOpenPostModal()}
              className="px-6 py-3 rounded-full bg-[#f95724] hover:bg-[#e04818] text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition whitespace-nowrap"
            >
              <span>+ Post Custom Need</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {(categories && categories.length > 0 ? categories : [
              { _id: 'cat-1', name: 'DJ & Sound Systems', slug: 'dj-sound', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', description: 'Line arrays, active tops, Pioneer consoles', avgPriceRange: '₹8,000 - ₹45,000' },
              { _id: 'cat-2', name: 'Stage & Mandap Decoration', slug: 'decor', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80', description: 'Flower arches, fairy light canopies, mandap setups', avgPriceRange: '₹15,000 - ₹1,20,000' },
              { _id: 'cat-3', name: '4K Photography & Drone', slug: 'photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80', description: 'Cinematic 4K coverage, drone flybys, live stream', avgPriceRange: '₹12,000 - ₹65,000' },
              { _id: 'cat-4', name: 'Catering Buffets', slug: 'catering', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format&fit=crop&q=80', description: 'Live counters, traditional thalis, chaat stalls', avgPriceRange: '₹350 - ₹1,200 / plate' },
            ]).map((cat) => {
              const bannerImg = cat.image && cat.image.trim().length > 0
                ? cat.image
                : getCategoryImage(cat.name);

              return (
                <div
                  key={cat._id || cat.slug || cat.name}
                  onClick={() => onOpenPostModal(cat.name)}
                  className="group rounded-3xl bg-white border border-slate-200/90 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 transition-all duration-300 cursor-pointer"
                >
                  {/* Category Image Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={bannerImg}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-[#f95724] shadow-sm flex items-center gap-1.5">
                        {getCategoryIcon(cat.name)}
                        <span>{cat.name}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                        Benchmark Rate
                      </span>
                      <span className="text-xs font-black bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20">
                        {cat.avgPriceRange || '₹10,000 - ₹50,000'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Action Button */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#f95724] transition-colors leading-snug">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {cat.description || 'Verified equipment & professional crew ready for reverse-bidding.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Min. 15% Savings Rule
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#f95724] font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>Get Bids</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE SMART EVENT PACKAGE BUILDER & LIVE REVERSE-BID MATRIX       */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#fbf0e2] via-[#fdf6ee] to-[#fbf0e2] py-7 sm:py-9 lg:py-11">
        
        {/* Full Section Seamless Connected Background Layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          
          {/* Top Seamless Flow Wave matching Section 2 */}
          <svg className="absolute top-0 left-0 w-full h-24 opacity-25 text-[#e6b980]" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
            <path d="M0,0 C360,60 720,10 1080,45 C1260,65 1380,20 1440,0 L1440,0 L0,0 Z" fill="url(#silk-connect-top)" />
            <defs>
              <linearGradient id="silk-connect-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Left Floral Peach Ambient Glow */}
          <div className="absolute top-10 left-0 w-[450px] h-[450px] bg-gradient-to-br from-orange-200/35 via-amber-100/25 to-transparent rounded-full blur-3xl transform -translate-x-20" />
          
          {/* Right Seamless Gazebo Backdrop with Luxury Radial Alpha Mask */}
          <div className="absolute top-0 right-0 w-full lg:w-3/5 h-full opacity-40 lg:opacity-55 [mask-image:radial-gradient(ellipse_at_top_right,black_30%,transparent_75%)]">
            <img 
              src="/hero_wedding_bg.jpg" 
              alt="Luxury Floral Mandap Gazebo" 
              className="w-full h-full object-cover object-right-top filter saturate-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fbf0e2] via-transparent to-transparent" />
          </div>

          {/* Bottom Golden Glow Flow */}
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[200px] bg-gradient-to-t from-orange-200/20 via-amber-100/15 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
          {/* Section Header with Badges, Title, Subtitle, and 3-Step Flow */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left Header Title & Subtitle */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/90 border border-orange-200/80 text-[#f95724] text-xs font-black tracking-wider uppercase">
                  <Package className="w-3.5 h-3.5 text-[#f95724]" />
                  <span>PACKAGE BUILDER</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>34 Verified Pros Active</span>
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f172a] tracking-tight leading-tight">
                Plan Your Event, <span className="text-[#f95724]">Your Way</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-medium">
                Select your occasion, choose the services you need, and get the best quotes through reverse bidding.
              </p>
            </div>

            {/* Right Side 3-Step Process Flow Pill */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-amber-200/70 shadow-sm text-xs font-bold shrink-0 self-start lg:self-center">
              <span className="text-[#f95724] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#f95724] text-white flex items-center justify-center text-[11px] font-black shadow-xs">1</span>
                <span>Select Services</span>
              </span>
              <span className="text-slate-300 font-normal">→</span>
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">2</span>
                <span>Compare Bids</span>
              </span>
              <span className="text-slate-300 font-normal">→</span>
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">3</span>
                <span>Book</span>
              </span>
            </div>

          </div>

          {/* Main 2-Column Package Builder Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Column: Configurator (Step 1 + Step 2 + Step 3) */}
            <div className="lg:col-span-8 bg-white sm:bg-white/95 sm:backdrop-blur-md rounded-2xl sm:rounded-3xl border border-amber-200/50 p-3.5 sm:p-6 shadow-sm sm:shadow-xl shadow-slate-900/5 space-y-5 sm:space-y-6 flex flex-col justify-between">
              
              {/* Step 1: Select Occasion (6 Cards in 1 Row) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      1
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                        Select Occasion
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose the type of event you are planning
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => scrollOccasions('left')}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-orange-100 hover:text-[#f95724] text-slate-600 flex items-center justify-center transition border border-slate-200/80 cursor-pointer shadow-2xs"
                        title="Scroll Left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollOccasions('right')}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-orange-100 hover:text-[#f95724] text-slate-600 flex items-center justify-center transition border border-slate-200/80 cursor-pointer shadow-2xs"
                        title="Scroll Right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-[#f95724] text-xs font-bold border border-amber-200/80 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Events</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Occasion Cards Horizontal Scroller */}
                <div ref={occasionScrollRef} className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {EVENT_TYPE_OPTIONS.map((evt) => {
                    const isSelected = packageEventType === evt.id;
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => setPackageEventType(evt.id)}
                        className={`group relative min-w-[120px] sm:min-w-[135px] flex-1 shrink-0 snap-start rounded-2xl p-1.5 border transition-all duration-200 cursor-pointer flex flex-col items-center text-center bg-white ${
                          isSelected
                            ? 'border-2 border-[#f95724] shadow-md shadow-orange-500/10'
                            : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 z-10 w-4 h-4 rounded-full bg-[#f95724] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="relative w-full h-16 sm:h-18 rounded-xl overflow-hidden mb-3">
                          <img
                            src={evt.image}
                            alt={evt.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Centered circular icon overlapping the bottom */}
                          <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white shadow-sm border flex items-center justify-center ${
                            isSelected ? 'border-orange-300 text-[#f95724]' : 'border-slate-200 text-slate-600'
                          }`}>
                            {evt.id === 'Wedding' && <Heart className="w-3 h-3 text-[#f95724] fill-orange-100" />}
                            {evt.id === 'Sangeet & Haldi' && <Music className="w-3 h-3 text-pink-500" />}
                            {evt.id === 'Reception' && <PartyPopper className="w-3 h-3 text-amber-500" />}
                            {evt.id === 'Birthday Bash' && <Cake className="w-3 h-3 text-indigo-500" />}
                            {evt.id === 'Corporate Gala' && <Briefcase className="w-3 h-3 text-blue-600" />}
                            {evt.id === 'Other Events' && <MoreHorizontal className="w-3 h-3 text-slate-600" />}
                          </div>
                        </div>
                        <span className={`text-xs font-bold truncate w-full pt-1 pb-1 ${
                          isSelected ? 'text-[#f95724]' : 'text-slate-800'
                        }`}>
                          {evt.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Services (Filter Tabs + 3x3 Grid) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      2
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                        Select Services
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose the services you need for your event
                      </p>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: 'All Services' },
                      { id: 'popular', label: '🔥 Popular' },
                      { id: 'decor', label: '🌸 Decoration' },
                      { id: 'entertainment', label: '🎵 Entertainment' },
                      { id: 'food', label: '🍴 Food' },
                      { id: 'photo', label: '📷 Photography' },
                    ].map((tab) => {
                      const isActive = serviceFilterTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setServiceFilterTab(tab.id as any)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                            isActive
                              ? 'bg-[#f95724] text-white shadow-xs'
                              : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3x3 Grid of 9 Landscape Service Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PACKAGE_SERVICE_OPTIONS.filter((srv) => {
                    if (serviceFilterTab === 'all') return true;
                    if (serviceFilterTab === 'popular') return ['decor', 'dj', 'catering', 'photo'].includes(srv.id);
                    if (serviceFilterTab === 'decor') return ['decor', 'lighting'].includes(srv.id);
                    if (serviceFilterTab === 'entertainment') return ['dj', 'lighting'].includes(srv.id);
                    if (serviceFilterTab === 'food') return ['catering', 'priest'].includes(srv.id);
                    if (serviceFilterTab === 'photo') return ['photo', 'video'].includes(srv.id);
                    return true;
                  }).map((srv) => {
                    const isSelected = selectedPackageServices.includes(srv.id);
                    const displayPrice = srv.id === 'catering'
                      ? Math.round((packageGuests / 100) * srv.price)
                      : srv.price;

                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => togglePackageService(srv.id)}
                        className={`p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 text-left group bg-white ${
                          isSelected
                            ? 'border-2 border-[#f95724] shadow-xs'
                            : 'border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={srv.image}
                            alt={srv.name}
                            className="w-12 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                          />
                          <div className="min-w-0">
                            <span className="block text-xs font-black text-slate-900 leading-tight truncate">
                              {srv.name}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {srv.id === 'catering' ? `₹${displayPrice.toLocaleString()} (${packageGuests}p)` : `₹${srv.price.toLocaleString()}`}
                            </span>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'bg-[#f95724] text-white' 
                            : 'border-2 border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Estimated Guests (Stepper + Slider + Quick Pills) */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#f95724] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    3
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                      Estimated Guests
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tell us how many people will attend your event
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Stepper with Users Icon */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 text-[#f95724] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPackageGuests((prev) => Math.max(50, prev - 50))}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold text-xs text-slate-900 min-w-[36px] text-center font-mono">
                      {packageGuests}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPackageGuests((prev) => Math.min(2000, prev + 50))}
                      className="w-7 h-7 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#f95724] font-black text-xs flex items-center justify-center border border-orange-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={packageGuests}
                    onChange={(e) => setPackageGuests(Number(e.target.value))}
                    className="w-28 sm:w-36 h-2 rounded-full appearance-none cursor-pointer accent-[#f95724] bg-slate-200"
                  />

                  {/* Quick Pills */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[50, 200, 500, 1000].map((num) => {
                      const isMatch = packageGuests === num || (num === 1000 && packageGuests >= 1000);
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPackageGuests(num)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                            isMatch
                              ? 'bg-[#f95724] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {num === 1000 ? '1000+' : num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: "Your Event Package" Card */}
            <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-3xl border border-amber-200/70 p-5 sm:p-6 shadow-xl shadow-slate-900/5 flex flex-col justify-between space-y-4">
              
              {/* Header */}
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-2xl font-black text-[#0f172a] tracking-tight">
                    Your Event Package
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#f95724] text-[11px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f95724] animate-pulse"></span>
                    <span>LIVE ESTIMATE</span>
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {selectedPackageServices.length} Services Selected • {packageEventType}
                </p>
              </div>

              {/* Dynamic List of Selected Services */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {PACKAGE_SERVICE_OPTIONS.filter((s) => selectedPackageServices.includes(s.id)).map((srv) => {
                  const srvDisplayPrice = srv.id === 'catering'
                    ? Math.round((packageGuests / 100) * srv.price)
                    : srv.price;

                  return (
                    <div key={srv.id} className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={srv.image} 
                          alt={srv.name} 
                          className="w-10 h-9 rounded-xl object-cover shrink-0 border border-slate-100" 
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {srv.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-black text-slate-800 font-mono">
                          ₹{srvDisplayPrice.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePackageService(srv.id)}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reverse Bidding Price Comparison Simulator */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Standard Market Rate:</span>
                  <span className="text-slate-400 line-through font-mono font-bold">
                    ₹{packageRetailTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-black text-slate-900 block leading-tight">
                      EzzyGo Target Bid Price:
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      Reverse-Bid Estimate
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#f95724] font-mono">
                    ₹{estimatedWinningBid.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Green Savings Banner */}
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                    ₹
                  </div>
                  <span className="text-xs font-bold text-emerald-950">
                    Est. Savings: ₹{estimatedSavings.toLocaleString()} (26%)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Guaranteed Best
                </span>
              </div>

              {/* CTA Action Button */}
              <button
                type="button"
                onClick={() => onOpenPostModal(`${packageEventType} Package (${selectedPackageServices.length} services, ${packageGuests} guests)`)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f95724] to-[#ff6b3d] hover:from-[#e04818] hover:to-[#f95724] text-white font-black text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
              >
                <span>Get Competitive Quotes Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 3 Micro Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
                  <Shield className="w-4 h-4 text-[#f95724] shrink-0" />
                  <span>Verified Vendors</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
                  <IndianRupee className="w-4 h-4 text-[#f95724] shrink-0" />
                  <span>Best Bids</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
                  <Lock className="w-4 h-4 text-[#f95724] shrink-0" />
                  <span>Escrow Safe</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. EXACT LIVE REVERSE-BIDDING AUCTIONS HUB (MATCHING SCREENSHOT)          */}
      {/* ========================================================================= */}
      <section id="requirements-hub" className="relative w-full bg-[#f8fafc] py-12 sm:py-16">
        <div className="relative z-10 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 space-y-7">
          <div className="max-w-3xl space-y-2">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
              How a booking works
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Vendors do not set the price. You do. They bid under your budget, and you choose one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-sm font-semibold text-[#f95724]">1</span>
              <h3 className="text-base font-semibold text-slate-900">Post what you need</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Add the service, place, date, and the most you will pay.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-sm font-semibold text-[#f95724]">2</span>
              <h3 className="text-base font-semibold text-slate-900">Vendors bid lower</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A bid can be accepted only if it is at least 15% below your budget.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-sm font-semibold text-[#f95724]">3</span>
              <h3 className="text-base font-semibold text-slate-900">Choose and pay</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                You pay the bid plus a 10% fee. EzzyGo holds that money.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-sm font-semibold text-[#f95724]">4</span>
              <h3 className="text-base font-semibold text-slate-900">Release after the event</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When the work is done, you release the vendor's price. EzzyGo keeps the fee.
              </p>
            </div>
          </div>

          {/* Navigation Tabs and New Post Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap bg-gradient-to-r from-orange-500 to-[#f95724] text-white shadow-md shadow-orange-500/25">
                <span>My open requests</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-[#c83c12] text-white">
                  {openReqs.length}
                </span>
              </span>

              <button
                onClick={onOpenBookings}
                className="px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap text-slate-700 hover:text-slate-900 bg-white/90 border border-slate-200/90 hover:border-emerald-300"
              >
                <span>My bookings</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-800">
                  {activeBookings.length}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenPostModal()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-[#f95724] hover:from-orange-600 hover:to-[#f95724] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>
            </div>
          </div>

          {/* Search and Category Filter Bar matching screenshot */}
          {openReqs.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, category, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#f95724] focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {['All', ...(categories && categories.length > 0 ? categories.map((c) => c.name) : ['DJ & Sound Systems', 'Stage & Mandap Decoration', '4K Photography & Drone', 'Catering Buffets'])].map((catLabel) => {
                  const isMatch = selectedCategoryFilter === catLabel;

                  return (
                    <button
                      key={catLabel}
                      onClick={() => setSelectedCategoryFilter(catLabel)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        isMatch
                          ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {catLabel}
                    </button>
                  );
                })}

              </div>
            </div>
          )}

          {/* OPEN REQUIREMENTS (AUCTIONS) */}
            <div className="space-y-4 sm:space-y-5">
              {filteredOpenReqs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#f95724] flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">No open requests</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    Post a request with your budget. Vendors will bid at least 15% below it.
                  </p>
                  <button
                    onClick={() => onOpenPostModal()}
                    className="px-6 py-3 rounded-xl bg-[#f95724] hover:bg-[#e04818] text-white font-bold text-xs shadow-md shadow-[#f95724]/20 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Event Need Now</span>
                  </button>
                </div>
              ) : (
                filteredOpenReqs.map((req) => {
                  const isExpanded = expandedReqId === req._id;
                  const eligibleBids = (req.bids || []).filter((b) => b.isEligibleForAccept);
                  const reqImage = req.imageUrl || getCategoryImage(req.category);

                  // Calculate discount percentage if lowest bid exists
                  const discountPct = req.lowestBid 
                    ? Math.round(((req.budget - req.lowestBid) / req.budget) * 100) 
                    : 0;

                  return (
                    <div
                      key={req._id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-lg transition-all overflow-hidden"
                    >
                      {/* Requirement Landscape Card Bar */}
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
                          
                          {/* Left Column: Landscape Image with Live Bidding Badge */}
                          <div className="w-full lg:w-56 h-36 rounded-2xl overflow-hidden relative shrink-0 bg-slate-100 shadow-xs border border-slate-100">
                            {/* Floating Green Live Bidding Badge */}
                            <div className="absolute top-2.5 left-2.5 z-10">
                              <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-semibold">
                                Open for bids
                              </span>
                            </div>

                            <img
                              src={reqImage}
                              alt={req.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Middle Column: Category Tags, Title, Description, Location */}
                          <div className="flex-1 space-y-2 min-w-0">
                            
                            {/* Tags Row */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                {req.category}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                              {req.title}
                            </h3>

                            {/* Description */}
                            {req.description && (
                              <p className="text-xs text-slate-500 line-clamp-1">
                                {req.description}
                              </p>
                            )}

                            {/* Meta Info Row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                              <span className="flex items-center gap-1 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{req.location.area}, {req.location.city}</span>
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{req.eventDate} ({req.timeWindow.start} - {req.timeWindow.end})</span>
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{req.guestCount} Guests</span>
                              </span>
                            </div>

                          </div>

                          {/* Right Column: Host Budget Ceiling + Lowest Active Bid + Action Button */}
                          <div className="grid grid-cols-2 sm:flex items-center justify-between lg:justify-end gap-2.5 sm:gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0 w-full lg:w-auto">
                            
                            {/* Host Budget Ceiling */}
                            <div className="text-center sm:text-right p-2 rounded-2xl bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-100">
                              <span className="text-xs text-slate-500 font-medium block leading-none mb-1">
                                Your budget
                              </span>
                              <span className="text-sm sm:text-base font-semibold text-slate-800">
                                ₹{req.budget.toLocaleString()}
                              </span>
                              <span className="text-xs text-[#f95724] font-medium block mt-1">
                                Accept ₹{req.maxAcceptableBid.toLocaleString()} or less
                              </span>
                            </div>

                            {/* Lowest Active Bid (Green Highlight Box) */}
                            <div className="p-2 sm:p-3 rounded-2xl bg-[#eafaf1] border border-[#bbf0d2] text-center sm:text-right sm:min-w-[110px]">
                              <span className="text-xs text-emerald-800 font-medium block leading-none mb-1">
                                Lowest bid
                              </span>
                              <span className="text-sm sm:text-xl font-semibold text-emerald-700">
                                {req.lowestBid ? `₹${req.lowestBid.toLocaleString()}` : 'No bids yet'}
                              </span>
                              {req.lowestBid && (
                                <span className="text-[10px] text-emerald-700 font-bold flex items-center justify-center sm:justify-end gap-0.5 mt-0.5">
                                  <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>{discountPct}% lower</span>
                                </span>
                              )}
                            </div>

                            {/* Countdown & Action Button */}
                            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center sm:min-w-[115px] pt-1 sm:pt-0">
                              <button
                                onClick={() => setExpandedReqId(isExpanded ? null : req._id)}
                                className="w-full py-2.5 sm:py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-[#f95724] hover:from-orange-600 hover:to-[#f95724] text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                              >
                                <span>{isExpanded ? 'Hide bids' : 'See bids'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>

                              <span className="text-xs text-slate-500 block mt-1 text-center">
                                {req.bidsCount || (req.bids ? req.bids.length : 0)} bids
                              </span>
                            </div>

                          </div>

                        </div>
                      </div>

                    {/* Bids Drawer */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-semibold text-slate-900">
                              Vendor bids ({req.bids?.length || 0})
                            </h4>
                            <p className="text-sm text-slate-600">
                              Accept a bid only if it is ₹{req.maxAcceptableBid.toLocaleString()} or less. You then pay that bid plus 10%.
                            </p>
                          </div>

                          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                            {eligibleBids.length} you can accept
                          </span>
                        </div>

                        {(!req.bids || req.bids.length === 0) ? (
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                            <h5 className="font-semibold text-slate-800 text-base">No bids yet</h5>
                            <p className="text-sm text-slate-600 max-w-sm mx-auto">
                              Vendors can see this request. Their prices will show here.
                            </p>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {req.bids.map((bid) => {
                              const isEligible = bid.isEligibleForAccept;
                              const platformFee = Math.round(bid.amount * 0.10);
                              const totalPayable = bid.amount + platformFee;
                              const savings = req.budget - totalPayable;

                              return (
                                <div
                                  key={bid._id}
                                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                                    isEligible
                                      ? 'bg-white border-emerald-300 shadow-sm hover:shadow-md hover:border-emerald-500'
                                      : 'bg-slate-100/80 border-slate-200 opacity-75'
                                  }`}
                                >
                                  {/* Provider Info */}
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <img
                                          src={bid.providerId?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                                          alt={bid.providerId?.name}
                                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-2xs"
                                        />
                                        <div>
                                          <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                                            <span>{bid.providerId?.businessName || bid.providerId?.name}</span>
                                            {bid.providerId?.isVerified && (
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                              {bid.providerId?.rating || 4.9}
                                            </span>
                                            <span>•</span>
                                            <span>{bid.providerId?.completedJobs || 28} Jobs Done</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                          isEligible 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-rose-100 text-rose-800'
                                        }`}>
                                          {bid.discountPercent}% OFF
                                        </span>
                                      </div>
                                    </div>

                                    {/* Proposal & Gear Specs */}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                                      <div className="text-slate-700 font-medium leading-relaxed">
                                        "{bid.proposalNotes}"
                                      </div>
                                      {bid.equipmentDetails && (
                                        <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-lg border border-slate-200">
                                          <strong>Gear:</strong> {bid.equipmentDetails}
                                        </div>
                                      )}
                                    </div>

                                    {/* Pricing & Fee Breakdown */}
                                    <div className="space-y-1 pt-1 text-xs">
                                      <div className="flex justify-between text-slate-600">
                                        <span>Vendor bid</span>
                                        <span className="font-bold font-mono text-slate-900">₹{bid.amount.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-slate-500 text-[11px]">
                                        <span>EzzyGo fee (10%)</span>
                                        <span className="font-mono text-amber-700 font-semibold">+₹{platformFee.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-slate-900 font-extrabold pt-1 border-t border-slate-200">
                                        <span>You pay</span>
                                        <span className="text-sm font-mono text-emerald-700">₹{totalPayable.toLocaleString()}</span>
                                      </div>
                                      {savings > 0 && (
                                        <div className="text-right text-[10px] font-bold text-emerald-600">
                                          (Net savings of ₹{savings.toLocaleString()} from budget)
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action */}
                                  <div>
                                    {isEligible ? (
                                      <button
                                        onClick={() => onAcceptBid(req._id, bid._id)}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
                                      >
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Choose this vendor · Pay ₹{totalPayable.toLocaleString()}</span>
                                      </button>
                                    ) : (
                                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-center text-[10px] font-bold text-rose-700">
                                        Too high to accept. The bid must be ₹{req.maxAcceptableBid.toLocaleString()} or less.
                                      </div>
                                    )}
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. VERIFIED HOST REVIEWS & TESTIMONIALS (MATCHING SCREENSHOT)             */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden py-12 sm:py-16 lg:py-20">
        
        {/* Background Atmosphere: Silk Flow Waves & Rose Petals */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top Silk Wave */}
          <svg className="absolute top-0 left-0 w-full h-24 opacity-25 text-[#e6b980]" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
            <path d="M0,0 C360,40 720,10 1080,35 C1260,50 1380,15 1440,0 L1440,0 L0,0 Z" fill="url(#silk-review-top)" />
            <defs>
              <linearGradient id="silk-review-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Festive Hanging Floral Corner Accents */}
          <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 opacity-50 pointer-events-none -scale-x-100">
            <svg viewBox="0 0 300 300" fill="none">
              <path d="M300,0 C220,30 160,110 140,210 C180,230 250,180 300,100 Z" fill="#ca8a04" fillOpacity="0.2" />
              <circle cx="240" cy="60" r="20" fill="#f97316" fillOpacity="0.3" />
              <circle cx="180" cy="120" r="12" fill="#f43f5e" fillOpacity="0.35" />
            </svg>
          </div>
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 opacity-50 pointer-events-none">
            <svg viewBox="0 0 300 300" fill="none">
              <path d="M300,0 C220,30 160,110 140,210 C180,230 250,180 300,100 Z" fill="#ca8a04" fillOpacity="0.2" />
              <circle cx="240" cy="60" r="20" fill="#f97316" fillOpacity="0.3" />
              <circle cx="180" cy="120" r="12" fill="#f43f5e" fillOpacity="0.35" />
            </svg>
          </div>

          {/* Floating Subtle Ambient Petals */}
          <div className="absolute top-10 left-12 w-3.5 h-3.5 bg-rose-400/50 rounded-full blur-[0.5px] rotate-45" />
          <div className="absolute top-1/4 right-1/6 w-3 h-3 bg-rose-400/40 rounded-full blur-[0.5px] -rotate-12" />
          <div className="absolute bottom-20 left-1/5 w-3 h-3 bg-orange-400/40 rounded-full blur-[0.5px]" />
          <div className="absolute bottom-12 right-16 w-4 h-4 bg-rose-400/45 rounded-full blur-[0.5px] rotate-12" />
        </div>

        <div className="relative z-10 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 space-y-9">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/90 border border-orange-200/90 shadow-2xs">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#f95724] stroke-[2.5]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#f95724]">
                Why hosts use EzzyGo
              </span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f172a] tracking-tight leading-[1.12]">
              Book with <span className="text-[#f95724]">no risk</span>
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              Three simple promises on every booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                Icon: IndianRupee,
                title: 'At least 15% below your budget',
                text: 'You can only pick a vendor whose price is 15% or more below the budget you set.',
              },
              {
                Icon: Shield,
                title: 'Money held until the event is done',
                text: 'EzzyGo keeps your payment safe. The vendor gets paid only after you click "Event done".',
              },
              {
                Icon: CheckCircle2,
                title: 'Full refund if cancelled',
                text: 'If a paid booking is cancelled, you get back everything you paid, including the EzzyGo fee.',
              },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="bg-white/95 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-3">
                <div className="w-11 h-11 rounded-full bg-orange-100 text-[#f95724] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA Button */}
          <div className="text-center pt-1">
            <button
              onClick={() => onOpenPostModal()}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-orange-500 to-[#f95724] hover:from-orange-600 hover:to-[#f95724] text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <span>Post your requirement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. FREQUENTLY ASKED QUESTIONS (MATCHING SCREENSHOT)                       */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden py-12 sm:py-16 lg:py-20">
        
        {/* Background Atmosphere: Silk Flow Waves & Rose Petals */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top Silk Wave */}
          <svg className="absolute top-0 left-0 w-full h-24 opacity-25 text-[#e6b980]" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
            <path d="M0,0 C360,40 720,10 1080,35 C1260,50 1380,15 1440,0 L1440,0 L0,0 Z" fill="url(#silk-faq-top)" />
            <defs>
              <linearGradient id="silk-faq-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Festive Hanging Floral Corner Accents */}
          <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 opacity-50 pointer-events-none">
            <svg viewBox="0 0 300 300" fill="none">
              <path d="M300,0 C220,30 160,110 140,210 C180,230 250,180 300,100 Z" fill="#ca8a04" fillOpacity="0.2" />
              <circle cx="240" cy="60" r="22" fill="#f97316" fillOpacity="0.35" />
              <circle cx="180" cy="120" r="14" fill="#f43f5e" fillOpacity="0.4" />
            </svg>
          </div>

          {/* Floating Subtle Ambient Petals */}
          <div className="absolute top-12 left-10 w-3.5 h-3.5 bg-rose-400/50 rounded-full blur-[0.5px] rotate-45" />
          <div className="absolute top-1/3 right-1/5 w-3 h-3 bg-rose-400/40 rounded-full blur-[0.5px] -rotate-12" />
          <div className="absolute bottom-16 left-1/4 w-3.5 h-3.5 bg-orange-400/40 rounded-full blur-[0.5px]" />
          <div className="absolute bottom-10 right-12 w-4 h-4 bg-rose-400/45 rounded-full blur-[0.5px] rotate-12" />
        </div>

        <div className="relative z-10 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/90 border border-orange-200/90 shadow-2xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#f95724]">
                GOT QUESTIONS?
              </span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f172a] tracking-tight leading-[1.12]">
              Frequently Asked <span className="text-[#f95724]">Questions</span>
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
              Everything you need to know about the 15% discount rule, escrow safety, and booking flow.
            </p>
          </div>

          {/* Two-Column Grid: FAQ Accordion (Left) + Trust Badges & Help Box (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start max-w-[1400px] mx-auto">
            
            {/* Left Column: Numbered Accordion List (7 Columns on LG) */}
            <div className="lg:col-span-7 space-y-3.5">
              {FAQS.map((faq, index) => {
                const isExpanded = expandedFaqIndex === index;
                const numStr = String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={index}
                    className={`transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? 'bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 border-orange-300 shadow-md p-4 sm:p-5 space-y-3.5'
                        : 'bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-amber-200/80 shadow-2xs p-4 sm:p-5 hover:border-orange-200 hover:shadow-xs'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                      className="w-full flex items-center justify-between gap-3.5 text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Number Badge */}
                        <span className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                          isExpanded 
                            ? 'bg-[#f95724] text-white shadow-xs' 
                            : 'bg-orange-100 text-[#f95724]'
                        }`}>
                          {numStr}
                        </span>

                        {/* Question Text */}
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-[#f95724] transition-colors">
                          {faq.question}
                        </span>
                      </div>

                      {/* Expand / Collapse Icon */}
                      <div className="shrink-0">
                        {isExpanded ? (
                          <div className="w-7 h-7 rounded-full bg-[#f95724] text-white flex items-center justify-center shadow-xs">
                            <ChevronUp className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 flex items-center justify-center text-slate-400 group-hover:text-slate-600">
                            <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Answer Area (Styled Box with % Icon for Item 1) */}
                    {isExpanded && (
                      <div className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl bg-orange-50/50 border border-orange-200/60 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#f95724] font-black text-sm flex items-center justify-center shrink-0">
                          <Percent className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: 2x2 Trust Badges & Help Card (5 Columns on LG) */}
            <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-amber-200/80 shadow-sm space-y-6">
              
              {/* 2x2 Trust Grid */}
              <div className="grid grid-cols-2 gap-4 text-center">
                
                {/* Feature 1: Safe & Secure */}
                <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100 flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-orange-100 text-[#f95724] flex items-center justify-center mb-2 shadow-2xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">Safe & Secure</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                    Your money is protected with Escrow
                  </p>
                </div>

                {/* Feature 2: Guaranteed Savings */}
                <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100 flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-orange-100 text-[#f95724] flex items-center justify-center mb-2 shadow-2xs">
                    <Percent className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">Guaranteed Savings</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                    Get minimum 15% lower bids
                  </p>
                </div>

                {/* Feature 3: Direct Communication */}
                <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100 flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-orange-100 text-[#f95724] flex items-center justify-center mb-2 shadow-2xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">Direct Communication</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                    Contact provider after booking
                  </p>
                </div>

                {/* Feature 4: Hassle-Free Booking */}
                <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100 flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-orange-100 text-[#f95724] flex items-center justify-center mb-2 shadow-2xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">Hassle-Free Booking</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                    Simple and transparent process
                  </p>
                </div>

              </div>

              {/* Bottom "Still Have Questions? We're Here to Help!" Card */}
              <div className="bg-gradient-to-br from-orange-100/70 via-[#fdf5ec] to-orange-100/60 rounded-2xl p-5 border border-orange-200/80 space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-orange-200/80 text-[#f95724] flex items-center justify-center shrink-0 shadow-2xs">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#f95724] block">
                      STILL HAVE QUESTIONS?
                    </span>
                    <h4 className="font-editorial text-base sm:text-lg font-black text-[#0f172a] leading-tight">
                      We're Here to Help!
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      Our support team is always ready to assist you.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => alert('Support team is available 24/7 at support@ezzygo.in')}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-[#f95724] hover:from-orange-600 hover:to-[#f95724] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Contact Support</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};






