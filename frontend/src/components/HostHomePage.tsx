import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Briefcase,
  Cake,
  Camera,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Flame,
  Flower2,
  Heart,
  IndianRupee,
  Lightbulb,
  MapPin,
  Palette,
  PartyPopper,
  Plus,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Utensils,
  Volume2,
} from 'lucide-react';
import { EzzyGoLogo } from './EzzyGoLogo';
import { PromoAdBanner } from './PromoAdBanner';
import {
  APP_EVENT_SERVICES,
  APP_OCCASIONS,
  SERVICE_FILTERS,
  filterEventServices,
  type EventServiceItem,
  type OccasionItem,
} from '../data/appCatalog';
import { OtherRequestCard } from './CatalogScreens';
import type { Banner, PostRequirementInitialData, Requirement } from '../types';

const CITIES = [
  'Pune', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi', 'Nagpur',
  'Nashik', 'Jaipur', 'Goa', 'Ahmedabad', 'Kolkata', 'Chennai',
];

interface HostHomePageProps {
  requirements: Requirement[];
  banners?: Banner[];
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  onOpenPostModal: (initial?: string | PostRequirementInitialData) => void;
  onOpenMyEvents?: () => void;
  onOpenOccasions?: () => void;
  onOpenServices?: () => void;
  onOpenServiceDetail?: (service: EventServiceItem) => void;
}

