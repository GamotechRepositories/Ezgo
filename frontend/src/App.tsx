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

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals State
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalCategory, setPostModalCategory] = useState<string | undefined>(undefined);
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
    const interval = setInterval(refreshOccasions, 8000);

    return () => {
      window.removeEventListener('focus', refreshOccasions);
      clearInterval(interval);
    };
  }, [loadData]);

  const handleOpenPostModal = (categoryName?: string) => {
    setPostModalCategory(categoryName);
    setIsPostModalOpen(true);
  };

  // 1. Create Requirement
  const handleCreateRequirement = async (data: Partial<Requirement>) => {
    try {
      const newReq = await api.createRequirement(data);
      setRequirements((prev) => [newReq, ...prev]);
      addToast(
        'success',
        'Request posted',
        `Vendors in ${newReq.location.city} can now see it and send you prices.`
      );
    } catch (err: any) {
      addToast('error', 'Could not post request', err.message);
      throw err;
    }
  };

  // 2. Accept Bid
  const handleAcceptBid = async (requirementId: string, bidId: string) => {
    const targetReq = requirements.find((r) => r._id === requirementId);
    const targetBid = targetReq?.bids?.find((b) => b._id === bidId);
    if (!targetReq || !targetBid) return;

    if (targetBid.amount > targetReq.maxAcceptableBid) {
      addToast(
        'error',
        'Price too high',
        `You can only pick prices of ₹${targetReq.maxAcceptableBid.toLocaleString()} or less (at least 15% below your budget).`
      );
      return;
    }

    try {
      const newBooking = await api.acceptBid(requirementId, bidId, currentUser._id);
      await refreshMine();
      setSelectedBookingForPay(newBooking);
      addToast(
        'success',
        'Vendor selected',
        `Pay ₹${newBooking.totalPaid.toLocaleString()} to confirm the booking and see the vendor's phone number.`
      );
    } catch (err: any) {
      addToast('error', 'Could not select vendor', err.message);
    }
  };

  // 3. Pay Booking. A Razorpay payment is already marked paid by /verify-payment.
  const handlePaySuccess = async (bookingId: string, paymentMethod: string, transactionId?: string) => {
    if (!transactionId) {
      await api.payBooking(bookingId, paymentMethod);
    }
    await refreshMine();
    addToast(
      'success',
      'Payment done',
      'EzGo is holding your money safely. You can now call or WhatsApp the vendor.'
    );
  };

  // 4. Cancel booking (unpaid: pick another vendor, paid: full refund)
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await api.cancelBooking(bookingId, 'Cancelled by host');
      await refreshMine();
      addToast('info', 'Booking cancelled', res.message);
    } catch (err: any) {
      addToast('error', 'Could not cancel', err.message);
      throw err;
    }
  };

  // 5. Complete Booking
  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await api.completeBooking(bookingId);
      await refreshMine();
      addToast('success', 'Event marked as done', 'EzGo has sent the full price to the vendor.');
    } catch (err: any) {
      addToast('error', 'Could not mark as done', err.message);
      throw err;
    }
  };

  // 6. Submit Review
  const handleSubmitReview = async (data: Parameters<typeof api.submitReview>[0]) => {
    try {
      await api.submitReview(data);
      await refreshMine();
      addToast('success', 'Thanks for rating', 'Your rating helps other hosts pick good vendors.');
    } catch (err: any) {
      addToast('error', 'Could not save rating', err.message);
      throw err;
    }
  };

  const [page, setPage] = useState<Page>(pageFromUrl);

  useEffect(() => {
    const onPopState = () => setPage(pageFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goTo = (next: Page) => {
    if (next !== pageFromUrl()) {
      window.history.pushState(null, '', next === 'bookings' ? '#bookings' : window.location.pathname);
    }
    setPage(next);
    window.scrollTo({ top: 0 });
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
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenPostModal={() => handleOpenPostModal()}
        onOpenBookings={handleOpenBookings}
        onGoHome={() => goTo('home')}
        isBookingsPage={page === 'bookings'}
        activeBookingsCount={activeBookingsCount}
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
            onOpenExplainer={() => setIsExplainerOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <RuleExplainer
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />

      <PostRequirementModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        categories={categories}
        onSubmit={handleCreateRequirement}
        requesterId={currentUser._id}
        initialCategory={postModalCategory}
      />

      <PaymentModal
        isOpen={!!selectedBookingForPay}
        onClose={() => setSelectedBookingForPay(null)}
        booking={selectedBookingForPay}
        onPaySuccess={handlePaySuccess}
        onCancelBooking={handleCancelBooking}
        onNavigateToBookings={handleOpenBookings}
      />

      <ReviewModal
        isOpen={!!selectedBookingForReview}
        onClose={() => setSelectedBookingForReview(null)}
        booking={selectedBookingForReview}
        onSubmitReview={handleSubmitReview}
        fromUserId={currentUser._id}
      />

      {/* Exact Matching Light Aesthetic Premium Footer */}
      <Footer 
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenPostModal={handleOpenPostModal}
      />

    </div>
  );
}
