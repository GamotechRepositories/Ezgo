import { useState } from 'react';
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
      
      {/* Navigation Header */}
      <Navbar onOpenPostModal={() => handleOpenPostModal()} />

      {/* 
        =======================================================================
        SECTION 1: HERO & LIVE BIDS + SERVICE CATEGORIES
        Luxury Indian Wedding Reception Night Atmosphere
        =======================================================================
      */}
      <div className="relative bg-[#07141C] overflow-hidden">
        {/* Hero Background with Rich Wedding Reception Ambience */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&auto=format&fit=crop&q=85"
            alt="Wedding Mandap & Reception Chandelier Lighting"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07141C]/80 via-[#07141C]/50 to-[#07141C]" />
          {/* Warm Golden Glow Accents */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-12 right-12 w-[400px] h-[300px] bg-[#FF5A1F]/15 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="relative z-10">
          {/* Hero Content with Search Capsule and Live Bids Card */}
          <Hero onOpenPostModal={(service, city) => handleOpenPostModal(service, city)} />

          {/* Circular Category Orbs Row */}
          <ServiceRail onSelectCategory={(catName) => handleOpenPostModal(catName)} />
        </div>

        {/* Seamless Flow Wave into Cream Section */}
        <div className="relative w-full overflow-hidden leading-none z-10 -mb-[1px]">
          <svg
            className="relative block w-full h-16 sm:h-24 md:h-32 text-[#FFF8EE]"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,21.3C1200,21,1320,43,1380,53.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* 
        =======================================================================
        SECTION 2 & 3: FOR EVERY OCCASION + HOW EZGO WORKS
        Cream / Warm Ivory Luxury Background with Golden Curves
        =======================================================================
      */}
      <div className="relative bg-[#FFF8EE] text-[#07141C] overflow-hidden pt-4 pb-16 sm:pb-24">
        {/* Subtle Decorative Golden Mandap/Paisley Motifs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-80 h-80 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* For Every Occasion: 4 Visual Cards */}
          <OccasionSection onSelectOccasion={(occTitle) => handleOpenPostModal(occTitle)} />

          {/* How EzGo Works: 5-Step Process */}
          <HowItWorks onOpenPostModal={() => handleOpenPostModal()} />
        </div>

        {/* Transition Wave into Dark Bidding Section */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 -mb-[1px]">
          <svg
            className="relative block w-full h-16 sm:h-24 md:h-32 text-[#07141C]"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,42.7C672,32,768,32,864,48C960,64,1056,96,1152,101.3C1248,107,1344,85,1392,74.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* 
        =======================================================================
        SECTION 4 & 5: REVERSE BIDDING & WHY CHOOSE EZGO
        Rich Dark Atmosphere with Phone Mockup and Couple Image
        =======================================================================
      */}
      <div className="relative bg-[#07141C] text-white overflow-hidden pt-12 pb-16 sm:pb-24">
        {/* Background Ambience */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1800&auto=format&fit=crop&q=80"
            alt="Reception Bokeh"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10">
          {/* Reverse Bidding with Smartphone Mockup & Script */}
          <BiddingShowcase onOpenPostModal={() => handleOpenPostModal()} />

          {/* Why Choose EzGo? 4 Circular Icons & Couple Feature */}
          <TrustSection />
        </div>

        {/* Transition Wave into Cream Testimonials Section */}
        <div className="relative w-full overflow-hidden leading-none z-10 -mb-[1px]">
          <svg
            className="relative block w-full h-16 sm:h-24 md:h-32 text-[#FFF8EE]"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,21.3C1200,21,1320,43,1380,53.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* 
        =======================================================================
        SECTION 6: WHAT OUR USERS SAY (TESTIMONIALS)
        Cream / Ivory Background with 3 White Cards & Gold Stars
        =======================================================================
      */}
      <div className="relative bg-[#FFF8EE] text-[#07141C] overflow-hidden pt-4 pb-16 sm:pb-24">
        <div className="relative z-10">
          <Testimonials />
        </div>

        {/* Transition Wave into Final CTA / Footer */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 -mb-[1px]">
          <svg
            className="relative block w-full h-16 sm:h-24 md:h-32 text-[#07141C]"
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,42.7C672,32,768,32,864,48C960,64,1056,96,1152,101.3C1248,107,1344,85,1392,74.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* 
        =======================================================================
        SECTION 7 & 8: FINAL CTA BANNER & FOOTER
        Nighttime Reception Background & Charcoal Footer
        =======================================================================
      */}
      <div className="relative bg-[#07141C] text-white overflow-hidden pt-10">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1800&auto=format&fit=crop&q=80"
            alt="Reception Table Candles"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          {/* Final CTA Banner with Right Stats Capsule */}
          <FinalCTA onOpenPostModal={() => handleOpenPostModal()} />

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Interactive Reverse-Bidding Modal */}
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