const occasionIcon = (type: OccasionItem['iconType']) => {
  const cls = 'w-[18px] h-[18px] text-[#f07d4a]';
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

const formatEventDate = (value?: string) => {
  if (!value) return 'Date TBA';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const HOME_FAQS = [
  { q: 'How does the 15% rule work?', a: 'You can only accept a bid that is at least 15% below your budget.' },
  { q: 'Is my payment safe?', a: 'EzzyGo holds the money. The vendor is paid after you tap Event done.' },
  { q: 'When do I get the vendor number?', a: 'Right after you pay.' },
];

export const HostHomePage: React.FC<HostHomePageProps> = ({
  requirements,
  banners = [],
  selectedCity,
  onSelectCity,
  onOpenPostModal,
  onOpenMyEvents,
  onOpenOccasions,
  onOpenServices,
  onOpenServiceDetail,
}) => {
  const [cityOpen, setCityOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [adIndex, setAdIndex] = useState(0);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [heroService, setHeroService] = useState('Decoration');
  const [heroDate, setHeroDate] = useState('');
  const heroLocation = selectedCity || 'Pune, MH';

  const city = (selectedCity || 'Pune').split(',')[0].trim();
  const ads = banners.filter((b) => b.isActive);
  const compactReqs = requirements.filter((r) => r.status !== 'DRAFT').slice(0, 3);
  const liveReqs = [...requirements.filter((r) => r.status === 'OPEN')]
    .sort((a, b) => (b.bidsCount || b.bids?.length || 0) - (a.bidsCount || a.bids?.length || 0))
    .slice(0, 3);
  const liveCount = requirements.filter(
    (r) => r.status === 'OPEN' && ((r.bidsCount || 0) > 0 || (r.bids || []).length > 0)
  ).length;
  const homeServices = APP_EVENT_SERVICES.slice(0, 4);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = window.setInterval(() => setAdIndex((i) => (i + 1) % ads.length), 6000);
    return () => window.clearInterval(t);
  }, [ads.length]);

  const filteredServices = useMemo(
    () => filterEventServices(serviceFilter, serviceQuery),
    [serviceFilter, serviceQuery]
  );

  const openOccasion = (occ: OccasionItem | 'Other') => {
    onOpenPostModal({
      eventType: occ === 'Other' ? 'Other' : occ.occasion,
      city,
    });
  };

  const openService = (service: EventServiceItem) => {
    onOpenServiceDetail?.(service);
  };

  return (
    <div className="bg-[#f5f6f8] min-h-screen pb-4 lg:pb-12">
      {/* Mobile hero — app layout */}
      <section className="lg:hidden relative h-[50vh] min-h-[340px] max-h-[460px] rounded-b-[28px] overflow-hidden shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
        <img src="/hero_wedding_bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/85 to-transparent" />

        <div className="relative z-10 flex items-center gap-2 px-4 pt-3">
          <EzzyGoLogo size="sm" showBadge={false} />
          <div className="relative">
            <button
              type="button"
              onClick={() => setCityOpen((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-[12.5px] font-extrabold cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#17233d]" />
              {city || 'Pune'}
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            {cityOpen && (
              <div className="absolute left-0 top-full mt-1 w-40 max-h-64 overflow-y-auto bg-white rounded-2xl border border-slate-100 shadow-xl p-1 z-30">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onSelectCity?.(c);
                      setCityOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="ml-auto w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#17233d]" />
          </span>
        </div>

        <div className="absolute left-5 right-5 bottom-5">
          <span className="inline-block px-2 py-[3px] rounded-md bg-[#17233d] text-white text-[9px] font-black tracking-[0.7px]">
            REVERSE BIDDING
          </span>
          <h1 className="mt-2 text-[22.5px] font-black text-[#111827] leading-[1.15] tracking-tight">
            Post your budget.<br />Vendors bid lower.
          </h1>
          <p className="mt-1 text-lg font-extrabold text-[#f07d4a]">You pick the best one.</p>
          <div className="mt-3 flex items-end justify-between">
            <button
              type="button"
              onClick={() => onOpenPostModal()}
              className="inline-flex items-center gap-1.5 px-4 py-[8.5px] rounded-full bg-[#f07d4a] text-white text-[13px] font-extrabold shadow-[0_3px_10px_rgba(240,125,74,0.35)] cursor-pointer"
            >
              Post Requirement
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 rounded-xl bg-white/92 border border-gray-200 text-[11px] font-extrabold text-gray-800">1/3</span>
          </div>
        </div>
      </section>

      {/* Desktop hero — original website layout */}
      <section className="hidden lg:block relative w-full overflow-hidden bg-[#fdfbf7] pt-32 xl:pt-36 pb-14 xl:pb-16">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-right bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('/hero_wedding_bg.jpg')` }}
        >
          <div className="w-full h-full bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/80 lg:via-[#f8fafc]/45 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 lg:px-14">
          <div className="max-w-3xl space-y-5">
            <h1 className="font-display text-5xl xl:text-[68px] font-extrabold text-[#0f172a] leading-[1.12] tracking-tight">
              Post your budget.<br />
              Vendors bid lower.<br />
              <span className="text-[#f07d4a] font-extrabold">You pick the best one.</span>
            </h1>
            <p className="text-slate-600 text-base leading-relaxed max-w-xl font-medium">
              You set the max. Vendors bid under it. You pick the best one.
            </p>
            <div className="w-full max-w-4xl bg-white rounded-full p-2 pl-6 pr-2.5 shadow-xl shadow-slate-900/5 border border-slate-200/90 flex items-center justify-between gap-2">
              <div className="flex-1 px-2 py-1.5 flex items-center gap-3 min-w-0">
                <Search className="w-4 h-4 text-[#17233d] shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[13px] font-bold text-slate-900 leading-tight">What service do you need?</label>
                  <input
                    type="text"
                    value={heroService}
                    onChange={(e) => setHeroService(e.target.value)}
                    placeholder="e.g. Decoration, Catering, DJ..."
                    className="w-full text-xs text-slate-700 font-medium placeholder-slate-400 focus:outline-none bg-transparent pt-0.5 truncate"
                  />
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200/90 shrink-0" />
              <div className="flex-1 px-3 py-1.5 flex items-center gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#17233d] shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[13px] font-bold text-slate-900 leading-tight">Location</label>
                  <select
                    value={heroLocation}
                    onChange={(e) => onSelectCity?.(e.target.value)}
                    className="text-xs text-slate-700 font-medium focus:outline-none bg-transparent cursor-pointer appearance-none w-full truncate"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200/90 shrink-0" />
              <div className="flex-1 px-3 py-1.5 flex items-center gap-2.5 min-w-0 relative">
                <Calendar className="w-4 h-4 text-[#17233d] shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[13px] font-bold text-slate-900 leading-tight">Event Date</label>
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
              <button
                type="button"
                onClick={() => onOpenPostModal(heroService)}
                className="px-6 py-3.5 rounded-full bg-[#f07d4a] hover:bg-[#de6a3a] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <span>Post Requirement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 overflow-hidden leading-none">
          <svg className="relative block w-full h-12 text-[#fffbf7]" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Mobile ads — app card */}
      {ads.length > 0 && (
        <div className="lg:hidden px-4 pt-3.5">
          <button
            type="button"
            onClick={() => {
              const ad = ads[adIndex];
              if (!ad) return;
              if (ad.targetUrl?.startsWith('http')) window.open(ad.targetUrl, '_blank');
              else onOpenPostModal(ad.title);
            }}
            className="relative w-full h-[196px] rounded-[22px] overflow-hidden border border-[#e8edf2] shadow-[0_6px_16px_rgba(0,0,0,0.08)] cursor-pointer text-left"
          >
            <img src={ads[adIndex].imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 p-3.5 flex flex-col">
              <span className="self-start inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-black/45 text-white text-[10px] font-bold">
                <span className="px-1 py-px rounded bg-amber-400 text-gray-900 text-[8px] font-black">AD</span>
                {ads[adIndex].badge}
              </span>
              <div className="mt-auto">
                {!!ads[adIndex].discountPercent && ads[adIndex].discountPercent! > 0 && (
                  <span className="inline-block mb-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#f4a06c] to-[#f07d4a] text-white text-[10px] font-extrabold">
                    Save {ads[adIndex].discountPercent}%
                  </span>
                )}
                <p className="text-white text-base font-extrabold leading-tight">{ads[adIndex].title}</p>
                {ads[adIndex].subtitle && <p className="text-white/80 text-xs mt-1">{ads[adIndex].subtitle}</p>}
              </div>
            </div>
          </button>
          {ads.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2.5">
              {ads.map((ad, i) => (
                <button
                  key={ad._id}
                  type="button"
                  onClick={() => setAdIndex(i)}
                  className={`h-1.5 rounded-full cursor-pointer ${i === adIndex ? 'w-[18px] bg-[#f07d4a]' : 'w-1.5 bg-slate-300'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop ads — original billboard */}
      <section className="hidden lg:block relative w-full bg-gradient-to-b from-[#fffbf7] via-[#fdf5eb] to-[#fbf0e2] pt-2 pb-3">
        <PromoAdBanner
          banners={banners}
          currentCity={selectedCity}
          onActionClick={(ad) => {
            if (ad.targetUrl?.startsWith('http')) window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
            else if (ad.targetUrl?.startsWith('#')) {
              const el = document.querySelector(ad.targetUrl);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else onOpenPostModal(ad.title);
          }}
        />
      </section>

      {/* Mobile popular — app posters */}
      <section className="lg:hidden pt-4">
        <RowTitle title="Popular Services" action="View All" onAction={() => onOpenOccasions?.()} />
        <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar">
          {APP_OCCASIONS.map((occ) => (
            <PosterCard
              key={occ.name}
              title={occ.name}
              image={occ.image}
              icon={occasionIcon(occ.iconType)}
              width={176}
              height={252}
              onClick={() => openOccasion(occ)}
            />
          ))}
        </div>
      </section>

      {/* Desktop popular — original occasion gallery */}
      <section className="hidden lg:block relative w-full overflow-hidden bg-gradient-to-b from-[#fbf0e2] via-[#fdf5eb] to-[#fbf0e2] pt-4 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-amber-200/30 via-orange-100/40 to-transparent rounded-[100%] blur-3xl -rotate-12" />
        </div>
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 lg:px-14">
          <div className="grid grid-cols-12 gap-12 items-center">
            <div className="col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#17233d]">FOR EVERY OCCASION</span>
                <div className="w-12 h-[2.5px] bg-[#f07d4a] rounded-full" />
              </div>
              <h2 className="font-editorial text-5xl xl:text-[56px] font-black text-[#0f172a] leading-[1.06] tracking-tight">
                Find the Right <br />
                <span className="text-[#17233d]">Professionals</span>
              </h2>
              <p className="text-slate-700 text-base leading-relaxed max-w-md font-medium">
                From weddings to festivals, get the best deals from trusted local professionals.
              </p>
              <button
                type="button"
                onClick={() => onOpenServices?.()}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#f07d4a] to-[#f4a06c] hover:from-[#de6a3a] text-white font-bold text-sm shadow-xl shadow-orange-500/30 cursor-pointer"
              >
                <span>Explore All Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="col-span-8 relative">
              <button
                type="button"
                onClick={() => document.getElementById('desktop-occasion-track')?.scrollBy({ left: -280, behavior: 'smooth' })}
                aria-label="Previous occasions"
                className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-2xl border border-amber-100 flex items-center justify-center text-[#17233d] hover:scale-110 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('desktop-occasion-track')?.scrollBy({ left: 280, behavior: 'smooth' })}
                aria-label="Next occasions"
                className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-2xl border border-amber-100 flex items-center justify-center text-[#17233d] hover:scale-110 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
              <div id="desktop-occasion-track" className="flex items-center gap-6 overflow-x-auto py-10 px-8 no-scrollbar scroll-smooth">
                {APP_OCCASIONS.map((occ, idx) => {
                  const tilt =
                    idx === 0 ? 'rotateY(14deg) translateY(-8px) rotateZ(-2.5deg) scale(0.97)' :
                    idx === 1 ? 'rotateY(6deg) translateY(-2px) rotateZ(-1deg) scale(0.99)' :
                    idx === 2 ? 'rotateY(0deg) translateY(4px) scale(1.02)' :
                    idx === 3 ? 'rotateY(-8deg) translateY(-2px) rotateZ(1.5deg) scale(0.99)' :
                    'rotateY(-16deg) translateY(-8px) rotateZ(3deg) scale(0.96)';
                  return (
                    <button
                      key={occ.name}
                      type="button"
                      onClick={() => openOccasion(occ)}
                      style={{ transform: tilt }}
                      className="relative w-[252px] h-[380px] shrink-0 rounded-[38px] overflow-hidden group cursor-pointer border border-white/40 shadow-[0_22px_45px_-12px_rgba(30,20,10,0.28)] hover:shadow-[0_35px_65px_-15px_rgba(249,87,36,0.35)] transition-transform duration-500"
                    >
                      <img src={occ.image} alt={occ.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/85 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />
                      <div className="absolute bottom-5 inset-x-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center shadow-lg shrink-0">
                            {occasionIcon(occ.iconType)}
                          </div>
                          <span className="font-editorial text-lg font-bold text-white drop-shadow truncate">{occ.name}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/70 bg-black/35 flex items-center justify-center text-white shrink-0 group-hover:bg-[#f07d4a]">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => openOccasion('Other')}
                  className="relative w-[252px] h-[380px] shrink-0 rounded-[38px] overflow-hidden group cursor-pointer border border-[#f07d4a]/30 bg-[#fff6f1] shadow-[0_22px_45px_-12px_rgba(30,20,10,0.18)] flex flex-col items-center justify-center px-6 text-center"
                >
                  <span className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center">
                    <Plus className="w-6 h-6 text-[#f07d4a]" />
                  </span>
                  <span className="mt-4 font-editorial text-2xl font-bold text-[#17233d]">Other Events</span>
                  <span className="mt-2 text-sm text-slate-500 font-medium">Not listed? Post it and vendors will bid.</span>
                  <span className="mt-6 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#f07d4a] to-[#f4a06c] text-white text-sm font-extrabold">
                    Post Request <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile event services — app 2x2 */}
      <section className="lg:hidden px-4 pt-2">
        <RowTitle title="Event Services" action="View All" onAction={() => onOpenServices?.()} padded={false} />
        <div className="grid grid-cols-2 gap-3 mt-3">
          {homeServices.map((s) => (
            <ServiceCard key={s.id} service={s} onClick={() => openService(s)} />
          ))}
        </div>
      </section>

      {/* Desktop event services — original catalog */}
      <section className="hidden lg:block relative w-full bg-gradient-to-b from-[#fbf0e2] to-[#fffbf7] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-14">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#17233d] text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Services & price guide
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  ✓ 100% Free Reverse Quotes
                </span>
              </div>
              <h2 className="font-editorial text-5xl font-black text-[#0f172a] tracking-tight">
                Explore Event Services & <span className="text-[#17233d]">Estimated Rates</span>
              </h2>
              <p className="text-slate-600 text-base mt-2 max-w-2xl font-medium">
                Know typical market costs. Select a service to post your need — vendors compete with lower reverse-bids.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onOpenServices?.()}
                className="px-5 py-3 rounded-full bg-white border border-slate-200 text-[#17233d] text-sm font-bold cursor-pointer"
              >
                View All
              </button>
              <button
                type="button"
                onClick={() => onOpenPostModal()}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#f07d4a] to-orange-500 text-white text-sm font-black shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Post Custom Requirement
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                placeholder="Search services (e.g. DJ, Mandap, Photography, Catering)..."
                className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full border border-slate-200 text-sm focus:outline-none focus:border-[#17233d]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {SERVICE_FILTERS.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setServiceFilter(pill)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                    serviceFilter === pill ? 'bg-[#f07d4a] text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {filteredServices.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => openService(s)}
                className="group rounded-3xl bg-white border border-slate-200 overflow-hidden text-left shadow-xs hover:shadow-xl hover:border-orange-400 transition-all cursor-pointer flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-black text-[#17233d] flex items-center gap-1.5">
                      <span style={{ color: s.accent }}>{serviceIcon(s.filterKey, 'w-3.5 h-3.5')}</span>
                      {s.shortName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-amber-300">Save 15%+</span>
                  </div>
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                      <span>Est. Market Rate</span>
                      <span className="text-emerald-400 font-bold">Vendors bid lower</span>
                    </div>
                    <span className="text-sm font-black bg-black/50 px-2.5 py-0.5 rounded-lg border border-white/20">{s.priceRange}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{s.description}</p>
                  <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Verified Local Pros</span>
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Escrow Safe</span>
                    </div>
                    <span className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#f07d4a] to-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2">
                      Get Free Bids for {s.shortName}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
            <OtherRequestCard
              className="rounded-3xl min-h-[360px] p-6"
              title="Other Services"
              subtitle="Need something else? Request any service and get vendor bids."
              onClick={() => onOpenPostModal('Other')}
            />
          </div>
        </div>
      </section>

      {/* Mobile my events + live bidding */}
      <div className="lg:hidden">
      <section className="px-4 pt-6">
        <div className="flex items-center gap-3">
          <h2 className="flex-1 text-[17px] font-extrabold text-[#17233d]">My Events</h2>
          {compactReqs.length > 0 && (
            <button type="button" onClick={() => onOpenMyEvents?.()} className="text-[13px] font-bold text-[#17233d] cursor-pointer">View All</button>
          )}
          <button type="button" onClick={() => onOpenPostModal()} className="text-[13px] font-bold text-[#17233d] cursor-pointer">+ New</button>
        </div>
        <div className="mt-3 space-y-3">
          {compactReqs.length === 0 ? (
            <EmptyCard
              icon={<ClipboardList className="w-8 h-8 text-[#17233d]" />}
              title="No events yet"
              text="Post your budget. Vendors bid lower."
              cta="Post Event"
              onCta={() => onOpenPostModal()}
            />
          ) : (
            compactReqs.map((req) => {
              const bids = req.bidsCount || req.bids?.length || 0;
              return (
                <button key={req._id} type="button" onClick={() => onOpenMyEvents?.()} className="w-full text-left bg-white rounded-[20px] border border-[#e8edf2] p-3.5 cursor-pointer">
                  <div className="flex justify-between gap-2">
                    <p className="text-[15px] font-extrabold text-slate-900 truncate">{req.title}</p>
                    <span className="text-[10px] font-extrabold text-[#f07d4a] bg-[#fff7ed] border border-[#ffd7c2] px-2 py-0.5 rounded-full shrink-0">{req.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{req.location?.city} · {formatEventDate(req.eventDate)}</p>
                  <div className="flex justify-between mt-2 text-xs font-extrabold">
                    <span>₹{req.budget.toLocaleString()}</span>
                    <span className="text-[#0f766e]">{bids > 0 ? `${bids} bid${bids === 1 ? '' : 's'}` : 'Waiting'}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0f766e] opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0f766e]" />
          </span>
          <h2 className="flex-1 text-[17px] font-extrabold text-[#17233d]">Live Bidding</h2>
          {liveCount > 0 && <span className="px-2 py-0.5 rounded-full bg-[#e6f6f1] text-[#0f766e] text-[11px] font-extrabold">{liveCount} live</span>}
          <button type="button" onClick={() => onOpenMyEvents?.()} className="text-[13px] font-bold text-[#17233d] cursor-pointer">View All</button>
        </div>
        <div className="mt-3 space-y-3">
          {liveReqs.length === 0 ? (
            <EmptyCard
              icon={<div className="w-11 h-11 rounded-[14px] bg-[#e6f6f1] text-[#0f766e] flex items-center justify-center"><Radio className="w-5 h-5" /></div>}
              title="No live bids yet"
              text="Bids will show here after you post."
            />
          ) : (
            liveReqs.map((req) => {
              const bids = req.bidsCount || req.bids?.length || 0;
              const savePct = req.lowestBid && req.budget > 0 ? Math.round(((req.budget - req.lowestBid) / req.budget) * 100) : 0;
              return (
                <button key={req._id} type="button" onClick={() => onOpenMyEvents?.()} className={`w-full text-left bg-white rounded-[20px] p-3.5 border cursor-pointer ${bids > 0 ? 'border-emerald-200' : 'border-[#e8edf2]'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${bids > 0 ? 'bg-[#e8f8f0] text-[#0f766e]' : 'bg-[#fff1ea] text-[#f07d4a]'}`}>
                      {bids > 0 ? 'LIVE' : 'WAITING'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{bids > 0 ? `${bids} vendors bidding` : 'Vendors notified'}</span>
                  </div>
                  <p className="text-[15px] font-extrabold mt-2 line-clamp-2">{req.title}</p>
                  <div className="flex justify-between mt-2 text-xs font-extrabold">
                    <span className="text-slate-500">Budget ₹{req.budget.toLocaleString()}</span>
                    {req.lowestBid ? <span className="text-[#0f766e]">Lowest ₹{req.lowestBid.toLocaleString()}{savePct ? ` · ${savePct}% below` : ''}</span> : <span className="text-slate-400">No bids yet</span>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>
      </div>

      {/* Desktop my events + live bidding */}
      <section className="hidden lg:block w-full bg-[#f8fafc] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-14 space-y-10">
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-editorial text-4xl font-black text-[#0f172a] tracking-tight">My Events</h2>
                <p className="text-slate-500 text-sm font-semibold mt-1">
                  {requirements.length === 0
                    ? 'Posted requests and vendor bids'
                    : `${requirements.length} event${requirements.length === 1 ? '' : 's'} posted`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => onOpenMyEvents?.()} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-bold text-[#17233d] cursor-pointer">View All</button>
                <button type="button" onClick={() => onOpenPostModal()} className="px-5 py-2.5 rounded-full bg-[#f07d4a] text-white text-sm font-extrabold cursor-pointer">+ New Post</button>
              </div>
            </div>
            {compactReqs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 px-10 py-12 flex items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 text-[#17233d] flex items-center justify-center shrink-0">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-extrabold text-slate-900">No events yet</p>
                  <p className="text-sm text-slate-500 mt-1">Post your budget. Vendors bid lower. You pick the best one.</p>
                </div>
                <button type="button" onClick={() => onOpenPostModal()} className="px-6 py-3 rounded-xl bg-[#f07d4a] text-white font-extrabold text-sm cursor-pointer shrink-0">
                  Post Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {compactReqs.map((req) => {
                  const bids = req.bidsCount || req.bids?.length || 0;
                  const img = req.imageUrl || req.images?.[0];
                  return (
                    <button key={req._id} type="button" onClick={() => onOpenMyEvents?.()} className="text-left bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer">
                      {img && <img src={img} alt="" className="h-36 w-full object-cover" />}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-lg font-extrabold text-slate-900 line-clamp-2">{req.title}</p>
                          <span className="text-[10px] font-extrabold text-[#f07d4a] bg-[#fff7ed] border border-[#ffd7c2] px-2 py-0.5 rounded-full shrink-0">{req.status}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">{req.location?.city} · {formatEventDate(req.eventDate)}</p>
                        <div className="flex justify-between mt-4 text-sm font-extrabold">
                          <span>Budget ₹{req.budget.toLocaleString()}</span>
                          <span className="text-[#0f766e]">{bids > 0 ? `${bids} bid${bids === 1 ? '' : 's'}` : 'Waiting'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0f766e] opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0f766e]" />
              </span>
              <h2 className="font-editorial text-4xl font-black text-[#0f172a] tracking-tight flex-1">Live Bidding</h2>
              {liveCount > 0 && <span className="px-3 py-1 rounded-full bg-[#e6f6f1] text-[#0f766e] text-xs font-extrabold">{liveCount} live</span>}
              <button type="button" onClick={() => onOpenMyEvents?.()} className="text-sm font-bold text-[#17233d] cursor-pointer">View All</button>
            </div>
            {liveReqs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 px-10 py-10 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#e6f6f1] text-[#0f766e] flex items-center justify-center">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-extrabold">No live bids yet</p>
                  <p className="text-sm text-slate-500 mt-1">Bids will show here after you post an event.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {liveReqs.map((req) => {
                  const bids = req.bidsCount || req.bids?.length || 0;
                  const savePct = req.lowestBid && req.budget > 0 ? Math.round(((req.budget - req.lowestBid) / req.budget) * 100) : 0;
                  return (
                    <button key={req._id} type="button" onClick={() => onOpenMyEvents?.()} className={`text-left bg-white rounded-3xl p-5 border shadow-sm hover:shadow-lg transition cursor-pointer ${bids > 0 ? 'border-emerald-200' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${bids > 0 ? 'bg-[#e8f8f0] text-[#0f766e]' : 'bg-[#fff1ea] text-[#f07d4a]'}`}>
                          {bids > 0 ? 'LIVE' : 'WAITING'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{bids > 0 ? `${bids} vendors bidding` : 'Vendors notified'}</span>
                      </div>
                      <p className="text-lg font-extrabold mt-3 line-clamp-2">{req.title}</p>
                      <div className="flex justify-between mt-4 text-sm font-extrabold">
                        <span className="text-slate-500">Budget ₹{req.budget.toLocaleString()}</span>
                        {req.lowestBid ? <span className="text-[#0f766e]">Lowest ₹{req.lowestBid.toLocaleString()}{savePct ? ` · ${savePct}%` : ''}</span> : <span className="text-slate-400">No bids yet</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="lg:max-w-[1200px] lg:mx-auto lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:pt-8">
      <section className="px-4 lg:px-0 pt-6 lg:pt-0">
        <h2 className="text-[18px] font-extrabold text-[#17233d] mb-3">Why EzzyGo</h2>
        {[
          { Icon: IndianRupee, t: '15% below your budget' },
          { Icon: Shield, t: 'Pay held until event done' },
          { Icon: CheckCircle2, t: 'Full refund if cancelled' },
        ].map(({ Icon, t }) => (
          <div key={t} className="mb-2 bg-white rounded-2xl px-3.5 py-3 border border-[#e8edf2] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#e6f6f1] text-[#0f766e] flex items-center justify-center"><Icon className="w-4 h-4" /></div>
            <p className="text-sm font-extrabold">{t}</p>
          </div>
        ))}
      </section>

      <section className="px-4 lg:px-0 pt-6 lg:pt-0">
        <h2 className="text-[18px] font-extrabold text-[#17233d] mb-3">FAQ</h2>
        {HOME_FAQS.map((faq, i) => {
          const open = faqOpen === i;
          return (
            <button
              key={faq.q}
              type="button"
              onClick={() => setFaqOpen(open ? null : i)}
              className={`w-full text-left mb-2 bg-white rounded-2xl p-3.5 border cursor-pointer ${open ? 'border-[#17233d]/35' : 'border-[#e8edf2]'}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[#17233d] font-extrabold text-sm">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-[13px] font-bold">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 ${open ? 'rotate-180' : ''}`} />
              </div>
              {open && <p className="mt-2 text-xs text-slate-500 leading-relaxed">{faq.a}</p>}
            </button>
          );
        })}
      </section>
      </div>

      </div>
    </div>
  );
};

function RowTitle({ title, action, onAction, padded = true }: { title: string; action: string; onAction: () => void; padded?: boolean }) {
  return (
    <div className={`flex items-center ${padded ? 'px-4 lg:px-0' : ''}`}>
      <h2 className="flex-1 text-[18px] font-extrabold text-[#17233d]">{title}</h2>
      <button type="button" onClick={onAction} className="text-[13px] font-extrabold text-[#17233d] cursor-pointer">{action}</button>
    </div>
  );
}

function PosterCard({ title, image, icon, onClick, width }: { title: string; image: string; icon: React.ReactNode; onClick: () => void; width?: number; height?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-[28px] shrink-0 text-left cursor-pointer shadow-[0_8px_18px_rgba(0,0,0,0.18)] ${width ? 'w-[176px] h-[252px] lg:w-full lg:h-[280px]' : 'w-full aspect-[3/4]'}`}
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

function ServiceCard({ service, onClick }: { service: EventServiceItem; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="bg-white rounded-[18px] border border-[#e8edf2] overflow-hidden text-left shadow-[0_3px_12px_rgba(0,0,0,0.045)] cursor-pointer">
      <div className="relative h-[108px]">
        <img src={service.image} alt="" className="w-full h-full object-cover" />
        <span className="absolute left-2 top-2 w-6 h-6 rounded-full bg-white flex items-center justify-center" style={{ color: service.accent }}>
          {serviceIcon(service.filterKey)}
        </span>
        <span className="absolute right-2 top-2 px-1.5 py-0.5 rounded-full bg-[#e4f7ea] text-[#18794e] text-[9px] font-extrabold">Save 15%+</span>
      </div>
      <div className="p-2.5">
        <p className="text-[14px] font-extrabold truncate">{service.shortName}</p>
        <p className="text-[11.5px] font-bold text-slate-500 truncate">{service.priceRange}</p>
        <span className="mt-2 flex items-center justify-center gap-1 h-8 rounded-full bg-gradient-to-r from-[#f4a06c] to-[#f07d4a] text-white text-[11.5px] font-extrabold">
          Get Bids <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </button>
  );
}

function EmptyCard({ icon, title, text, cta, onCta }: { icon: React.ReactNode; title: string; text: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="bg-white rounded-[20px] border border-[#e8edf2] px-4 py-5 text-center">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-2.5 text-[15px] font-extrabold">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{text}</p>
      {cta && (
        <button type="button" onClick={onCta} className="mt-3.5 w-full h-11 rounded-[14px] bg-[#f07d4a] text-white font-extrabold text-sm cursor-pointer">
          {cta}
        </button>
      )}
    </div>
  );
}
