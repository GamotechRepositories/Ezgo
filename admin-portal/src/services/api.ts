import type { AdminMetrics, Booking, Category, User } from '../types';

const API_BASE = 'http://localhost:5000/api';

export const mockAdminUser: User = {
  _id: 'usr-admin-1',
  name: 'Super Admin',
  phone: '+91 99000 00001',
  email: 'ops@ezgoevents.in',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
};

export const mockMetrics: AdminMetrics = {
  totalRequirements: 5,
  totalBookings: 2,
  activeBookings: 1,
  completedBookings: 1,
  totalProviders: 3,
  pendingVerificationCount: 1,
  totalGMV: 94600,
  totalCommissionEarned: 8600,
  totalEscrowHeld: 26400,
  recentTransactions: [],
};

export const mockProviders: User[] = [
  {
    _id: 'usr-p1',
    name: 'Rajesh Sound & FX Pro',
    phone: '+91 98231 45678',
    email: 'rajesh@punesoundpros.in',
    role: 'provider',
    businessName: 'Rajesh Pro Audio LLP',
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
];

export const mockCategories: Category[] = [
  {
    _id: 'cat-1',
    name: 'DJ & Sound Systems',
    slug: 'dj-sound',
    icon: 'Speaker',
    description: 'Line arrays, active tops, subwoofers, Pioneer DDJ, wireless mics',
    avgPriceRange: '₹8,000 - ₹45,000',
    isActive: true,
  },
  {
    _id: 'cat-2',
    name: 'Stage & Mandap Decoration',
    slug: 'decor',
    icon: 'Sparkles',
    description: 'Custom flower arches, fairy light canopies, royal wedding backdrops',
    avgPriceRange: '₹15,000 - ₹1,20,000',
    isActive: true,
  },
  {
    _id: 'cat-3',
    name: '4K Photography & Drone',
    slug: 'photography',
    icon: 'Camera',
    description: 'Cinematic 4K coverage, drone flybys, live stream mix, gimbal rigs',
    avgPriceRange: '₹12,000 - ₹65,000',
    isActive: true,
  },
];

export const api = {
  async getAdminUser(): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (_) {}
    return mockAdminUser;
  },

  async getMetrics(): Promise<AdminMetrics> {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (_) {}
    return mockMetrics;
  },

  async getProviders(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/providers`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (_) {}
    return mockProviders;
  },

  async verifyProvider(providerId: string, isVerified: boolean): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${providerId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
      });
      return await res.json();
    } catch (_) {
      return { success: true };
    }
  },

  async getBookings(): Promise<Booking[]> {
    try {
      const res = await fetch(`${API_BASE}/bookings`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (_) {}
    return [];
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (_) {}
    return mockCategories;
  },

  async addCategory(catData: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData),
      });
      const data = await res.json();
      return data.data || data;
    } catch (_) {
      return {
        _id: 'cat-' + Date.now(),
        name: catData.name || 'New Category',
        slug: catData.slug || 'new-cat',
        icon: catData.icon || 'Sparkles',
        description: catData.description || '',
        avgPriceRange: catData.avgPriceRange || '₹10,000 - ₹50,000',
        isActive: true,
      };
    }
  },
};