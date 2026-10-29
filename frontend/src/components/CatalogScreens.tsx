import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Cake,
  Camera,
  ChevronLeft,
  Flame,
  Flower2,
  Heart,
  Palette,
  PartyPopper,
  Plus,
  Search,
  Sparkles,
  Utensils,
  Volume2,
  Lightbulb,
  Star,
  ShieldCheck,
  Clock,
  Check,
  MessageSquare,
  Info,
} from 'lucide-react';
import {
  APP_OCCASIONS,
  SERVICE_COVERS,
  SERVICE_FILTERS,
  filterEventServices,
  type EventServiceItem,
  type OccasionItem,
} from '../data/appCatalog';
import type { PostRequirementInitialData } from '../types';

type PostFn = (initial?: string | PostRequirementInitialData) => void;

const occasionIcon = (type: OccasionItem['iconType']) => {
  const cls = 'w-[18px] h-[18px] text-[#ff5c28]';
  if (type === 'rings') return <Sparkles className={cls} />;
  if (type === 'lotus') return <Flower2 className={cls} />;
  if (type === 'corporate') return <Briefcase className={cls} />;
  if (type === 'party') return <PartyPopper className={cls} />;
  return <Cake className={cls} />;
};

const serviceIcon = (key: string, className = 'w-3 h-3') => {
  if (key === 'dj') return <Volume2 className={className} />;
  if (key === 'decor') return <Sparkles className={className} />;
  if (key === 'photography') return <Camera className={className} />;
  if (key === 'catering') return <Utensils className={className} />;
  if (key === 'lighting') return <Lightbulb className={className} />;
  if (key === 'priest') return <Flame className={className} />;
  if (key === 'mehendi') return <Heart className={className} />;
  return <Palette className={className} />;
};

function CatalogShell({
  title,
  onBack,
  children,
  wide,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-8 lg:pt-20">
      <div className="sticky top-0 lg:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className={`h-14 px-4 flex items-center gap-2 mx-auto ${wide ? 'lg:max-w-[1600px] lg:px-14' : 'lg:max-w-[1200px] lg:px-8'}`}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[17px] font-extrabold text-[#17233d]">{title}</h1>
        </div>
      </div>
      <div className={`p-4 pb-10 ${wide ? 'lg:max-w-[1600px] lg:px-14' : 'lg:max-w-[1200px] lg:px-8'} lg:mx-auto lg:pt-8`}>
        {children}
      </div>
    </div>
  );
}

function PosterCard({
  title,
  image,
  icon,
  onClick,
}: {
  title: string;
  image: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative overflow-hidden rounded-[28px] w-full aspect-[3/4] text-left cursor-pointer shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
    >
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/90" />
      <div className="absolute left-3 right-3 bottom-3.5 flex items-center gap-2">
        <span className="w-10 h-10 rounded-full bg-white/96 flex items-center justify-center shrink-0">{icon}</span>
        <span className="text-white font-extrabold text-[15px] leading-tight">{title}</span>
      </div>
    </button>
  );
}

export function ServiceCard({ service, onClick }: { service: EventServiceItem; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="bg-white rounded-[18px] border border-[#e8edf2] overflow-hidden text-left shadow-[0_3px_12px_rgba(0,0,0,0.045)] cursor-pointer">
      <div className="relative h-[108px] lg:h-[140px]">
        <img src={service.image} alt="" className="w-full h-full object-cover" />
        <span className="absolute left-2 top-2 w-6 h-6 rounded-full bg-white flex items-center justify-center" style={{ color: service.accent }}>
          {serviceIcon(service.filterKey)}
        </span>
        <span className="absolute right-2 top-2 px-1.5 py-0.5 rounded-full bg-[#e4f7ea] text-[#18794e] text-[9px] font-extrabold">Save 15%+</span>
      </div>
      <div className="p-2.5 lg:p-3.5">
        <p className="text-[14px] font-extrabold truncate">{service.shortName}</p>
        <p className="text-[11.5px] font-bold text-slate-500 truncate">{service.priceRange}</p>
        <span className="mt-2 flex items-center justify-center gap-1 h-8 rounded-full bg-gradient-to-r from-[#ff8254] to-[#ff5c28] text-white text-[11.5px] font-extrabold">
          Get Bids <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </button>
  );
}

