import { 
  Smartphone, 
  Bell, 
  Wifi, 
  Battery, 
  Signal, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import ezgoLogo from '../assets/ezgo-logo.png';

interface MobileAppPreviewProps {
  onOpenPostModal: () => void;
}

export default function MobileAppPreview({ onOpenPostModal }: MobileAppPreviewProps) {
  return (
    <section className="relative py-20 sm:py-28 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Phone Mockup (6 cols on lg) */}
          <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
            <div className="relative w-[300px] sm:w-[340px] rounded-[48px] p-3 bg-gradient-to-b from-slate-700 via-slate-900 to-black shadow-2xl shadow-black/90 border-4 border-slate-700/60 backdrop-blur-2xl">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 mr-3" />
                <div className="w-2 h-2 rounded-full bg-blue-900/80" />
              </div>

              {/* Phone Screen Container */}
              <div className="relative rounded-[40px] overflow-hidden bg-[#07141C] text-white p-4 pt-10 border border-white/10 font-sans shadow-inner">
                
                {/* Phone Status Bar */}
                <div className="flex items-center justify-between text-[11px] text-white/70 px-2 mb-4">
                  <span className="font-semibold">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Mock In-App Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 px-1">
                  <div className="flex items-center gap-2">
                    <img src={ezgoLogo} alt="EzGo" className="h-6 w-auto object-contain" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Live Bidding</h4>
                      <p className="text-[9px] text-emerald-400">● 4 Bids Active</p>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-full bg-white/10 text-white relative">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#FF5A1F]" />
                  </div>
                </div>

                {/* Requirement Banner Inside App */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/15 mb-3">
                  <span className="text-[9px] uppercase tracking-wider text-white/50 block font-bold">
                    Target Budget
                  </span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="font-mono text-lg font-bold text-white">₹25,000</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                      Wedding Mandap Decor
                    </span>
                  </div>
                </div>

                {/* Live Competing Bids in App */}
                <div className="space-y-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[11px] text-white">Royal Events</p>
                      <p className="text-[9px] text-white/60">⭐ 4.9 · Verified</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-white text-xs">₹22,000</p>
                      <p className="text-[9px] text-emerald-400 font-bold">-₹3,000</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-black/80 border border-emerald-500/60 flex items-center justify-between text-xs shadow-md">
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-[11px] text-white">Pixel Stories</p>
                        <span className="text-[8px] bg-emerald-600 text-white px-1 py-0.2 rounded">BEST</span>
                      </div>
                      <p className="text-[9px] text-white/60">⭐ 4.9 · 265 jobs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-300 text-xs">₹20,500</p>
                      <p className="text-[9px] text-emerald-400 font-bold">-₹4,500</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[11px] text-white">Dream Decor</p>
                      <p className="text-[9px] text-white/60">⭐ 4.8 · Verified</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-white text-xs">₹21,000</p>
                      <p className="text-[9px] text-emerald-400 font-bold">-₹4,000</p>
                    </div>
                  </div>
                </div>

                {/* Mock CTA inside phone */}
                <button
                  onClick={onOpenPostModal}
                  className="w-full py-2.5 rounded-xl bg-[#FF5A1F] text-white font-bold text-xs shadow-lg shadow-[#FF5A1F]/40 flex items-center justify-center gap-1.5"
                >
                  <span>Accept Pixel Stories Bid</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

              </div>
            </div>
          </div>

          {/* Right: Content & Experience (6 cols on lg) */}
          <div className="lg:col-span-6 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE]/10 border border-[#FFF8EE]/20 text-[#FFF8EE] text-xs font-semibold uppercase tracking-widest backdrop-blur-md mb-6">
              <Smartphone className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Mobile First Experience</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Real-Time Bids in the <br />
              <span className="text-[#FF5A1F] italic font-normal">Palm of Your Hand</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-[#FFF8EE]/80 leading-relaxed">
              Receive live push notifications as top event vendors in your city underbid each other. Track quotes, chat with verified professionals, and secure your date with one tap.
            </p>

            <div className="mt-8 space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F] shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Instant Price Drops</h4>
                  <p className="text-xs text-[#FFF8EE]/70 mt-0.5">
                    Vendors reduce bids in real-time until you find your dream price point.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">EzGo SafeLock Escrow</h4>
                  <p className="text-xs text-[#FFF8EE]/70 mt-0.5">
                    Your advance stays secure in escrow until the vendor finishes the event on ground.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
