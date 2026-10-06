import type { Requirement, Bid, Booking, User, EquipmentItem } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'ezgo_token_vendor';

export interface DemoAccount {
  role: 'requester' | 'provider' | 'admin';
  name: string;
  businessName?: string;
  phone: string;
  password: string;
}

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
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
    throw new Error('Cannot reach the EzGo server. Is the backend running?');
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

  async register(input: { name: string; phone: string; password: string; businessName: string; serviceArea?: string }): Promise<User> {
    const data = await request<{ token: string; user: User }>(
      '/auth/register',
      jsonBody('POST', { ...input, role: 'provider' }),
      'Could not create your account'
    );
    setToken(data.token);
    return data.user;
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

  getEquipment(vendorId: string): Promise<EquipmentItem[]> {
    return request<EquipmentItem[]>(`/items?providerId=${encodeURIComponent(vendorId)}`, {}, 'Could not load your equipment');
  },

  addEquipment(vendorId: string, item: Partial<EquipmentItem>): Promise<EquipmentItem> {
    return request<EquipmentItem>('/items', jsonBody('POST', { ...item, providerId: vendorId }), 'Could not save equipment');
  },

  updateEquipment(itemId: string, changes: Partial<EquipmentItem>): Promise<EquipmentItem> {
    return request<EquipmentItem>(`/items/${itemId}`, jsonBody('PUT', changes), 'Could not update equipment');
  },

  deleteEquipment(itemId: string): Promise<void> {
    return request<void>(`/items/${itemId}`, { method: 'DELETE' }, 'Could not remove equipment');
  },

  async uploadImage(file: File, folder = 'ezgo/equipment'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const headers: HeadersInit = {};
    if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/upload`, { method: 'POST', headers, body: formData });
    } catch (_) {
      throw new Error('Cannot reach the EzGo server. Is the backend running?');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Image upload failed');
    return data.url;
  },
};
