import { ArrowRight, Users, ShieldCheck, Calendar, Star } from 'lucide-react';

interface FinalCTAProps {
  onOpenPostModal: () => void;
}

export default function FinalCTA({ onOpenPostModal }: FinalCTAProps) {
  return (
    <section className="relative py-16 sm:py-24 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Call to Action (6 cols on lg) */}
          <div className="lg:col-span-6 text-left">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#FF5A1F] uppercase block mb-2">
              READY TO PLAN YOUR EVENT?
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Post a Requirement Today
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed max-w-md">
              Join thousands of happy users who found the best event professionals at better prices.
            </p>

            <div className="mt-6">
              <button
                onClick={onOpenPostModal}
                className="px-6 py-3 rounded-full bg-[#FF5A1F] hover:bg-[#E44C13] text-white font-semibold text-xs sm:text-sm shadow-xl shadow-[#FF5A1F]/30 transition flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Side: Stats Capsule Bar (6 cols on lg) */}
          <div className="lg:col-span-6">
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-full bg-black/60 border border-white/15 backdrop-blur-md shadow-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
              
              {/* Stat 1 */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#FF5A1F] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs sm:text-sm text-white block leading-tight">10K+</span>
                  <span className="text-[10px] text-white/60">Happy Users</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#FF5A1F] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs sm:text-sm text-white block leading-tight">2K+</span>
                  <span className="text-[10px] text-white/60">Verified Providers</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#FF5A1F] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs sm:text-sm text-white block leading-tight">50K+</span>
                  <span className="text-[10px] text-white/60">Successful Bookings</span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex items-center gap-2.5 px-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-xs sm:text-sm text-white block leading-tight">4.8/5</span>
                  <span className="text-[10px] text-white/60">Average Rating</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
