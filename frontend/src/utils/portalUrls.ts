/**
 * Resolves the appropriate Vendor Portal URL.
 * In local development (localhost / 127.0.0.1), points to port 5174.
 * In production/staging, routes to https://vendor.ezzygo.in.
 */
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
