import { Sparkles, Star, Quote, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/landingData';

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE]/10 border border-[#FFF8EE]/20 text-[#FFF8EE] text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Real Experiences</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            What Our Users Say
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#FFF8EE]/80 leading-relaxed">
            Discover how event hosts and top providers achieve transparent, win-win bookings on EzGo.
          </p>
        </div>

        {/* 3 Testimonial Cards (Soft Cream / Glassmorphism) */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS_DATA.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group relative p-7 sm:p-8 rounded-[28px] bg-gradient-to-b from-[#FFF8EE]/95 via-white/95 to-[#F8EBDD]/90 text-[#07141C] border border-white/80 backdrop-blur-2xl shadow-2xl shadow-black/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Top Rating & Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    {testimonial.savedAmount}
                  </span>
                </div>

                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-[#FF5A1F]/20 mb-3" />

                {/* Quote Text */}
                <p className="font-serif text-base sm:text-lg text-[#07141C] leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                <div className="mt-4 inline-block px-2.5 py-1 rounded-lg bg-[#07141C]/5 text-[11px] font-semibold text-[#07141C]/70">
                  {testimonial.serviceType}
                </div>
              </div>

              {/* Author Info */}
              <div className="mt-8 pt-5 border-t border-[#07141C]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF5A1F] to-amber-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-[#07141C]">
                        {testimonial.author}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="text-[11px] text-[#07141C]/60">
                      {testimonial.role} • {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
