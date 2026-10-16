/**
 * Portal URLs for Admin Portal.
 * In local dev (localhost / 127.0.0.1), routes to ports 5173 / 5174.
 * In production/staging, routes to https://www.ezzygo.in and https://vendor.ezzygo.in.
 */
export const getUserPortalUrl = (): string => {
  if (import.meta.env.VITE_USER_PORTAL_URL) {
    return import.meta.env.VITE_USER_PORTAL_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5173';
    }
  }
  return 'https://www.ezzygo.in';
};

export const getVendorPortalUrl = (): string => {
  if (import.meta.env.VITE_VENDOR_PORTAL_URL) {
    return import.meta.env.VITE_VENDOR_PORTAL_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5174';
    }
  }
  return 'https://vendor.ezzygo.in';
};
