import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types';

interface AvailabilityCalendarProps {
  vendor: User;
  onUpdateVendor: (updated: User) => void;
  showToast: (type: 'success' | 'error', title: string, message: string) => void;
}

const COMMON_REASONS = [
  'Offline Wedding Booking',
  'Private Corporate Gig',
  'Equipment Maintenance & Servicing',
  'Holiday / Studio Off',
];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  vendor,
  onUpdateVendor,
  showToast,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const unavailableDates = vendor.unavailableDates || [];

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      showToast('error', 'Select Date', 'Please select a date to block.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate < todayStr) {
      showToast('error', 'Invalid Date', 'Cannot block past dates.');
      return;
    }

    if (unavailableDates.some((d) => d.date === selectedDate)) {
      showToast('error', 'Already Blocked', `Date ${selectedDate} is already marked as unavailable.`);
      return;
    }

    setLoading(true);
    try {
      const updated = await api.blockDate(selectedDate, reason || 'Booked / Offline Event');
      onUpdateVendor(updated);
      showToast('success', 'Date Blocked', `Date ${selectedDate} blocked successfully.`);
      setSelectedDate('');
      setReason('');
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to block date');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockDate = async (date: string) => {
    setLoading(true);
    try {
      const updated = await api.unblockDate(date);
      onUpdateVendor(updated);
      showToast('success', 'Date Unblocked', `Date ${date} is now available.`);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to unblock date');
    } finally {
      setLoading(false);
    }
  };

  // Find upcoming blocked dates
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingBlocked = unavailableDates
    .filter((d) => d.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-slate-100 text-[#17233d]">
            <CalendarDays className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-[22px] sm:text-3xl font-black text-slate-900 tracking-tight">
              Availability
            </h1>
            <p className="text-[13px] sm:text-base text-slate-500 mt-0.5">
              Block dates you already have offline gigs. Hosts will not get your bid on those days.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Block Form on Left, Upcoming Blackouts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form to Block Date */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#17233d]" />
              <span>Block a Date</span>
            </h2>
            <p className="text-xs text-slate-500">
              When a date is blocked, EzzyGo will automatically warn or prevent bids for events on that day.
            </p>
          </div>

          <form onSubmit={handleBlockDate} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="avail-date" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Date
              </label>
              <input
                id="avail-date"
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#17233d] focus:bg-white transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="avail-reason" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Reason / Note (Optional)
              </label>
              <input
                id="avail-reason"
                type="text"
                placeholder="e.g. Offline Wedding at Grand Hyatt"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#17233d] focus:bg-white transition"
              />

              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className="text-xs px-3.5 py-2 min-h-[36px] rounded-full bg-slate-100 hover:bg-slate-50 hover:text-slate-700 text-slate-600 border border-slate-200 transition cursor-pointer active:scale-95 flex items-center"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedDate}
              className="w-full py-3.5 min-h-[48px] rounded-2xl bg-[#f07d4a] hover:bg-[#ea4a17] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-slate-900/12 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Saving…' : 'Block this date'}</span>
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Blocking dates avoids double-booking penalties and preserves your <strong>5-star vendor completion rating</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Currently Blocked Dates List */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Blocked Dates Schedule
              </h2>
              <p className="text-xs text-slate-500">
                You currently have {upcomingBlocked.length} upcoming date{upcomingBlocked.length === 1 ? '' : 's'} blocked.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#17233d]">
              {upcomingBlocked.length} Blocked
            </span>
          </div>

          {upcomingBlocked.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">100% Available</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have no blocked dates. You are eligible to receive and bid on all upcoming reverse-auction events.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBlocked.map((item) => (
                <div
                  key={item.date}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-800 shrink-0 shadow-2xs">
                      <span className="text-[10px] font-bold text-[#17233d] uppercase">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-base font-black leading-none">
                        {new Date(item.date).getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.date}</span>
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>All-day blocked</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{item.reason}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUnblockDate(item.date)}
                    disabled={loading}
                    className="p-2.5 min-w-[42px] min-h-[42px] rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition cursor-pointer flex items-center justify-center"
                    title="Unblock date"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
