import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Percent,
  ShieldCheck
} from 'lucide-react';
import type { Banner } from '../types';

interface PromoAdBannerProps {
  banners: Banner[];
  currentCity?: string;
  onActionClick?: (banner: Banner) => void;
}

export const PromoAdBanner: React.FC<PromoAdBannerProps> = ({
  banners = [],
  currentCity = 'Pune',
  onActionClick,
}) => {
  // Filter active banners matching city or ALL
  const cleanCity = currentCity ? currentCity.split(',')[0].trim().toLowerCase() : '';
  const matchingBanners = banners.filter((b) => {
    if (!b.isActive) return false;
    if (!b.city || b.city === 'ALL' || b.city === 'All Cities') return true;
    return b.city.toLowerCase().includes(cleanCity);
  });

  const activeList = matchingBanners;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate every 6 seconds if not hovered and multiple banners exist
  useEffect(() => {
    if (activeList.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeList.length, isHovered]);

  // Reset index if list changes
  useEffect(() => {
    if (currentIndex >= activeList.length) {
      setCurrentIndex(0);
    }
  }, [activeList.length, currentIndex]);

  const currentAd = activeList[currentIndex] || activeList[0];

  if (!currentAd) return null;

  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick(currentAd);
      return;
    }
    if (currentAd.targetUrl) {
      if (currentAd.targetUrl.startsWith('http')) {
        window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer');
      } else if (currentAd.targetUrl.startsWith('#')) {
        const elem = document.querySelector(currentAd.targetUrl);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative w-full overflow-hidden py-3 sm:py-5 bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-14">
        
        {/* Main Ad Billboard Container */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCta}
          className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-[#EFE6DC] group cursor-pointer"
        >
          {/* Background Blurred Ambient Glow for Ultrawide displays */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-110 opacity-70"
            style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
          />

          {/* High-Resolution Ad Photo */}
          <img
            key={currentAd.imageUrl}
            src={currentAd.imageUrl}
            alt={currentAd.title}
            className="absolute inset-0 w-full h-full object-cover object-right sm:object-center group-hover:scale-103 transition-transform duration-700 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/promo_banner_grand_event.jpg';
            }}
          />

          {/* Deep Cinematic Gradient Overlay: Dark on left to ensure high text readability, semi-transparent on right to showcase image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 sm:via-black/75 md:via-black/60 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

          {/* Relative Flex Column: Clean, high-impact commercial billboard ad layout */}
          <div className="relative z-20 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] lg:min-h-[240px] p-4 sm:p-6">
            
            {/* Top Bar: Distinct AD Identifier + City Tag */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Clear "AD" Identifier Pill - Instantly signals commercial advertisement */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-md">
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                    AD
                  </span>
                  <span className="text-[11px] font-bold text-white/90 tracking-wide">
                    {currentAd.badge || 'Sponsored Deal'}
                  </span>
                </div>

                {/* City Tag */}
                {currentAd.city && currentAd.city !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-white/10 text-[10px] font-bold">
                    <MapPin className="w-2.5 h-2.5 text-slate-500" />
                    <span>{currentAd.city}</span>
                  </span>
                )}
              </div>

              {/* Verified Partner Tag */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/80 text-[10px] font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Partner</span>
              </div>
            </div>

            {/* Bottom Offer Block: Bold Discount Pill + Clean Headline + 1-Line Tagline + CTA */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-6 mt-auto pt-2">
              
              {/* Left: Punchy Offer Copy */}
              <div className="max-w-xl space-y-1.5 sm:space-y-2">
                
                {/* Bold Discount Sticker */}
                {currentAd.discountPercent ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-[#ff5c28] text-slate-950 font-black text-[11px] sm:text-xs tracking-wider uppercase shadow-md shadow-slate-900/15">
                    <Percent className="w-3 h-3 stroke-[3]" />
                    <span>SAVE UP TO {currentAd.discountPercent}% • REVERSE BIDDING</span>
                  </div>
                ) : null}

                {/* Main Headline */}
                <h3 className="font-editorial text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-lg tracking-tight group-hover:text-amber-200 transition-colors line-clamp-1 sm:line-clamp-2">
                  {currentAd.title}
                </h3>

                {/* Single-line Subtitle (Clean, not text-heavy) */}
                <p className="text-xs sm:text-sm text-slate-200/90 font-medium max-w-lg line-clamp-1 drop-shadow">
                  {currentAd.subtitle || 'Book verified professionals with guaranteed reverse-bidding savings.'}
                </p>
              </div>

              {/* Right: CTA Button & Carousel Dots */}
              <div className="flex items-center justify-between sm:justify-start gap-3 shrink-0">
                
                {/* Carousel Indicators if multiple ads */}
                {activeList.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
                    {activeList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(idx);
                        }}
                        aria-label={`Go to ad ${idx + 1}`}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentIndex === idx
                            ? 'w-5 sm:w-7 bg-[#ff5c28]'
                            : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Direct High-Impact CTA Button */}
                <button
                  type="button"
                  onClick={handleCta}
                  className="btn-primary whitespace-nowrap"
                >
                  <span>{currentAd.ctaText || 'Claim Deal'}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                </button>

              </div>

            </div>

          </div>

          {/* Left & Right Slide Navigation Arrows (hidden on mobile, visible on tablet/desktop) */}
          {activeList.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
                }}
                aria-label="Previous ad"
                className="hidden md:flex absolute left-3.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/25 shadow-xl hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % activeList.length);
                }}
                aria-label="Next ad"
                className="hidden md:flex absolute right-3.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/25 shadow-xl hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
