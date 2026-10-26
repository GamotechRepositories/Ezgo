import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Shared by the login screen's "demo account" buttons. Only accounts that still
// use these passwords are listed, and never when NODE_ENV is production.
export const DEMO_PASSWORDS = {
  requester: 'host123',
  provider: 'vendor123',
  admin: 'admin123',
};

export const PORTAL_LOGINS = {
  host: {
    email: 'host@ezzygo.in',
    password: 'Host@1234',
    name: 'EzzyGo Host',
    phone: '9999990001',
    role: 'requester',
  },
  vendor: {
    email: 'vendor@ezzygo.in',
    password: 'Vendor@1234',
    name: 'EzzyGo Vendor',
    phone: '9999990002',
    role: 'provider',
    businessName: 'EzzyGo Events Studio',
  },
};

const upsertPortalUser = async (login) => {
  const passwordHash = await bcrypt.hash(login.password, 10);
  let user = await User.findOne({ email: login.email }).select('+passwordHash');

  const fields = {
    name: login.name,
    email: login.email,
    role: login.role,
    roles: [login.role],
    passwordHash,
    authProvider: 'local',
    usesDemoPassword: false,
  };

  if (login.businessName) fields.businessName = login.businessName;
  if (login.role === 'provider') {
    fields.serviceArea = 'Pune';
    fields.isVerified = true;
    fields.categories = ['DJ & Sound Systems', 'Lighting & Trussing'];
    fields.rating = 4.8;
    fields.reviewCount = 16;
    fields.completedJobs = 28;
  }

  if (!user) {
    const phoneTaken = await User.findOne({ phone: login.phone });
    if (!phoneTaken) fields.phone = login.phone;
    user = await User.create(fields);
  } else {
    Object.assign(user, fields);
    if (!user.phone) {
      const phoneTaken = await User.findOne({ phone: login.phone });
      if (!phoneTaken) user.phone = login.phone;
    }
    await user.save();
  }
};

export const ensurePortalLogins = async () => {
  await upsertPortalUser(PORTAL_LOGINS.host);
  await upsertPortalUser(PORTAL_LOGINS.vendor);
  console.log('Seeded portal logins:');
  console.log(`  Host   ${PORTAL_LOGINS.host.email} / ${PORTAL_LOGINS.host.password}`);
  console.log(`  Vendor ${PORTAL_LOGINS.vendor.email} / ${PORTAL_LOGINS.vendor.password}`);
};

export const ensureDemoPasswords = async () => {
  const users = await User.find({ $or: [{ passwordHash: null }, { passwordHash: '' }] }).select('+passwordHash');
  for (const user of users) {
    const plain = DEMO_PASSWORDS[user.role];
    if (!plain) continue;
    user.passwordHash = await bcrypt.hash(plain, 10);
    user.usesDemoPassword = true;
    await user.save();
  }
  if (users.length) {
    console.log(`Set a demo password on ${users.length} existing account(s).`);
  }
};
