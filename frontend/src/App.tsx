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
import { Footer } from './components/Footer';
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
  const [postModalCategory, setPostModalCategory] = useState<string | undefined>(undefined);
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
    // Rich default seed data if offline
    if (requirements.length === 0) {
      const sampleReqs: Requirement[] = [
        {
          _id: 'req-demo-1',
          requesterId: mockUsers.requester,
          category: 'DJ / Teenmar / Sound & Lighting',
          title: 'Sangeet Night DJ & High-Bass Sound Setup',
          description: 'Need a top-tier DJ with Punjabi + Telugu wedding mixes, moving head lights, smoke machine, and wireless mics for 250 guests.',
          imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
          equipmentNeeded: ['JBL VRX Line Array', 'Pioneer DDJ-1000', 'Beam 230W Moving Heads', 'Smoke & Cold Pyro Machines'],
          location: {
            city: 'Hyderabad',
            area: 'Gachibowli',
            venueAddress: 'Fort Grand Convention Hall, Financial District',
          },
          eventDate: '2026-10-15',
          timeWindow: { start: '19:00', end: '23:30' },
          guestCount: 250,
          budget: 25000,
          maxAcceptableBid: 21250, // 85% of 25000
          status: 'OPEN',
          bidsCount: 2,
          lowestBid: 19500,
          createdAt: new Date().toISOString(),
          bids: [
            {
              _id: 'bid-1',
              requirementId: 'req-demo-1',
              providerId: mockUsers.provider,
              amount: 19500, // 22% OFF -> ELIGIBLE
              proposalNotes: 'Includes full JBL VRX line-array audio, 4 moving heads, DJ booth, fog effect, and 4.5 hours non-stop live performance.',
              equipmentDetails: 'JBL VRX Line Array + Pioneer DDJ-1000 + 4 Beam 230 Lights',
              discountPercent: 22,
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
              amount: 22500, // only 10% discount -> INELIGIBLE (< 15%)
              proposalNotes: 'Basic sound setup with dual 15-inch active speakers and 2 par lights.',
              equipmentDetails: 'Yamaha DXR15 + Basic DJ controller',
              discountPercent: 10,
              isEligibleForAccept: false,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          _id: 'req-demo-2',
          requesterId: mockUsers.requester,
          category: 'Decoration & Stage Design',
          title: 'Royal Mandap & Floral Reception Backdrop',
          description: 'Grand mandap with fresh Dutch flowers, brass diya urlis, fairytale warm fairy lights canopy and red carpet aisle for 400 guests.',
          imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
          equipmentNeeded: ['Imported Dutch Flowers', 'Brass Urli & Diya Stands', 'Fairy Light Tunnel'],
          location: {
            city: 'Hyderabad',
            area: 'Jubilee Hills',
            venueAddress: 'N Convention Center, Madhapur',
          },
          eventDate: '2026-11-02',
          timeWindow: { start: '17:00', end: '23:00' },
          guestCount: 400,
          budget: 65000,
          maxAcceptableBid: 55250, // 85% of 65000
          status: 'OPEN',
          bidsCount: 1,
          lowestBid: 52000,
          createdAt: new Date().toISOString(),
          bids: [
            {
              _id: 'bid-3',
              requirementId: 'req-demo-2',
              providerId: {
                _id: 'usr-prov-3',
                name: 'Pragathi Luxury Decors',
                businessName: 'Pragathi Floral Creations',
                phone: '+91 98888 77777',
                role: 'provider',
                rating: 4.95,
                reviewCount: 58,
                completedJobs: 62,
                isVerified: true,
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
              },
              amount: 52000, // 20% OFF -> ELIGIBLE
              proposalNotes: 'Includes fresh Bangalore roses + Dutch carnations, grand entrance arch, 40ft stage floral wall, and mood LED floodlights.',
              equipmentDetails: 'Custom Brass Urlis + 10,000 meters fairy lights + Metal Mandap Frame',
              discountPercent: 20,
              isEligibleForAccept: true,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
            }
          ],
        },
        {
          _id: 'req-demo-3',
          requesterId: mockUsers.requester,
          category: 'Photography & 4K Cinematography',
          title: 'Candid Wedding & 4K Drone Coverage',
          description: '2 candid photographers, 2 cinematic cinematographers, DJI drone aerial coverage, same-day teaser edit and raw 4K footage delivered on SSD.',
          imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80',
          equipmentNeeded: ['Sony FX3 / A7 IV Cameras', 'DJI Mavic 3 Cine Drone', 'Gimbal Stabilizers'],
          location: {
            city: 'Hyderabad',
            area: 'Banjara Hills',
            venueAddress: 'Taj Krishna Grand Ballroom',
          },
          eventDate: '2026-11-18',
          timeWindow: { start: '10:00', end: '22:00' },
          guestCount: 500,
          budget: 50000,
          maxAcceptableBid: 42500,
          status: 'OPEN',
          bidsCount: 1,
          lowestBid: 39000,
          createdAt: new Date().toISOString(),
          bids: [
            {
              _id: 'bid-4',
              requirementId: 'req-demo-3',
              providerId: {
                _id: 'usr-prov-4',
                name: 'Klick Cine Studios',
                businessName: 'Klick Cinematic Weddings',
                phone: '+91 97777 66666',
                role: 'provider',
                rating: 4.88,
                reviewCount: 36,
                completedJobs: 40,
                isVerified: true,
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
              },
              amount: 39000, // 22% OFF -> ELIGIBLE
              proposalNotes: 'Dual Sony FX3 4K 10-bit cinema line cameras, DJI Mavic 3 Cine drone, 1-minute Instagram teaser within 24 hours, and 300 page luxury photobook.',
              equipmentDetails: 'Sony FX3 + G Master 24-70 f2.8 + DJI RS3 Pro Gimbal',
              discountPercent: 22,
              isEligibleForAccept: true,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
            }
          ]
        }
      ];
      setRequirements(sampleReqs);
    }
  }, []);

  // Switch role handler
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(mockUsers[role]);
    addToast('info', `Switched to ${role.toUpperCase()} mode`, `Now operating as ${mockUsers[role].name}`);
  };

  // Open post modal with optional prefilled category
  const handleOpenPostModal = (category?: string) => {
    setPostModalCategory(category);
    setIsPostModalOpen(true);
  };

  // 1. Post Requirement
  const handleCreateRequirement = async (data: Partial<Requirement>) => {
    try {
      let newReq: Requirement;
      try {
        newReq = await api.createRequirement(data);
      } catch (_) {
        // Fallback local creation
        const budget = Number(data.budget) || 15000;
        newReq = {
          _id: 'req-' + Math.random().toString(36).substring(2, 9),
          requesterId: currentUser,
          category: data.category || 'DJ / Teenmar / Sound & Lighting',
          title: data.title || 'Event Requirement',
          description: data.description || '',
          imageUrl: data.imageUrl,
          equipmentNeeded: data.equipmentNeeded,
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

  // 4. Pay Booking
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

  // 5. Complete Booking
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

  // 6. Submit Review
  const handleSubmitReview = async (_data: any) => {
    addToast('success', 'Thank You for Rating!', 'Your review helps keep our verified pro network top-tier.');
  };

  // Admin controls
  const handleVerifyProvider = async (providerId: string, isVerified: boolean) => {
    try {
      await api.verifyProvider(providerId, isVerified);
      setProviders((prev) =>
        prev.map((p) => (p._id === providerId ? { ...p, isVerified } : p))
      );
      addToast('success', 'Provider Status Updated', `Verification status set to ${isVerified}`);
    } catch (_) {}
  };

  const handleAddCategory = async (categoryData: Partial<Category>) => {
    const newCat: Category = {
      _id: 'cat-' + Math.random().toString(36).substring(2, 9),
      name: categoryData.name || 'New Category',
      slug: categoryData.slug || 'new-category',
      icon: categoryData.icon || 'Sparkles',
      description: categoryData.description || '',
      avgPriceRange: categoryData.avgPriceRange || '₹5,000 - ₹25,000',
      isActive: true,
    };
    setCategories((prev) => [...prev, newCat]);
    addToast('success', 'Category Created', `${newCat.name} is now available on the board.`);
  };

  const handleResetSeedData = async () => {
    loadData();
    addToast('info', 'Data Refreshed', 'Synced latest categories and marketplace data.');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        currentUser={currentUser}
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenPostModal={() => handleOpenPostModal()}
      />

      {/* Main Workspace Body (Full-width for true edge-to-edge landing page) */}
      <main className={`w-full flex-1 ${currentRole !== 'requester' ? 'pt-20' : ''}`}>
        
        {currentRole === 'requester' && (
          <RequesterView
            requirements={requirements}
            bookings={bookings}
            categories={categories}
            currentUser={currentUser}
            onOpenPostModal={handleOpenPostModal}
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
        initialCategory={postModalCategory}
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

      {/* Exact Matching Light Aesthetic Premium Footer */}
      <Footer 
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenPostModal={handleOpenPostModal}
      />

    </div>
  );
}
