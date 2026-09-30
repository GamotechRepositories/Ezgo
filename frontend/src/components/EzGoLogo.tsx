import React from 'react';

interface EzGoLogoProps {
  variant?: 'host' | 'vendor' | 'admin' | 'simple';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  showBadge?: boolean;
  className?: string;
}

export const EzGoLogo: React.FC<EzGoLogoProps> = ({
  variant = 'host',
  size = 'md',
  theme = 'light',
  showBadge = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', subtext: 'text-[9px]', badge: 'text-[9px] px-1.5 py-0.2' },
    md: { icon: 36, text: 'text-2xl', subtext: 'text-[10px]', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 44, text: 'text-3xl', subtext: 'text-xs', badge: 'text-xs px-2.5 py-0.5' },
    xl: { icon: 54, text: 'text-4xl', subtext: 'text-sm', badge: 'text-xs px-3 py-1' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Real Vector Brandmark Icon */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-2xl shadow-md transition-transform hover:scale-105"
        style={{
          width: currentSize.icon,
          height: currentSize.icon,
          background: 'linear-gradient(135deg, #f95724 0%, #ea580c 50%, #ca8a04 100%)',
          boxShadow: '0 4px 14px -2px rgba(249, 87, 36, 0.35)',
        }}
      >
        {/* Subtle glossy overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/15 to-white/25 pointer-events-none" />
        
        {/* Crisp Dynamic E-Z Flash Emblem */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-white drop-shadow-xs"
        >
          {/* Fast forward stylized Z-lightning */}
          <path
            d="M8 12C8 10.3431 9.34315 9 11 9H27C28.6569 9 30 10.3431 30 12C30 12.8 29.6 13.5 29 14.1L18.5 23H27C28.6569 23 30 24.3431 30 26C30 27.6569 28.6569 29 27 29H11C9.34315 29 8 27.6569 8 26C8 25.2 8.4 24.5 9 23.9L19.5 15H11C9.34315 15 8 13.6569 8 12Z"
            fill="currentColor"
          />
          {/* Center speed spark */}
          <circle cx="32" cy="10" r="2.5" fill="#fef08a" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight ${currentSize.text} ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ez<span className="text-[#f95724]">Go</span>
          </span>

          {showBadge && variant === 'vendor' && (
            <span className={`font-black rounded-full uppercase tracking-wider bg-orange-500/10 text-[#f95724] border border-[#f95724]/20 ${currentSize.badge}`}>
              PRO VENDOR
            </span>
          )}

          {showBadge && variant === 'admin' && (
            <span className={`font-black rounded-full uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-300/30 ${currentSize.badge}`}>
              ADMIN HUB
            </span>
          )}
        </div>

        {variant !== 'simple' && (
          <span className={`font-semibold tracking-wide ${currentSize.subtext} ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
            {variant === 'vendor' ? 'Reverse-Bidding Partner' : variant === 'admin' ? 'Enterprise Operations' : 'Event Reverse Auctions'}
          </span>
        )}
      </div>
    </div>
  );
};
