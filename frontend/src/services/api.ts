import type { User, Requirement, Bid, Booking, Category, AdminMetrics, UserRole } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const mockCategories: Category[] = [
  { _id: 'cat-1', name: 'DJ & Sound Systems', slug: 'dj-sound', icon: 'Speaker', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', description: 'DJ setup, teenmar beats, truss lights & fog machines', avgPriceRange: '₹8,000 - ₹35,000', isActive: true },
  { _id: 'cat-2', name: 'Catering Buffets', slug: 'catering', icon: 'Utensils', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format&fit=crop&q=80', description: 'South & North Indian vegetarian & non-vegetarian buffets', avgPriceRange: '₹15,000 - ₹1,50,000', isActive: true },
  { _id: 'cat-3', name: 'Stage & Mandap Decoration', slug: 'decor', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80', description: 'Floral stage, mandap, entrance arch & theme lighting', avgPriceRange: '₹10,000 - ₹75,000', isActive: true },
  { _id: 'cat-4', name: 'Lighting & Trussing', slug: 'lighting', icon: 'Zap', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', description: 'Ambient LED serial lights, focus beams & architectural wash', avgPriceRange: '₹5,000 - ₹25,000', isActive: true },
  { _id: 'cat-5', name: 'Purohit & Priest Services', slug: 'purohit', icon: 'Flame', image: 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=600&auto=format&fit=crop&q=80', description: 'Vedic rituals, Griha Pravesh, Satyanarayana Puja & Weddings', avgPriceRange: '₹3,500 - ₹15,000', isActive: true },
  { _id: 'cat-6', name: '4K Photography & Drone', slug: 'photography', icon: 'Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80', description: 'Candid wedding photography, cinematic 4K video & drones', avgPriceRange: '₹15,000 - ₹80,000', isActive: true },
  { _id: 'cat-7', name: 'Bridal Mehendi & Makeup', slug: 'mehendi-makeup', icon: 'Heart', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', description: 'Bridal organic Rajasthani & Arabic Mehendi artists', avgPriceRange: '₹4,000 - ₹20,000', isActive: true },
  { _id: 'cat-8', name: 'Tent & Stage Setup', slug: 'tent-stage', icon: 'Tent', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80', description: 'German shamiana tents, VIP lounge chairs & stage trussing', avgPriceRange: '₹15,000 - ₹60,000', isActive: true },
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
    name: 'Rajesh Sound & FX Pro',
    businessName: 'Rajesh Pro Audio & Lightings',
    phone: '+91 98231 45678',
    email: 'rajesh@punesoundpros.in',
    role: 'provider',
    categories: ['DJ & Sound Systems', 'Lighting & Trussing'],
    serviceArea: 'Pune, MH',
    rating: 4.9,
    reviewCount: 42,
    completedJobs: 58,
    isVerified: true,
    bankDetails: {
      accountHolder: 'Rajesh Pro Audio LLP',
      accountNumber: '••••••••9812',
      ifscCode: 'HDFC0001234',
      upiId: 'rajeshsound@okhdfc',
      isKycCompleted: true,
    },
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  admin: {
    _id: 'usr-admin-1',
    name: 'EzGo Operations Desk',
    phone: '+91 90000 00001',
    email: 'ops@ezgo.in',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
};

// Live Dynamic API Client
export const api = {
  async getUserByRole(role: 'requester' | 'provider' | 'admin'): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (_) {}
    return mockUsers[role];
  },

  async getCategories(): Promise<Category[]> {
    let baseList = mockCategories;
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          baseList = json.data;
        }
      }
    } catch (_) {}

    try {
      const raw = localStorage.getItem('ezgo_custom_categories');
      if (raw) {
        const customCats: Category[] = JSON.parse(raw);
        const combined = [...baseList];
        for (const cat of customCats) {
          if (!combined.some((c) => c._id === cat._id || c.slug === cat.slug)) {
            combined.push(cat);
          }
        }
        return combined;
      }
    } catch (_) {}

    return baseList;
  },

  async getRequirements(params?: { category?: string; status?: string; requesterId?: string }): Promise<Requirement[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/requirements?${query}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (_) {}
    return [];
  },

  async getRequirementById(id: string): Promise<Requirement | null> {
    try {
      const res = await fetch(`${API_BASE}/requirements/${id}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
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
    return json.data || json;
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
    return json.data || json;
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
    return json.data || json;
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
        return json.data || json;
      }
    } catch (_) {}
    return [];
  },

  async getAdminMetrics(): Promise<AdminMetrics | null> {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (_) {}
    return null;
  },

  async verifyProvider(providerId: string, isVerified: boolean) {
    const res = await fetch(`${API_BASE}/admin/providers/${providerId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified }),
    });
    return await res.json();
  },

  async uploadImage(file: File, folder = 'ezgo/uploads'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Image upload failed');
    }

    const data = await res.json();
    return data.url;
  },
};
