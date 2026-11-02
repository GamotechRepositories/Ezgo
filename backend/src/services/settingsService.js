import SystemSetting from '../models/SystemSetting.js';

let cachedSettings = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

export const getSystemSettings = async (forceFresh = false) => {
  const now = Date.now();
  if (!forceFresh && cachedSettings && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedSettings;
  }

  let settings = await SystemSetting.findOne({ key: 'marketplace_config' });
  if (!settings) {
    settings = await SystemSetting.create({
      key: 'marketplace_config',
      platformFeePercent: 10,
      minBiddingDiscountPercent: 15,
      updatedByName: 'System Default',
    });
  }

  cachedSettings = settings;
  lastFetchedAt = now;
  return settings;
};

export const invalidateSettingsCache = () => {
  cachedSettings = null;
  lastFetchedAt = 0;
};

