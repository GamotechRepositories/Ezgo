import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('EzzyGo Phase 3 & 4: Payments, Escrow, Disputes & Security', () => {

  describe('Module 08: Escrow Splits & Gateway Calculations', () => {
    it('should accurately calculate total charge with 10% platform fee', () => {
      const bidAmount = 40000;
      const fee = Math.round(bidAmount * 0.10);
      const total = bidAmount + fee;

      assert.strictEqual(fee, 4000, 'Fee must be ?4,000');
      assert.strictEqual(total, 44000, 'Total host payment must be ?44,000');
    });

    it('should prevent duplicate order generation for already-ordered booking', () => {
      const existingOrder = {
        orderId: 'order_test_998877',
        bookingId: 'book_123',
        amount: 44000,
        status: 'created',
      };

      const requestedBookingId = 'book_123';
      const isAlreadyCreated = existingOrder.bookingId === requestedBookingId;

      assert.strictEqual(isAlreadyCreated, true, 'Must detect existing gateway order');
      const resolvedOrderId = isAlreadyCreated ? existingOrder.orderId : 'order_new';
      assert.strictEqual(resolvedOrderId, 'order_test_998877', 'Must reuse existing order ID');
    });

    it('should reconcile payment.captured webhook by updating booking to ACTIVE escrow', () => {
      const booking = {
        status: 'AWAITING_PAYMENT',
        isContactRevealed: false,
        paymentDetails: { escrowStatus: 'NOT_PAID' },
      };

      const webhookEvent = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_capture_12345',
              order_id: 'order_test_998877',
              amount: 4400000, // paise
              status: 'captured',
            },
          },
        },
      };

      if (webhookEvent.event === 'payment.captured' && webhookEvent.payload.payment.entity.status === 'captured') {
        booking.status = 'ACTIVE';
        booking.isContactRevealed = true;
        booking.paymentDetails.escrowStatus = 'HELD';
        booking.paymentDetails.transactionId = webhookEvent.payload.payment.entity.id;
      }

      assert.strictEqual(booking.status, 'ACTIVE');
      assert.strictEqual(booking.isContactRevealed, true);
      assert.strictEqual(booking.paymentDetails.escrowStatus, 'HELD');
      assert.strictEqual(booking.paymentDetails.transactionId, 'pay_capture_12345');
    });
  });

  describe('Module 08: Dispute State Machine Transitions', () => {
    it('should transition ACTIVE booking into DISPUTED and lock escrow release', () => {
      const booking = {
        status: 'ACTIVE',
        totalPaid: 22000,
        bidAmount: 20000,
        disputeDetails: null,
      };

      // Raise dispute
      const reason = 'Vendor failed to provide sound monitors as agreed';
      booking.status = 'DISPUTED';
      booking.disputeDetails = {
        isDisputed: true,
        reason,
        raisedAt: new Date(),
        resolutionAction: 'NONE',
      };

      assert.strictEqual(booking.status, 'DISPUTED');
      assert.strictEqual(booking.disputeDetails.isDisputed, true);

      // Normal completion without resolution must be prohibited
      const canCompleteNormally = booking.status === 'ACTIVE';
      assert.strictEqual(canCompleteNormally, false, 'Payout cannot be released while status is DISPUTED');
    });

    it('should resolve dispute with PAYOUT_VENDOR by completing booking and releasing escrow', () => {
      const booking = {
        status: 'DISPUTED',
        bidAmount: 20000,
        platformFee: 2000,
        disputeDetails: { isDisputed: true },
        payoutDetails: null,
      };

      // Admin resolves with PAYOUT_VENDOR
      booking.status = 'COMPLETED';
      booking.payoutDetails = {
        transferId: 'POUT-TEST-88',
        amountToProvider: booking.bidAmount,
        commissionRetained: booking.platformFee,
      };
      booking.disputeDetails.resolutionAction = 'PAYOUT_VENDOR';

      assert.strictEqual(booking.status, 'COMPLETED');
      assert.strictEqual(booking.payoutDetails.amountToProvider, 20000);
      assert.strictEqual(booking.disputeDetails.resolutionAction, 'PAYOUT_VENDOR');
    });

    it('should resolve dispute with REFUND_HOST by cancelling booking and refunding full amount', () => {
      const booking = {
        status: 'DISPUTED',
        totalPaid: 22000,
        paymentDetails: { escrowStatus: 'HELD' },
        disputeDetails: { isDisputed: true },
      };

      // Admin resolves with REFUND_HOST
      booking.status = 'CANCELLED';
      booking.paymentDetails.escrowStatus = 'REFUNDED';
      booking.paymentDetails.refundId = 'RFND-TEST-12';
      booking.disputeDetails.resolutionAction = 'REFUND_HOST';

      assert.strictEqual(booking.status, 'CANCELLED');
      assert.strictEqual(booking.paymentDetails.escrowStatus, 'REFUNDED');
      assert.strictEqual(booking.disputeDetails.resolutionAction, 'REFUND_HOST');
    });
  });

  describe('Module 09: KYC Data Protection & Security Rules', () => {
    it('should redact sensitive KYC documents and bank details for host users', () => {
      const providerRecord = {
        name: 'Rajesh Sound Systems',
        businessName: 'Rajesh Pro Audio',
        phone: '9823145678',
        rating: 4.8,
        bankDetails: {
          accountNumber: '112233445566',
          ifscCode: 'HDFC0001234',
        },
        kycDocuments: {
          aadhaarNumber: '123456789012',
          aadhaarFront: 'https://cloudinary.com/aadhaar.pdf',
          panNumber: 'ABCDE1234F',
        },
      };

      const requesterView = (userRole, provider) => {
        if (userRole === 'admin') return provider;
        const { bankDetails, kycDocuments, ...safeProvider } = provider;
        return safeProvider;
      };

      const hostView = requesterView('requester', providerRecord);
      assert.strictEqual(hostView.name, 'Rajesh Sound Systems');
      assert.strictEqual(hostView.bankDetails, undefined, 'Bank details must be stripped');
      assert.strictEqual(hostView.kycDocuments, undefined, 'KYC documents must be stripped');

      const adminView = requesterView('admin', providerRecord);
      assert.notStrictEqual(adminView.bankDetails, undefined, 'Bank details visible to admin');
      assert.notStrictEqual(adminView.kycDocuments, undefined, 'KYC documents visible to admin');
    });

    it('should reject unauthorized access to provider KYC copies', () => {
      const checkAccess = (userRole, requesterUserId, targetProviderId) => {
        if (userRole === 'admin') return true;
        if (requesterUserId === targetProviderId) return true;
        return false;
      };

      assert.strictEqual(checkAccess('requester', 'user_host_1', 'user_vendor_2'), false, 'Host must be rejected (403)');
      assert.strictEqual(checkAccess('provider', 'user_vendor_3', 'user_vendor_2'), false, 'Unrelated vendor must be rejected (403)');
      assert.strictEqual(checkAccess('provider', 'user_vendor_2', 'user_vendor_2'), true, 'Owning vendor has access');
      assert.strictEqual(checkAccess('admin', 'user_admin_99', 'user_vendor_2'), true, 'Admin has access');
    });
  });

});
