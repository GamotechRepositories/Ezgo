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
import { LoginPage } from './components/LoginPage';
import { api, getToken, clearToken } from './services/api';
import type { Requirement, Booking, User } from './types';

export default function App() {
  const [currentVendor, setCurrentVendor] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api.me()
      .then(setCurrentVendor)
      .catch(() => clearToken())
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600">Loading...</div>;
  }
  if (!currentVendor) return <LoginPage onSuccess={setCurrentVendor} />;
  return (
    <VendorApp
      currentVendor={currentVendor}
      onLogout={() => {
        clearToken();
        setCurrentVendor(null);
      }}
    />
  );
}

function VendorApp({ currentVendor, onLogout }: { currentVendor: User; onLogout: () => void }) {
  const [loadError, setLoadError] = useState('');
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
    setLoadError('');
    try {
      const [reqs, bks] = await Promise.all([
        api.getRequirements(),
        api.getMyBookings(currentVendor._id),
      ]);
      setRequirements(reqs);
      setBookings(bks);
    } catch (err: any) {
      setLoadError(err.message);
    }
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
        'Bid sent',
        `The host can now see your bid of ₹${bidData.amount.toLocaleString()}.`
      );
    } catch (err: any) {
      addToast('error', 'Could not send bid', err.message);
    }
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
          onLogout={onLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loadError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm">{loadError}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 rounded-full bg-white border border-rose-200 text-sm font-semibold hover:bg-rose-100 transition cursor-pointer shrink-0"
              >
                Try again
              </button>
            </div>
          )}

          {activeTab === 'auctions' && (
            <LiveAuctionDesk
              requirements={requirements}
              currentUser={currentVendor}
              onOpenBidModal={(req) => setSelectedReqForBid(req)}
              onOpenExplainer={() => setIsExplainerOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <ActiveOrdersDesk bookings={bookings} />
          )}

          {activeTab === 'wallet' && (
            <EarningsWallet
              vendor={currentVendor}
              bookings={bookings}
            />
          )}

          {activeTab === 'inventory' && (
            <EquipmentInventory vendorId={currentVendor._id} />
          )}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-400 bg-white/50">
          EzGo for vendors · You get your full bid after every event
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