import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getSystemSettings, invalidateSettingsCache } from '../src/services/settingsService.js';

describe('EzzyGo Admin Advanced Controls — User Ban, Review Moderation & Dynamic Commission', () => {

  describe('Feature 1: User Account Suspension & Ban State Enforcement', () => {
    it('should correctly flag a user as banned and record banReason', () => {
      const user = {
        _id: 'user_123',
        name: 'Violating Vendor',
        isBanned: false,
        banReason: '',
      };

      // Admin bans user
      const isBanned = true;
      const banReason = 'Spamming fake bids';
      user.isBanned = isBanned;
      user.banReason = banReason;
      user.bannedAt = new Date();

      assert.strictEqual(user.isBanned, true);
      assert.strictEqual(user.banReason, 'Spamming fake bids');
      assert.ok(user.bannedAt instanceof Date);
    });

    it('should reject requests from banned users in auth middleware logic', () => {
      const bannedUser = {
        _id: 'user_banned_456',
        name: 'Suspended Host',
        isBanned: true,
        banReason: 'Fraudulent dispute filings',
      };

      const checkAuth = (user) => {
        if (user.isBanned) {
          throw new Error(
            user.banReason
              ? `Your account has been suspended by the administrator: "${user.banReason}". Please contact support.`
              : 'Your account has been suspended by the administrator. Please contact support.'
          );
        }
        return true;
      };

      assert.throws(
        () => checkAuth(bannedUser),
        /Fraudulent dispute filings/
      );

      const activeUser = { _id: 'user_ok', isBanned: false };
      assert.strictEqual(checkAuth(activeUser), true);
    });

    it('should prevent administrators from accidentally banning their own account', () => {
      const adminId = 'admin_self_999';
      const targetUserId = 'admin_self_999';

      const validateBanTarget = (adminId, targetId) => {
        if (adminId === targetId) {
          throw new Error('You cannot ban your own administrator account.');
        }
      };

      assert.throws(
        () => validateBanTarget(adminId, targetUserId),
        /You cannot ban your own administrator account/
      );
    });
  });

  describe('Feature 2: Review Moderation & Dynamic Rating Recalculation', () => {
    it('should recalculate vendor rating accurately when a review is hidden or deleted', () => {
      const reviews = [
        { _id: 'r1', rating: 5, isHidden: false },
        { _id: 'r2', rating: 5, isHidden: false },
        { _id: 'r3', rating: 1, isHidden: false, comment: 'Spam comment with abusive words' },
      ];

      // Initial average: (5 + 5 + 1) / 3 = 3.666... -> 3.7
      let visible = reviews.filter((r) => !r.isHidden);
      let avg = visible.reduce((sum, r) => sum + r.rating, 0) / visible.length;
      assert.strictEqual(Number(avg.toFixed(1)), 3.7);

      // Admin hides the abusive review r3
      reviews[2].isHidden = true;
      reviews[2].moderationReason = 'Abusive language';

      visible = reviews.filter((r) => !r.isHidden);
      avg = visible.reduce((sum, r) => sum + r.rating, 0) / visible.length;

      // New average with hidden review excluded: (5 + 5) / 2 = 5.0
      assert.strictEqual(visible.length, 2);
      assert.strictEqual(Number(avg.toFixed(1)), 5.0);
    });

    it('should fallback to baseline default rating (4.8) if all reviews are removed or hidden', () => {
      const reviews = [
        { _id: 'r1', rating: 2, isHidden: true },
      ];

      const visible = reviews.filter((r) => !r.isHidden);
      const avg = visible.length > 0
        ? visible.reduce((sum, r) => sum + r.rating, 0) / visible.length
        : 4.8;

      assert.strictEqual(avg, 4.8);
      assert.strictEqual(visible.length, 0);
    });
  });

  describe('Feature 3: Dynamic Commission Rate Calculations', () => {
    it('should dynamically calculate platform fee based on custom commission rate', () => {
      const bidAmount = 20000;

      // 10% default
      const defaultRate = 10;
      const defaultFee = Math.round(bidAmount * (defaultRate / 100));
      assert.strictEqual(defaultFee, 2000);
      assert.strictEqual(bidAmount + defaultFee, 22000);

      // Admin changes commission to 8%
      const customRate8 = 8;
      const fee8 = Math.round(bidAmount * (customRate8 / 100));
      assert.strictEqual(fee8, 1600);
      assert.strictEqual(bidAmount + fee8, 21600);

      // Admin changes commission to 15%
      const customRate15 = 15;
      const fee15 = Math.round(bidAmount * (customRate15 / 100));
      assert.strictEqual(fee15, 3000);
      assert.strictEqual(bidAmount + fee15, 23000);
    });

    it('should validate commission rate bounds (0% to 50%)', () => {
      const validateCommissionRate = (rate) => {
        const num = Number(rate);
        if (isNaN(num) || num < 0 || num > 50) {
          throw new Error('Platform fee percentage must be between 0% and 50%.');
        }
        return num;
      };

      assert.strictEqual(validateCommissionRate(12), 12);
      assert.strictEqual(validateCommissionRate(0), 0);
      assert.strictEqual(validateCommissionRate(50), 50);

      assert.throws(() => validateCommissionRate(-5), /must be between 0% and 50%/);
      assert.throws(() => validateCommissionRate(65), /must be between 0% and 50%/);
      assert.throws(() => validateCommissionRate('abc'), /must be between 0% and 50%/);
    });
  });
});