export function OtherRequestCard({
  title,
  subtitle,
  onClick,
  cta = 'Post Request',
  className = '',
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  cta?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-[#fff5f0] rounded-[18px] border-[1.4px] border-[#ff5c28]/40 p-3 text-center cursor-pointer min-h-[180px] h-full flex flex-col items-center ${className}`}
    >
      <span className="w-[42px] h-[42px] rounded-full bg-white shadow-[0_4px_8px_rgba(240,125,74,0.16)] flex items-center justify-center mt-1">
        <Plus className="w-5 h-5 text-[#ff5c28]" />
      </span>
      <p className="mt-2.5 text-[14.5px] font-extrabold text-[#17233d] leading-tight">{title}</p>
      <p className="mt-1 text-[11.5px] text-slate-500 font-medium leading-snug flex-1 px-1">{subtitle}</p>
      <span className="mt-2 w-full py-1.5 rounded-full bg-gradient-to-r from-[#ff8254] to-[#ff5c28] text-white text-[11.5px] font-extrabold inline-flex items-center justify-center gap-1">
        {cta} <ArrowRight className="w-3 h-3" />
      </span>
    </button>
  );
}

export function OccasionCatalogScreen({
  onBack,
  onOpenPost,
  city,
}: {
  onBack: () => void;
  onOpenPost: PostFn;
  city?: string;
}) {
  const openOccasion = (occ: OccasionItem | 'Other') => {
    onOpenPost({
      eventType: occ === 'Other' ? 'Other' : occ.occasion,
      city,
    });
  };

  return (
    <CatalogShell title="All Occasions" onBack={onBack} wide>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-5">
        {APP_OCCASIONS.map((occ) => (
          <PosterCard
            key={occ.name}
            title={occ.name}
            image={occ.image}
            icon={occasionIcon(occ.iconType)}
            onClick={() => openOccasion(occ)}
          />
        ))}
        <OtherRequestCard
          title="Other Events"
          subtitle="Not listed? Tell us the occasion and vendors will bid on it."
          onClick={() => openOccasion('Other')}
        />
      </div>
    </CatalogShell>
  );
}

export function ServiceCatalogScreen({
  onBack,
  onOpenDetail,
  onOpenPost,
}: {
  onBack: () => void;
  onOpenDetail: (service: EventServiceItem) => void;
  onOpenPost: PostFn;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(() => filterEventServices(filter, query), [filter, query]);

  return (
    <CatalogShell title="Event Services" onBack={onBack} wide>
      <div className="bg-white rounded-[14px] border border-[#e8edf2] flex items-center px-3 mb-3 lg:max-w-xl">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search DJ, Mandap, Photography, Catering..."
          className="flex-1 h-11 px-2 text-[13px] outline-none bg-transparent"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
        {SERVICE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 h-[34px] rounded-full text-[13px] border cursor-pointer ${
              filter === f
                ? 'bg-[#17233d] text-white border-[#17233d] font-bold'
                : 'bg-white text-slate-800 border-[#e8edf2] font-medium'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {filtered.map((s) => (
          <ServiceCard key={s.id} service={s} onClick={() => onOpenDetail(s)} />
        ))}
        <OtherRequestCard
          title="Other Services"
          subtitle="Need something else? Request any service and get vendor bids."
          onClick={() => onOpenPost('Other')}
        />
      </div>
    </CatalogShell>
  );
}

interface ServiceTheme {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  priceNote: string;
  startingBudget: number;
}

const DECORATION_THEMES: ServiceTheme[] = [
  {
    id: 'royal-mandap',
    title: 'Royal Mandap & Floral Arch',
    subtitle: 'Traditional wooden/carved pillars, fresh red & yellow roses, marigold chandeliers, holy fire havan canopy & brass samai lamps.',
    image: '/occasion_weddings.jpg',
    tag: 'Weddings & Vivah',
    priceNote: 'Starts ~₹35,000',
    startingBudget: 35000,
  },
  {
    id: 'sangeet-fairy-lights',
    title: 'Sangeet & Cocktail Fairy Canopy',
    subtitle: 'Over 10,000 warm-white micro fairy lights, black box trussing, LED profile stage washes, disco effects & acrylic dance floor.',
    image: '/occasion_parties.jpg',
    tag: 'Sangeet & Receptions',
    priceNote: 'Starts ~₹25,000',
    startingBudget: 25000,
  },
  {
    id: 'haldi-mehendi',
    title: 'Haldi & Mehendi Yellow Fiesta',
    subtitle: 'Vibrant marigold curtains, traditional decorated wooden swing (jhula), colorful umbrella ceilings & Instagrammable photo booths.',
    image: '/occasion_festivals.jpg',
    tag: 'Pre-Wedding Rituals',
    priceNote: 'Starts ~₹15,000',
    startingBudget: 15000,
  },
  {
    id: 'pastel-geometric',
    title: 'Pastel Garden & Geometric Backdrop',
    subtitle: 'Modern circular/hexagonal golden arches, pampas grass, custom neon name signs, blush pink & ivory silk drape backdrops.',
    image: '/occasion_birthdays.jpg',
    tag: 'Engagements & Birthdays',
    priceNote: 'Starts ~₹18,000',
    startingBudget: 18000,
  },
];

const getServiceThemes = (filterKey: string): ServiceTheme[] => {
  if (filterKey === 'decor') {
    return DECORATION_THEMES;
  }
  if (filterKey === 'dj') {
    return [
      {
        id: 'sangeet-dj',
        title: 'Bollywood & Punjabi Sangeet DJ',
        subtitle: 'High-energy live Bollywood, Punjabi, and commercial dance sets with interactive MC hosting and wireless crowd mics.',
        image: '/occasion_parties.jpg',
        tag: 'Sangeet & Receptions',
        priceNote: 'Starts ~₹15,000',
        startingBudget: 15000,
      },
      {
        id: 'concert-line-array',
        title: 'Concert Line Array & Bass Bins',
        subtitle: 'Dual 18" subwoofers, active line array speakers, digital mixer, and stage monitor setup for 500+ guests.',
        image: '/occasion_festivals.jpg',
        tag: 'College & Corporate Fests',
        priceNote: 'Starts ~₹25,000',
        startingBudget: 25000,
      },
    ];
  }
  if (filterKey === 'photography') {
    return [
      {
        id: 'cinematic-wedding',
        title: 'Cinematic Wedding & Drone 4K',
        subtitle: 'Candid portraits, 4K gimbal drone sweeps, cinematic highlight teaser, and luxury leather-bound hardbound album.',
        image: '/occasion_weddings.jpg',
        tag: 'Weddings',
        priceNote: 'Starts ~₹35,000',
        startingBudget: 35000,
      },
      {
        id: 'event-traditional',
        title: 'Traditional Stage & Guest Photo',
        subtitle: 'Coverage of rituals, stage guest portraits, high-speed instant photo prints, and fast digital gallery delivery.',
        image: '/occasion_parties.jpg',
        tag: 'Parties & Corporate',
        priceNote: 'Starts ~₹15,000',
        startingBudget: 15000,
      },
    ];
  }
  return [];
};

export const getServiceStartingBudget = (filterKey: string): number => {
  switch (filterKey) {
    case 'decor':
      return 30000;
    case 'dj':
      return 18000;
    case 'photography':
      return 32000;
    case 'catering':
      return 45000;
    case 'lighting':
      return 15000;
    case 'purohit':
      return 8000;
    case 'mehendi':
      return 10000;
    case 'tent-stage':
      return 25000;
    default:
      return 20000;
  }
};

export function ServiceDetailScreen({
  service,
  onBack,
  onOpenPost,
}: {
  service: EventServiceItem;
  onBack: () => void;
  onOpenPost: PostFn;
}) {
  const covers = SERVICE_COVERS[service.filterKey] || [
    `Verified local vendors for ${service.shortName}`,
    'Quotes on your date and city',
    'Payment held until the event is done',
  ];

  const themes = getServiceThemes(service.filterKey);
  const isDecor = service.filterKey === 'decor' || service.id === 'decoration';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-28 lg:pb-16 lg:pt-24">
      {/* Container for Desktop Breadcrumb and Top Nav */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Desktop Breadcrumb Bar */}
        <div className="hidden lg:flex items-center justify-between pb-4 pt-2 border-b border-slate-200/80 mb-6">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4 text-[#ff5c28]" />
              <span>Back to Services</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-medium">Event Services</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">{service.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Local Vendors
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#ff5c28] text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-[#ff5c28]" />
              Save 15%+ via Reverse Bidding
            </span>
          </div>
        </div>

        {/* Hero Banner Section */}
        {/* Desktop: Centered card with rounded 3xl corners, deep gradient, stats pill */}
        {/* Mobile: Edge-to-edge cover with floating back button */}
        <div className="relative -mx-4 sm:mx-0 h-[240px] sm:h-[300px] lg:h-[380px] rounded-none sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-none lg:shadow-xl border-b lg:border border-slate-200/80 mb-6 lg:mb-8">
          <img
            src={service.image}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

          {/* Mobile Back Button */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="lg:hidden absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-slate-800 flex items-center justify-center cursor-pointer shadow-md z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Hero Content Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8 text-white flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10.5px] font-extrabold uppercase tracking-wider">
                  {service.shortName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e4f7ea] text-[#18794e] text-[10.5px] font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Min 15% Savings Guaranteed
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> 4.9 (420+ Events)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-white drop-shadow-sm">
                {service.title}
              </h1>
              <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-200 font-medium leading-relaxed max-w-xl">
                {service.description}
              </p>
            </div>

            {/* Quick Desktop Stats Pill */}
            <div className="hidden lg:flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Typical Price</p>
                <p className="text-xl font-black text-white">{service.priceRange}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onOpenPost({
                    category: service.title,
                    budget: getServiceStartingBudget(service.filterKey),
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5c28] to-[#e66c35] hover:opacity-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Get Bids</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Highlights, Themes, Inclusions, How It Works, Host FAQs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 4 Feature Pillars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <span className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5c28] flex items-center justify-center font-bold mb-2">
                  <Flower2 className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#17233d]">Farm-Fresh Florals</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Same-day fresh flowers for maximum fragrance & elegance.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-2">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#17233d]">On-Time Guarantee</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Setup ready 2 hours before the first guest walks in.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-2">
                  <Palette className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#17233d]">Custom References</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Share Pinterest or Instagram photos for exact styling.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#17233d]">Escrow Protection</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Money released only after you inspect and approve.</p>
                </div>
              </div>
            </div>

            {/* Popular Themes & Styles (Especially for Decoration!) */}
            {themes.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#17233d]">
                      {isDecor ? 'Popular Decoration Themes & Setups' : `Popular ${service.shortName} Packages`}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select a setup style to request tailored bids from verified decorators
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {themes.length} Styles Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className="group relative rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/50 hover:bg-white hover:border-[#ff5c28]/40 hover:shadow-md transition-all duration-200 flex flex-col"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={theme.image}
                          alt={theme.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                          {theme.tag}
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-[#17233d] text-[10.5px] font-black shadow-xs">
                          {theme.priceNote}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-[15px] text-[#17233d] group-hover:text-[#ff5c28] transition">
                            {theme.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                            {theme.subtitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenPost({
                              category: service.title,
                              title: `${theme.title} Setup`,
                              description: `Looking for ${theme.title} theme: ${theme.subtitle}`,
                              budget: theme.startingBudget,
                            })
                          }
                          className="mt-3.5 w-full py-2 rounded-xl bg-white border border-[#ff5c28]/40 hover:bg-[#fff5f0] text-[#ff5c28] font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Request this Theme</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Usually Included Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h2 className="text-lg font-extrabold text-[#17233d] mb-1">
                What's Usually Included in {service.shortName}
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Every verified quote includes full service execution, labor, and teardown
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {covers.map((line, idx) => (
                  <div
                    key={line}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-[#17233d]">{line}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {idx === 0
                          ? 'Complete structural truss, backdrops, and safety rigging included.'
                          : idx === 1
                            ? 'Color-coordinated fresh florals and accent stage lighting.'
                            : 'On-time venue setup and complete post-event removal.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <p className="text-xs text-amber-900 font-medium">
                  Have unique needs? You can specify custom flowers, stage dimensions, and special lighting directly in your request.
                </p>
              </div>
            </div>

            {/* How Reverse Bidding Works */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#17233d]">
                    How EzzyGo Reverse Bidding Works
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Never overpay again. Verified vendors bid downwards to win your gig.
                  </p>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  Save 15%+ Enforced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-[#fde7d8] text-[#ff5c28] text-xs font-black flex items-center justify-center mb-3">
                      1
                    </span>
                    <p className="text-sm font-extrabold text-[#17233d]">Post Your Budget</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Enter your event date, city, area, and max budget. Free. Takes 1 minute.
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] font-bold text-[#ff5c28]">Zero upfront fees</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-[#fde7d8] text-[#ff5c28] text-xs font-black flex items-center justify-center mb-3">
                      2
                    </span>
                    <p className="text-sm font-extrabold text-[#17233d]">Vendors Bid Lower</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Local decorators compete. Every bid must be at least 15% below your budget.
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] font-bold text-emerald-700">Guaranteed savings</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-[#fde7d8] text-[#ff5c28] text-xs font-black flex items-center justify-center mb-3">
                      3
                    </span>
                    <p className="text-sm font-extrabold text-[#17233d]">Pay via Escrow</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Pick your favorite portfolio. EzzyGo holds the money until event inspection.
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] font-bold text-blue-700">100% Risk-free</p>
                </div>
              </div>
            </div>

            {/* Host FAQs & Tips for Decoration */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h2 className="text-lg font-extrabold text-[#17233d] mb-4">
                Tips for Booking {service.shortName}
              </h2>
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-extrabold text-[#17233d]">
                    How early should I book stage decoration?
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    We recommend posting your requirement at least 3 to 14 days prior to ensure vendors can reserve specific fresh flower varieties and lighting trusses.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-extrabold text-[#17233d]">
                    Can I provide reference photos from Instagram or Pinterest?
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Absolutely! Once you post, you can share reference pictures. Verified decorators will tailor their proposal to replicate your exact colors and props.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-extrabold text-[#17233d]">
                    What if the decorator is delayed or fails to deliver?
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    With EzzyGo Escrow, your payment is held safely until you confirm setup completion. If a vendor breaches agreement, our admin dispute desk issues an instant full refund.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Sticky Price, Savings Calculator & Booking CTA */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            
            {/* Elevated Price & CTA Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 lg:p-7 space-y-5">
              <div>
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Typical Market Rate
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-black text-[#17233d]">{service.priceRange}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Actual price depends on stage dimensions, floral density & lighting.
                </p>
              </div>

              {/* 15% Rule Callout Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#fff5f0] to-[#fde7d8]/60 border border-[#ff5c28]/30">
                <div className="flex items-center gap-1.5 text-[#ff5c28] font-black text-xs">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>The EzzyGo Advantage</span>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">
                  You set the budget. Verified local vendors must bid <strong className="text-[#17233d]">at least 15% lower</strong> to compete for your event.
                </p>
                <div className="mt-2.5 pt-2 border-t border-[#ff5c28]/20 flex items-center justify-between text-[11px] font-extrabold text-[#17233d]">
                  <span>On a ₹30,000 budget:</span>
                  <span className="text-emerald-700 font-black">Save min ₹4,500</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenPost({
                      category: service.title,
                      budget: getServiceStartingBudget(service.filterKey),
                    })
                  }
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff5c28] to-[#e66c35] hover:opacity-95 text-white font-black text-base shadow-lg shadow-[#ff5c28]/25 hover:shadow-[#ff5c28]/40 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Bids for {service.shortName}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center text-xs text-slate-500 font-semibold mt-2">
                  100% Free to post • No obligation to accept
                </p>
              </div>

              {/* What Happens Next Checklist */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                <p className="font-extrabold text-[#17233d] text-xs">Why hosts book through EzzyGo:</p>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Multiple competing quotes in ~30 mins</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>100% Escrow Protection via Razorpay</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Direct phone & address unlocked upon payment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Free cancellation before vendor dispatch</span>
                </div>
              </div>
            </div>

            {/* Concierge Help Callout */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff5c28] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#17233d]">Need Planning Help?</p>
                  <p className="text-[11px] text-slate-500">Free advice on decor themes & budgets</p>
                </div>
              </div>
              <a
                href={`https://wa.me/919322054199?text=${encodeURIComponent(
                  `Hello EzzyGo Team, I need help planning ${service.title} for my upcoming event.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition"
              >
                Chat
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* Mobile Fixed Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e8edf2] px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-xl">
        <button
          type="button"
          onClick={() =>
            onOpenPost({
              category: service.title,
              budget: getServiceStartingBudget(service.filterKey),
            })
          }
          className="w-full h-[50px] rounded-2xl bg-gradient-to-r from-[#ff5c28] to-[#e66c35] text-white font-extrabold text-[15px] cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#ff5c28]/20"
        >
          <span>Get bids for {service.shortName}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[11px] text-slate-500 font-semibold mt-1.5">
          Free to post • Save min 15% • Escrow protected
        </p>
      </div>
    </div>
  );
}
