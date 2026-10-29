import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera, Maximize2, X } from 'lucide-react';

interface CardImageGalleryProps {
  images?: string[];
  fallbackImage?: string;
  alt?: string;
  badge?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  enableLightbox?: boolean;
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80';

export const CardImageGallery: React.FC<CardImageGalleryProps> = ({
  images = [],
  fallbackImage = DEFAULT_FALLBACK,
  alt = 'Event reference',
  badge,
  className = 'w-full h-full',
  imageClassName = '',
  enableLightbox = true,
}) => {
  const validImages = Array.isArray(images) && images.length > 0
    ? images.filter((img) => Boolean(img && typeof img === 'string' && img.trim().length > 0))
    : [fallbackImage];

  const gallery = validImages.length > 0 ? validImages : [fallbackImage];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  const hasMultiple = gallery.length > 1;
  const activeUrl = failedIndices[currentIndex] ? fallbackImage : gallery[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex(idx);
  };

  const handleOpenLightbox = (e: React.MouseEvent) => {
    if (!enableLightbox) return;
    e.stopPropagation();
    e.preventDefault();
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div className={`relative overflow-hidden group select-none bg-slate-900 ${className}`}>
        {/* Main Image with Perfect Object Fit */}
        <img
          src={activeUrl}
          alt={`${alt} - photo ${currentIndex + 1}`}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${imageClassName}`}
          onError={() => {
            setFailedIndices((prev) => ({ ...prev, [currentIndex]: true }));
          }}
        />

        {/* Dynamic Dark Gradient for Contrast & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Optional Custom Top-Left Badge */}
        {badge && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            {badge}
          </div>
        )}

        {/* Top-Right Multi-Photo Counter Pill & Fullscreen Trigger */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {hasMultiple && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[11px] font-bold text-white shadow-xs border border-white/20">
              <Camera className="w-3 h-3 text-slate-500" />
              <span>
                {currentIndex + 1}/{gallery.length}
              </span>
            </span>
          )}

          {enableLightbox && (
            <button
              type="button"
              onClick={handleOpenLightbox}
              title="View full photo"
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-[#f07d4a] text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls when multiple images exist */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              title="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-[#f07d4a] text-white backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              title="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-[#f07d4a] text-white backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom Dots Indicator Bar */}
            <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
              {gallery.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? 'w-4 h-1.5 bg-[#f07d4a] shadow-xs'
                      : 'w-1.5 h-1.5 bg-white/70 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
            Photo {currentIndex + 1} of {gallery.length}
          </div>

          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeUrl}
              alt={alt}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-[#f07d4a] text-white flex items-center justify-center cursor-pointer transition shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-[#f07d4a] text-white flex items-center justify-center cursor-pointer transition shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
