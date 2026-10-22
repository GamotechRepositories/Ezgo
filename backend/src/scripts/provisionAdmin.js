import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import User from '../models/User.js';

/**
 * Server-side script to securely provision or promote an authorized administrator account.
 * Usage: node src/scripts/provisionAdmin.js <email> [name]
 * Example: node src/scripts/provisionAdmin.js onereach66@gmail.com "Lead Admin"
 */
const run = async () => {
  const emailArg = process.argv[2];
  const nameArg = process.argv[3] || 'EzzyGo Administrator';

  if (!emailArg || !emailArg.includes('@')) {
    console.error('❌ Error: Please provide a valid email address.');
    console.error('Usage: node src/scripts/provisionAdmin.js <email> [name]');
    process.exit(1);
  }

  const normalizedEmail = emailArg.trim().toLowerCase();

  await connectDB();

  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    user.role = 'admin';
    if (!Array.isArray(user.roles)) user.roles = [];
    if (!user.roles.includes('admin')) user.roles.push('admin');
    await user.save();
    console.log(`✅ Successfully promoted existing user (${user._id}) to ADMIN: ${normalizedEmail}`);
  } else {
    user = await User.create({
      name: nameArg,
      email: normalizedEmail,
      role: 'admin',
      roles: ['admin'],
      phone: '+91 90000 00099',
    });
    console.log(`✅ Successfully created new ADMIN account (${user._id}): ${normalizedEmail}`);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Error provisioning admin account:', err);
  process.exit(1);
});
