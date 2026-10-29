import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Cake,
  Camera,
  CheckCircle2,
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
      <div className="sticky top-0 lg:top-20 z-20 bg-white border-b border-slate-100 px-2 h-14 flex items-center gap-1">
        <button type="button" onClick={onBack} aria-label="Back" className="w-10 h-10 flex items-center justify-center cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-extrabold text-[#17233d]">{title}</h1>
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
        <span className="mt-2 flex items-center justify-center gap-1 h-8 rounded-full bg-gradient-to-r from-[#f4a06c] to-[#f07d4a] text-white text-[11.5px] font-extrabold">
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
      className={`bg-[#fff6f1] rounded-[18px] border-[1.4px] border-[#f07d4a]/40 p-3 text-center cursor-pointer min-h-[180px] h-full flex flex-col items-center ${className}`}
    >
      <span className="w-[42px] h-[42px] rounded-full bg-white shadow-[0_4px_8px_rgba(240,125,74,0.16)] flex items-center justify-center mt-1">
        <Plus className="w-5 h-5 text-[#f07d4a]" />
      </span>
      <p className="mt-2.5 text-[14.5px] font-extrabold text-[#17233d] leading-tight">{title}</p>
      <p className="mt-1 text-[11.5px] text-slate-500 font-medium leading-snug flex-1 px-1">{subtitle}</p>
      <span className="mt-2 w-full py-1.5 rounded-full bg-gradient-to-r from-[#f4a06c] to-[#f07d4a] text-white text-[11.5px] font-extrabold inline-flex items-center justify-center gap-1">
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

function DetailStep({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-2.5 mb-2.5">
      <span className="w-[26px] h-[26px] rounded-full bg-[#fde7d8] text-[#f07d4a] text-xs font-extrabold flex items-center justify-center shrink-0">
        {n}
      </span>
      <div>
        <p className="text-sm font-extrabold text-[#17233d]">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col pb-28 lg:pb-10 lg:pt-20">
      <div className="relative h-[220px] lg:h-[360px] lg:rounded-b-[28px] overflow-hidden">
        <img src={service.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-[11px] font-extrabold tracking-wide uppercase opacity-80">{service.shortName}</p>
          <h1 className="text-[22px] lg:text-4xl font-black leading-tight">{service.title}</h1>
        </div>
      </div>

      <div className="px-4 py-4 lg:max-w-[960px] lg:mx-auto lg:w-full lg:px-8 space-y-4 flex-1">
        <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
        <div className="bg-white rounded-[18px] border border-[#e8edf2] p-4">
          <p className="text-xs font-semibold text-slate-500">Typical market price</p>
          <p className="text-[22px] font-extrabold text-[#17233d] mt-1">{service.priceRange}</p>
          <p className="text-[13px] text-slate-600 font-medium mt-1.5 leading-relaxed">
            This is not a fixed price. You set a budget. Vendors must bid at least 15% below it.
          </p>
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#17233d] mb-2.5">How this works</h2>
          <DetailStep n={1} title="Post your date, city and max budget" subtitle="Free. Takes about 1 minute." />
          <DetailStep n={2} title="Vendors send lower bids" subtitle="You only see prices at least 15% below your budget." />
          <DetailStep n={3} title="Pick one and pay to EzzyGo" subtitle="We hold the money. Vendor is paid after you mark the event done." />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#17233d] mb-2.5">Usually includes</h2>
          {covers.map((line) => (
            <p key={line} className="text-sm font-medium text-slate-700 flex gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#0f766e] shrink-0 mt-0.5" />
              {line}
            </p>
          ))}
        </div>
        <div className="hidden lg:block pt-2">
          <button
            type="button"
            onClick={() => onOpenPost(service.title)}
            className="w-full h-12 rounded-2xl bg-[#f07d4a] text-white font-extrabold text-[15px] cursor-pointer"
          >
            Get bids for {service.shortName}
          </button>
          <p className="text-center text-xs text-slate-500 font-semibold mt-2">Free to post. Pay only after you choose a vendor.</p>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e8edf2] px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          type="button"
          onClick={() => onOpenPost(service.title)}
          className="w-full h-[50px] rounded-2xl bg-[#f07d4a] text-white font-extrabold text-[15px] cursor-pointer"
        >
          Get bids for {service.shortName}
        </button>
        <p className="text-center text-xs text-slate-500 font-semibold mt-1.5">Free to post. Pay only after you choose a vendor.</p>
      </div>
    </div>
  );
}
