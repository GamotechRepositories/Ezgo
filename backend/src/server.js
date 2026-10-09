import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { seedDatabase } from './config/seedData.js';
import { ensureDemoPasswords } from './config/demoPasswords.js';
import { requireAuth } from './middlewares/auth.js';
import { initSocket } from './services/socketService.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import occasionRoutes from './routes/occasionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { createOrder, verifyPayment } from './controllers/paymentController.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB and seed demo records
connectDB().then(async () => {
  await seedDatabase();
  await ensureDemoPasswords();
});

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io real-time engine
initSocket(httpServer);

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// Rate Limiter for Auth & General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 login/register/OTP attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

// Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply general limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EzzyGo Event Services Reverse-Bidding API',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Direct Razorpay Standard endpoints
app.post('/api/create-order', requireAuth, createOrder);
app.post('/api/verify-payment', requireAuth, verifyPayment);

// Mount Marketplace API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/occasions', occasionRoutes);
app.use('/api/items', itemRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 EzzyGo Backend with WebSocket running on http://localhost:${PORT}`);
});
