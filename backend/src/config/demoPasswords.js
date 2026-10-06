import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Shared by the login screen's "demo account" buttons. Only accounts that still
// use these passwords are listed, and never when NODE_ENV is production.
export const DEMO_PASSWORDS = {
  requester: 'host123',
  provider: 'vendor123',
  admin: 'admin123',
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
