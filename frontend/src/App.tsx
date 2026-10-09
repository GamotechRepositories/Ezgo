import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { RequesterView } from './components/RequesterView';
import { RuleExplainer } from './components/RuleExplainer';
import { PostRequirementModal } from './components/PostRequirementModal';
import { PaymentModal } from './components/PaymentModal';
import { ReviewModal } from './components/ReviewModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { LoginPage } from './components/LoginPage';
import { MyBookingsPage } from './components/MyBookingsPage';
import { api, getToken, clearToken } from './services/api';
import { getSocket } from './services/socket';
import type { User, Requirement, Booking, Category, Occasion } from './types';

type Page = 'home' | 'bookings';
const pageFromUrl = (): Page => (window.location.hash === '#bookings' ? 'bookings' : 'home');

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api.me()
      .then(setCurrentUser)
      .catch(() => clearToken())
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600">Loading...</div>;
  }
  if (!currentUser) return <LoginPage onSuccess={setCurrentUser} />;
  return (
    <HostApp
      currentUser={currentUser}
      onLogout={() => {
        clearToken();
        setCurrentUser(null);
      }}
    />
  );
}

function HostApp({ currentUser, onLogout }: { currentUser: User; onLogout: () => void }) {
  const [loadError, setLoadError] = useState('');
  const [selectedCity, setSelectedCity] = useState('Pune, MH');

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals State
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
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
      api.getRequirements({ requesterId: userId }),
      api.getBookings({ userId, role: 'requester' }),
    ]);
    setRequirements(reqs);
    setBookings(bks);
  }, []);

  // Initial Load
  const loadData = useCallback(async () => {
    setLoadError('');
    const [catsRes, occsRes, activityRes] = await Promise.allSettled([
      api.getCategories(),
      api.getOccasions(),
      loadMyActivity(currentUser._id),
    ]);

    const errors: string[] = [];
    if (catsRes.status === 'fulfilled') setCategories(catsRes.value);
    else errors.push(catsRes.reason?.message);
    if (occsRes.status === 'fulfilled') setOccasions(occsRes.value);
    else errors.push(occsRes.reason?.message);
    if (activityRes.status === 'rejected') errors.push(activityRes.reason?.message);

    if (errors.length) setLoadError(errors[0] || 'Something went wrong while loading.');
  }, [currentUser._id, loadMyActivity]);

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

    socket.on('bid:placed', handleBidPlaced);
    socket.on('requirement:created', handleRequirementCreated);
    socket.on('requirement:updated', handleRequirementUpdated);

    return () => {
      socket.off('bid:placed', handleBidPlaced);
      socket.off('requirement:created', handleRequirementCreated);
      socket.off('requirement:updated', handleRequirementUpdated);
    };
  }, [currentUser._id, loadMyActivity]);

  const closeAllModals = useCallback((triggerHistoryBack: boolean = false) => {
    setIsExplainerOpen(false);
    setIsPostModalOpen(false);
    setSelectedBookingForPay(null);
    setSelectedBookingForReview(null);
    if (triggerHistoryBack && window.history.state?.modal) {
      window.history.back();
    }
  }, []);

  const anyModalOpen = isExplainerOpen || isPostModalOpen || !!selectedBookingForPay || !!selectedBookingForReview;

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

  const handleOpenPostModal = (data?: string | import('./types').PostRequirementInitialData) => {
    setPostModalData(data);
    window.history.pushState({ modal: 'post' }, '');
    setIsPostModalOpen(true);
  };

  const handleOpenExplainer = () => {
    window.history.pushState({ modal: 'explainer' }, '');
    setIsExplainerOpen(true);
  };

  // 1. Create Requirement
  const handleCreateRequirement = async (data: Partial<Requirement>) => {
    try {
      const newReq = await api.createRequirement(data);
      setRequirements((prev) => [newReq, ...prev]);
      setIsPostModalOpen(false);
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
      setSelectedBookingForPay(createdBooking);
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
      setSelectedBookingForReview(res.data || booking);
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
    if (next !== pageFromUrl()) {
      window.history.pushState(null, '', next === 'bookings' ? '#bookings' : window.location.pathname);
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
        isBookingsPage={page === 'bookings'}
        activeBookingsCount={activeBookingsCount}
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
      <main className="w-full flex-1">
        {page === 'bookings' ? (
          <MyBookingsPage
            bookings={bookings}
            categories={categories}
            onBack={() => goTo('home')}
            onOpenPostModal={handleOpenPostModal}
            onOpenPaymentModal={(b) => setSelectedBookingForPay(b)}
            onCancelBooking={handleCancelBooking}
            onCompleteBooking={handleCompleteBooking}
            onOpenReviewModal={(b) => setSelectedBookingForReview(b)}
          />
        ) : (
          <RequesterView
            requirements={requirements}
            bookings={bookings}
            categories={categories}
            occasions={occasions}
            currentUser={currentUser}
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

      <ReviewModal
        isOpen={!!selectedBookingForReview}
        onClose={() => closeAllModals(true)}
        booking={selectedBookingForReview}
        onSubmitReview={handleSubmitReview}
        fromUserId={currentUser._id}
      />

      {/* Exact Matching Light Aesthetic Premium Footer */}
      <Footer 
        onOpenExplainer={handleOpenExplainer}
        onOpenPostModal={handleOpenPostModal}
      />

    </div>
  );
}
