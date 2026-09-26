import { useState } from 'react';
import landingBackground from './assets/landingpagebackground.png';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServiceRail from './components/ServiceRail';
import OccasionSection from './components/OccasionSection';
import HowItWorks from './components/HowItWorks';
import BiddingShowcase from './components/BiddingShowcase';
import MobileAppPreview from './components/MobileAppPreview';
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
        CONTINUOUS MASTER BACKGROUND LAYER
        This image provides the seamless visual foundation across all sections
        =======================================================================
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <img
          src={landingBackground}
          alt="EzGo Luxury Events Continuous Background"
          className="w-full h-full object-cover object-top opacity-75 min-h-[4800px]"
          loading="eager"
        />
        {/* Subtle unified ambient overlay for contrast and high readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07141C]/40 via-transparent to-[#07141C]/80" />
      </div>

      {/* 
        =======================================================================
        FOREGROUND CONTINUOUS LUXURY LANDING PAGE
        =======================================================================
      */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Transparent Floating Sticky Header */}
        <Navbar onOpenPostModal={(service) => handleOpenPostModal(service)} />

        {/* Hero Section with Live Bids Card */}
        <Hero onOpenPostModal={(service, city) => handleOpenPostModal(service, city)} />

        {/* Floating Horizontal Service Rail */}
        <ServiceRail onSelectCategory={(catName) => handleOpenPostModal(catName)} />

        {/* Occasion Section (Weddings, Festivals, Corporate, Parties) */}
        <OccasionSection onSelectOccasion={(occTitle) => handleOpenPostModal(occTitle)} />

        {/* How It Works (Connected 5-Step Process) */}
        <HowItWorks onOpenPostModal={() => handleOpenPostModal()} />

        {/* Core USP: Reverse Bidding Showcase with Interactive Calculator */}
        <BiddingShowcase onOpenPostModal={(budget) => handleOpenPostModal(undefined, undefined, budget)} />

        {/* Mobile App Smartphone Mockup Preview */}
        <MobileAppPreview onOpenPostModal={() => handleOpenPostModal()} />

        {/* Trust & Safety Guarantees */}
        <TrustSection />

        {/* Testimonials (Soft Cream / Glass Cards) */}
        <Testimonials />

        {/* Final High-Converting Cinematic CTA */}
        <FinalCTA onOpenPostModal={() => handleOpenPostModal()} />

        {/* Dark Navy Footer */}
        <Footer />

      </div>

      {/* Interactive Reverse-Bidding & Requirement Posting Modal */}
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
