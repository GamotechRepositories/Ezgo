import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: "Got an amazing photographer at 30% less than my budget. The whole process was so easy!",
      author: "Priya S.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      quote: "As a vendor, I get genuine leads and no extra charges. Great platform!",
      author: "Rahul K.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      quote: "Used EzGo for my brother's wedding. Everything was smooth and professional.",
      author: "Sneha M.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <section id="testimonials" className="relative py-16 sm:py-24 text-[#07141C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Arrows */}
        <div className="flex items-end justify-between gap-4 mb-10">
          <div className="text-left">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#FF5A1F] uppercase block mb-1">
              TRUSTED BY THOUSANDS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#07141C] tracking-tight">
              What Our Users Say
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[#07141C] flex items-center justify-center transition shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[#07141C] flex items-center justify-center transition shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 White Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-5 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-100 shadow-lg text-left flex flex-col justify-between"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                />
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Bottom Author & Stars */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-xs text-[#07141C]">
                  {t.author}
                </span>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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
