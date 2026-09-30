export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'requester' | 'provider' | 'admin';
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
  guestCount: number;
  budget: number;
  maxAcceptableBid: number;
  status: 'OPEN' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  bidsCount: number;
  lowestBid?: number;
  createdAt: string;
}

export interface Booking {
  _id: string;
  requirementId: Requirement;
  bidId: any;
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
  totalEscrowHeld: number;
  recentTransactions: any[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  amount?: number;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
}