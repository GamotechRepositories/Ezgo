import { 
  ShieldCheck, 
  Tag, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';

export default function TrustSection() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Verified Providers',
      subtitle: 'Trusted & reviewed'
    },
    {
      icon: Tag,
      title: 'Best Price Guarantee',
      subtitle: 'At least 15% lower'
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      subtitle: 'Money held safely'
    },
    {
      icon: CheckCircle2,
      title: 'Hassle Free Events',
      subtitle: 'Focus on what matters'
    }
  ];

  return (
    <section id="trust" className="relative py-16 sm:py-24 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Side: Content & 4 Circular Guarantees (7 cols on lg) */}
          <div className="lg:col-span-7 text-left">
            
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#FF5A1F] uppercase block mb-2">
              WHY CHOOSE EZGO?
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Everything You Need <br />
              for a Hassle-Free Event
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
              We make event planning simple, transparent and affordable with verified professionals and secure payments.
            </p>

            {/* 4 Feature Columns with Circular Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 mt-8">
              {trustItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex flex-col items-start text-left">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[#FF5A1F] mb-3">
                      <Icon className="w-5 h-5 text-white/90" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-white leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-white/60 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Side: Couple Photo & Script Text (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center relative">
            <div className="relative">
              {/* Handwritten script overlay */}
              <div className="font-script text-3xl sm:text-4xl text-white/95 text-center lg:text-right drop-shadow-lg">
                Make Your <br />
                <span className="text-amber-200">Event Unforgettable</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
