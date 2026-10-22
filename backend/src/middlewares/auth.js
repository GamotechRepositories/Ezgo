import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'ezzygo-dev-only-secret';

export const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '30d' });

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      res.status(401);
      throw new Error('Please log in.');
    }
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      res.status(401);
      throw new Error('Please log in again.');
    }
    req.user = user;
    next();
  } catch (error) {
    if (res.statusCode === 200) res.status(401);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.message = 'Your login has expired. Please log in again.';
    }
    next(error);
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error('Please log in.'));
  }
  // Admin accounts have superuser privileges across all roles
  const isAdmin = req.user.role === 'admin' || req.user.roles?.includes('admin');
  if (isAdmin) {
    return next();
  }
  if (!roles.includes(req.user.role) && !roles.some((r) => req.user.roles?.includes(r))) {
    res.status(403);
    return next(new Error('You do not have access to this.'));
  }
  next();
};
