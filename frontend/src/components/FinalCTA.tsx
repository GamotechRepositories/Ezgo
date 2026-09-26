import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

interface FinalCTAProps {
  onOpenPostModal: () => void;
  onOpenProviderModal?: () => void;
}

export default function FinalCTA({ onOpenPostModal, onOpenProviderModal }: FinalCTAProps) {
  return (
    <section className="relative py-24 sm:py-32 text-white overflow-hidden text-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Glow behind container */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A1F]/20 via-amber-500/10 to-indigo-500/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="p-8 sm:p-14 rounded-[36px] bg-gradient-to-b from-[#07141C]/90 via-[#07141C]/80 to-[#07141C]/95 border border-white/20 backdrop-blur-2xl shadow-2xl shadow-black/80">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE]/10 border border-[#FFF8EE]/20 text-[#FFF8EE] text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Start Saving Today</span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Ready to Plan <br className="hidden sm:block" />
            <span className="text-[#FF5A1F] italic font-normal">Your Dream Event?</span>
          </h2>

          {/* Subheading */}
          <p className="mt-5 text-base sm:text-xl text-[#FFF8EE]/80 max-w-2xl mx-auto leading-relaxed font-normal">
            Post your requirement in under 60 seconds and let verified professionals compete for your business. Guaranteed 15%+ savings and escrow protection.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenPostModal}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7B47] hover:from-[#FF5A1F] hover:to-[#E44C13] text-white font-bold text-sm sm:text-base shadow-2xl shadow-[#FF5A1F]/40 hover:shadow-[#FF5A1F]/60 transition duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenProviderModal || onOpenPostModal}
              className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm sm:text-base transition duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-md"
            >
              <UserCheck className="w-4 h-4 text-[#FF5A1F]" />
              <span>Become a Verified Provider</span>
            </button>
          </div>

          {/* Trust badges footer */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#FFF8EE]/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Escrow Protection
            </span>
            <span>•</span>
            <span>Zero Advance Risk</span>
            <span>•</span>
            <span>No Hidden Commissions</span>
          </div>

        </div>

      </div>
    </section>
  );
}
