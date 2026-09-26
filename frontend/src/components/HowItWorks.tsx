import { 
  FileText, 
  Users2, 
  Sparkles, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';

interface HowItWorksProps {
  onOpenPostModal?: () => void;
}

export default function HowItWorks({ onOpenPostModal: _onOpenPostModal }: HowItWorksProps) {
  const steps = [
    {
      num: '01',
      icon: FileText,
      title: 'Post a Requirement',
      desc: 'Tell us what you need, location, date and budget.'
    },
    {
      num: '02',
      icon: Users2,
      title: 'Get Multiple Bids',
      desc: 'Verified providers compete with better prices.'
    },
    {
      num: '03',
      icon: Sparkles,
      title: 'Choose the Best',
      desc: 'Compare profiles, ratings and pick the best bid (min. 15% lower).'
    },
    {
      num: '04',
      icon: CreditCard,
      title: 'Pay Securely',
      desc: 'Pay bid amount + 10% platform fee. Amount is held safely by EzGo.'
    },
    {
      num: '05',
      icon: CheckCircle2,
      title: 'Enjoy Your Event',
      desc: 'Mark as complete after the event. Payment is released to the provider.'
    }
  ];

  return (
    <section id="how-it-works" className="relative py-16 sm:py-24 text-[#07141C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-4 h-[1.5px] bg-[#FF5A1F]" />
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#FF5A1F] uppercase">
              HOW EZGO WORKS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#07141C] tracking-tight">
            A Simple 5-Step Process
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-[#4A5568] leading-relaxed">
            Get the best event services at your budget with complete transparency and security.
          </p>
        </div>

        {/* 5-Step Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-3 items-start relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative flex flex-col items-center text-center px-2">
                
                {/* Connecting Arrow for Desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 -right-2 text-slate-300 z-10">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                )}

                {/* Number Badge + White Icon Card */}
                <div className="relative mb-4">
                  {/* Number Circle (Top Left of Card) */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#FF5A1F] text-white font-bold text-[10px] flex items-center justify-center shadow-md z-10">
                    {step.num}
                  </div>

                  {/* Icon Card */}
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-[#07141C]">
                    <Icon className="w-6 h-6 text-[#07141C]" />
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="font-bold text-xs sm:text-sm text-[#07141C] mb-1">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-[11px] text-[#64748B] leading-relaxed max-w-[190px]">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
