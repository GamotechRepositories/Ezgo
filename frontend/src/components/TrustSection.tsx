import { 
  BadgeCheck, 
  Percent, 
  ShieldCheck, 
  HeartHandshake, 
  Sparkles,
  Lock,
  Headphones
} from 'lucide-react';
import { TRUST_FEATURES } from '../data/landingData';

export default function TrustSection() {
  const getTrustIcon = (iconName: string) => {
    switch (iconName) {
      case 'BadgeCheck':
        return <BadgeCheck className="w-8 h-8 text-[#FF5A1F]" />;
      case 'Percent':
        return <Percent className="w-8 h-8 text-[#FF5A1F]" />;
      case 'Lock':
        return <Lock className="w-8 h-8 text-[#FF5A1F]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-8 h-8 text-[#FF5A1F]" />;
      default:
        return <ShieldCheck className="w-8 h-8 text-[#FF5A1F]" />;
    }
  };

  return (
    <section id="trust" className="relative py-20 sm:py-28 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE]/10 border border-[#FFF8EE]/20 text-[#FFF8EE] text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Trust & Peace of Mind</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Everything You Need <br />
            <span className="text-[#FF5A1F] italic font-normal">for a Hassle-Free Event</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#FFF8EE]/80 leading-relaxed">
            We combine rigorous vendor vetting with escrow financial protection so you can enjoy your celebrations worry-free.
          </p>
        </div>

        {/* 4 Trust Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {TRUST_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="group relative p-7 rounded-3xl bg-gradient-to-b from-[#07141C]/85 via-[#07141C]/75 to-[#07141C]/90 border border-white/15 hover:border-[#FF5A1F]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#FF5A1F]/15 flex flex-col justify-between"
            >
              <div>
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/15 group-hover:border-[#FF5A1F]/50 group-hover:bg-[#FF5A1F]/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-105 shadow-inner">
                  {getTrustIcon(feature.iconName)}
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#FF5A1F]/15 text-[#FF5A1F] text-[10px] font-bold uppercase tracking-wider mb-2">
                  {feature.stat}
                </div>

                <h3 className="font-serif font-bold text-xl text-white group-hover:text-[#FF5A1F] transition-colors">
                  {feature.title}
                </h3>

                <p className="text-xs font-semibold text-[#FFF8EE]/90 mt-1">
                  {feature.subtitle}
                </p>

                <p className="text-xs text-[#FFF8EE]/70 mt-3 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Subtle Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  EzGo Verified
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Concierge Support Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/20 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#FF5A1F]/30">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-white">
                Dedicated Event Concierge Support
              </h4>
              <p className="text-xs sm:text-sm text-[#FFF8EE]/75 mt-0.5">
                Have a large multi-day wedding or corporate summit? Our dedicated managers coordinate custom bids for you.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition shrink-0 backdrop-blur-md"
          >
            Talk to Concierge →
          </a>
        </div>

      </div>
    </section>
  );
}
