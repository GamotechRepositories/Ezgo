import { 
  FileText, 
  TrendingDown, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/landingData';

interface HowItWorksProps {
  onOpenPostModal: () => void;
}

export default function HowItWorks({ onOpenPostModal }: HowItWorksProps) {
  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-6 h-6 text-[#FF5A1F]" />;
      case 'TrendingDown':
        return <TrendingDown className="w-6 h-6 text-[#FF5A1F]" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-6 h-6 text-[#FF5A1F]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#FF5A1F]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-[#FF5A1F]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#FF5A1F]" />;
    }
  };

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE]/10 border border-[#FFF8EE]/20 text-[#FFF8EE] text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>How EzGo Works</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            A Simple 5-Step Process
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#FFF8EE]/80 leading-relaxed">
            Get the best event services at your budget with complete transparency and escrow security.
          </p>
        </div>

        {/* Desktop 5-Step Horizontal Journey */}
        <div className="hidden lg:block relative">
          
          {/* Continuous Glowing Connecting Line */}
          <div className="absolute top-1/2 left-[5%] right-[5%] -translate-y-12 h-[2px] bg-gradient-to-r from-[#FF5A1F]/30 via-[#FF5A1F] to-[#FF5A1F]/30 z-0" />

          <div className="grid grid-cols-5 gap-4 relative z-10">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.number}
                className="group flex flex-col items-center text-center p-4 rounded-3xl bg-[#07141C]/80 border border-white/10 hover:border-[#FF5A1F]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#FF5A1F]/20"
              >
                {/* Step Number Tag */}
                <div className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-mono text-[11px] font-bold mb-3 group-hover:bg-[#FF5A1F] group-hover:text-white transition-colors">
                  STEP {step.number}
                </div>

                {/* Circular Icon Orb */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#07141C] to-white/10 border-2 border-white/20 group-hover:border-[#FF5A1F] flex items-center justify-center mb-4 transition-all duration-300 shadow-xl group-hover:scale-110">
                  {getStepIcon(step.iconName)}
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-base text-white group-hover:text-[#FF5A1F] transition-colors leading-tight">
                  {step.title}
                </h3>

                {/* Subtitle */}
                <p className="text-[11px] font-semibold text-[#FF5A1F] mt-1">
                  {step.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs text-[#FFF8EE]/70 mt-2 leading-relaxed">
                  {step.description}
                </p>

                {/* Highlight Chip */}
                <span className="mt-4 inline-block px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-[#FFF8EE]/80">
                  {step.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet Vertical Connected Timeline */}
        <div className="lg:hidden relative pl-6 sm:pl-8 border-l-2 border-[#FF5A1F]/40 space-y-8 ml-3 sm:ml-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div key={step.number} className="relative group">
              
              {/* Timeline Marker Orb */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-[#07141C] border-2 border-[#FF5A1F] flex items-center justify-center text-white font-mono text-xs font-bold shadow-lg shadow-[#FF5A1F]/40">
                {step.number}
              </div>

              {/* Step Card */}
              <div className="p-5 rounded-2xl bg-[#07141C]/80 border border-white/15 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-white/10 text-[#FF5A1F]">
                    {getStepIcon(step.iconName)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#FF5A1F] font-semibold">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#FFF8EE]/75 leading-relaxed mt-2">
                  {step.description}
                </p>

                <div className="mt-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/10 text-[10px] font-medium text-[#FFF8EE]/90">
                    {step.highlight}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-14 text-center">
          <button
            onClick={onOpenPostModal}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7B47] text-white font-semibold text-sm shadow-xl shadow-[#FF5A1F]/30 hover:shadow-[#FF5A1F]/50 transition duration-300 hover:scale-105 active:scale-95"
          >
            <span>Experience Reverse Bidding Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
