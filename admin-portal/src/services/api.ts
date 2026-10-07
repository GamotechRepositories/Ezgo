import type { AdminMetrics, Booking, Category, Occasion, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'ezzygo_token_admin';

export interface DemoAccount {
  role: 'requester' | 'provider' | 'admin';
  name: string;
  businessName?: string;
  phone: string;
  password: string;
}

export const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('ezgo_token_admin') || '';
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const defaultAdminUser: User = {
  _id: '',
  name: 'Admin',
  phone: '',
  role: 'admin',
};

export const emptyMetrics: AdminMetrics = {
  totalRequirements: 0,
  totalBookings: 0,
  activeBookings: 0,
  completedBookings: 0,
  totalProviders: 0,
  pendingVerificationCount: 0,
  totalGMV: 0,
  totalCommissionEarned: 0,
  totalEscrowHeld: 0,
  recentTransactions: [],
};

async function request<T>(path: string, options: RequestInit = {}, fallbackError = 'Request failed'): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
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

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const api = {
  async login(phone: string, password: string): Promise<User> {
    const data = await request<{ token: string; user: User }>(
      '/auth/login',
      json('POST', { phone, password, role: 'admin' }),
      'Could not log in'
    );
    setToken(data.token);
    return data.user;
  },

  me: () => request<User>('/auth/me', {}, 'Could not load admin'),

  demoAccounts: () => request<DemoAccount[]>('/auth/demo-accounts', {}, 'Could not load demo accounts'),

  getMetrics: () => request<AdminMetrics>('/admin/metrics', {}, 'Could not load metrics'),

  getProviders: () => request<User[]>('/admin/providers', {}, 'Could not load vendors'),

  verifyProvider: (providerId: string, isVerified: boolean) =>
    request<User>(`/admin/providers/${providerId}/verify`, json('PATCH', { isVerified }), 'Could not change vendor status'),

  getBookings: () => request<Booking[]>('/bookings', {}, 'Could not load bookings'),

  completeBooking: (bookingId: string) =>
    request<Booking>('/bookings/complete', json('POST', { bookingId }), 'Could not pay the vendor'),

  cancelBooking: (bookingId: string, reason: string) =>
    request<Booking>('/bookings/cancel', json('POST', { bookingId, reason }), 'Could not cancel the booking'),

  getCategories: () => request<Category[]>('/categories', {}, 'Could not load categories'),

  addCategory: (catData: Partial<Category>) =>
    request<Category>('/categories', json('POST', catData), 'Could not add category'),

  updateCategory: (id: string, catData: Partial<Category>) =>
    request<Category>(`/categories/${id}`, json('PUT', catData), 'Could not update category'),

  async uploadImage(file: File, folder = 'ezzygo/categories'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const headers: HeadersInit = {};
    if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/upload`, { method: 'POST', headers, body: formData });
    } catch {
      throw new Error('Cannot reach the EzzyGo server. Is the backend running?');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Image upload failed');
    return data.url;
  },

  getOccasions: () => request<Occasion[]>('/occasions', {}, 'Could not load occasions'),

  addOccasion: (occasionData: Partial<Occasion>) =>
    request<Occasion>('/occasions', json('POST', occasionData), 'Could not add occasion'),

  updateOccasion: (id: string, occasionData: Partial<Occasion>) =>
    request<Occasion>(`/occasions/${id}`, json('PUT', occasionData), 'Could not update occasion'),

  deleteOccasion: (id: string) => request<unknown>(`/occasions/${id}`, { method: 'DELETE' }, 'Could not remove occasion'),
};
