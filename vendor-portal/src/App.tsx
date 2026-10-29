import { Search, Briefcase, Calendar, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { VendorSidebar } from './components/VendorSidebar';
import { VendorHeader } from './components/VendorHeader';
import { VendorAccountModal } from './components/VendorAccountModal';
import { VendorVerificationModal } from './components/VendorVerificationModal';
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
import { VendorProfilePage } from './components/VendorProfilePage';
import { api, getToken, clearToken, getUser, setUser, clearUser } from './services/api';
import { getSocket } from './services/socket';
import type { Requirement, Booking, User } from './types';

type VendorTab = 'auctions' | 'orders' | 'availability' | 'wallet' | 'inventory' | 'profile';

const tabFromUrl = (): VendorTab => {
  const hash = window.location.hash.replace('#', '');
  if (['orders', 'availability', 'wallet', 'inventory', 'auctions', 'profile'].includes(hash)) {
    return hash as VendorTab;
  }
  return 'auctions';
};

export default function App() {
  const [currentVendor, setCurrentVendor] = useState<User | null>(() => getUser());
  const [ready, setReady] = useState(() => Boolean(getUser() && getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api.me()
      .then((user) => {
        setCurrentVendor(user);
        setUser(user);
      })
      .catch((err: any) => {
        // Only clear credentials if backend explicitly rejects with 401 (token expired/invalid)
        if (err?.status === 401 || err?.message?.toLowerCase().includes('log in again') || err?.message?.toLowerCase().includes('expired')) {
          clearToken();
          clearUser();
          setCurrentVendor(null);
        }
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600">Loading...</div>;
  }
  if (!currentVendor) {
    return (
      <LoginPage
        onSuccess={(user) => {
          setCurrentVendor(user);
          setUser(user);
        }}
      />
    );
  }
  return (
    <VendorApp
      currentVendor={currentVendor}
      onUpdateVendor={(user) => {
        setCurrentVendor(user);
        setUser(user);
      }}
      onLogout={() => {
        clearToken();
        clearUser();
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
  const [marketplaceCity, setMarketplaceCity] = useState('ALL');
  
  const [selectedReqForBid, setSelectedReqForBid] = useState<Requirement | null>(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message: message || '' }]);
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
  }, [currentVendor._id]);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'wallet') {
      api.getMyBookings(currentVendor._id).then(setBookings).catch(() => {});
    }
  }, [activeTab, currentVendor._id]);

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

    const handleBookingCreated = (newBooking: any) => {
      const provId = String(typeof newBooking.providerId === 'object' ? newBooking.providerId?._id : newBooking.providerId);
      if (provId === String(currentVendor._id)) {
        setBookings((prev) => [newBooking, ...prev.filter((b) => String(b._id) !== String(newBooking._id))]);
        addToast('success', 'Bid Accepted! 🎉', `Host accepted your bid for "${newBooking.requirementId?.title || 'an event'}"!`);
      }
    };

    const handleBookingUpdated = (updatedBooking: any) => {
      const provId = String(typeof updatedBooking.providerId === 'object' ? updatedBooking.providerId?._id : updatedBooking.providerId);
      if (provId === String(currentVendor._id)) {
        setBookings((prev) =>
          prev.map((b) => (String(b._id) === String(updatedBooking._id) ? { ...b, ...updatedBooking } : b))
        );
        if (updatedBooking.status === 'ACTIVE') {
          addToast('success', 'Escrow Payment Confirmed 🛡️', 'Host completed payment into EzzyGo Escrow. Contact details unlocked!');
        } else if (updatedBooking.status === 'COMPLETED') {
          addToast('success', 'Payout Released! 💰', 'Job marked completed and payout dispatched to your bank!');
        }
      }
    };

    const handleKycStatus = (data: { providerId: string; isVerified: boolean; notes?: string; rejectionReason?: string }) => {
      if (String(data.providerId) === String(currentVendor._id)) {
        if (data.isVerified) {
          onUpdateVendor?.({
            ...currentVendor,
            isVerified: true,
            kycDocuments: {
              ...(currentVendor.kycDocuments || {}),
              status: 'APPROVED',
            } as any,
          });
          addToast('success', 'KYC Verified! 🎉', 'Your vendor profile has been approved by admin. You can now place bids!');
        } else {
          onUpdateVendor?.({
            ...currentVendor,
            isVerified: false,
            kycDocuments: {
              ...(currentVendor.kycDocuments || {}),
              status: 'REJECTED',
              rejectionReason: data.rejectionReason || '',
            } as any,
          });
          addToast('error', 'KYC Verification Update ⚠️', data.rejectionReason || 'Please review your uploaded documents.');
        }
      }
    };

    const handleNewNotification = (notification: any) => {
      if (notification?.title) {
        addToast('info', notification.title, notification.message);
      }
    };

    socket.on('bid:placed', handleBidPlaced);
    socket.on('requirement:created', handleRequirementCreated);
    socket.on('requirement:updated', handleRequirementUpdated);
    socket.on('booking:created', handleBookingCreated);
    socket.on('booking:updated', handleBookingUpdated);
    socket.on('booking:update', handleBookingUpdated);
    socket.on('kyc:status', handleKycStatus);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('bid:placed', handleBidPlaced);
      socket.off('requirement:created', handleRequirementCreated);
      socket.off('requirement:updated', handleRequirementUpdated);
      socket.off('booking:created', handleBookingCreated);
      socket.off('booking:updated', handleBookingUpdated);
      socket.off('booking:update', handleBookingUpdated);
      socket.off('kyc:status', handleKycStatus);
      socket.off('notification:new', handleNewNotification);
    };
  }, [currentVendor?._id, onUpdateVendor]);

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
          if (r._id !== reqId) return r;
          const vendorId = String(currentVendor._id);
          const prior = (r.bids || []).filter((b) => {
            const pId = typeof b.providerId === 'object' ? (b.providerId as any)?._id : b.providerId;
            return String(pId) !== vendorId && String(b._id) !== String(newBid._id);
          });
          const bids = [newBid, ...prior];
          const lowest = bids.reduce((min, b) => Math.min(min, b.amount), bidData.amount);
          return { ...r, bidsCount: bids.length, lowestBid: lowest, bids };
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
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        activeOrdersCount={activeOrdersCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        <VendorHeader
          vendor={currentVendor}
          activeTab={activeTab}
          marketplaceCity={marketplaceCity}
          onMarketplaceCity={setMarketplaceCity}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onTabChange={handleTabChange}
          activeOrdersCount={activeOrdersCount}
          onLogout={onLogout}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8">
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
              marketplaceCity={marketplaceCity}
              onMarketplaceCity={setMarketplaceCity}
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

          {activeTab === 'profile' && (
            <VendorProfilePage
              vendor={currentVendor}
              requirements={requirements}
              bookings={bookings}
              onEditProfile={() => setIsAccountModalOpen(true)}
              onOpenLeads={() => handleTabChange('auctions')}
              onOpenJobs={() => handleTabChange('orders')}
              onOpenCalendar={() => handleTabChange('availability')}
              onOpenEarnings={() => handleTabChange('wallet')}
              onOpenEquipment={() => handleTabChange('inventory')}
              onOpenExplainer={() => setIsExplainerOpen(true)}
              onOpenVerification={() => setIsVerificationModalOpen(true)}
              onLogout={onLogout}
            />
          )}
        </main>

        <footer className="hidden lg:block border-t border-slate-200 bg-white px-6 py-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-500">
            <p className="font-semibold text-slate-700">EzzyGo vendors · you receive 100% of your bid</p>
            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={() => setIsExplainerOpen(true)} className="font-semibold text-[#ff5c28] cursor-pointer">
                How bidding works
              </button>
              <a href="https://wa.me/919322054199" className="font-semibold hover:text-slate-800">WhatsApp support</a>
              <a href="mailto:support@ezzygo.in" className="font-semibold hover:text-slate-800">support@ezzygo.in</a>
            </div>
          </div>
        </footer>
      </div>
      {/* Mobile Fixed Bottom Navigation Bar for Vendors */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1 px-3 flex items-center justify-around lg:hidden safe-bottom shadow-[0_-8px_24px_rgba(23,35,61,0.06)]">
        {([
          { id: 'auctions' as const, label: 'Leads', icon: Search },
          { id: 'orders' as const, label: 'Jobs', icon: Briefcase, badge: activeOrdersCount },
          { id: 'availability' as const, label: 'Calendar', icon: Calendar },
          { id: 'profile' as const, label: 'Profile', icon: UserIcon },
        ]).map((item) => {
          const Icon = item.icon;
          const active = item.id === 'profile'
            ? ['profile', 'wallet', 'inventory'].includes(activeTab)
            : activeTab === item.id;
          const initial = (currentVendor.businessName || currentVendor.name || 'V').trim().charAt(0).toUpperCase();
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] py-1.5 rounded-xl transition cursor-pointer ${
                active ? 'text-[#ff5c28] font-bold' : 'text-[#5c6573] font-medium'
              }`}
            >
              {item.id === 'profile' ? (
                currentVendor.avatar ? (
                  <img src={currentVendor.avatar} alt="" className={`w-6 h-6 rounded-full object-cover mb-0.5 ${active ? 'ring-2 ring-[#ff5c28]' : ''}`} />
                ) : (
                  <span className={`w-6 h-6 rounded-full mb-0.5 text-[11px] font-black flex items-center justify-center ${active ? 'bg-[#ff5c28] text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {initial}
                  </span>
                )
              ) : (
                <Icon className="w-5 h-5 mb-0.5" strokeWidth={active ? 2.4 : 2} />
              )}
              <span className="text-[10px]">{item.label}</span>
              {item.badge ? (
                <span className="absolute top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-[#ff5c28] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
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

      <VendorAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        vendor={currentVendor}
        onUpdateVendor={(updated) => {
          if (onUpdateVendor) onUpdateVendor(updated);
        }}
        onLogout={onLogout}
        onShowToast={addToast}
        onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
      />

      <VendorVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        vendor={currentVendor}
        onUpdateVendor={(updated) => {
          if (onUpdateVendor) onUpdateVendor(updated);
        }}
        onShowToast={addToast}
      />
    </div>
  );
}