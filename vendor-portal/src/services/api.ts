import type { Requirement, Bid, Booking, User, EquipmentItem } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'ezzygo_token_vendor';

export interface DemoAccount {
  role: 'requester' | 'provider' | 'admin';
  name: string;
  businessName?: string;
  phone: string;
  password: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('ezgo_token_vendor') || '';
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const emptyVendor: User = {
  _id: '',
  name: 'Vendor',
  phone: '',
  role: 'provider',
  isVerified: false,
};

async function request<T>(path: string, options: RequestInit = {}, fallbackError = 'Request failed'): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (_) {
    throw new Error('Cannot reach the EzzyGo server. Is the backend running?');
  }
  if (res.status === 401 && token && !path.startsWith('/auth/')) {
    clearToken();
    window.location.reload();
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || fallbackError);
  return (json.data ?? json) as T;
}

const jsonBody = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  async login(phone: string, password: string): Promise<User> {
    const data = await request<{ token: string; user: User }>(
      '/auth/login',
      jsonBody('POST', { phone, password, role: 'provider' }),
      'Could not log in'
    );
    setToken(data.token);
    return data.user;
  },

  async register(input: { name: string; phone: string; password: string; businessName: string; serviceArea?: string; email?: string }): Promise<User> {
    const data = await request<{ token: string; user: User }>(
      '/auth/register',
      jsonBody('POST', { ...input, role: 'provider' }),
      'Could not create your account'
    );
    setToken(data.token);
    return data.user;
  },

  async sendOtp(phone: string, purpose = 'login'): Promise<{ phone: string; demoOtp?: string }> {
    const res = await request<{ success: boolean; data: { phone: string; demoOtp?: string } }>(
      '/auth/send-otp',
      jsonBody('POST', { phone, purpose }),
      'Could not send OTP'
    );
    return res.data;
  },

  async verifyOtpAndLogin(phone: string, otp: string): Promise<{ isNewUser: boolean; user?: User; phone: string }> {
    const res = await request<{
      success: boolean;
      isNewUser: boolean;
      phone: string;
      data?: { token: string; user: User };
    }>('/auth/verify-otp', jsonBody('POST', { phone, otp, role: 'provider' }), 'Invalid OTP code');

    if (res.data?.token) {
      setToken(res.data.token);
      return { isNewUser: false, user: res.data.user, phone: res.phone };
    }
    return { isNewUser: true, phone: res.phone };
  },

  me(): Promise<User> {
    return request<User>('/auth/me', {}, 'Could not load your account');
  },

  demoAccounts(): Promise<DemoAccount[]> {
    return request<DemoAccount[]>('/auth/demo-accounts', {}, 'Could not load demo accounts');
  },

  getRequirements(): Promise<Requirement[]> {
    return request<Requirement[]>('/requirements', {}, 'Could not load open requests');
  },

  placeBid(reqId: string, bidData: { amount: number; proposalNotes: string; equipmentDetails?: string; providerId: string }): Promise<Bid> {
    return request<Bid>('/bids', jsonBody('POST', { requirementId: reqId, ...bidData }), 'Bid submission rejected');
  },

  getMyBookings(vendorId: string): Promise<Booking[]> {
    return request<Booking[]>(`/bookings/provider/${vendorId}`, {}, 'Could not load your orders');
  },

  raiseDispute(bookingId: string, reason: string): Promise<{ message: string; data: Booking }> {
    return request(`/bookings/${bookingId}/dispute`, jsonBody('POST', { reason }), 'Failed to raise dispute');
  },

  submitKyc(kycData: {
    aadhaarNumber?: string;
    aadhaarFront?: string;
    aadhaarBack?: string;
    panNumber?: string;
    panCard?: string;
    gstNumber?: string;
    gstDoc?: string;
    businessAddress?: string;
  }): Promise<User> {
    return request<User>('/auth/submit-kyc', jsonBody('POST', kycData), 'Failed to submit KYC documents');
  },

  getNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    return request<{ success: boolean; data: AppNotification[]; unreadCount: number }>('/notifications').then((r) => ({
      notifications: r.data || [],
      unreadCount: r.unreadCount || 0,
    }));
  },

  markNotificationRead(id: string): Promise<void> {
    return request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  getEquipment(vendorId: string): Promise<EquipmentItem[]> {
    return request<EquipmentItem[]>(`/items?providerId=${encodeURIComponent(vendorId)}`, {}, 'Could not load your equipment');
  },

  addEquipment(vendorId: string, item: Partial<EquipmentItem>): Promise<EquipmentItem> {
    return request<EquipmentItem>('/items', jsonBody('POST', { ...item, providerId: vendorId }), 'Could not save equipment');
  },

  updateEquipment(id: string, patch: Partial<EquipmentItem>): Promise<EquipmentItem> {
    return request<EquipmentItem>(`/items/${id}`, jsonBody('PUT', patch), 'Could not update equipment');
  },

  removeEquipment(id: string): Promise<void> {
    return request<void>(`/items/${id}`, { method: 'DELETE' }, 'Could not remove equipment');
  },

  deleteEquipment(id: string): Promise<void> {
    return request<void>(`/items/${id}`, { method: 'DELETE' }, 'Could not remove equipment');
  },

  async uploadImage(file: File, folder = 'ezzygo/equipment'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const data = await request<{ url: string }>('/upload', { method: 'POST', body: formData }, 'Image upload failed');
    return data.url;
  },
};
