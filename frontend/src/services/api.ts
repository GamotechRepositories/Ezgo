import type { User, Requirement, Bid, Booking, Category, AdminMetrics, UserRole } from '../types';

const API_BASE = 'http://localhost:5000/api';

// Initial Mock Seed fallback
export const mockCategories: Category[] = [
  { _id: 'cat-1', name: 'DJ / Teenmar / Sound & Lighting', slug: 'dj-sound', icon: 'Volume2', description: 'DJ setup, teenmar beats, truss lights & fog machines', avgPriceRange: '₹8,000 - ₹35,000', isActive: true },
  { _id: 'cat-2', name: 'Catering', slug: 'catering', icon: 'Utensils', description: 'South & North Indian vegetarian & non-vegetarian buffets', avgPriceRange: '₹15,000 - ₹1,50,000', isActive: true },
  { _id: 'cat-3', name: 'Decoration', slug: 'decoration', icon: 'Sparkles', description: 'Floral stage, mandap, entrance arch & theme lighting', avgPriceRange: '₹10,000 - ₹75,000', isActive: true },
  { _id: 'cat-4', name: 'Lighting', slug: 'lighting', icon: 'Lightbulb', description: 'Ambient LED serial lights, focus beams & architectural wash', avgPriceRange: '₹5,000 - ₹25,000', isActive: true },
  { _id: 'cat-5', name: 'Purohit / Priest services', slug: 'purohit', icon: 'Flame', description: 'Vedic rituals, Griha Pravesh, Satyanarayana Puja & Weddings', avgPriceRange: '₹3,500 - ₹15,000', isActive: true },
  { _id: 'cat-6', name: 'Photography & Videography', slug: 'photography', icon: 'Camera', description: 'Candid wedding photography, cinematic 4K video & drones', avgPriceRange: '₹15,000 - ₹80,000', isActive: true },
  { _id: 'cat-7', name: 'Mehendi', slug: 'mehendi', icon: 'Heart', description: 'Bridal organic Rajasthani & Arabic Mehendi artists', avgPriceRange: '₹4,000 - ₹20,000', isActive: true },
  { _id: 'cat-8', name: 'Tent & Stage setup', slug: 'tent-stage', icon: 'Tent', description: 'German shamiana tents, VIP lounge chairs & stage trussing', avgPriceRange: '₹15,000 - ₹60,000', isActive: true },
  { _id: 'cat-9', name: 'Festival-specific event setup', slug: 'festival', icon: 'Sun', description: 'Ganesh Utsav, Diwali lights & Durga Puja pandal decor', avgPriceRange: '₹8,000 - ₹40,000', isActive: true },
];

export const mockUsers: Record<UserRole, User> = {
  requester: {
    _id: 'usr-req-1',
    name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    email: 'ananya.sharma@ezgo.in',
    role: 'requester',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  provider: {
    _id: 'usr-prov-1',
    name: 'Rajesh Pro Events & DJ',
    businessName: 'Rajesh Sound & Teenmar Beats',
    phone: '+91 91234 56789',
    email: 'rajesh@events.in',
    role: 'provider',
    categories: ['DJ / Teenmar / Sound & Lighting', 'Lighting'],
    serviceArea: 'Hyderabad (Madhapur, Gachibowli, Jubilee Hills)',
    rating: 4.9,
    reviewCount: 42,
    completedJobs: 45,
    isVerified: true,
    bankDetails: {
      accountHolder: 'Rajesh Sound & Beats',
      accountNumber: '••••••••8921',
      ifscCode: 'HDFC0001234',
      upiId: 'rajesh.events@okaxis',
      isKycCompleted: true,
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  admin: {
    _id: 'usr-admin-1',
    name: 'EzGo Operations Desk',
    phone: '+91 90000 00001',
    email: 'ops@ezgo.in',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
};

// API Client Helper
export const api = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return mockCategories;
  },

  async getRequirements(params?: { category?: string; status?: string; requesterId?: string }): Promise<Requirement[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/requirements?${query}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return [];
  },

  async getRequirementById(id: string): Promise<Requirement | null> {
    try {
      const res = await fetch(`${API_BASE}/requirements/${id}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return null;
  },

  async createRequirement(data: Partial<Requirement>): Promise<Requirement> {
    const res = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to post requirement');
    }
    const json = await res.json();
    return json.data;
  },

  async placeBid(data: {
    requirementId: string;
    providerId: string;
    amount: number;
    proposalNotes: string;
    equipmentDetails?: string;
  }): Promise<{ message: string; data: Bid }> {
    const res = await fetch(`${API_BASE}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to place bid');
    }
    return await res.json();
  },

  async acceptBid(requirementId: string, bidId: string, requesterId: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/accept-bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirementId, bidId, requesterId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to accept bid');
    }
    const json = await res.json();
    return json.data;
  },

  async payBooking(bookingId: string, paymentMethod: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, paymentMethod }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Payment processing failed');
    }
    const json = await res.json();
    return json.data;
  },

  async completeBooking(bookingId: string): Promise<{ message: string; data: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to complete booking');
    }
    return await res.json();
  },

  async getBookings(params?: { userId?: string; role?: string; status?: string }): Promise<Booking[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/bookings?${query}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return [];
  },

  async getAdminMetrics(): Promise<AdminMetrics | null> {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (_) {}
    return null;
  },

  async verifyProvider(providerId: string, isVerified: boolean) {
    const res = await fetch(`${API_BASE}/admin/verify-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, isVerified }),
    });
    return await res.json();
  },
};
