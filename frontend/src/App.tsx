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
    <div className="relative min-h-screen bg-[#07141C] text-slate-100 font-sans selection:bg-[#FF5A1F]/30 selection:text-[#FF7B47] overflow-x-hidden">
      
      {/* 
        =======================================================================
        HERO BACKGROUND IMAGE CONTAINER
        Using herosection background.png directly as requested
        =======================================================================
      */}
      <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBackground}
            alt="EzGo Hero Background"
            className="w-full h-full object-cover object-top"
          />
          {/* Subtle contrast gradient for maximum readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#07141C]/90" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col justify-between min-h-screen">
          
          {/* Header / Navbar */}
          <Navbar onOpenPostModal={() => handleOpenPostModal()} />

          {/* Main Hero (Left Headline & Search Bar + Right Live Bids Card) */}
          <div className="my-auto py-8">
            <Hero onOpenPostModal={(service, city) => handleOpenPostModal(service, city)} />
          </div>

          {/* Bottom Service Category Orbs */}
          <div className="pb-8 sm:pb-12">
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
