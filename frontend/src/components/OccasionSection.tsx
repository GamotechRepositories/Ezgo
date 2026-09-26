import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { OCCASIONS_DATA } from '../data/landingData';

interface OccasionSectionProps {
  onSelectOccasion: (occasionTitle: string) => void;
}

export default function OccasionSection({ onSelectOccasion }: OccasionSectionProps) {
  return (
    <section id="occasions" className="relative py-16 sm:py-24 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE]/10 border border-[#FFF8EE]/20 text-[#FFF8EE] text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Tailored By Occasion</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Find the Right Professionals <br />
            <span className="text-[#FF5A1F] italic font-normal">for Your Event</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#FFF8EE]/80 leading-relaxed">
            From grand Indian weddings to sacred festivals and corporate galas, find trusted local professionals for all your event needs.
          </p>
        </div>

        {/* 4 Large Visual Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {OCCASIONS_DATA.map((occasion) => (
            <div
              key={occasion.id}
              onClick={() => onSelectOccasion(occasion.title)}
              className="group relative rounded-[28px] overflow-hidden p-7 sm:p-9 bg-gradient-to-b from-[#07141C]/85 via-[#07141C]/75 to-[#07141C]/90 border border-white/15 hover:border-[#FF5A1F]/50 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#FF5A1F]/20 cursor-pointer flex flex-col justify-between min-h-[300px]"
            >
              {/* Background ambient gradient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5A1F]/10 rounded-full blur-3xl group-hover:bg-[#FF5A1F]/20 transition-all duration-500 pointer-events-none" />

              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#FFF8EE]/90 uppercase tracking-wider">
                    {occasion.badge}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-[#FF5A1F] text-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shadow-md">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Title */}
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white group-hover:text-[#FF5A1F] transition-colors leading-snug">
                  {occasion.title}
                </h3>

                {/* Subtitle */}
                <p className="mt-2 text-sm text-[#FFF8EE]/75 leading-relaxed">
                  {occasion.subtitle}
                </p>
              </div>

              {/* Service tags included */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-white/50 font-bold mb-2.5">
                  Popular Services Needed
                </p>
                <div className="flex flex-wrap gap-2">
                  {occasion.servicesIncluded.map((service, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-[#FFF8EE]/90 group-hover:border-white/20 transition"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#FF5A1F]" />
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
