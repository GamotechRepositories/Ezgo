import { useState } from 'react';
import heroBackground from './assets/hero-background.png';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServiceRail from './components/ServiceRail';
import PostRequirementModal from './components/PostRequirementModal';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalService, setModalService] = useState<string | undefined>(undefined);
  const [modalCity, setModalCity] = useState<string | undefined>(undefined);
  const [modalBudget, setModalBudget] = useState<number | undefined>(undefined);

  const handleOpenPostModal = (service?: string, city?: string, budget?: number) => {
    setModalService(service);
    setModalCity(city);
    setModalBudget(budget);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#07141C] text-slate-100 font-sans selection:bg-[#FF5A1F]/30 selection:text-[#FF7B47] overflow-x-hidden flex flex-col justify-between">
      
      {/* 
        =======================================================================
        COMPACT HERO SECTION WITH PROPORTIONATE BACKGROUND
        =======================================================================
      */}
      <div className="relative w-full max-h-[85vh] lg:max-h-[720px] min-h-[580px] sm:min-h-[640px] flex flex-col justify-between overflow-hidden bg-[#07141C]">
        
        {/* Background Image Layer - Scaled down & nicely framed */}
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
          <img
            src={heroBackground}
            alt="EzGo Hero Background"
            className="w-full h-full object-cover object-top opacity-90 transition-all duration-300"
          />
          {/* Subtle vignette gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#07141C]/90" />
        </div>

        {/* Foreground Content Container */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          
          {/* Header / Navbar (Compact) */}
          <Navbar onOpenPostModal={() => handleOpenPostModal()} />

          {/* Main Hero (Compact Headline & Search Capsule) */}
          <div className="my-auto py-2">
            <Hero onOpenPostModal={(service, city) => handleOpenPostModal(service, city)} />
          </div>

          {/* Bottom Service Category Orbs (Compact) */}
          <div className="pb-4 sm:pb-6">
            <ServiceRail onSelectCategory={(catName) => handleOpenPostModal(catName)} />
          </div>

        </div>

      </div>

      {/* Interactive Modal when clicking Post Requirement / Service */}
      <PostRequirementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialService={modalService}
        initialCity={modalCity}
        initialBudget={modalBudget}
      />

    </div>
  );
}
