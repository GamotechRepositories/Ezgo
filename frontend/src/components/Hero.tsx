import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Star,
  Users
} from 'lucide-react';

interface HeroProps {
  onOpenPostModal: (service?: string, city?: string) => void;
}

export default function Hero({ onOpenPostModal }: HeroProps) {
  const [serviceInput, setServiceInput] = useState('');
  const [locationInput, setLocationInput] = useState('Hyderabad, Telangana');
  const [dateInput, setDateInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenPostModal(serviceInput || 'DJ / Sound', locationInput);
  };

  return (
    <section className="relative pt-12 pb-1 sm:pt-14 sm:pb-2 lg:pt-16 lg:pb-2 text-white">
      <div className="max-w-5xl mx-auto">
        
        <div className="grid lg:grid-cols-12 gap-4 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            
            {/* Eyebrow */}
            <span className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase text-white/80 font-bold mb-1.5">
              EVENT SERVICES MARKETPLACE
            </span>

            {/* Headline (Even More Compact) */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-bold text-white tracking-tight leading-[1.12]">
              Your Event. <br />
              Your Budget. <br />
              <span className="text-[#FF5A1F]">Their Best Bid.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-2 text-[11px] sm:text-xs text-white/85 max-w-sm leading-relaxed">
              Post what you need and let verified event professionals compete with better prices.
            </p>

            {/* Search / Requirement Pill Bar (Ultra Compact) */}
            <form
              onSubmit={handleSubmit}
              className="mt-3.5 w-full max-w-xl p-1 rounded-full bg-white text-[#07141C] shadow-lg pill-input-shadow flex flex-col sm:flex-row items-center gap-1"
            >
              {/* Field 1: Service */}
              <div className="flex-1 flex items-center gap-1.5 px-2.5 py-0.5 w-full sm:w-auto">
                <Search className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  className="w-full bg-transparent text-[11px] text-[#07141C] placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              <div className="hidden sm:block w-[1px] h-3.5 bg-slate-200" />

              {/* Field 2: Location */}
              <div className="flex-1 flex items-center gap-1.5 px-2.5 py-0.5 w-full sm:w-auto">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Hyderabad, Telangana"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full bg-transparent text-[11px] text-[#07141C] placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              <div className="hidden sm:block w-[1px] h-3.5 bg-slate-200" />

              {/* Field 3: Date */}
              <div className="flex-1 flex items-center gap-1.5 px-2.5 py-0.5 w-full sm:w-auto">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Event date"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-transparent text-[11px] text-[#07141C] placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-full bg-[#FF5A1F] hover:bg-[#E44C13] text-white text-[10px] sm:text-[11px] font-semibold shadow-md transition flex items-center justify-center gap-1 shrink-0"
              >
                <span>Post a Requirement</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>

            {/* Integrated Stats Row (Ultra Compact) */}
            <div className="mt-3 flex flex-wrap items-center gap-4 sm:gap-5 text-xs text-white">
              {/* Avatars */}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  <img
                    className="w-4 h-4 rounded-full border border-[#07141C] object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80"
                    alt=""
                  />
                  <img
                    className="w-4 h-4 rounded-full border border-[#07141C] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&auto=format&fit=crop&q=80"
                    alt=""
                  />
                  <img
                    className="w-4 h-4 rounded-full border border-[#07141C] object-cover"
                    src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=50&auto=format&fit=crop&q=80"
                    alt=""
                  />
                </div>
                <div className="text-left">
                  <span className="font-bold text-[10px] block leading-none">10K+</span>
                  <span className="text-[8px] text-white/70">Happy Users</span>
                </div>
              </div>

              {/* Verified Providers */}
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[#FF5A1F]">
                  <Users className="w-2.5 h-2.5" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-[10px] block leading-none">2K+</span>
                  <span className="text-[8px] text-white/70">Verified Providers</span>
                </div>
              </div>

              {/* Average Rating */}
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <div className="text-left">
                  <span className="font-bold text-[10px] block leading-none">4.8/5</span>
                  <span className="text-[8px] text-white/70">Average Rating</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Spacer */}
          <div className="lg:col-span-4" />

        </div>

      </div>
    </section>
  );
}
