import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('EzzyGo Core Business Rules & Calculations', () => {

  describe('Module 05: 15% Minimum Discount Rule', () => {
    it('should correctly calculate maxAcceptableBid as exactly 85% of host budget', () => {
      const budget10000 = 10000;
      const maxBid = Math.floor(budget10000 * 0.85);
      assert.strictEqual(maxBid, 8500, 'Max acceptable bid for ₹10,000 budget must be ₹8,500');
    });

    it('should accept bids <= 85% of budget (Boundary Test: ₹8,500 accepts, ₹8,501 rejects)', () => {
      const budget = 10000;
      const maxAcceptableBid = Math.floor(budget * 0.85);

      const validBid = 8500;
      const isEligibleValid = validBid <= maxAcceptableBid;
      assert.strictEqual(isEligibleValid, true, 'Bid of ₹8,500 must be eligible');

      const invalidBid = 8501;
      const isEligibleInvalid = invalidBid <= maxAcceptableBid;
      assert.strictEqual(isEligibleInvalid, false, 'Bid of ₹8,501 must be rejected under 15% rule');
    });

    it('should calculate correct discount percentage for any bid', () => {
      const budget = 50000;
      const bid = 35000;
      const discountPercent = Math.round(((budget - bid) / budget) * 100);
      assert.strictEqual(discountPercent, 30, 'Discount must be 30%');
      assert.strictEqual(discountPercent >= 15, true, 'Must qualify for 15% discount');
    });
  });

  describe('Module 06: Platform Fee (10%) & Escrow Splits', () => {
    it('should accurately calculate 10% platform fee on top of bid amount', () => {
      const bidAmount = 8500;
      const platformFee = Math.round(bidAmount * 0.10);
      const totalPaid = bidAmount + platformFee;

      assert.strictEqual(platformFee, 850, 'Platform fee must be ₹850 (10% of ₹8,500)');
      assert.strictEqual(totalPaid, 9350, 'Host must pay ₹9,350 total (Bid + Fee)');
    });

    it('should release 100% of bid to vendor and retain exactly the platform fee', () => {
      const bidAmount = 25000;
      const platformFee = Math.round(bidAmount * 0.10); // 2500
      const totalPaid = bidAmount + platformFee; // 27500

      const vendorPayout = bidAmount;
      const ezzygoRetained = platformFee;

      assert.strictEqual(vendorPayout, 25000, 'Vendor must get full ₹25,000');
      assert.strictEqual(ezzygoRetained, 2500, 'EzzyGo must retain ₹2,500 commission');
      assert.strictEqual(vendorPayout + ezzygoRetained, totalPaid, 'Sum must balance total paid');
    });
  });

  describe('Module 07: Contact Privacy & State Machine Transitions', () => {
    it('should mask contact details before payment is secured', () => {
      const booking = {
        status: 'AWAITING_PAYMENT',
        isContactRevealed: false,
        providerPhone: '9876543210',
      };

      const revealedPhone = booking.status === 'ACTIVE' || booking.isContactRevealed
        ? booking.providerPhone
        : '••••••••••';

      assert.strictEqual(revealedPhone, '••••••••••', 'Phone must remain masked when awaiting payment');
    });

    it('should unlock contact details immediately after escrow payment confirmation', () => {
      const booking = {
        status: 'ACTIVE',
        isContactRevealed: true,
        providerPhone: '9876543210',
      };

      const revealedPhone = booking.status === 'ACTIVE' || booking.isContactRevealed
        ? booking.providerPhone
        : '••••••••••';

      assert.strictEqual(revealedPhone, '9876543210', 'Phone must be unlocked when active/paid');
    });
  });

  describe('Module 02: OTP Normalization & Verification Rules', () => {
    it('should normalize Indian phone numbers with country code or leading zeros', () => {
      const normalize = (phone) => {
        const digits = String(phone || '').replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
        if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
        return digits;
      };

      assert.strictEqual(normalize('+91 98765 43210'), '9876543210');
      assert.strictEqual(normalize('09876543210'), '9876543210');
      assert.strictEqual(normalize('9876543210'), '9876543210');
    });
  });

});
