import type { AdminMetrics, Booking, Category, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    description: 'Line arrays, active tops, subwoofers, Pioneer DDJ, wireless mics',
    avgPriceRange: '₹8,000 - ₹45,000',
    isActive: true,
  },
  {
    _id: 'cat-2',
    name: 'Stage & Mandap Decoration',
    slug: 'decor',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
    description: 'Custom flower arches, fairy light canopies, royal wedding backdrops',
    avgPriceRange: '₹15,000 - ₹1,20,000',
    isActive: true,
  },
  {
    _id: 'cat-3',
    name: '4K Photography & Drone',
    slug: 'photography',
    icon: 'Camera',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    description: 'Cinematic 4K coverage, drone flybys, live stream mix, gimbal rigs',
    avgPriceRange: '₹12,000 - ₹65,000',
    isActive: true,
  },
];

const LOCAL_STORAGE_KEY = 'ezgo_custom_categories';

function getStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCategories(newCat: Category) {
  try {
    const existing = getStoredCategories();
    const filtered = existing.filter((c) => c._id !== newCat._id && c.slug !== newCat.slug);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...filtered, newCat]));
  } catch {}
}

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
    const stored = getStoredCategories();
    let baseList = mockCategories;
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          baseList = data.data;
        }
      }
    } catch (_) {}

    // Merge baseList and stored categories, deduplicating by slug/id
    const combined = [...baseList];
    for (const cat of stored) {
      if (!combined.some((c) => c._id === cat._id || c.slug === cat.slug)) {
        combined.push(cat);
      }
    }
    return combined;
  },

  async addCategory(catData: Partial<Category>): Promise<Category> {
    let createdCat: Category | null = null;
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData),
      });
      if (res.ok) {
        const data = await res.json();
        createdCat = data.data || data;
      }
    } catch (_) {}

    if (!createdCat) {
      createdCat = {
        _id: 'cat-' + Date.now(),
        name: catData.name || 'New Category',
        slug: catData.slug || 'new-cat',
        icon: catData.icon || 'Sparkles',
        image: catData.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
        description: catData.description || '',
        avgPriceRange: catData.avgPriceRange || '₹10,000 - ₹50,000',
        isActive: true,
      };
    }

    // Persist to localStorage so refresh never loses the category
    saveStoredCategories(createdCat);
    return createdCat;
  },
};