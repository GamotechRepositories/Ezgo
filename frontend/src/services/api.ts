import type { User, Requirement, Bid, Booking, Category, Occasion } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'ezzygo_token_host';

export const emptyUser: User = {
  _id: '',
  name: 'Guest',
  phone: '',
  role: 'requester',
};

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

export const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('ezgo_token_host') || '';
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

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
  return json as T;
}

const unwrap = async <T>(promise: Promise<{ data?: T }>): Promise<T> => {
  const json = await promise;
  return (json.data ?? json) as T;
};

const jsonBody = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const toQuery = (params?: Record<string, string | undefined>) => {
  const clean = Object.entries(params || {}).filter(([, v]) => v) as [string, string][];
  return clean.length ? `?${new URLSearchParams(clean).toString()}` : '';
};

export const api = {
  async login(phone: string, password: string): Promise<User> {
    const data = await unwrap<{ token: string; user: User }>(
      request('/auth/login', jsonBody('POST', { phone, password, role: 'requester' }), 'Could not log in')
    );
    setToken(data.token);
    return data.user;
  },

  async register(input: { name: string; phone: string; password: string; email?: string }): Promise<User> {
    const data = await unwrap<{ token: string; user: User }>(
      request('/auth/register', jsonBody('POST', { ...input, role: 'requester' }), 'Could not create your account')
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
    }>('/auth/verify-otp', jsonBody('POST', { phone, otp, role: 'requester' }), 'Invalid OTP code');

    if (res.data?.token) {
      setToken(res.data.token);
      return { isNewUser: false, user: res.data.user, phone: res.phone };
    }
    return { isNewUser: true, phone: res.phone };
  },

  me(): Promise<User> {
    return unwrap(request('/auth/me', {}, 'Could not load your account'));
  },

  demoAccounts(): Promise<DemoAccount[]> {
    return unwrap(request('/auth/demo-accounts', {}, 'Could not load demo accounts'));
  },

  getCategories(): Promise<Category[]> {
    return unwrap(request('/categories', {}, 'Could not load services'));
  },

  getOccasions(): Promise<Occasion[]> {
    return unwrap(request('/occasions', {}, 'Could not load occasions'));
  },

  getRequirements(params?: { category?: string; status?: string; requesterId?: string; includeDrafts?: string }): Promise<Requirement[]> {
    return unwrap(request(`/requirements${toQuery(params)}`, {}, 'Could not load your requests'));
  },

  createRequirement(data: Partial<Requirement>): Promise<Requirement> {
    return unwrap(request('/requirements', jsonBody('POST', data), 'Failed to post requirement'));
  },

  updateRequirement(id: string, data: Partial<Requirement>): Promise<Requirement> {
    return unwrap(request(`/requirements/${id}`, jsonBody('PUT', data), 'Failed to update requirement'));
  },

  publishDraftRequirement(id: string): Promise<Requirement> {
    return unwrap(request(`/requirements/${id}/publish`, jsonBody('PATCH', {}), 'Failed to publish draft'));
  },

  deleteRequirement(id: string): Promise<void> {
    return unwrap(request(`/requirements/${id}`, { method: 'DELETE' }, 'Failed to delete requirement'));
  },

  placeBid(data: {
    requirementId: string;
    providerId: string;
    amount: number;
    proposalNotes: string;
    equipmentDetails?: string;
  }): Promise<{ message: string; data: Bid }> {
    return request('/bids', jsonBody('POST', data), 'Failed to place bid');
  },

  acceptBid(requirementId: string, bidId: string, requesterId: string): Promise<Booking> {
    return unwrap(request('/bookings/accept-bid', jsonBody('POST', { requirementId, bidId, requesterId }), 'Failed to accept bid'));
  },

  createRazorpayOrder(data: {
    amount?: number;
    currency?: string;
    receipt?: string;
    bookingId?: string;
    notes?: Record<string, any>;
  }): Promise<{
    success: boolean;
    order_id: string;
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    key_id?: string;
  }> {
    return request('/create-order', jsonBody('POST', data), 'Failed to create Razorpay order');
  },

  verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingId?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    return request('/verify-payment', jsonBody('POST', data), 'Payment signature verification failed');
  },

  payBooking(bookingId: string, paymentMethod: string): Promise<Booking> {
    return unwrap(request('/bookings/pay', jsonBody('POST', { bookingId, paymentMethod }), 'Payment processing failed'));
  },

  cancelBooking(bookingId: string, reason?: string): Promise<{ message: string; data: Booking }> {
    return request('/bookings/cancel', jsonBody('POST', { bookingId, reason }), 'Failed to cancel booking');
  },

  raiseDispute(bookingId: string, reason: string): Promise<{ message: string; data: Booking }> {
    return request(`/bookings/${bookingId}/dispute`, jsonBody('POST', { reason }), 'Failed to raise dispute');
  },

  completeBooking(bookingId: string): Promise<{ message: string; data: Booking }> {
    return request('/bookings/complete', jsonBody('POST', { bookingId }), 'Failed to complete booking');
  },

  submitReview(data: {
    bookingId: string;
    fromUserId: string;
    toUserId: string;
    rating: number;
    comment: string;
    role: 'requester_to_provider' | 'provider_to_requester';
  }): Promise<unknown> {
    return unwrap(request('/bookings/review', jsonBody('POST', data), 'Could not save your rating'));
  },

  getBookings(params?: { userId?: string; role?: string; status?: string }): Promise<Booking[]> {
    return unwrap(request(`/bookings${toQuery(params)}`, {}, 'Could not load your bookings'));
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

  async uploadImage(file: File, folder = 'ezzygo/uploads'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const data = await request<{ url: string }>('/upload', { method: 'POST', body: formData }, 'Image upload failed');
    return data.url;
  },
};
