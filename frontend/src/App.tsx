import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RequesterView } from './components/RequesterView';
import { ProviderView } from './components/ProviderView';
import { AdminView } from './components/AdminView';
import { RuleExplainer } from './components/RuleExplainer';
import { PostRequirementModal } from './components/PostRequirementModal';
import { PlaceBidModal } from './components/PlaceBidModal';
import { PaymentModal } from './components/PaymentModal';
import { ReviewModal } from './components/ReviewModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { api, mockCategories, mockUsers } from './services/api';
import type { User, UserRole, Requirement, Bid, Booking, Category, AdminMetrics } from './types';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('requester');
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.requester);
  
  // Data State
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<User[]>([mockUsers.provider]);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);

  // Modals State
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedReqForBid, setSelectedReqForBid] = useState<Requirement | null>(null);
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
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load from API or fallback
  const loadData = async () => {
    try {
      const [cats, reqs, bks, metrics] = await Promise.all([
        api.getCategories(),
        api.getRequirements(),
        api.getBookings(),
        api.getAdminMetrics(),
      ]);
      if (cats.length) setCategories(cats);
      if (reqs.length) setRequirements(reqs);
      if (bks.length) setBookings(bks);
      if (metrics) setAdminMetrics(metrics);
    } catch (_) {
      console.warn('Backend loading in fallback mode');
    }
  };

  useEffect(() => {
    loadData();
    // Default seed fallback if offline
    if (requirements.length === 0) {
      const sampleReq: Requirement = {
        _id: 'req-demo-1',
        requesterId: mockUsers.requester,
        category: 'DJ / Teenmar / Sound & Lighting',
        title: 'Sangeet Night DJ & High-Bass Sound Setup',
        description: 'Need a top-tier DJ with Punjabi + Telugu wedding mixes, moving head lights, smoke machine, and wireless mics for 250 guests.',
        location: {
          city: 'Hyderabad',
          area: 'Gachibowli',
          venueAddress: 'Fort Grand Convention Hall, Financial District',
        },
        eventDate: '2026-10-15',
        timeWindow: { start: '19:00', end: '23:30' },
        guestCount: 250,
        budget: 18000,
        maxAcceptableBid: 15300, // 85% of 18000
        status: 'OPEN',
        bidsCount: 2,
        lowestBid: 14500,
        createdAt: new Date().toISOString(),
        bids: [
          {
            _id: 'bid-1',
            requirementId: 'req-demo-1',
            providerId: mockUsers.provider,
            amount: 14500, // ~19.4% OFF -> ELIGIBLE
            proposalNotes: 'Includes full JBL line-array audio, 4 moving heads, DJ booth, fog effect, and 4 hours live performance.',
            equipmentDetails: 'JBL VRX Line Array + Pioneer DDJ-1000 + 4 Beam 230 Lights',
            discountPercent: 19,
            isEligibleForAccept: true,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'bid-2',
            requirementId: 'req-demo-1',
            providerId: {
              ...mockUsers.provider,
              _id: 'usr-prov-2',
              name: 'Sri Krishna Decors & Sound',
              businessName: 'Sri Krishna Audio & Tech',
              rating: 4.6,
              completedJobs: 18,
            },
            amount: 16500, // only 8.3% discount -> INELIGIBLE (< 15%)
            proposalNotes: 'Basic sound setup with dual 15-inch active speakers and 2 par lights.',
            equipmentDetails: 'Yamaha DXR15 + Basic DJ controller',
            discountPercent: 8,
            isEligibleForAccept: false,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setRequirements([sampleReq]);
    }
  }, []);

  // Switch role handler
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(mockUsers[role]);
    addToast('info', `Switched to ${role.toUpperCase()} mode`, `Now operating as ${mockUsers[role].name}`);
  };

  // 1. Post Requirement
  const handleCreateRequirement = async (data: Partial<Requirement>) => {
    try {
      let newReq: Requirement;
      try {
        newReq = await api.createRequirement(data);
      } catch (_) {
        // Fallback local creation
        const budget = Number(data.budget) || 10000;
        newReq = {
          _id: 'req-' + Math.random().toString(36).substring(2, 9),
          requesterId: currentUser,
          category: data.category || 'DJ / Teenmar / Sound & Lighting',
          title: data.title || 'Event Requirement',
          description: data.description || '',
          location: data.location || { city: 'Hyderabad', area: 'Gachibowli' },
          eventDate: data.eventDate || '2026-10-25',
          timeWindow: data.timeWindow || { start: '18:00', end: '23:00' },
          guestCount: data.guestCount || 100,
          budget: budget,
          maxAcceptableBid: Math.floor(budget * 0.85),
          status: 'OPEN',
          bidsCount: 0,
          createdAt: new Date().toISOString(),
          bids: [],
        };
      }
      setRequirements((prev) => [newReq, ...prev]);
      addToast(
        'success',
        'Requirement Published!',
        `Your budget of ₹${newReq.budget.toLocaleString()} is live. Providers must bid ≤ ₹${newReq.maxAcceptableBid.toLocaleString()} to qualify under the 15% rule.`
      );
    } catch (err: any) {
      addToast('error', 'Failed to publish requirement', err.message);
    }
  };

  // 2. Submit Reverse Bid
  const handlePlaceBid = async (data: {
    requirementId: string;
    providerId: string;
    amount: number;
    proposalNotes: string;
    equipmentDetails: string;
  }) => {
    try {
      const targetReq = requirements.find((r) => r._id === data.requirementId);
      if (!targetReq) return;

      const discountPercent = Math.round(((targetReq.budget - data.amount) / targetReq.budget) * 100);
      const isEligible = data.amount <= targetReq.maxAcceptableBid;

      const newBid: Bid = {
        _id: 'bid-' + Math.random().toString(36).substring(2, 9),
        requirementId: data.requirementId,
        providerId: currentUser,
        amount: data.amount,
        proposalNotes: data.proposalNotes,
        equipmentDetails: data.equipmentDetails,
        discountPercent,
        isEligibleForAccept: isEligible,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      setRequirements((prev) =>
        prev.map((r) => {
          if (r._id === data.requirementId) {
            const updatedBids = [...(r.bids || []), newBid];
            return {
              ...r,
              bidsCount: updatedBids.length,
              lowestBid: Math.min(...updatedBids.map((b) => b.amount)),
              bids: updatedBids,
            };
          }
          return r;
        })
      );

      if (isEligible) {
        addToast(
          'success',
          'Eligible Bid Submitted! (15% Rule Passed)',
          `Your quote of ₹${data.amount.toLocaleString()} offers ${discountPercent}% discount and is eligible for client acceptance.`
        );
      } else {
        addToast(
          'warning',
          'Bid Placed (Under 15% Discount Threshold)',
          `Your bid of ₹${data.amount.toLocaleString()} is only ${discountPercent}% OFF. The client can only accept bids at or below ₹${targetReq.maxAcceptableBid.toLocaleString()} (≥15% OFF).`
        );
      }
    } catch (err: any) {
      addToast('error', 'Bid Placement Error', err.message);
    }
  };

  // 3. Accept Bid
  const handleAcceptBid = async (requirementId: string, bidId: string) => {
    try {
      const targetReq = requirements.find((r) => r._id === requirementId);
      if (!targetReq) return;

      const targetBid = targetReq.bids?.find((b) => b._id === bidId);
      if (!targetBid) return;

      // Server / Local 15% Rule Check
      if (targetBid.amount > targetReq.maxAcceptableBid) {
        addToast(
          'error',
          '15% Minimum-Discount Rule Violation',
          `Cannot accept bid of ₹${targetBid.amount.toLocaleString()}. Bids must be at least 15% below posted budget (≤ ₹${targetReq.maxAcceptableBid.toLocaleString()}).`
        );
        return;
      }

      const bidAmount = targetBid.amount;
      const platformFee = Math.round(bidAmount * 0.10);
      const totalPaid = bidAmount + platformFee;

      const newBooking: Booking = {
        _id: 'book-' + Math.random().toString(36).substring(2, 9),
        requirementId: targetReq,
        bidId: targetBid,
        requesterId: currentUser,
        providerId: targetBid.providerId,
        bidAmount,
        platformFee,
        totalPaid,
        status: 'AWAITING_PAYMENT',
        paymentDetails: {
          transactionId: '',
          method: 'UPI',
          escrowStatus: 'HELD',
        },
        isContactRevealed: false,
        createdAt: new Date().toISOString(),
      };

      setBookings((prev) => [newBooking, ...prev]);

      // Update Requirement status
      setRequirements((prev) =>
        prev.map((r) => (r._id === requirementId ? { ...r, status: 'ACCEPTED' } : r))
      );

      addToast(
        'success',
        'Bid Accepted! Proceeding to Escrow Checkout',
        `Bid ₹${bidAmount.toLocaleString()} + 10% Platform Fee ₹${platformFee.toLocaleString()} = Total ₹${totalPaid.toLocaleString()}`
      );

      // Open Escrow Checkout Modal immediately
      setSelectedBookingForPay(newBooking);
    } catch (err: any) {
      addToast('error', 'Failed to accept bid', err.message);
    }
  };

  // 4. Pay into Escrow
  const handlePaySuccess = async (bookingId: string, paymentMethod: string) => {
    try {
      const txnRef = 'PAY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      setBookings((prev) =>
        prev.map((b) => {
          if (b._id === bookingId) {
            return {
              ...b,
              status: 'ACTIVE',
              isContactRevealed: true,
              paymentDetails: {
                transactionId: txnRef,
                method: paymentMethod,
                paidAt: new Date().toISOString(),
                escrowStatus: 'HELD',
              },
            };
          }
          return b;
        })
      );

      // Update Requirement
      setRequirements((prev) =>
        prev.map((r) => {
          const matchingBooking = bookings.find((b) => b._id === bookingId);
          if (matchingBooking && r._id === matchingBooking.requirementId._id) {
            return { ...r, status: 'ACTIVE' };
          }
          return r;
        })
      );

      addToast(
        'success',
        'Escrow Secured & Contact Unlocked! ',
        `Payment confirmed (Ref: ${txnRef}). Funds are safely locked in EzGo Escrow. Vendor phone number has been unlocked.`
      );
    } catch (err: any) {
      addToast('error', 'Payment Failed', err.message);
    }
  };

  // 5. Complete Booking & Trigger Payout
  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const payoutRef = 'POUT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      let targetBooking: Booking | null = null;

      setBookings((prev) =>
        prev.map((b) => {
          if (b._id === bookingId) {
            const updatedBooking: Booking = {
              ...b,
              status: 'COMPLETED',
              completedAt: new Date().toISOString(),
              payoutDetails: {
                transferId: payoutRef,
                releasedAt: new Date().toISOString(),
                amountToProvider: b.bidAmount,
                commissionRetained: b.platformFee,
              },
            };
            targetBooking = updatedBooking;
            return updatedBooking;
          }
          return b;
        })
      );

      // Update Requirement
      setRequirements((prev) =>
        prev.map((r) => {
          const matchingBooking = bookings.find((b) => b._id === bookingId);
          if (matchingBooking && r._id === matchingBooking.requirementId._id) {
            return { ...r, status: 'COMPLETED' };
          }
          return r;
        })
      );

      // Open review modal
      if (targetBooking) {
        setSelectedBookingForReview(targetBooking);
        const resolvedBooking: Booking = targetBooking;
        addToast(
          'success',
          'Service Completed! 100% Payout Released to Vendor',
          `₹${resolvedBooking.bidAmount.toLocaleString()} released to ${resolvedBooking.providerId?.businessName || resolvedBooking.providerId?.name} (0% vendor deduction). EzGo retained ₹${resolvedBooking.platformFee.toLocaleString()} commission.`
        );
      }
    } catch (err: any) {
      addToast('error', 'Completion Error', err.message);
    }
  };

  // 6. Submit Review
  const handleSubmitReview = async (_: any) => {
    addToast('success', 'Review Submitted!', 'Thank you for rating your service experience.');
  };

  // 7. Admin Provider Verification
  const handleVerifyProvider = async (providerId: string, isVerified: boolean) => {
    setProviders((prev) =>
      prev.map((p) => (p._id === providerId ? { ...p, isVerified } : p))
    );
    addToast(
      'success',
      isVerified ? 'Vendor KYC Approved!' : 'Vendor Verification Revoked',
      `Provider account status updated successfully.`
    );
  };

  // 8. Admin Add Category
  const handleAddCategory = async (cat: Partial<Category>) => {
    const newCat: Category = {
      _id: 'cat-' + Math.random().toString(36).substring(2, 8),
      name: cat.name || 'New Service',
      slug: (cat.name || 'new-service').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: 'Sparkles',
      description: 'Expandable marketplace event category',
      avgPriceRange: cat.avgPriceRange || '₹5,000 - ₹30,000',
      isActive: true,
    };
    setCategories((prev) => [...prev, newCat]);
    addToast('success', 'Category Added', `${newCat.name} is now available for postings.`);
  };

  // 9. Reset Demo Data
  const handleResetSeedData = async () => {
    await loadData();
    addToast('info', 'Database Reset', 'Demo records re-synchronized.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Global Navbar with Role Switcher */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        currentUser={currentUser}
        onOpenExplainer={() => setIsExplainerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'requester' && (
          <RequesterView
            requirements={requirements}
            bookings={bookings}
            currentUser={currentUser}
            onOpenPostModal={() => setIsPostModalOpen(true)}
            onAcceptBid={handleAcceptBid}
            onOpenPaymentModal={(b) => setSelectedBookingForPay(b)}
            onCompleteBooking={handleCompleteBooking}
            onOpenReviewModal={(b) => setSelectedBookingForReview(b)}
            onOpenExplainer={() => setIsExplainerOpen(true)}
          />
        )}

        {currentRole === 'provider' && (
          <ProviderView
            requirements={requirements}
            myBids={[]}
            myBookings={bookings}
            currentUser={currentUser}
            categories={categories}
            onOpenBidModal={(req) => setSelectedReqForBid(req)}
            onOpenExplainer={() => setIsExplainerOpen(true)}
          />
        )}

        {currentRole === 'admin' && (
          <AdminView
            metrics={adminMetrics}
            bookings={bookings}
            categories={categories}
            providers={providers}
            onVerifyProvider={handleVerifyProvider}
            onAddCategory={handleAddCategory}
            onResetSeedData={handleResetSeedData}
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
      />

      <PlaceBidModal
        isOpen={!!selectedReqForBid}
        onClose={() => setSelectedReqForBid(null)}
        requirement={selectedReqForBid}
        providerId={currentUser._id}
        onSubmit={handlePlaceBid}
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

      {/* Premium Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-base text-white">EzGo<span className="text-amber-400">.</span></span>
            <span>•</span>
            <span>Event Services Reverse-Bidding Marketplace</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button onClick={() => setIsExplainerOpen(true)} className="hover:text-amber-400 transition">
              15% Rule & Escrow Guide
            </button>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">0% Vendor Deductions</span>
            <span>•</span>
            <span>RBI-Compliant Split Escrow</span>
          </div>

          <div className="text-slate-400">
            © {new Date().getFullYear()} EzGo Marketplace. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
