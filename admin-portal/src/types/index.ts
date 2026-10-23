export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'requester' | 'provider' | 'admin';
  roles?: string[];
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
  kycDocuments?: {
    aadhaarNumber?: string;
    aadhaarFront?: string;
    aadhaarBack?: string;
    panNumber?: string;
    panCard?: string;
    gstNumber?: string;
    gstDoc?: string;
    businessAddress?: string;
    submittedAt?: string;
    rejectionReason?: string;
    reviewRequestedAt?: string;
    reviewRequestedMessage?: string;
  };
  avatar?: string;
  unavailableDates?: {
    date: string;
    reason: string;
    createdAt?: string;
  }[];
  verificationAudit?: {
    status: string;
    action?: string;
    reviewedByName?: string;
    reviewedAt: string;
    notes?: string;
  }[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  description: string;
  avgPriceRange: string;
  isActive: boolean;
}

export interface Occasion {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  image: string;
  iconType?: 'rings' | 'lotus' | 'corporate' | 'party' | 'birthday' | 'sparkles' | 'music' | 'camera' | 'food';
  order?: number;
  isActive?: boolean;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  targetUrl?: string;
  ctaText?: string;
  city?: string;
  placement: 'hero_banner' | 'featured_banner' | 'all';
  discountPercent?: number;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Requirement {
  _id: string;
  requesterId: User | string;
  category: string;
  title: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  location: {
    city: string;
    area: string;
    venueAddress?: string;
  };
  eventDate: string;
  guestCount: number;
  budget: number;
  maxAcceptableBid: number;
  status: 'OPEN' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'DRAFT';
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
  disputeReason?: string;
  disputeDetails?: {
    isDisputed: boolean;
    reason: string;
    raisedBy?: any;
    raisedAt?: string;
    resolutionAction?: string;
    resolutionNote?: string;
    resolvedAt?: string | null;
  };
  completedAt?: string;
  createdAt: string;
}

export interface CityMetric {
  city: string;
  totalRequirements: number;
  openRequirements: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalProviders: number;
  verifiedProviders: number;
  totalGMV: number;
  totalCommissionEarned: number;
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
  totalPayoutsReleased?: number;
  cityBreakdown?: CityMetric[];
  recentTransactions: any[];
}

export interface AuditLog {
  _id?: string;
  id?: string;
  actor: {
    id?: string;
    name: string;
    role?: string;
    phone?: string;
    email?: string;
  } | string;
  action: string;
  targetType?: string;
  targetId?: string;
  details: string;
  metadata?: Record<string, any>;
  amount?: number | null;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
  ipAddress?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface Bid {
  _id: string;
  requirementId: string;
  providerId: {
    _id: string;
    name: string;
    businessName?: string;
    phone?: string;
    rating?: number;
    avatar?: string;
    isVerified?: boolean;
  };
  amount: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
}