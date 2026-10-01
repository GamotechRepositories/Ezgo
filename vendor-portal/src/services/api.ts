import type { Requirement, Bid, Booking, Category, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const mockVendor: User = {
  _id: 'usr-p1',
  name: 'Rajesh Sound & FX Pro',
  phone: '+91 98231 45678',
  email: 'rajesh@punesoundpros.in',
  role: 'provider',
  businessName: 'Rajesh Pro Audio & Lightings',
  categories: ['DJ & Sound Systems', 'Lighting & Trussing', 'Stage & Mandap Decoration'],
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
};

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
  {
    _id: 'cat-4',
    name: 'Catering Buffets',
    slug: 'catering',
    icon: 'Utensils',
    description: 'Multi-cuisine live counters, traditional thalis, chaat stalls',
    avgPriceRange: '₹350 - ₹1,200 / plate',
    isActive: true,
  },
  {
    _id: 'cat-5',
    name: 'Lighting & Trussing',
    slug: 'lighting',
    icon: 'Zap',
    description: 'Sharpy moving heads, LED par cans, aluminum box truss grids',
    avgPriceRange: '₹10,000 - ₹50,000',
    isActive: true,
  },
];

export const mockEquipmentList = [
  {
    id: 'eq-1',
    name: 'JBL VRX932LA Line Array Pair',
    category: 'Sound Systems',
    specs: 'Constant Curvature 1750W Peak, Dual Active Tops',
    dailyRate: 6500,
    isAvailable: true,
    condition: 'Excellent' as const,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'eq-2',
    name: 'Pioneer DDJ-1000 4-Channel DJ Controller',
    category: 'DJ Gear',
    specs: 'Full size jog wheels, Magvel crossfader, Rekordbox ready',
    dailyRate: 4000,
    isAvailable: true,
    condition: 'Excellent' as const,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'eq-3',
    name: 'Beam 230W 7R Sharpy Moving Heads (Set of 4)',
    category: 'Lighting',
    specs: '14 colors + open, 17 gobos, 8-facet prism with flight case',
    dailyRate: 5000,
    isAvailable: true,
    condition: 'Good' as const,
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'eq-4',
    name: 'Shure BLX288/PG58 Dual Wireless Vocal System',
    category: 'Microphones',
    specs: 'Dual channel UHF receiver, 300ft operating range',
    dailyRate: 1800,
    isAvailable: true,
    condition: 'Excellent' as const,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80',
  },
];

export const api = {
  async getVendorUser(): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'provider' }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (_) {}
    return mockVendor;
  },

  async getRequirements(): Promise<Requirement[]> {
    try {
      const res = await fetch(`${API_BASE}/requirements`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (_) {}
    return [];
  },

  async placeBid(reqId: string, bidData: { amount: number; proposalNotes: string; equipmentDetails?: string; providerId: string }): Promise<Bid> {
    const res = await fetch(`${API_BASE}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirementId: reqId, ...bidData }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Bid submission rejected');
    }
    const data = await res.json();
    return data.data || data;
  },

  async getMyBookings(vendorId?: string): Promise<Booking[]> {
    try {
      const targetId = vendorId || mockVendor._id;
      const res = await fetch(`${API_BASE}/bookings/provider/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }
    } catch (_) {}
    return [];
  },

  async getCategories(): Promise<Category[]> {
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
};