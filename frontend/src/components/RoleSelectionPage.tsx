import React, { useState, useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { EzzyGoLogo } from "./EzzyGoLogo";

type RoleChoice = "host" | "vendor";

interface RoleSelectionPageProps {
  onSelect: (role: RoleChoice) => void;
}

const BANNER_URL =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&fit=crop&q=80";

const CalendarCheckIcon: React.FC = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <rect x="4" y="8" width="30" height="26" rx="5" fill="white" stroke="#FF3838" strokeWidth="2.2" />
    <rect x="4" y="8" width="30" height="9" rx="4" fill="#FF3838" />
    <rect x="12" y="4" width="4" height="7" rx="2" fill="#FF3838" />
    <rect x="22" y="4" width="4" height="7" rx="2" fill="#FF3838" />
    <path d="M13 23l4 4 8-8" stroke="#FF3838" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StorefrontIcon: React.FC = () => (
  <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
    <rect x="2" y="12" width="36" height="22" rx="4" fill="#00C853" />
    <path d="M2 12 Q10 4 20 4 Q30 4 38 12Z" fill="#059669" />
    <rect x="7" y="20" width="10" height="12" rx="2" fill="white" />
    <rect x="23" y="21" width="10" height="7" rx="2" fill="white" />
    <ellipse cx="10" cy="12" rx="4" ry="3" fill="#00C853" />
    <ellipse cx="20" cy="10" rx="4" ry="3" fill="#00C853" />
    <ellipse cx="30" cy="12" rx="4" ry="3" fill="#00C853" />
  </svg>
);

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<RoleChoice>("host");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 700);
    return () => clearInterval(id);
  }, []);

  const isHost = selected === "host";

  return (
    <div className="min-h-dvh flex flex-col bg-[#FCF9F6] overflow-x-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <EzzyGoLogo variant="host" size="md" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/70 text-xs font-semibold text-[#17233d] shadow-sm">
          India&#39;s #1 Event Marketplace
        </span>
      </header>

      {/* Wedding Banner */}
      <div className="w-full relative overflow-hidden" style={{ maxHeight: 280 }}>
        <img
          src={BANNER_URL}
          alt="Event Banner"
          className="w-full object-cover object-top"
          style={{ height: 240 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FCF9F6]" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 pt-2">
        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            How will you use{" "}
            <span className="text-[#FF3838]">EzzyGo?</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1.5">
            Choose one to continue. You can switch later.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase whitespace-nowrap">
            Select One Role
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="flex flex-col gap-3.5 max-w-lg w-full mx-auto">
          {/* Event Host Card */}
          <button
            onClick={() => setSelected("host")}
            className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-all duration-200 cursor-pointer ${
              isHost
                ? "bg-[#FFF5F4] border-[#FF453A] shadow-[0_5px_16px_rgba(255,69,58,0.12)]"
                : "bg-white border-slate-100 shadow-[0_3px_10px_rgba(0,0,0,0.03)] hover:border-slate-200"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                isHost ? "bg-[#FFECEB]" : "bg-slate-50"
              }`}
            >
              <CalendarCheckIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-extrabold text-slate-900 leading-tight">Customer</div>
              <div className="text-[13px] text-slate-500 font-medium mt-0.5 leading-snug">
                Plan events, compare bids &amp; book vendors
              </div>
            </div>
            {isHost ? (
              <div className="w-6 h-6 rounded-full bg-[#FF453A] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
            )}
          </button>

          {/* Service Provider Card */}
          <button
            onClick={() => setSelected("vendor")}
            className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-all duration-200 cursor-pointer ${
              !isHost
                ? "bg-[#F0FDF4] border-[#10B981] shadow-[0_5px_16px_rgba(16,185,129,0.12)]"
                : "bg-white border-slate-100 shadow-[0_3px_10px_rgba(0,0,0,0.03)] hover:border-slate-200"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                !isHost ? "bg-[#E8F8F0]" : "bg-slate-50"
              }`}
            >
              <StorefrontIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-extrabold text-slate-900 leading-tight">Service Provider</div>
              <div className="text-[13px] text-slate-500 font-medium mt-0.5 leading-snug">
                Find event leads, submit bids &amp; grow your business
              </div>
            </div>
            {!isHost ? (
              <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="sticky bottom-0 bg-[#FCF9F6] px-5 pt-4 pb-6 border-t border-slate-100/80">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-3">
          <button
            onClick={() => onSelect(selected)}
            style={{
              boxShadow: pulse
                ? "0 6px 24px rgba(255,56,56,0.38)"
                : "0 4px 14px rgba(255,56,56,0.22)",
            }}
            className="w-full h-14 rounded-2xl bg-[#FF3838] text-white font-extrabold text-[16.5px] flex items-center justify-center gap-2 tracking-tight transition-all duration-700 cursor-pointer hover:bg-[#e62e2e] active:scale-[0.98]"
          >
            {isHost ? "Continue as Customer" : "Continue as Service Provider"}
            <ArrowRight
              className={`w-5 h-5 transition-transform duration-700 ${pulse ? "translate-x-1" : ""}`}
            />
          </button>
          <p className="text-xs text-slate-400 font-medium text-center">
            You can change your role anytime in Profile.
          </p>
        </div>
      </div>
    </div>
  );
};
