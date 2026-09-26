import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface OccasionSectionProps {
  onSelectOccasion: (occasionTitle: string) => void;
}

export default function OccasionSection({ onSelectOccasion }: OccasionSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const occasions = [
    {
      id: 'weddings',
      title: 'Weddings',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'festivals',
      title: 'Festivals',
      image: 'https://images.unsplash.com/photo-1609137144822-0a25615ee516?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'corporate',
      title: 'Corporate Events',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'parties',
      title: 'Private Parties',
      image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&auto=format&fit=crop&q=80'
    }
  ];

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
    }
  };

  return (
    <section id="occasions" className="relative py-14 sm:py-20 text-[#07141C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Text Column (4.5 cols on lg) */}
          <div className="lg:col-span-4 text-left">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#FF5A1F] uppercase block mb-2">
              FOR EVERY OCCASION
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#07141C] tracking-tight leading-tight">
              Find the Right Professionals
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-[#4A5568] leading-relaxed max-w-sm">
              From weddings to festivals, get the best deals from trusted local professionals.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => onSelectOccasion('All Occasions')}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-[#07141C] text-xs font-semibold shadow-sm transition flex items-center gap-2"
              >
                <span>Explore All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleScroll('left')}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-[#07141C] flex items-center justify-center transition shadow-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-[#07141C] flex items-center justify-center transition shadow-sm"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Cards Column: 4 Vertical Visual Cards (8 cols on lg) */}
          <div className="lg:col-span-8">
            <div
              ref={scrollRef}
              className="flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-2 pt-1"
            >
              {occasions.map((occasion) => (
                <div
                  key={occasion.id}
                  onClick={() => onSelectOccasion(occasion.title)}
                  className="group relative flex-none w-[170px] sm:w-[200px] h-[240px] sm:h-[280px] rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Background Image */}
                  <img
                    src={occasion.image}
                    alt={occasion.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Overlay at bottom for readable text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Bottom Title Label */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                      {occasion.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
