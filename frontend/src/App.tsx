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
        HERO SECTION WITH PROPORTIONATE BACKGROUND
        =======================================================================
      */}
      <div className="relative w-full min-h-screen lg:min-h-[860px] flex flex-col justify-between overflow-hidden bg-[#07141C]">
        
        {/* Background Image Layer - Properly scaled & positioned */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroBackground}
            alt="EzGo Hero Background"
            className="w-full h-full object-cover sm:object-cover object-top lg:object-[center_top] scale-100 sm:scale-100 transition-all duration-300"
          />
          {/* Subtle contrast gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#07141C]/80" />
        </div>

        {/* Foreground Content Container */}
        <div className="relative z-10 flex flex-col justify-between min-h-screen lg:min-h-[860px]">
          
          {/* Header / Navbar */}
          <Navbar onOpenPostModal={() => handleOpenPostModal()} />

          {/* Main Hero (Headline, Subheading & Pill Search Capsule) */}
          <div className="my-auto py-4 sm:py-6">
            <Hero onOpenPostModal={(service, city) => handleOpenPostModal(service, city)} />
          </div>

          {/* Bottom Service Category Orbs */}
          <div className="pb-6 sm:pb-10">
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
