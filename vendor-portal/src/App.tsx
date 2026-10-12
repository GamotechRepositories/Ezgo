import { Search, CalendarCheck, Calendar, Wallet, Menu } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { VendorSidebar } from './components/VendorSidebar';
import { VendorHeader } from './components/VendorHeader';
import { LiveAuctionDesk } from './components/LiveAuctionDesk';
import { PlaceBidModal } from './components/PlaceBidModal';
import { ActiveOrdersDesk } from './components/ActiveOrdersDesk';
import { EarningsWallet } from './components/EarningsWallet';
import { EquipmentInventory } from './components/EquipmentInventory';
import { AvailabilityCalendar } from './components/AvailabilityCalendar';
import { RuleExplainer } from './components/RuleExplainer';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { LoginPage } from './components/LoginPage';
import { api, getToken, clearToken } from './services/api';
import { getSocket } from './services/socket';
import type { Requirement, Booking, User } from './types';

type VendorTab = 'auctions' | 'orders' | 'availability' | 'wallet' | 'inventory';

const tabFromUrl = (): VendorTab => {
  const hash = window.location.hash.replace('#', '');
  if (['orders', 'availability', 'wallet', 'inventory', 'auctions'].includes(hash)) {
    return hash as VendorTab;
  }
  return 'auctions';
};

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
      onUpdateVendor={setCurrentVendor}
      onLogout={() => {
        clearToken();
        setCurrentVendor(null);
      }}
    />
  );
}

function VendorApp({ currentVendor, onUpdateVendor, onLogout }: { currentVendor: User; onUpdateVendor?: (u: User) => void; onLogout: () => void }) {
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<VendorTab>(tabFromUrl);
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

  // Real-time WebSocket Live Bidding & Auctions
  useEffect(() => {
    if (!currentVendor?._id) return;
    const socket = getSocket();

    socket.emit('join:user', currentVendor._id);

    const handleBidPlaced = (data: {
      requirementId: string;
      bid: any;
      isUpdate: boolean;
      lowestBid: number;
      bidsCount: number;
    }) => {
      setRequirements((prev) =>
        prev.map((req) => {
          if (String(req._id) === String(data.requirementId)) {
            const existingBids = req.bids || [];
            const filteredBids = existingBids.filter((b) => String(b._id) !== String(data.bid?._id));
            return {
              ...req,
              lowestBid: data.lowestBid,
              bidsCount: data.bidsCount,
              bids: data.bid ? [data.bid, ...filteredBids] : existingBids,
            };
          }
          return req;
        })
      );
      // Also background refresh to sync ranking & calculations
      api.getRequirements().then(setRequirements).catch(() => {});
    };

    const handleRequirementCreated = (newReq: Requirement) => {
      setRequirements((prev) => {
        if (prev.some((r) => String(r._id) === String(newReq._id))) return prev;
        return [newReq, ...prev];
      });
      addToast('info', 'New Event Request Posted!', `${newReq.title} in ${newReq.location.area}`);
    };

    const handleRequirementUpdated = (updatedReq: Requirement) => {
      setRequirements((prev) =>
        prev.map((r) => (String(r._id) === String(updatedReq._id) ? { ...r, ...updatedReq } : r))
      );
    };

    socket.on('bid:placed', handleBidPlaced);
    socket.on('requirement:created', handleRequirementCreated);
    socket.on('requirement:updated', handleRequirementUpdated);

    return () => {
      socket.off('bid:placed', handleBidPlaced);
      socket.off('requirement:created', handleRequirementCreated);
      socket.off('requirement:updated', handleRequirementUpdated);
    };
  }, [currentVendor?._id]);

  const closeAllModals = useCallback(() => {
    setSelectedReqForBid(null);
    setIsExplainerOpen(false);
    setIsSidebarOpen(false);
  }, []);

  const anyModalOpen = !!selectedReqForBid || isExplainerOpen || isSidebarOpen;

  // Handle Escape Key & PopState
  useEffect(() => {
    const onPopState = () => {
      if (anyModalOpen) {
        closeAllModals();
      }
      setActiveTab(tabFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [anyModalOpen, closeAllModals]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && anyModalOpen) {
        closeAllModals();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [anyModalOpen, closeAllModals]);

  const handleTabChange = (tab: VendorTab) => {
    closeAllModals();
    if (tab !== tabFromUrl()) {
      window.history.pushState(null, '', `#${tab}`);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRaiseDispute = async (bookingId: string, reason: string) => {
    try {
      await api.raiseDispute(bookingId, reason);
      if (currentVendor?._id) {
        const updated = await api.getMyBookings(currentVendor._id);
        setBookings(updated);
      }
      addToast('success', 'Dispute Submitted', 'EzzyGo support has been alerted and will mediate this booking.');
    } catch (err: any) {
      addToast('error', 'Could not submit dispute', err.message);
      throw err;
    }
  };

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
      setSelectedReqForBid(null);
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
        onTabChange={handleTabChange}
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
          onTabChange={handleTabChange}
          activeOrdersCount={activeOrdersCount}
          onLogout={onLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
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
            <ActiveOrdersDesk bookings={bookings} onRaiseDispute={handleRaiseDispute} />
          )}

          {activeTab === 'wallet' && (
            <EarningsWallet
              vendor={currentVendor}
              bookings={bookings}
            />
          )}

          {activeTab === 'availability' && (
            <AvailabilityCalendar
              vendor={currentVendor}
              onUpdateVendor={(updated) => onUpdateVendor?.(updated)}
              showToast={(type, title, msg) => addToast(type, title, msg)}
            />
          )}

          {activeTab === 'inventory' && (
            <EquipmentInventory vendorId={currentVendor._id} />
          )}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-400 bg-white/50 mb-14 lg:mb-0">
          EzzyGo for vendors · You get your full bid after every event
        </footer>
      </div>
      {/* Mobile Fixed Bottom Navigation Bar for Vendors */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 flex items-center justify-around lg:hidden safe-bottom shadow-lg">
        <button
          onClick={() => handleTabChange('auctions')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'auctions' ? 'text-[#f95724] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Requests</span>
        </button>

        <button
          onClick={() => handleTabChange('orders')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'orders' ? 'text-[#f95724] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <CalendarCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Bookings</span>
          {activeOrdersCount > 0 && (
            <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
              {activeOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('availability')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'availability' ? 'text-[#f95724] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Calendar</span>
        </button>

        <button
          onClick={() => handleTabChange('wallet')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'wallet' ? 'text-[#f95724] font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Earnings</span>
        </button>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 font-medium transition cursor-pointer"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>


      <PlaceBidModal
        isOpen={!!selectedReqForBid}
        onClose={() => setSelectedReqForBid(null)}
        requirement={selectedReqForBid}
        providerId={currentVendor._id}
        existingBid={selectedReqForBid?.bids?.find(
          (b) => (typeof b.providerId === 'object' ? (b.providerId as any)?._id : b.providerId) === currentVendor._id
        )}
        onSubmit={handlePlaceBid}
      />

      <RuleExplainer
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />
    </div>
  );
}