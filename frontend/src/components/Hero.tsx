import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Star,
  Users
} from 'lucide-react';
import LiveBidsCard from './LiveBidsCard';

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
    <section className="relative pt-28 pb-8 sm:pt-36 sm:pb-12 lg:pt-38 lg:pb-14 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Hero Column (7.5 cols on lg) */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            
            {/* Eyebrow */}
            <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-white/80 font-bold mb-3">
              EVENT SERVICES MARKETPLACE
            </span>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] font-bold text-white tracking-tight leading-[1.08]">
              Your Event. <br />
              Your Budget. <br />
              <span className="text-[#FF5A1F]">Their Best Bid.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-4 text-xs sm:text-base text-white/85 max-w-lg leading-relaxed">
              Post what you need and let verified event professionals compete with better prices.
            </p>

            {/* Search / Requirement Pill Bar */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 w-full max-w-3xl p-1.5 sm:p-2 rounded-full bg-white text-[#07141C] shadow-2xl pill-input-shadow flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
            >
              {/* Field 1: Service */}
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 w-full sm:w-auto">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#07141C] placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              <div className="hidden sm:block w-[1px] h-6 bg-slate-200" />

              {/* Field 2: Location */}
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 w-full sm:w-auto">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Hyderabad, Telangana"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#07141C] placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              <div className="hidden sm:block w-[1px] h-6 bg-slate-200" />

              {/* Field 3: Date */}
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 w-full sm:w-auto">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Event date"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#07141C] placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#FF5A1F] hover:bg-[#E44C13] text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Post a Requirement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Integrated Stats Row */}
            <div className="mt-6 flex flex-wrap items-center gap-6 sm:gap-8 text-xs text-white">
              {/* Avatars */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img
                    className="w-6 h-6 rounded-full border-2 border-[#07141C] object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80"
                    alt=""
                  />
                  <img
                    className="w-6 h-6 rounded-full border-2 border-[#07141C] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&auto=format&fit=crop&q=80"
                    alt=""
                  />
                  <img
                    className="w-6 h-6 rounded-full border-2 border-[#07141C] object-cover"
                    src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=50&auto=format&fit=crop&q=80"
                    alt=""
                  />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block leading-none">10K+</span>
                  <span className="text-[10px] text-white/70">Happy Users</span>
                </div>
              </div>

              {/* Verified Providers */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#FF5A1F]">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block leading-none">2K+</span>
                  <span className="text-[10px] text-white/70">Verified Providers</span>
                </div>
              </div>

              {/* Average Rating */}
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div className="text-left">
                  <span className="font-bold text-xs block leading-none">4.8/5</span>
                  <span className="text-[10px] text-white/70">Average Rating</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Live Bids Floating Card (4 cols on lg) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <LiveBidsCard onSelectBid={() => onOpenPostModal(serviceInput || 'DJ / Sound', locationInput)} />
          </div>

        </div>

      </div>
    </section>
  );
}
