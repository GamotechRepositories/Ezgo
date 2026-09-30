import { useState, useEffect } from 'react';
import { VendorSidebar } from './components/VendorSidebar';
import { VendorHeader } from './components/VendorHeader';
import { LiveAuctionDesk } from './components/LiveAuctionDesk';
import { PlaceBidModal } from './components/PlaceBidModal';
import { ActiveOrdersDesk } from './components/ActiveOrdersDesk';
import { EarningsWallet } from './components/EarningsWallet';
import { EquipmentInventory } from './components/EquipmentInventory';
import { RuleExplainer } from './components/RuleExplainer';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { api, mockVendor } from './services/api';
import type { Requirement, Booking, User } from './types';

export default function App() {
  const [currentVendor, setCurrentVendor] = useState<User>(mockVendor);
  const [activeTab, setActiveTab] = useState<'auctions' | 'orders' | 'wallet' | 'inventory'>('auctions');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [selectedReqForBid, setSelectedReqForBid] = useState<Requirement | null>(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async () => {
    try {
      const user = await api.getVendorUser();
      if (user) setCurrentVendor(user);

      const [reqs, bks] = await Promise.all([
        api.getRequirements(),
        api.getMyBookings(user?._id),
      ]);
      setRequirements(reqs);
      setBookings(bks);
    } catch (_) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlaceBid = async (reqId: string, bidData: any) => {
    try {
      const newBid = await api.placeBid(reqId, bidData);
      setRequirements((prev) =>
        prev.map((r) => {
          if (r._id === reqId) {
            const currentLowest = r.lowestBid || r.budget;
            return {
              ...r,
              bidsCount: (r.bidsCount || 0) + 1,
              lowestBid: Math.min(currentLowest, bidData.amount),
              bids: [newBid, ...(r.bids || [])],
            };
          }
          return r;
        })
      );
      addToast(
        'success',
        'Bid Dispatched to Host!',
        `Your bid of ₹${bidData.amount.toLocaleString()} is live. Host will review your equipment package.`
      );
    } catch (err: any) {
      addToast('error', 'Bid Error', err.message);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status: 'COMPLETED' } : b))
    );
    addToast(
      'success',
      'Event Completed!',
      'Service marked complete. Full payout has been unlocked into your wallet.'
    );
  };

  const activeOrdersCount = bookings.filter((b) => b.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Left Sidebar */}
      <VendorSidebar
        vendor={currentVendor}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenExplainer={() => setIsExplainerOpen(true)}
        activeOrdersCount={activeOrdersCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        <VendorHeader
          vendor={currentVendor}
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onTabChange={setActiveTab}
          activeOrdersCount={activeOrdersCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'auctions' && (
            <LiveAuctionDesk
              requirements={requirements}
              currentUser={currentVendor}
              onOpenBidModal={(req) => setSelectedReqForBid(req)}
              onOpenExplainer={() => setIsExplainerOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <ActiveOrdersDesk
              bookings={bookings}
              onCompleteBooking={handleCompleteBooking}
            />
          )}

          {activeTab === 'wallet' && (
            <EarningsWallet
              vendor={currentVendor}
              bookings={bookings}
            />
          )}

          {activeTab === 'inventory' && (
            <EquipmentInventory />
          )}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-400 bg-white/50">
          EzGo Verified Vendor Partner Workspace • 100% Escrow Backed Direct Payouts
        </footer>
      </div>

      <PlaceBidModal
        isOpen={!!selectedReqForBid}
        onClose={() => setSelectedReqForBid(null)}
        requirement={selectedReqForBid}
        providerId={currentVendor._id}
        onSubmit={handlePlaceBid}
      />

      <RuleExplainer
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />
    </div>
  );
}