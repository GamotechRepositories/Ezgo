import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../src/middlewares/auth.js';
import { setTransporter, resetTransporter } from '../src/services/emailService.js';
import { sendAdminOtp, verifyAdminOtp, logoutAdmin, getAdminMe } from '../src/controllers/adminAuthController.js';
import Otp from '../src/models/Otp.js';
import User from '../src/models/User.js';

// In-memory test store mocking Mongoose models for fast, isolated, deterministic unit testing
class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort() {
    return this;
  }
  select() {
    return this;
  }
  then(resolve, reject) {
    return Promise.resolve(this.data).then(resolve, reject);
  }
}

describe('EzzyGo Admin Panel — Secure Email OTP Authentication', () => {
  let sentEmails = [];
  let inMemoryOtps = [];
  let inMemoryUsers = [];

  const adminUser = {
    _id: '507f191e810c19729de860ea',
    name: 'Super Admin',
    email: 'admin@ezzygo.com',
    role: 'admin',
    roles: ['admin'],
    phone: '+919999999999',
    passwordHash: 'secret_hash_value',
    toObject() {
      return { ...this };
    },
  };

  const vendorUser = {
    _id: '507f191e810c19729de860eb',
    name: 'Test Vendor',
    email: 'vendor@ezzygo.com',
    role: 'provider',
    roles: ['provider'],
    phone: '+918888888888',
    passwordHash: 'vendor_secret',
    toObject() {
      return { ...this };
    },
  };

  const requesterUser = {
    _id: '507f191e810c19729de860ec',
    name: 'Test Host',
    email: 'host@ezzygo.com',
    role: 'requester',
    roles: ['requester'],
    phone: '+917777777777',
    passwordHash: 'host_secret',
    toObject() {
      return { ...this };
    },
  };

  // Mock response builder
  const mockRes = () => {
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
    };
    return res;
  };

  beforeEach(() => {
    sentEmails = [];
    inMemoryOtps = [];
    inMemoryUsers = [adminUser, vendorUser, requesterUser];

    // Mock Email Transporter
    setTransporter({
      sendMail: async (options) => {
        sentEmails.push(options);
        return { messageId: 'mock-msg-' + Math.random() };
      },
    });

    // Mock Otp Model methods
    Otp.findOne = (query) => {
      let matches = inMemoryOtps.filter((item) => {
        if (query.email && item.email !== query.email) return false;
        if (query.purpose && item.purpose !== query.purpose) return false;
        if (query.isVerified !== undefined && item.isVerified !== query.isVerified) return false;
        return true;
      });
      const found = matches[matches.length - 1] || null;
      return new MockQuery(found);
    };

    Otp.countDocuments = async (query) => {
      let count = 0;
      for (const item of inMemoryOtps) {
        if (query.email && item.email !== query.email) continue;
        if (query.purpose && item.purpose !== query.purpose) continue;
        if (query.createdAt && query.createdAt.$gte && item.createdAt < query.createdAt.$gte) continue;
        count++;
      }
      return count;
    };

    Otp.deleteMany = async (query) => {
      inMemoryOtps = inMemoryOtps.filter((item) => {
        if (query.email && item.email === query.email) {
          if (!query.purpose || item.purpose === query.purpose) return false;
        }
        return true;
      });
      return { deletedCount: 1 };
    };

    Otp.deleteOne = async (query) => {
      const idx = inMemoryOtps.findIndex((item) => item._id === query._id);
      if (idx !== -1) inMemoryOtps.splice(idx, 1);
      return { deletedCount: 1 };
    };

    Otp.create = async (doc) => {
      const created = {
        _id: 'otp_' + Math.random().toString(36).substring(2, 9),
        attempts: 0,
        maxAttempts: 5,
        isVerified: false,
        createdAt: new Date(),
        ...doc,
        save: async function () {
          return this;
        },
      };
      inMemoryOtps.push(created);
      return created;
    };

    // Mock User Model methods
    User.findOne = (query) => {
      let user = inMemoryUsers.find((u) => {
        if (query.email && u.email !== query.email) return false;
        if (query.$or) {
          const matchesOr = query.$or.some((cond) => {
            if (cond.role && u.role === cond.role) return true;
            if (cond.roles && u.roles?.includes(cond.roles)) return true;
            return false;
          });
          if (!matchesOr) return false;
        }
        return true;
      });
      return new MockQuery(user || null);
    };

    User.findById = async (id) => {
      return inMemoryUsers.find((u) => u._id === id) || null;
    };
  });

  afterEach(() => {
    resetTransporter();
  });

  describe('Step 1 & 2: OTP Request & Security Protections', () => {
    it('1. should allow an authorized admin to request an OTP and send email via mock transporter', async () => {
      const req = { body: { email: 'admin@ezzygo.com' } };
      const res = mockRes();

      await sendAdminOtp(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(sentEmails.length, 1, 'Email must be sent to admin');
      assert.strictEqual(sentEmails[0].to, 'admin@ezzygo.com');
      assert.strictEqual(sentEmails[0].subject, 'Your EzzyGo Admin Login OTP');

      // Verify OTP challenge was stored in database
      assert.strictEqual(inMemoryOtps.length, 1);
      const challenge = inMemoryOtps[0];
      assert.strictEqual(challenge.email, 'admin@ezzygo.com');
      assert.strictEqual(challenge.userId, adminUser._id);
      assert.strictEqual(challenge.purpose, 'admin_login');
      assert.ok(challenge.otpHash, 'Must store cryptographic hash of OTP');
      assert.strictEqual(challenge.otpCode, undefined, 'Must NEVER store plaintext OTP code');
    });

    it('2. should store only a SHA-256 hash of the OTP and NOT plaintext OTP', async () => {
      const req = { body: { email: 'admin@ezzygo.com' } };
      const res = mockRes();

      await sendAdminOtp(req, res, () => {});

      const challenge = inMemoryOtps[0];
      assert.strictEqual(typeof challenge.otpHash, 'string');
      assert.strictEqual(challenge.otpHash.length, 64, 'SHA-256 hash must be 64 hex characters');
      assert.strictEqual(challenge.otpCode, undefined, 'Plaintext otpCode must be undefined');
    });

    it('3. should NOT reveal whether a non-admin or unregistered email exists (Account Enumeration Prevention)', async () => {
      // Test with unregistered email
      const reqUnknown = { body: { email: 'unknown@stranger.com' } };
      const resUnknown = mockRes();
      await sendAdminOtp(reqUnknown, resUnknown, () => {});

      assert.strictEqual(resUnknown.statusCode, 200);
      assert.strictEqual(resUnknown.body.success, true);
      assert.strictEqual(
        resUnknown.body.message,
        'If an authorized admin account is registered with this email, a 6-digit verification code has been sent.'
      );
      assert.strictEqual(sentEmails.length, 0, 'No email must be sent for unregistered address');

      // Test with vendor email
      const reqVendor = { body: { email: 'vendor@ezzygo.com' } };
      const resVendor = mockRes();
      await sendAdminOtp(reqVendor, resVendor, () => {});

      assert.strictEqual(resVendor.statusCode, 200);
      assert.strictEqual(resVendor.body.success, true);
      assert.strictEqual(sentEmails.length, 0, 'Vendors cannot request admin OTPs');

      // Test with requester email
      const reqHost = { body: { email: 'host@ezzygo.com' } };
      const resHost = mockRes();
      await sendAdminOtp(reqHost, resHost, () => {});

      assert.strictEqual(resHost.statusCode, 200);
      assert.strictEqual(resHost.body.success, true);
      assert.strictEqual(sentEmails.length, 0, 'Normal users cannot request admin OTPs');
    });

    it('4. should enforce 60-second cooldown rate limit on resending OTP', async () => {
      // First request
      await sendAdminOtp({ body: { email: 'admin@ezzygo.com' } }, mockRes(), () => {});
      assert.strictEqual(inMemoryOtps.length, 1);

      // Immediate second request within 60s
      const resCooldown = mockRes();
      await sendAdminOtp({ body: { email: 'admin@ezzygo.com' } }, resCooldown, () => {});

      assert.strictEqual(resCooldown.statusCode, 429);
      assert.strictEqual(resCooldown.body.success, false);
      assert.match(resCooldown.body.message, /Please wait \d+ seconds/);
    });

    it('5. should invalidate previous OTP challenge when a new one is issued', async () => {
      // Seed an existing OTP challenge from 2 minutes ago
      inMemoryOtps.push({
        _id: 'old_otp_1',
        email: 'admin@ezzygo.com',
        userId: adminUser._id,
        otpHash: crypto.createHash('sha256').update('111111').digest('hex'),
        expiresAt: new Date(Date.now() + 3 * 60 * 1000),
        createdAt: new Date(Date.now() - 120 * 1000), // 2 mins ago
        purpose: 'admin_login',
        attempts: 0,
        maxAttempts: 5,
        isVerified: false,
      });

      const res = mockRes();
      await sendAdminOtp({ body: { email: 'admin@ezzygo.com' } }, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      // Ensure the old OTP was deleted
      const foundOld = inMemoryOtps.find((o) => o._id === 'old_otp_1');
      assert.strictEqual(foundOld, undefined, 'Old challenge must be deleted on new OTP request');
    });

    it('6. should reject invalid email format gracefully', async () => {
      const res = mockRes();
      await sendAdminOtp({ body: { email: 'not-an-email' } }, res, () => {});

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Please enter a valid administrator email address.');
    });
  });

  describe('Step 3 & 4: OTP Verification & Admin Session Establishment', () => {
    it('7. should successfully authenticate admin with valid OTP and return JWT session token', async () => {
      const correctOtp = '654321';
      const otpHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

      inMemoryOtps.push({
        _id: 'valid_challenge_1',
        email: 'admin@ezzygo.com',
        userId: adminUser._id,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        maxAttempts: 5,
        isVerified: false,
        purpose: 'admin_login',
      });

      const res = mockRes();
      await verifyAdminOtp(
        { body: { email: 'admin@ezzygo.com', otp: correctOtp } },
        res,
        () => {}
      );

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.token, 'Must return JWT token');
      assert.strictEqual(res.body.data.user.role, 'admin');
      assert.strictEqual(res.body.data.user.passwordHash, undefined, 'Must redact passwordHash');

      // Verify JWT payload claims
      const decoded = jwt.verify(res.body.data.token, JWT_SECRET);
      assert.strictEqual(decoded.id, adminUser._id);
      assert.strictEqual(decoded.role, 'admin');

      // Verify challenge was deleted immediately to prevent reuse
      const remainingChallenge = inMemoryOtps.find((o) => o._id === 'valid_challenge_1');
      assert.strictEqual(remainingChallenge, undefined, 'OTP must be immediately invalidated after verification');
    });

    it('8. should reject incorrect OTP and decrement remaining attempts', async () => {
      const correctOtp = '654321';
      const otpHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

      const challenge = {
        _id: 'challenge_attempts',
        email: 'admin@ezzygo.com',
        userId: adminUser._id,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        maxAttempts: 5,
        isVerified: false,
        purpose: 'admin_login',
        save: async function () {
          return this;
        },
      };
      inMemoryOtps.push(challenge);

      const res = mockRes();
      await verifyAdminOtp(
        { body: { email: 'admin@ezzygo.com', otp: '999999' } },
        res,
        () => {}
      );

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Invalid verification code\. 4 attempts remaining\./);
      assert.strictEqual(challenge.attempts, 1);
    });

    it('9. should block verification and delete OTP when max attempts (5) are reached', async () => {
      const correctOtp = '654321';
      const otpHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

      const challenge = {
        _id: 'challenge_maxed',
        email: 'admin@ezzygo.com',
        userId: adminUser._id,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 4, // 4 failed attempts already
        maxAttempts: 5,
        isVerified: false,
        purpose: 'admin_login',
        save: async function () {
          return this;
        },
      };
      inMemoryOtps.push(challenge);

      const res = mockRes();
      await verifyAdminOtp(
        { body: { email: 'admin@ezzygo.com', otp: '000000' } },
        res,
        () => {}
      );

      assert.strictEqual(res.statusCode, 400);
      assert.match(res.body.message, /Maximum attempts exceeded/);

      // Challenge must be removed from DB
      const exists = inMemoryOtps.find((o) => o._id === 'challenge_maxed');
      assert.strictEqual(exists, undefined, 'Maxed out challenge must be deleted');
    });

    it('10. should reject expired OTP (>5 minutes)', async () => {
      const correctOtp = '654321';
      const otpHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

      inMemoryOtps.push({
        _id: 'challenge_expired',
        email: 'admin@ezzygo.com',
        userId: adminUser._id,
        otpHash,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        attempts: 0,
        maxAttempts: 5,
        isVerified: false,
        purpose: 'admin_login',
      });

      const res = mockRes();
      await verifyAdminOtp(
        { body: { email: 'admin@ezzygo.com', otp: correctOtp } },
        res,
        () => {}
      );

      assert.strictEqual(res.statusCode, 400);
      assert.match(res.body.message, /expired/i);
    });

    it('11. should reject reused OTP immediately', async () => {
      const correctOtp = '654321';
      const otpHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

      inMemoryOtps.push({
        _id: 'challenge_reuse',
        email: 'admin@ezzygo.com',
        userId: adminUser._id,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        maxAttempts: 5,
        isVerified: false,
        purpose: 'admin_login',
      });

      // 1st verification succeeds
      const res1 = mockRes();
      await verifyAdminOtp({ body: { email: 'admin@ezzygo.com', otp: correctOtp } }, res1, () => {});
      assert.strictEqual(res1.statusCode, 200);

      // 2nd verification must fail because OTP was invalidated
      const res2 = mockRes();
      await verifyAdminOtp({ body: { email: 'admin@ezzygo.com', otp: correctOtp } }, res2, () => {});
      assert.strictEqual(res2.statusCode, 400);
      assert.match(res2.body.message, /Invalid or expired verification session/);
    });

    it('12. should reject non-admin accounts even if an OTP challenge is somehow manipulated', async () => {
      const correctOtp = '654321';
      const otpHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

      // Manipulated challenge associated with vendor user ID
      inMemoryOtps.push({
        _id: 'challenge_fake',
        email: 'vendor@ezzygo.com',
        userId: vendorUser._id,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        maxAttempts: 5,
        isVerified: false,
        purpose: 'admin_login',
      });

      const res = mockRes();
      await verifyAdminOtp(
        { body: { email: 'vendor@ezzygo.com', otp: correctOtp } },
        res,
        () => {}
      );

      assert.strictEqual(res.statusCode, 403);
      assert.match(res.body.message, /Access denied/);
    });

    it('13. should handle logout and me endpoints cleanly', async () => {
      const resLogout = mockRes();
      await logoutAdmin({}, resLogout);
      assert.strictEqual(resLogout.statusCode, 200);
      assert.strictEqual(resLogout.body.success, true);

      const resMe = mockRes();
      await getAdminMe({ user: adminUser }, resMe);
      assert.strictEqual(resMe.statusCode, 200);
      assert.strictEqual(resMe.body.data.role, 'admin');
      assert.strictEqual(resMe.body.data.passwordHash, undefined);
    });

    it('14. should handle SMTP transport failure safely without crashing', async () => {
      // Mock failure transporter
      setTransporter({
        sendMail: async () => {
          throw new Error('Connection refused by SMTP server');
        },
      });

      const res = mockRes();
      await sendAdminOtp({ body: { email: 'admin@ezzygo.com' } }, res, () => {});

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Unable to deliver verification email/);
      assert.strictEqual(inMemoryOtps.length, 0, 'Undelivered challenge must be cleaned up');
    });
  });
});
