import { useRef } from 'react';
import { 
  Speaker, 
  Utensils, 
  Sparkles, 
  Camera, 
  Palette, 
  Flame, 
  Lightbulb, 
  Mic2, 
  Tent,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { SERVICES_DATA } from '../data/landingData';

interface ServiceRailProps {
  onSelectCategory: (categoryName: string) => void;
}

export default function ServiceRail({ onSelectCategory }: ServiceRailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Speaker':
        return <Speaker className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Utensils':
        return <Utensils className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Camera':
        return <Camera className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Lightbulb':
        return <Lightbulb className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Mic2':
        return <Mic2 className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Tent':
        return <Tent className="w-6 h-6 text-[#FF5A1F]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#FF5A1F]" />;
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="relative py-12 sm:py-16 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs uppercase tracking-widest text-[#FFF8EE]/80 font-semibold mb-3">
              <span>All Event Categories</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Curated Event Services
            </h2>
            <p className="text-sm sm:text-base text-[#FFF8EE]/70 mt-1 max-w-lg">
              Explore verified specialists ready to place competing reverse bids on your event.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="p-2.5 rounded-full bg-[#07141C]/80 hover:bg-[#07141C] border border-white/20 text-white transition hover:scale-105 active:scale-95 shadow-md backdrop-blur-md"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2.5 rounded-full bg-[#07141C]/80 hover:bg-[#07141C] border border-white/20 text-white transition hover:scale-105 active:scale-95 shadow-md backdrop-blur-md"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Service Rail */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-6 pt-2 scroll-smooth -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              onClick={() => onSelectCategory(service.name)}
              className="group relative flex-none w-[220px] sm:w-[260px] rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#07141C]/80 via-[#07141C]/65 to-[#07141C]/85 border border-white/15 hover:border-[#FF5A1F]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#FF5A1F]/20 cursor-pointer flex flex-col justify-between"
            >
              {/* Badge if present */}
              {service.badge && (
                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 text-[#FF5A1F] text-[10px] font-bold uppercase tracking-wider">
                  {service.badge}
                </div>
              )}

              {/* Icon Orb */}
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#FF5A1F]/15 group-hover:border-[#FF5A1F]/40 transition-all duration-300 shadow-lg">
                  {getIcon(service.iconName)}
                </div>

                <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#FF5A1F] transition-colors">
                  {service.name}
                </h3>

                <p className="text-xs text-[#FFF8EE]/70 mt-2 line-clamp-2 leading-relaxed">
                  {service.tagline}
                </p>
              </div>

              {/* Price & Action */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#FFF8EE]/50 block font-semibold">
                    Starts at
                  </span>
                  <span className="font-mono font-bold text-sm text-[#FFF8EE]">
                    {service.startingPrice}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#FF5A1F] text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-[-45deg]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
