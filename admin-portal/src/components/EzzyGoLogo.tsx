import React from 'react';
import logoImg from '../assets/EzzyGo Event Marketplace Logo.png';

export interface EzzyGoLogoProps {
  variant?: 'host' | 'vendor' | 'admin' | 'simple';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  showBadge?: boolean;
  className?: string;
}

export const EzzyGoLogo: React.FC<EzzyGoLogoProps> = ({
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { imgHeight: 'h-7 sm:h-8', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { imgHeight: 'h-8 sm:h-10', badge: 'text-[10px] px-2 py-0.5' },
    lg: { imgHeight: 'h-10 sm:h-12', badge: 'text-xs px-2.5 py-0.5' },
    xl: { imgHeight: 'h-12 sm:h-14', badge: 'text-xs px-3 py-1' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src={logoImg}
        alt="EzzyGo Event Marketplace"
        className={`${currentSize.imgHeight} w-auto object-contain shrink-0 transition-transform duration-200 hover:scale-[1.02]`}
      />

      {showBadge && (
        <span className={`font-black rounded-full uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-300/30 ${currentSize.badge}`}>
          ADMIN HUB
        </span>
      )}
    </div>
  );
};

export const EzGoLogo = EzzyGoLogo;
