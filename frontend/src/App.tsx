import { useState, useEffect, useCallback } from 'react';
import { Home, Calendar, Plus, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { RequesterView } from './components/RequesterView';
import { RuleExplainer } from './components/RuleExplainer';
import { PostRequirementModal } from './components/PostRequirementModal';
import { PaymentModal } from './components/PaymentModal';
import { ReviewModal } from './components/ReviewModal';
import { MyAccountModal } from './components/MyAccountModal';
import { MyProfilePage } from './components/MyProfilePage';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { LoginPage } from './components/LoginPage';
import { MyBookingsPage } from './components/MyBookingsPage';
import { RoleSelectionPage } from './components/RoleSelectionPage';
import { LocationSelectionPage } from './components/LocationSelectionPage';
import { api, getToken, clearToken, getUser, setUser, clearUser } from './services/api';
import { getSocket } from './services/socket';
import { getVendorPortalUrl } from './utils/portalUrls';
import type { User, Requirement, Booking, Category, Occasion, Banner } from './types';

type Page = 'home' | 'bookings' | 'profile';
type AppStep = 'role' | 'login' | 'location' | 'app';
const pageFromUrl = (): Page => {
  if (window.location.hash === '#bookings') return 'bookings';
  if (window.location.hash === '#profile') return 'profile';
  return 'home';
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getUser());
  const [ready, setReady] = useState(() => Boolean(getUser() && getToken()));
  const [step, setStep] = useState<AppStep>(() => (getUser() && getToken() ? 'app' : 'role'));
  const [selectedCity, setSelectedCityOnboard] = useState('Pune, MH');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api.me()
      .then((user) => {
        setCurrentUser(user);
        setUser(user);
        setStep('app');
      })
      .catch((err: any) => {
        // Only clear credentials if backend explicitly rejects with 401 (token expired/invalid)
        if (err?.status === 401 || err?.message?.toLowerCase().includes('log in again') || err?.message?.toLowerCase().includes('expired')) {
          clearToken();
          clearUser();
          setCurrentUser(null);
          setStep('role');
        }
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600">Loading...</div>;
  }

  // Step 1: Role Selection
  if (step === 'role') {
    return (
      <RoleSelectionPage
        onSelect={(role) => {
          if (role === 'vendor') {
            // redirect vendor to vendor portal (live: https://vendor.ezzygo.in, dev: localhost:5174)
            window.location.href = getVendorPortalUrl();
          } else {
            setStep('login');
          }
        }}
      />
    );
  }

  // Step 2: Login
  if (step === 'login') {
    return (
      <LoginPage
        onBack={() => setStep('role')}
        onSuccess={(user) => {
          setCurrentUser(user);
          setUser(user);
          setStep('location');
        }}
      />
    );
  }

  // Step 3: Location Selection
  if (step === 'location') {
    return (
      <LocationSelectionPage
        onBack={() => setStep('login')}
        onSelect={(city) => {
          setSelectedCityOnboard(city + ', IN');
          setStep('app');
        }}
      />
    );
  }

  // Step 4: Main App
  if (!currentUser) {
    // fallback — user somehow skipped login
    return (
      <LoginPage
        onBack={() => setStep('role')}
        onSuccess={(user) => {
          setCurrentUser(user);
          setUser(user);
          setStep('location');
        }}
      />
    );
  }

  return (
    <HostApp
      currentUser={currentUser}
      initialCity={selectedCity}
      onUpdateUser={(updated) => {
        setCurrentUser(updated);
        setUser(updated);
      }}
      onLogout={() => {
        clearToken();
        clearUser();
        setCurrentUser(null);
        setStep('role');
      }}
    />
  );
}

function HostApp({
  currentUser,
  onLogout,
  onUpdateUser,
  initialCity,
}: {
  currentUser: User;
  onLogout: () => void;
  onUpdateUser?: (u: User) => void;
  initialCity?: string;
}) {
  const [loadError, setLoadError] = useState('');
  const [selectedCity, setSelectedCity] = useState(initialCity || 'Pune, MH');

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals State
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [postModalData, setPostModalData] = useState<string | import('./types').PostRequirementInitialData | undefined>(undefined);
  const [selectedBookingForPay, setSelectedBookingForPay] = useState<Booking | null>(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadMyActivity = useCallback(async (userId: string) => {
    const [reqs, bks] = await Promise.all([
      api.getRequirements({ requesterId: userId, includeDrafts: 'true' }),
      api.getBookings({ userId, role: 'requester' }),
    ]);
    setRequirements(reqs);
    setBookings(bks);
  }, []);

  // Initial Load
  const loadData = useCallback(async () => {
    setLoadError('');
    const [catsRes, occsRes, bannersRes, activityRes] = await Promise.allSettled([
      api.getCategories(),
      api.getOccasions(),
      api.getBanners(),
      loadMyActivity(currentUser._id),
    ]);

    const errors: string[] = [];
    if (catsRes.status === 'fulfilled') setCategories(catsRes.value);
    else errors.push(catsRes.reason?.message);
    if (occsRes.status === 'fulfilled') setOccasions(occsRes.value);
    else errors.push(occsRes.reason?.message);
    if (bannersRes.status === 'fulfilled') setBanners(bannersRes.value);
    if (activityRes.status === 'rejected') errors.push(activityRes.reason?.message);

    if (errors.length) setLoadError(errors[0] || 'Something went wrong while loading.');
  }, [currentUser._id, selectedCity, loadMyActivity]);

  const refreshMine = async () => {
    if (!currentUser._id) return;
    try {
      await loadMyActivity(currentUser._id);
    } catch (err: any) {
      addToast('error', 'Could not refresh', err.message);
    }
  };

  useEffect(() => {
    loadData();

    const refreshOccasions = () => {
      api.getOccasions().then(setOccasions).catch(() => {});
    };

    window.addEventListener('focus', refreshOccasions);
    const interval = setInterval(refreshOccasions, 15000);

    return () => {
      window.removeEventListener('focus', refreshOccasions);
      clearInterval(interval);
    };
  }, [loadData]);

  // Real-time WebSocket Live Bidding updates
  useEffect(() => {
    if (!currentUser?._id) return;
    const socket = getSocket();

    socket.emit('join:user', currentUser._id);

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
      // Background sync full state
      loadMyActivity(currentUser._id);
    };

    const handleRequirementCreated = (newReq: Requirement) => {
      const ownerId = String(typeof newReq.requesterId === 'object' ? (newReq.requesterId as any)?._id : newReq.requesterId);
      if (ownerId === String(currentUser._id)) {
        setRequirements((prev) => {
          if (prev.some((r) => String(r._id) === String(newReq._id))) return prev;
          return [newReq, ...prev];
        });
      }
    };

    const handleRequirementUpdated = (updatedReq: Requirement) => {
      setRequirements((prev) =>
        prev.map((r) => (String(r._id) === String(updatedReq._id) ? { ...r, ...updatedReq } : r))
      );
    };

    const handleBookingCreated = (newBooking: any) => {
      const ownerId = String(typeof newBooking.requesterId === 'object' ? newBooking.requesterId?._id : newBooking.requesterId);
      if (ownerId === String(currentUser._id)) {
        setBookings((prev) => {
          if (prev.some((b) => String(b._id) === String(newBooking._id))) return prev;
          return [newBooking, ...prev];
        });
        addToast('success', 'Booking Confirmed!', 'Awaiting payment to lock in your vendor.');
        loadMyActivity(currentUser._id);
      }
    };

    const handleBookingUpdated = (updatedBooking: any) => {
      const ownerId = String(typeof updatedBooking.requesterId === 'object' ? updatedBooking.requesterId?._id : updatedBooking.requesterId);
      if (ownerId === String(currentUser._id)) {
        setBookings((prev) =>
          prev.map((b) => (String(b._id) === String(updatedBooking._id) ? { ...b, ...updatedBooking } : b))
        );
        loadMyActivity(currentUser._id);
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
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('bid:placed', handleBidPlaced);
      socket.off('requirement:created', handleRequirementCreated);
      socket.off('requirement:updated', handleRequirementUpdated);
      socket.off('booking:created', handleBookingCreated);
      socket.off('booking:updated', handleBookingUpdated);
      socket.off('booking:update', handleBookingUpdated);
      socket.off('notification:new', handleNewNotification);
    };
  }, [currentUser._id, loadMyActivity]);

  const closeAllModals = useCallback((triggerHistoryBack: boolean = false) => {
    setIsExplainerOpen(false);
    setIsPostModalOpen(false);
    setIsAccountModalOpen(false);
    setSelectedBookingForPay(null);
    setSelectedBookingForReview(null);
    if (window.history.state?.modal) {
      if (triggerHistoryBack) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${window.location.hash}`);
      }
    }
  }, []);

  const anyModalOpen = isExplainerOpen || isPostModalOpen || isAccountModalOpen || !!selectedBookingForPay || !!selectedBookingForReview;

  // Handle Escape Key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (anyModalOpen) {
          closeAllModals(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [anyModalOpen, closeAllModals]);

  const pushModal = (name: string) => {
    if (window.history.state?.modal !== name) {
      window.history.pushState({ modal: name }, '');
    }
  };

  const handleOpenPostModal = (data?: string | import('./types').PostRequirementInitialData) => {
    setPostModalData(data);
    pushModal('post');
    setIsPostModalOpen(true);
  };

  const handleOpenExplainer = () => {
    pushModal('explainer');
    setIsExplainerOpen(true);
  };

  const handleOpenAccountModal = () => {
    pushModal('account');
    setIsAccountModalOpen(true);
  };

  const handleOpenPaymentModal = (booking: Booking) => {
    pushModal('pay');
    setSelectedBookingForPay(booking);
  };

  const handleOpenReviewModal = (booking: Booking) => {
    pushModal('review');
    setSelectedBookingForReview(booking);
  };

  // 1. Create Requirement
  const handleCreateRequirement = async (data: Partial<Requirement>) => {
    try {
      const newReq = await api.createRequirement(data);
      setRequirements((prev) => [newReq, ...prev]);
      closeAllModals(true);
      addToast(
        'success',
        'Request posted',
        `Vendors in ${newReq.location.city} can now see it and send you prices.`
      );
    } catch (err: any) {
      addToast('error', 'Could not post', err.message);
      throw err;
    }
  };

  // 2. Accept Bid
  const handleAcceptBid = async (requirementId: string, bidId: string) => {
    try {
      const createdBooking = await api.acceptBid(requirementId, bidId, currentUser._id);
      await refreshMine();
      handleOpenPaymentModal(createdBooking);
      addToast('success', 'Vendor chosen', 'Please pay to confirm the booking.');
    } catch (err: any) {
      addToast('error', 'Could not choose vendor', err.message);
    }
  };

  // 3. Payment Success
  const handlePaySuccess = async (
    bookingId: string,
    paymentMethod: string,
    _transactionId?: string,
    verifiedBooking?: Booking
  ) => {
    try {
      let updated = verifiedBooking;
      if (!updated) {
        updated = await api.payBooking(bookingId, paymentMethod);
      }
      if (updated) {
        setBookings((prev) => prev.map((b) => (b._id === bookingId ? updated! : b)));
        setRequirements((prev) =>
          prev.map((r) => (r._id === updated!.requirementId?._id ? { ...r, status: 'ACTIVE' } : r))
        );
      }
      setSelectedBookingForPay(null);
      addToast('success', 'Payment confirmed', 'We hold the money in Escrow until the event is done.');
      await refreshMine();
    } catch (err: any) {
      addToast('error', 'Payment update failed', err.message);
      throw err;
    }
  };

  // 4. Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await api.cancelBooking(bookingId, 'Cancelled by user');
      await refreshMine();
      if (selectedBookingForPay?._id === bookingId) {
        setSelectedBookingForPay(null);
      }
      addToast('info', 'Booking cancelled', res.message || 'Request re-opened for bidding.');
    } catch (err: any) {
      addToast('error', 'Could not cancel', err.message);
      throw err;
    }
  };

  
  // 5b. Raise Dispute
  const handleRaiseDispute = async (bookingId: string, reason: string) => {
    try {
      const res = await api.raiseDispute(bookingId, reason);
      await refreshMine();
      addToast('warning', 'Dispute Submitted', res.message || 'EzzyGo support team will review and mediate the payment.');
    } catch (err: any) {
      addToast('error', 'Could not raise dispute', err.message);
      throw err;
    }
  };

  // 5. Complete Booking
  const handleCompleteBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking) return;
    const vendorName = (booking.providerId as any)?.businessName || (booking.providerId as any)?.name || 'the vendor';
    if (!window.confirm(`Mark this event done? EzzyGo will send ₹${booking.bidAmount.toLocaleString()} to ${vendorName}.`)) {
      return;
    }
    try {
      const res = await api.completeBooking(bookingId);
      await refreshMine();
      addToast('success', 'Event marked done', res.message || 'Payment released to vendor.');
      handleOpenReviewModal(res.data || booking);
    } catch (err: any) {
      addToast('error', 'Could not complete', err.message);
      throw err;
    }
  };

  // 6. Submit Review
  const handleSubmitReview = async (data: Parameters<typeof api.submitReview>[0]) => {
    try {
      await api.submitReview(data);
      setSelectedBookingForReview(null);
      await refreshMine();
      addToast('success', 'Thanks for rating', 'Your rating helps other hosts pick good vendors.');
    } catch (err: any) {
      addToast('error', 'Could not save rating', err.message);
      throw err;
    }
  };

  const [page, setPage] = useState<Page>(pageFromUrl);

  useEffect(() => {
    const onPopState = () => {
      // If modal was open, close modal first
      if (anyModalOpen) {
        closeAllModals();
      }
      setPage(pageFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [anyModalOpen, closeAllModals]);

  const goTo = (next: Page) => {
    closeAllModals();
    if (next === page) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const homeUrl = `${window.location.pathname}${window.location.search}`;
    const hash = next === 'bookings' ? '#bookings' : next === 'profile' ? '#profile' : homeUrl;

    if (next === 'home') {
      if (window.location.hash === '#bookings' || window.location.hash === '#profile') {
        window.history.back();
        return;
      }
      window.history.replaceState(null, '', homeUrl);
      setPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'home') {
      window.history.pushState(null, '', hash);
    } else {
      window.history.replaceState(null, '', hash);
    }
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBookings = () => {
    goTo('bookings');
    refreshMine();
  };

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'ACTIVE' || b.status === 'AWAITING_PAYMENT'
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenExplainer={handleOpenExplainer}
        onOpenPostModal={(cat) => handleOpenPostModal(cat)}
        onOpenBookings={handleOpenBookings}
        onGoHome={() => goTo('home')}
        onOpenAccountModal={handleOpenAccountModal}
        onOpenProfilePage={() => goTo('profile')}
        onOpenMyEvents={() => {
          goTo('home');
          setTimeout(() => {
            const el = document.getElementById('requirements-hub');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        isBookingsPage={page === 'bookings'}
        isProfilePage={page === 'profile'}
        activeBookingsCount={activeBookingsCount}
        requirementsCount={requirements.length}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      {loadError && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm">{loadError}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-full bg-white border border-rose-200 text-sm font-semibold hover:bg-rose-100 transition cursor-pointer shrink-0"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="w-full flex-1 pb-20 lg:pb-0">
        {page === 'profile' ? (
          <MyProfilePage
            currentUser={currentUser}
            onUpdateUser={(updated) => {
              if (onUpdateUser) onUpdateUser(updated);
            }}
            onLogout={onLogout}
            onBack={() => goTo('home')}
            onOpenBookings={handleOpenBookings}
            onOpenMyEvents={() => {
              goTo('home');
              setTimeout(() => {
                const el = document.getElementById('requirements-hub');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onOpenExplainer={handleOpenExplainer}
            onOpenPostModal={handleOpenPostModal}
            requirements={requirements}
            bookings={bookings}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            onShowToast={addToast}
          />
        ) : page === 'bookings' ? (
          <MyBookingsPage
            bookings={bookings}
            categories={categories}
            selectedCity={selectedCity}
            onBack={() => goTo('home')}
            onOpenPostModal={handleOpenPostModal}
            onOpenPaymentModal={handleOpenPaymentModal}
            onCancelBooking={handleCancelBooking}
            onCompleteBooking={handleCompleteBooking}
            onOpenReviewModal={handleOpenReviewModal}
            onRaiseDispute={handleRaiseDispute}
          />
        ) : (
          <RequesterView
            requirements={requirements}
            bookings={bookings}
            categories={categories}
            occasions={occasions}
            banners={banners}
            currentUser={currentUser}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            onOpenPostModal={handleOpenPostModal}
            onAcceptBid={handleAcceptBid}
            onOpenBookings={handleOpenBookings}
            onOpenExplainer={handleOpenExplainer}
          />
        )}
      </main>

      {/* Modals */}
      <RuleExplainer
        isOpen={isExplainerOpen}
        onClose={() => closeAllModals(true)}
      />

      <PostRequirementModal
        isOpen={isPostModalOpen}
        onClose={() => closeAllModals(true)}
        categories={categories}
        onSubmit={handleCreateRequirement}
        requesterId={currentUser._id}
        initialData={postModalData}
        initialCity={selectedCity}
      />

      <PaymentModal
        isOpen={!!selectedBookingForPay}
        onClose={() => closeAllModals(true)}
        booking={selectedBookingForPay}
        onPaySuccess={handlePaySuccess}
        onCancelBooking={handleCancelBooking}
        onNavigateToBookings={handleOpenBookings}
      />


      {/* Mobile Bottom Navigation Bar (Visible on Mobile/Tablet) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1 safe-bottom"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center text-center">
          {/* Home */}
          <button
            onClick={() => goTo('home')}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              page === 'home' ? 'text-[#f95724] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* My Events */}
          <button
            onClick={() => {
              goTo('home');
              setTimeout(() => {
                const el = document.getElementById('requirements-hub');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">My Events</span>
          </button>

          {/* Center Action: Plan Event */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleOpenPostModal()}
              aria-label="Post Requirement"
              className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-tr from-[#f95724] to-[#ff7443] text-white shadow-lg shadow-[#f95724]/35 flex items-center justify-center active:scale-90 transition cursor-pointer border-2 border-white"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Bookings */}
          <button
            onClick={handleOpenBookings}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer relative ${
              page === 'bookings' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <ShieldCheck className="w-5 h-5" />
              {activeBookingsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeBookingsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Bookings</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => goTo('profile')}
            aria-label="My Profile"
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              page === 'profile' ? 'text-[#f95724] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Profile</span>
          </button>
        </div>
      </nav>

      <ReviewModal
        isOpen={!!selectedBookingForReview}
        onClose={() => closeAllModals(true)}
        booking={selectedBookingForReview}
        onSubmitReview={handleSubmitReview}
        fromUserId={currentUser._id}
      />

      <MyAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => closeAllModals(true)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          if (onUpdateUser) onUpdateUser(updated);
        }}
        onLogout={onLogout}
        onOpenBookings={handleOpenBookings}
        onOpenMyEvents={() => {
          goTo('home');
          setTimeout(() => {
            const el = document.getElementById('requirements-hub');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onOpenExplainer={handleOpenExplainer}
        onOpenPostModal={handleOpenPostModal}
        requirementsCount={requirements.length}
        activeBookingsCount={activeBookingsCount}
        completedBookingsCount={bookings.filter((b) => b.status === 'COMPLETED').length}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onShowToast={addToast}
      />

      {/* Exact Matching Light Aesthetic Premium Footer */}
      <Footer 
        onOpenExplainer={handleOpenExplainer}
        onOpenPostModal={handleOpenPostModal}
      />

    </div>
  );
}
