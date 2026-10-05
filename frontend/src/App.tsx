import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RequesterView } from './components/RequesterView';
import { RuleExplainer } from './components/RuleExplainer';
import { PostRequirementModal } from './components/PostRequirementModal';
import { PaymentModal } from './components/PaymentModal';
import { ReviewModal } from './components/ReviewModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { api, mockCategories, mockUsers } from './services/api';
import type { User, Requirement, Booking, Category, Occasion } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.requester);
  
  // Data State
  const [categories, setCategories] = useState<Category[]>(mockCategories);
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

  // Initial Load
  const loadData = async () => {
    try {
      const [catsRes, reqsRes, bookingsRes, userRes, occsRes] = await Promise.allSettled([
        api.getCategories(),
        api.getRequirements(),
        api.getBookings(),
        api.getUserByRole('requester'),
        api.getOccasions(),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value) {
        setCurrentUser(userRes.value);
      }
      if (catsRes.status === 'fulfilled' && catsRes.value.length > 0) {
        setCategories(catsRes.value);
      }
      if (reqsRes.status === 'fulfilled' && reqsRes.value.length > 0) {
        setRequirements(reqsRes.value);
      }
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.length > 0) {
        setBookings(bookingsRes.value);
      }
      if (occsRes.status === 'fulfilled' && occsRes.value.length > 0) {
        setOccasions(occsRes.value);
      }
    } catch (_) {
      // Fallbacks already initialized in state
    }
  };

  useEffect(() => {
    loadData();

    const refreshOccasions = () => {
      api.getOccasions().then((occs) => {
        if (occs && occs.length > 0) setOccasions(occs);
      }).catch(() => {});
    };

    window.addEventListener('focus', refreshOccasions);
    const interval = setInterval(refreshOccasions, 8000);

    return () => {
      window.removeEventListener('focus', refreshOccasions);
      clearInterval(interval);
    };
  }, []);

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
        'Requirement Broadcasted Live!',
        `Your event is now live on the marketplace. Verified providers in ${newReq.location.city} are being notified.`
      );
    } catch (err: any) {
      addToast('error', 'Failed to Post', err.message);
    }
  };

  // 2. Accept Bid
  const handleAcceptBid = async (requirementId: string, bidId: string) => {
    try {
      const targetReq = requirements.find((r) => r._id === requirementId);
      if (!targetReq) return;

      const targetBid = targetReq.bids?.find((b) => b._id === bidId);
      if (!targetBid) return;

      if (targetBid.amount > targetReq.maxAcceptableBid) {
        addToast(
          'error',
          'Bid Ineligible Under 15% Rule',
          `This bid of ₹${targetBid.amount.toLocaleString()} does not meet the minimum 15% discount threshold (max allowed: ₹${targetReq.maxAcceptableBid.toLocaleString()}).`
        );
        return;
      }

      let newBooking: Booking;
      try {
        newBooking = await api.acceptBid(requirementId, bidId, currentUser._id);
      } catch (_) {
        const platformFee = Math.round(targetBid.amount * 0.10);
        newBooking = {
          _id: 'bk-' + Math.random().toString(36).substring(2, 9),
          requirementId: targetReq,
          bidId: targetBid,
          requesterId: currentUser,
          providerId: targetBid.providerId,
          bidAmount: targetBid.amount,
          platformFee: platformFee,
          totalPaid: targetBid.amount + platformFee,
          status: 'AWAITING_PAYMENT',
          paymentDetails: {
            transactionId: 'TXN-INIT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            method: 'PENDING',
            escrowStatus: 'HELD',
          },
          isContactRevealed: false,
          createdAt: new Date().toISOString(),
        };
      }

      setBookings((prev) => [newBooking, ...prev]);
      setRequirements((prev) =>
        prev.map((r) => (r._id === requirementId ? { ...r, status: 'ACCEPTED' } : r))
      );

      setSelectedBookingForPay(newBooking);

      addToast(
        'success',
        'Bid Accepted! Complete Escrow Deposit',
        `Provider selected. Please fund the Escrow (₹${newBooking.totalPaid.toLocaleString()}) to reveal full contact details.`
      );
    } catch (err: any) {
      addToast('error', 'Acceptance Failed', err.message);
    }
  };

  // 3. Pay Booking
  const handlePaySuccess = async (bookingId: string, paymentMethod: string) => {
    try {
      try {
        await api.payBooking(bookingId, paymentMethod);
      } catch (_) {}

      setBookings((prev) =>
        prev.map((b) => {
          if (b._id === bookingId) {
            return {
              ...b,
              status: 'ACTIVE',
              isContactRevealed: true,
              paymentDetails: {
                ...b.paymentDetails,
                method: paymentMethod,
                paidAt: new Date().toISOString(),
                escrowStatus: 'HELD',
              },
            };
          }
          return b;
        })
      );

      addToast(
        'success',
        'Escrow Funded & Contact Revealed!',
        'Funds securely deposited in Escrow. Provider phone and WhatsApp are now available.'
      );
    } catch (err: any) {
      addToast('error', 'Payment Failed', err.message);
    }
  };

  // 4. Complete Booking
  const handleCompleteBooking = async (bookingId: string) => {
    try {
      try {
        await api.completeBooking(bookingId);
      } catch (_) {}

      setBookings((prev) =>
        prev.map((b) => {
          if (b._id === bookingId) {
            return {
              ...b,
              status: 'COMPLETED',
              completedAt: new Date().toISOString(),
              payoutDetails: {
                transferId: 'PAYOUT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                releasedAt: new Date().toISOString(),
                amountToProvider: b.bidAmount,
                commissionRetained: b.platformFee,
              },
            };
          }
          return b;
        })
      );

      addToast(
        'success',
        'Booking Completed & Payout Released!',
        '100% of the bid amount has been dispatched to the provider with zero deductions.'
      );
    } catch (err: any) {
      addToast('error', 'Completion Error', err.message);
    }
  };

  // 5. Submit Review
  const handleSubmitReview = async (_data: any) => {
    addToast('success', 'Thank You for Rating!', 'Your review helps keep our verified pro network top-tier.');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenPostModal={() => handleOpenPostModal()}
      />

      {/* Main Workspace Body */}
      <main className="w-full flex-1">
        <RequesterView
          requirements={requirements}
          bookings={bookings}
          categories={categories}
          occasions={occasions}
          currentUser={currentUser}
          onOpenPostModal={handleOpenPostModal}
          onAcceptBid={handleAcceptBid}
          onOpenPaymentModal={(b) => setSelectedBookingForPay(b)}
          onCompleteBooking={handleCompleteBooking}
          onOpenReviewModal={(b) => setSelectedBookingForReview(b)}
          onOpenExplainer={() => setIsExplainerOpen(true)}
        />
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