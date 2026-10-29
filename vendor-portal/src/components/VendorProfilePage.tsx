import React from 'react';
import {
  UserRoundPen,
  Search,
  Briefcase,
  CalendarOff,
  Wallet,
  Package,
  CircleHelp,
  Headset,
  Globe,
  LogOut,
  ChevronRight,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import type { Requirement, Booking, User } from '../types';
import { getUserPortalUrl } from '../utils/portalUrls';

interface VendorProfilePageProps {
  vendor: User;
  requirements: Requirement[];
  bookings: Booking[];
  onEditProfile: () => void;
  onOpenLeads: () => void;
  onOpenJobs: () => void;
  onOpenCalendar: () => void;
  onOpenEarnings: () => void;
  onOpenEquipment: () => void;
  onOpenExplainer: () => void;
  onOpenVerification: () => void;
  onLogout: () => void;
}

export const VendorProfilePage: React.FC<VendorProfilePageProps> = ({
  vendor,
  requirements,
  bookings,
  onEditProfile,
  onOpenLeads,
  onOpenJobs,
  onOpenCalendar,
  onOpenEarnings,
  onOpenEquipment,
  onOpenExplainer,
  onOpenVerification,
  onLogout,
}) => {
  const name = vendor.businessName?.trim() || vendor.name || 'Event Vendor';
  const city = (vendor.serviceArea || '').split(',')[0].trim() || 'Set your city';
  const vendorId = String(vendor._id);
  const myBids = requirements.filter((r) =>
    (r.bids || []).some((b) => {
      const pId = typeof b.providerId === 'object' ? (b.providerId as { _id?: string })?._id : b.providerId;
      return String(pId) === vendorId;
    })
  ).length;
  const jobs = bookings.length;
  const done = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAYOUT_RELEASED').length;
  const initial = name.trim().charAt(0).toUpperCase() || 'V';
  const phoneDigits = (vendor.phone || '').replace(/\D/g, '');
  const phoneLabel = phoneDigits.length >= 10
    ? `+91 ${phoneDigits.slice(-10, -5)} ${phoneDigits.slice(-5)}`
    : vendor.phone || 'Add phone';

  const menus = [
    { icon: UserRoundPen, title: 'Edit profile', subtitle: 'Name, email, city and photo', onClick: onEditProfile },
    { icon: Search, title: 'Open leads', subtitle: 'Bid on live reverse auctions', onClick: onOpenLeads },
    { icon: Briefcase, title: 'My jobs', subtitle: 'Accepted bids and host contact', onClick: onOpenJobs },
    { icon: CalendarOff, title: 'Availability', subtitle: 'Block dates with offline gigs', onClick: onOpenCalendar },
    { icon: Wallet, title: 'Earnings', subtitle: 'You receive 100% of your bid', onClick: onOpenEarnings },
    { icon: Package, title: 'Equipment', subtitle: 'Gear you can bring to events', onClick: onOpenEquipment },
    { icon: ShieldCheck, title: 'Verification', subtitle: vendor.isVerified ? 'Verified vendor' : 'Complete KYC to bid faster', onClick: onOpenVerification },
    { icon: CircleHelp, title: 'How EzzyGo works', subtitle: 'Bid 15% below budget. You get 100% of your bid', onClick: onOpenExplainer },
    { icon: Headset, title: 'Help & support', subtitle: 'WhatsApp, call or email us', onClick: () => window.open('https://wa.me/919322054199?text=Hello%20EzzyGo%20Team', '_blank') },
    { icon: Globe, title: 'Host website', subtitle: 'See the customer booking site', onClick: () => window.open(getUserPortalUrl(), '_blank') },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <h1 className="text-[22px] font-black text-[#17233d]">My Account</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">Your jobs, bids and payouts.</p>
      </div>

      <div className="bg-white rounded-[20px] border border-[#e8edf2] p-4 flex items-center gap-3.5">
        <button type="button" onClick={onEditProfile} className="relative shrink-0 cursor-pointer">
          {vendor.avatar ? (
            <img src={vendor.avatar} alt="" className="w-16 h-16 rounded-full object-cover bg-[#fff1ea]" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#fff1ea] text-[#f07d4a] font-black text-xl flex items-center justify-center">
              {initial}
            </div>
          )}
          <span className="absolute -right-0.5 -bottom-0.5 w-[22px] h-[22px] rounded-full bg-[#f07d4a] text-white flex items-center justify-center">
            <Camera className="w-2.5 h-2.5" />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-extrabold truncate">{name}</p>
          <p className="text-[13px] text-slate-600">{phoneLabel}</p>
          {vendor.email ? <p className="text-xs text-slate-500 truncate">{vendor.email}</p> : null}
          <p className="text-xs text-slate-500 font-semibold">{city}</p>
        </div>
        <button type="button" onClick={onEditProfile} className="text-sm font-extrabold text-[#f07d4a] cursor-pointer">
          Edit
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          [String(myBids), 'Bids'],
          [String(jobs), 'Jobs'],
          [String(done), 'Completed'],
        ].map(([value, label]) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e8edf2] py-3.5 text-center">
            <p className="text-xl font-black text-[#17233d]">{value}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[20px] border border-[#e8edf2] overflow-hidden">
        {menus.map((row, i) => {
          const Icon = row.icon;
          return (
            <button
              key={row.title}
              type="button"
              onClick={row.onClick}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left cursor-pointer hover:bg-slate-50 ${i > 0 ? 'border-t border-[#e8edf2]' : ''}`}
            >
              <span className="w-[38px] h-[38px] rounded-xl bg-slate-100 text-[#17233d] flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{row.title}</span>
                <span className="block text-xs text-slate-500">{row.subtitle}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="w-full h-[46px] rounded-xl text-[#ff5148] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </div>
  );
};
