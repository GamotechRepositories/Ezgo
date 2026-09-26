import { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';
import LiveBidsCard from './LiveBidsCard';
import { STATS_DATA } from '../data/landingData';

interface HeroProps {
  onOpenPostModal: (initialService?: string, initialCity?: string) => void;
}

export default function Hero({ onOpenPostModal }: HeroProps) {
  const [selectedService, setSelectedService] = useState('DJ / Sound');
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [eventDate, setEventDate] = useState('');

  const popularServices = [
    'DJ / Sound',
    'Catering',
    'Decoration',
    'Photography',
    'Bridal Mehendi',
    'Priest / Purohit'
  ];

  const cities = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Jaipur', 'Hyderabad', 'Pune'];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenPostModal(selectedService, selectedCity);
  };

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content Column (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE]/10 border border-[#FFF8EE]/20 text-[#FFF8EE] text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Event Services Marketplace</span>
            </div>

            {/* Editorial Serif Main Heading */}
            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-md">
              Your Event. <br />
              Your Budget. <br />
              <span className="text-[#FF5A1F] italic font-normal">Their Best Bid.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-xl text-[#FFF8EE]/85 max-w-xl font-normal leading-relaxed">
              Post what you need and let verified event professionals compete with better prices. Instant savings of <strong className="text-white font-semibold">15% or more</strong> guaranteed.
            </p>

            {/* Interactive Search / Post Requirement Bar */}
            <form
              onSubmit={handleQuickSubmit}
              className="mt-8 w-full max-w-2xl p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#07141C]/80 border border-white/20 backdrop-blur-2xl shadow-2xl shadow-black/60 flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-3"
            >
              {/* Service selector */}
              <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition">
                <Search className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[9px] uppercase tracking-wider text-white/50 font-bold">
                    Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-white font-medium focus:outline-none cursor-pointer truncate"
                  >
                    {popularServices.map((service) => (
                      <option key={service} value={service} className="bg-[#07141C] text-white">
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location selector */}
              <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition">
                <MapPin className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[9px] uppercase tracking-wider text-white/50 font-bold">
                    Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-white font-medium focus:outline-none cursor-pointer"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city} className="bg-[#07141C] text-white">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Event Date */}
              <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition">
                <Calendar className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[9px] uppercase tracking-wider text-white/50 font-bold">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7B47] text-white font-semibold text-xs sm:text-sm shadow-xl shadow-[#FF5A1F]/40 hover:shadow-[#FF5A1F]/60 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <span>Post Requirement</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Micro guarantees */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#FFF8EE]/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Free to post
              </span>
              <span className="text-white/30">•</span>
              <span>Average response: under 15 mins</span>
              <span className="text-white/30">•</span>
              <span>Zero obligation</span>
            </div>

            {/* Seamlessly Integrated Statistics */}
            <div className="mt-12 pt-8 border-t border-white/15 w-full grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS_DATA.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-[#FFF8EE]/90 mt-0.5">
                    {stat.label}
                  </span>
                  <span className="text-[11px] text-[#FFF8EE]/60">
                    {stat.sublabel}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Hero Column: Live Bids Floating Card (5 cols on lg) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-soft-float">
            <LiveBidsCard onSelectBid={() => onOpenPostModal(selectedService, selectedCity)} />
          </div>

        </div>
      </div>
    </section>
  );
}
