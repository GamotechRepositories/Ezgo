import type { AdminMetrics, Booking, Category, Occasion, User, AuditLog, Banner } from '../types';

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
  cityBreakdown: [],
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
  if (res.status === 401 && token && !path.includes('/auth/')) {
    clearToken();
    window.location.reload();
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || fallbackError);
  return (json.data ?? json) as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const api = {
  async sendAdminOtp(email: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(
      '/admin/auth/send-otp',
      json('POST', { email }),
      'Failed to send verification code'
    );
  },

  async verifyAdminOtp(email: string, otp: string): Promise<User> {
    const data = await request<{ token: string; user: User }>(
      '/admin/auth/verify-otp',
      json('POST', { email, otp }),
      'Verification failed'
    );
    if (data.token) {
      setToken(data.token);
    }
    return data.user;
  },

  async logout(): Promise<void> {
    try {
      await request('/admin/auth/logout', json('POST', {}));
    } catch {
      // Ignore network errors on logout
    } finally {
      clearToken();
    }
  },

  async login(phone: string, password: string): Promise<User> {
    const data = await request<{ token: string; user: User }>(
      '/auth/login',
      json('POST', { phone, password, role: 'admin' }),
      'Could not log in'
    );
    setToken(data.token);
    return data.user;
  },

  me: () => request<User>('/admin/auth/me', {}, 'Could not load admin').catch(() => request<User>('/auth/me', {}, 'Could not load admin')),

  demoAccounts: () => request<DemoAccount[]>('/auth/demo-accounts', {}, 'Could not load demo accounts'),

  getMetrics: () => request<AdminMetrics>('/admin/metrics', {}, 'Could not load metrics'),

  getProviders: (params?: { city?: string }) => {
    const query = new URLSearchParams();
    if (params?.city && params.city !== 'ALL') query.set('city', params.city);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<User[]>(`/admin/providers${qs}`, {}, 'Could not load vendors');
  },

  verifyProvider: (providerId: string, isVerified: boolean, notes?: string, rejectionReason?: string) =>
    request<User>(`/admin/providers/${providerId}/verify`, json('PATCH', { isVerified, notes, rejectionReason }), 'Could not change vendor status'),

  getBookings: (params?: { city?: string }) => {
    const query = new URLSearchParams();
    if (params?.city && params.city !== 'ALL') query.set('city', params.city);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Booking[]>(`/bookings${qs}`, {}, 'Could not load bookings');
  },

  completeBooking: (bookingId: string) =>
    request<Booking>('/bookings/complete', json('POST', { bookingId }), 'Could not pay the vendor'),

  cancelBooking: (bookingId: string, reason: string) =>
    request<Booking>('/bookings/cancel', json('POST', { bookingId, reason }), 'Could not cancel the booking'),

  resolveDispute: (bookingId: string, action: 'PAYOUT_VENDOR' | 'REFUND_HOST' | 'DISMISS', note?: string) =>
    request<Booking>(`/bookings/${bookingId}/resolve-dispute`, json('POST', { action, note }), 'Could not resolve dispute'),


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
  
  getBanners: (params?: { city?: string; all?: boolean; placement?: string }) => {
    const query = new URLSearchParams();
    if (params?.city && params.city !== 'ALL') query.set('city', params.city);
    if (params?.all !== undefined) query.set('all', String(params.all));
    if (params?.placement && params.placement !== 'all') query.set('placement', params.placement);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Banner[]>(`/banners${qs}`, {}, 'Could not load ad banners');
  },

  addBanner: (bannerData: Partial<Banner>) =>
    request<Banner>('/banners', json('POST', bannerData), 'Could not add ad banner'),

  updateBanner: (id: string, bannerData: Partial<Banner>) =>
    request<Banner>(`/banners/${id}`, json('PUT', bannerData), 'Could not update ad banner'),

  deleteBanner: (id: string) => request<unknown>(`/banners/${id}`, { method: 'DELETE' }, 'Could not remove ad banner'),

  getAuditLogs: (params?: { action?: string; targetType?: string }) => {
    const query = new URLSearchParams();
    if (params?.action && params.action !== 'ALL') query.set('action', params.action);
    if (params?.targetType && params.targetType !== 'ALL') query.set('targetType', params.targetType);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<AuditLog[]>(`/admin/audit-logs${qs}`, {}, 'Could not load audit logs');
  },

  getProviderKyc: (providerId: string) =>
    request<any>(`/admin/providers/${providerId}/kyc`, {}, 'Could not load provider KYC details'),

  getRequirements: (params?: { category?: string; status?: string; city?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.city) query.set('city', params.city);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<any[]>(`/requirements${qs}`, {}, 'Could not load event requirements');
  },

  deleteRequirement: (id: string) =>
    request<{ success: boolean; message: string }>(`/requirements/${id}`, { method: 'DELETE' }, 'Could not delete requirement'),

  getAllUsers: (params?: { search?: string; role?: string; city?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role && params.role !== 'ALL') query.set('role', params.role);
    if (params?.city && params.city !== 'ALL') query.set('city', params.city);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<User[]>(`/admin/users${qs}`, {}, 'Could not load users');
  },

  updateUserRole: (userId: string, role: string) =>
    request<User>(`/admin/users/${userId}/role`, json('PATCH', { role }), 'Could not update user role'),

  updateProfile: (data: {
    userId?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }) => request<User>('/auth/profile', json('PUT', data), 'Could not update profile'),
};


