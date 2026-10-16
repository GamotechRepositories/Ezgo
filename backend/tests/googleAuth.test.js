import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  verifyGoogleIdToken,
  handleGoogleAuth,
  withoutPassword,
  wrongPortalMessage,
} from '../src/services/googleAuthService.js';

// In-memory mock UserModel for database-independent unit & security testing
const createMockUserModel = (initialUsers = []) => {
  const users = [...initialUsers];

  return {
    async findOne(query) {
      if (query.googleId) {
        return users.find((u) => u.googleId === query.googleId) || null;
      }
      if (query.email) {
        return users.find((u) => u.email === query.email) || null;
      }
      return null;
    },
    async create(doc) {
      const newUser = {
        _id: 'mock_id_' + (users.length + 1),
        ...doc,
        save: async () => newUser,
        toObject: () => ({ ...newUser }),
      };
      users.push(newUser);
      return newUser;
    },
    async findById(id) {
      return users.find((u) => u._id === id) || null;
    },
    _all() {
      return users;
    },
  };
};

describe('EzzyGo Google Authentication & Security Rules', () => {

  describe('Token Verification & Claim Validation', () => {
    it('should reject requests missing an idToken', async () => {
      await assert.rejects(
        async () => {
          await verifyGoogleIdToken('');
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /Google ID token is required/i);
          return true;
        }
      );
    });

    it('should extract trusted claims (sub, email, name, picture) from valid token', async () => {
      const mockToken = 'mock-google-token-1:sub_google_12345:host.test@ezzygo.in:Host Test User:verified';
      const claims = await verifyGoogleIdToken(mockToken);
      assert.strictEqual(claims.sub, 'sub_google_12345');
      assert.strictEqual(claims.email, 'host.test@ezzygo.in');
      assert.strictEqual(claims.emailVerified, true);
      assert.strictEqual(claims.name, 'Host Test User');
      assert.ok(claims.picture.length > 0);
    });

    it('should detect unverified Google email claims', async () => {
      const mockToken = 'mock-google-token-2:sub_google_99999:unverified@ezzygo.in:Unverified User:unverified';
      const mockModel = createMockUserModel();
      await assert.rejects(
        async () => {
          await handleGoogleAuth({ idToken: mockToken, role: 'requester' }, mockModel);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /not verified by Google/i);
          return true;
        }
      );
    });
  });

  describe('Portal Role Separation & Admin Protection', () => {
    it('should forbid admin account self-registration via Google Sign-In', async () => {
      const mockToken = 'mock-google-token-3:sub_admin_hack:attacker@gmail.com:Bad Actor:verified';
      const mockModel = createMockUserModel();
      await assert.rejects(
        async () => {
          await handleGoogleAuth({ idToken: mockToken, role: 'admin' }, mockModel);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          assert.match(err.message, /Administrator accounts cannot be created via Google Sign-In/i);
          return true;
        }
      );
    });

    it('should allow a host account to log into the vendor portal and enable provider capabilities', async () => {
      const mockToken = 'mock-google-token-host:sub_h101:host@ezzygo.in:Host User:verified';
      const mockModel = createMockUserModel([
        {
          _id: 'host_101',
          name: 'Host User',
          googleId: 'sub_h101',
          email: 'host@ezzygo.in',
          role: 'requester',
          roles: ['requester'],
          save: async function () { return this; },
          toObject: function () { return { ...this }; },
        },
      ]);

      const res = await handleGoogleAuth({ idToken: mockToken, role: 'provider' }, mockModel);
      assert.strictEqual(res.isNewUser, false);
      assert.ok(res.token);
      assert.strictEqual(res.user.role, 'provider');
      assert.ok(res.user.roles.includes('requester'));
      assert.ok(res.user.roles.includes('provider'));
      assert.ok(res.user.businessName);
    });

    it('should allow a vendor account to log into the host app and enable requester capabilities', async () => {
      const mockToken = 'mock-google-token-vendor:sub_v101:vendor@ezzygo.in:Vendor User:verified';
      const mockModel = createMockUserModel([
        {
          _id: 'vendor_101',
          name: 'Vendor User',
          googleId: 'sub_v101',
          email: 'vendor@ezzygo.in',
          role: 'provider',
          businessName: 'Vendor Services Ltd',
          roles: ['provider'],
          save: async function () { return this; },
          toObject: function () { return { ...this }; },
        },
      ]);

      const res = await handleGoogleAuth({ idToken: mockToken, role: 'requester' }, mockModel);
      assert.strictEqual(res.isNewUser, false);
      assert.ok(res.token);
      assert.strictEqual(res.user.role, 'requester');
      assert.ok(res.user.roles.includes('provider'));
      assert.ok(res.user.roles.includes('requester'));
    });

    it('should block non-admin accounts from logging into admin portal', async () => {
      const mockToken = 'mock-google-token-host2:sub_h102:host2@ezzygo.in:Host User 2:verified';
      const mockModel = createMockUserModel([
        {
          _id: 'host_102',
          googleId: 'sub_h102',
          email: 'host2@ezzygo.in',
          role: 'requester',
          save: async function () { return this; },
          toObject: function () { return { ...this }; },
        },
      ]);

      await assert.rejects(
        async () => {
          await handleGoogleAuth({ idToken: mockToken, role: 'admin' }, mockModel);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          assert.match(err.message, /administrator privileges/i);
          return true;
        }
      );
    });

    it('should block admin accounts from logging into host or vendor desks', async () => {
      const mockToken = 'mock-google-token-admin:sub_adm1:admin@ezzygo.in:Admin User:verified';
      const mockModel = createMockUserModel([
        {
          _id: 'admin_1',
          googleId: 'sub_adm1',
          email: 'admin@ezzygo.in',
          role: 'admin',
          roles: ['admin'],
          save: async function () { return this; },
          toObject: function () { return { ...this }; },
        },
      ]);

      await assert.rejects(
        async () => {
          await handleGoogleAuth({ idToken: mockToken, role: 'provider' }, mockModel);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          assert.match(err.message, /admin account.*Open the admin app/i);
          return true;
        }
      );
    });

    it('should provide correct separation messages for wrong portals', () => {
      assert.match(wrongPortalMessage('provider'), /vendor account/i);
      assert.match(wrongPortalMessage('admin'), /admin account/i);
      assert.match(wrongPortalMessage('requester'), /host account/i);
    });
  });

  describe('Safe Account Linking Policy', () => {
    it('should not silently auto-link when an existing account has the same email', async () => {
      const mockToken = 'mock-google-token-conflict:sub_new_google:existing@ezzygo.in:Existing User:verified';
      const mockModel = createMockUserModel([
        {
          _id: 'existing_user_1',
          email: 'existing@ezzygo.in',
          phone: '9876543210',
          passwordHash: 'hashed_password_abc',
          role: 'requester',
        },
      ]);

      await assert.rejects(
        async () => {
          await handleGoogleAuth({ idToken: mockToken, role: 'requester' }, mockModel);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 409);
          assert.strictEqual(err.code, 'ACCOUNT_EXISTS_PASSWORD');
          assert.match(err.message, /already exists.*Please log in/i);
          return true;
        }
      );
    });
  });

  describe('Vendor Onboarding & KYC Rules', () => {
    it('should not bypass vendor KYC for first-time Google sign-ins, returning profile for completion', async () => {
      const mockToken = 'mock-google-token-4:sub_vendor_new:newvendor@ezzygo.in:Kiran DJ:verified';
      const mockModel = createMockUserModel();
      const result = await handleGoogleAuth({ idToken: mockToken, role: 'provider' }, mockModel);

      assert.strictEqual(result.isNewUser, true);
      assert.ok(result.googleProfile);
      assert.strictEqual(result.googleProfile.googleId, 'sub_vendor_new');
      assert.strictEqual(result.googleProfile.email, 'newvendor@ezzygo.in');
      assert.strictEqual(result.googleProfile.name, 'Kiran DJ');
      // Must not generate an active session token before KYC/business details are provided
      assert.strictEqual(result.token, undefined);
    });
  });

  describe('Host Account Creation & Login', () => {
    it('should create a new host account for first-time Google sign-ins', async () => {
      const mockToken = 'mock-google-token-newhost:sub_h101:newhost@ezzygo.in:New Host:verified';
      const mockModel = createMockUserModel();
      const result = await handleGoogleAuth({ idToken: mockToken, role: 'requester' }, mockModel);

      assert.strictEqual(result.isNewUser, true);
      assert.ok(result.token, 'Must return JWT token');
      assert.strictEqual(result.user.email, 'newhost@ezzygo.in');
      assert.strictEqual(result.user.name, 'New Host');
      assert.strictEqual(result.user.role, 'requester');
    });

    it('should log in existing Google user directly', async () => {
      const mockToken = 'mock-google-token-existhost:sub_h999:existhost@ezzygo.in:Existing Host:verified';
      const mockModel = createMockUserModel([
        {
          _id: 'user_h999',
          name: 'Existing Host',
          email: 'existhost@ezzygo.in',
          googleId: 'sub_h999',
          role: 'requester',
          save: async () => {},
        },
      ]);

      const result = await handleGoogleAuth({ idToken: mockToken, role: 'requester' }, mockModel);
      assert.strictEqual(result.isNewUser, false);
      assert.ok(result.token);
      assert.strictEqual(result.user._id, 'user_h999');
    });
  });

  describe('User Sanitization & Password Redaction', () => {
    it('should completely strip passwordHash from returned user object', () => {
      const rawUser = {
        _id: '660e1234567890abcdef1234',
        name: 'Safe User',
        email: 'safe@ezzygo.in',
        passwordHash: '$2a$10$e8w6Wc8F3vE2m/9K9hY7r.uO9',
        role: 'requester',
      };
      const sanitized = withoutPassword(rawUser);
      assert.strictEqual(sanitized.passwordHash, undefined, 'passwordHash must never be present');
      assert.strictEqual(sanitized.email, 'safe@ezzygo.in');
      assert.strictEqual(sanitized.name, 'Safe User');
    });
  });
});
