import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middlewares/auth.js';
import { DEMO_PASSWORDS } from '../config/demoPasswords.js';

export const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

const findByPhone = async (phone) => {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  const users = await User.find().select('+passwordHash');
  return users.find((user) => normalizePhone(user.phone) === digits) || null;
};

const withoutPassword = (user) => {
  const plain = user.toObject();
  delete plain.passwordHash;
  return plain;
};

const wrongPortalMessage = (role) => {
  if (role === 'provider') return 'This is a vendor account. Open the vendor app to log in.';
  if (role === 'admin') return 'This is an admin account. Open the admin app to log in.';
  return 'This is a host account. Open the host app to log in.';
};

export const register = async (req, res, next) => {
  try {
    const { name, phone, password, role, businessName, serviceArea } = req.body;
    const digits = normalizePhone(phone);

    if (!name || !String(name).trim()) {
      res.status(400);
      throw new Error('Enter your name.');
    }
    if (digits.length !== 10) {
      res.status(400);
      throw new Error('Enter a 10-digit mobile number.');
    }
    if (!password || String(password).length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters.');
    }
    if (role !== 'requester' && role !== 'provider') {
      res.status(400);
      throw new Error('Choose a host or vendor account.');
    }
    if (role === 'provider' && !String(businessName || '').trim()) {
      res.status(400);
      throw new Error('Enter your business name.');
    }

    const existing = await findByPhone(digits);
    if (existing) {
      res.status(409);
      throw new Error('An account with this mobile number already exists. Log in instead.');
    }

    const user = await User.create({
      name: String(name).trim(),
      phone: digits,
      role,
      passwordHash: await bcrypt.hash(String(password), 10),
      usesDemoPassword: false,
      businessName: role === 'provider' ? String(businessName).trim() : '',
      serviceArea: serviceArea || 'Pune',
      isVerified: false,
    });

    res.status(201).json({
      success: true,
      data: { token: signToken(user), user: withoutPassword(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { phone, password, role } = req.body;
    const user = await findByPhone(phone);
    const matches = user?.passwordHash && (await bcrypt.compare(String(password || ''), user.passwordHash));

    if (!matches) {
      res.status(401);
      throw new Error('Wrong phone number or password.');
    }
    if (role && user.role !== role) {
      res.status(403);
      throw new Error(wrongPortalMessage(user.role));
    }

    res.json({
      success: true,
      data: { token: signToken(user), user: withoutPassword(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// Demo buttons on the login screen. Hidden in production.
export const demoAccounts = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.json({ success: true, data: [] });
    }
    const users = await User.find({ usesDemoPassword: true }).select('name phone role businessName');
    const shown = { requester: 0, provider: 0, admin: 0 };
    const data = users
      .filter((user) => {
        if (!DEMO_PASSWORDS[user.role] || shown[user.role] >= 3) return false;
        shown[user.role] += 1;
        return true;
      })
      .map((user) => ({
        role: user.role,
        name: user.name,
        businessName: user.businessName || '',
        phone: user.phone,
        password: DEMO_PASSWORDS[user.role],
      }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDemoUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId, bankDetails, categories, serviceArea, businessName } = req.body;
    if (req.user.role !== 'admin' && req.user._id.toString() !== String(userId)) {
      res.status(403);
      throw new Error('You can only update your own profile.');
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { bankDetails, categories, serviceArea, businessName },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
