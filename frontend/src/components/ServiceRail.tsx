import { useState } from 'react';
import { 
  Headphones, 
  Utensils, 
  Sparkles, 
  Camera, 
  Feather, 
  Flame, 
  Lightbulb, 
  Users2, 
  Tent 
} from 'lucide-react';

interface ServiceRailProps {
  onSelectCategory: (categoryName: string) => void;
}

export default function ServiceRail({ onSelectCategory }: ServiceRailProps) {
  const [activeCategory, setActiveCategory] = useState('DJ / Sound');

  const categories = [
    { name: 'DJ / Sound', icon: Headphones },
    { name: 'Catering', icon: Utensils },
    { name: 'Decoration', icon: Sparkles },
    { name: 'Photography', icon: Camera },
    { name: 'Mehendi', icon: Feather },
    { name: 'Priest / Purohit', icon: Flame },
    { name: 'Lighting', icon: Lightbulb },
    { name: 'Performers', icon: Users2 },
    { name: 'Tent & Stage', icon: Tent }
  ];

  return (
    <section id="services" className="relative py-2 sm:py-2.5 text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Ultra-Compact Circular Category Orbs Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  onSelectCategory(cat.name);
                }}
                className="group flex flex-col items-center gap-1 shrink-0 transition-transform active:scale-95"
              >
                {/* Circular Button */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-[#FF5A1F] shadow-sm shadow-white/20 scale-105 ring-2 ring-[#FF5A1F]'
                      : 'bg-black/50 hover:bg-black/70 text-white/80 hover:text-white border border-white/15'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#FF5A1F]' : 'text-white/80 group-hover:text-white'}`} />
                </div>

                {/* Label */}
                <span
                  className={`text-[9px] sm:text-[10px] font-medium tracking-tight text-center whitespace-nowrap transition-colors ${
                    isActive ? 'text-white font-bold' : 'text-white/70 group-hover:text-white'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
