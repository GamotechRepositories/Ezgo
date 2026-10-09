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
  imageUrl?: string;
  eventType?: string;
  equipmentNeeded?: string[];
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
  status: 'DRAFT' | 'OPEN' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
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

export interface EquipmentItem {
  _id: string;
  providerId?: string;
  name: string;
  category: string;
  specs: string;
  dailyRate: number;
  isAvailable: boolean;
  condition: 'Excellent' | 'Good' | 'Maintenance Required';
  image: string;
}