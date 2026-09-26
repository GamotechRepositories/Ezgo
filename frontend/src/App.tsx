import { useState } from 'react';
import landingBackground from './assets/landingpagebackground.png';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServiceRail from './components/ServiceRail';
import OccasionSection from './components/OccasionSection';
import HowItWorks from './components/HowItWorks';
import BiddingShowcase from './components/BiddingShowcase';
import TrustSection from './components/TrustSection';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
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
        CONTINUOUS MASTER BACKGROUND CANVAS
        =======================================================================
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <img
          src={landingBackground}
          alt="EzGo Luxury Events Continuous Background"
          className="w-full h-full object-cover object-top opacity-85 min-h-[4200px]"
          loading="eager"
        />
        {/* Subtle ambient tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07141C]/30 via-transparent to-[#07141C]/60" />
      </div>

      {/* 
        =======================================================================
        FOREGROUND CONTINUOUS LANDING PAGE
        =======================================================================
      */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* 1. Transparent Floating Sticky Header */}
        <Navbar onOpenPostModal={() => handleOpenPostModal()} />

        {/* 2. Hero Section with Pill Search Bar & Live Bids Card */}
        <Hero onOpenPostModal={(service, city) => handleOpenPostModal(service, city)} />

        {/* 3. Circular Service Orbs Row */}
        <ServiceRail onSelectCategory={(catName) => handleOpenPostModal(catName)} />

        {/* 4. For Every Occasion Section (Weddings, Festivals, Corporate, Parties) */}
        <OccasionSection onSelectOccasion={(occTitle) => handleOpenPostModal(occTitle)} />

        {/* 5. How EzGo Works (5-Step Horizontal Process) */}
        <HowItWorks onOpenPostModal={() => handleOpenPostModal()} />

        {/* 6. Built For Your Budget: Reverse Bidding with Phone Mockup & Script */}
        <BiddingShowcase onOpenPostModal={() => handleOpenPostModal()} />

        {/* 7. Why Choose EzGo? (4 Guarantees & Script) */}
        <TrustSection />

        {/* 8. Trusted By Thousands: Testimonials (3 White Avatar Cards) */}
        <Testimonials />

        {/* 9. Ready To Plan Your Event? Final CTA Banner & Right Stats Capsule */}
        <FinalCTA onOpenPostModal={() => handleOpenPostModal()} />

        {/* 10. Dark Footer */}
        <Footer />

      </div>

      {/* Interactive Reverse-Bidding Simulation & Requirement Posting Modal */}
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
