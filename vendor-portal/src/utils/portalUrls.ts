/**
 * Resolves the appropriate User / Host Portal URL.
 * In local development (localhost / 127.0.0.1), points to port 5173.
 * In production/staging, routes to https://www.ezzygo.in.
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

export const getAdminPortalUrl = (): string => {
  if (import.meta.env.VITE_ADMIN_PORTAL_URL) {
    return import.meta.env.VITE_ADMIN_PORTAL_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5175';
    }
  }
  return 'https://admin.ezzygo.in';
};
