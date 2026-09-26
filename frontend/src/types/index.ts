export type UserRole = 'requester' | 'provider' | 'admin';

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  businessName?: string;
  categories?: string[];
  serviceArea?: string;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
  isVerified?: boolean;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
    isKycCompleted: boolean;
  };
  avatar?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  avgPriceRange: string;
  isActive: boolean;
}

export interface Requirement {
  _id: string;
  requesterId: User | string;
  category: string;
  title: string;
  description: string;
  location: {
    city: string;
    area: string;
    venueAddress?: string;
  };
  eventDate: string;
  timeWindow: {
    start: string;
    end: string;
  };
  guestCount: number;
  budget: number;
  maxAcceptableBid: number; // 85% of budget
  status: 'OPEN' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  bidsCount: number;
  lowestBid?: number;
  createdAt: string;
  bids?: Bid[];
}

export interface Bid {
  _id: string;
  requirementId: Requirement | string;
  providerId: User;
  amount: number;
  proposalNotes: string;
  equipmentDetails?: string;
  discountPercent: number;
  isEligibleForAccept: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Booking {
  _id: string;
  requirementId: Requirement;
  bidId: Bid;
  requesterId: User;
  providerId: User;
  bidAmount: number;
  platformFee: number;
  totalPaid: number;
  status: 'AWAITING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'PAYOUT_RELEASED' | 'CANCELLED' | 'DISPUTED';
  paymentDetails: {
    transactionId: string;
    method: string;
    paidAt?: string;
    escrowStatus: 'HELD' | 'RELEASED_TO_PROVIDER' | 'REFUNDED';
  };
  payoutDetails?: {
    transferId: string;
    releasedAt: string;
    amountToProvider: number;
    commissionRetained: number;
  };
  isContactRevealed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface AdminMetrics {
  totalRequirements: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalProviders: number;
  pendingVerificationCount: number;
  totalGMV: number;
  totalCommissionEarned: number;
  totalPayoutsReleased: number;
  recentTransactions: any[];
}
