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
    <section id="services" className="relative py-8 sm:py-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Circular Category Orbs Row */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2">
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
                className="group flex flex-col items-center gap-2 shrink-0 transition-transform active:scale-95"
              >
                {/* Circular Button */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-[#FF5A1F] shadow-lg shadow-white/20 scale-105 ring-4 ring-[#FF5A1F]/30'
                      : 'bg-black/50 hover:bg-black/70 text-white/80 hover:text-white border border-white/15'
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-[#FF5A1F]' : 'text-white/80 group-hover:text-white'}`} />
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] sm:text-xs font-medium tracking-tight text-center whitespace-nowrap transition-colors ${
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
