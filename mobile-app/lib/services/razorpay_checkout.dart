import 'dart:async';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'api_service.dart';

class RazorpayPaymentResult {
  final String paymentId;
  final String orderId;
  final String signature;

  const RazorpayPaymentResult({
    required this.paymentId,
    required this.orderId,
    required this.signature,
  });
}

class RazorpayCheckout {
  RazorpayCheckout._();

  static const int cancelledCode = 2;

  static String? contact(String? phone) {
    final digits = (phone ?? '').replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length >= 10) return digits.substring(digits.length - 10);
    return null;
  }

  static String? email(String? value) {
    final email = (value ?? '').trim();
    if (RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(email)) return email;
    return null;
  }

  static Future<RazorpayPaymentResult> open({
    required String key,
    required String orderId,
    required int amountPaise,
    required String method,
    String currency = 'INR',
    String name = 'EzzyGo',
    String? description,
    String? customerName,
    String? customerEmail,
    String? customerPhone,
  }) {
    final razorpay = Razorpay();
    final done = Completer<RazorpayPaymentResult>();

    void finishOk(RazorpayPaymentResult result) {
      if (!done.isCompleted) done.complete(result);
    }

    void finishErr(Object error) {
      if (!done.isCompleted) done.completeError(error);
    }

    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, (PaymentSuccessResponse response) {
      final paymentId = response.paymentId ?? '';
      final paidOrderId = response.orderId ?? orderId;
      final signature = response.signature ?? '';
      if (paymentId.isEmpty || signature.isEmpty) {
        finishErr(ApiException('Payment succeeded but confirmation data was incomplete.'));
        return;
      }
      finishOk(RazorpayPaymentResult(
        paymentId: paymentId,
        orderId: paidOrderId,
        signature: signature,
      ));
    });

    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, (PaymentFailureResponse response) {
      if (response.code == Razorpay.PAYMENT_CANCELLED || response.code == cancelledCode) {
        finishErr(ApiException('Payment cancelled. No money was taken.', cancelledCode));
        return;
      }
      finishErr(ApiException(
        response.message?.toString() ?? 'Payment failed. Please try again.',
        response.code,
      ));
    });

    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, (_) {
      finishErr(ApiException('Please complete payment with UPI or card.', cancelledCode));
    });

    final preferUpi = method.toLowerCase() == 'upi';
    final prefill = <String, dynamic>{};
    final namePrefill = (customerName ?? '').trim();
    if (namePrefill.isNotEmpty) prefill['name'] = namePrefill;
    final emailPrefill = email(customerEmail);
    if (emailPrefill != null) prefill['email'] = emailPrefill;
    final phonePrefill = contact(customerPhone);
    if (phonePrefill != null) prefill['contact'] = phonePrefill;

    try {
      razorpay.open({
        'key': key,
        'amount': amountPaise,
        'currency': currency,
        'name': name,
        'description': description ?? 'EzzyGo escrow payment',
        'order_id': orderId,
        'timeout': 300,
        'retry': {'enabled': true, 'max_count': 1},
        'theme': {'color': '#ff5c28'},
        if (prefill.isNotEmpty) 'prefill': prefill,
        'method': {
          'upi': true,
          'card': true,
          'netbanking': false,
          'wallet': false,
          'emi': false,
          'paylater': false,
        },
        'config': {
          'display': {
            'sequence': preferUpi ? ['upi', 'card'] : ['card', 'upi'],
            'preferences': {'show_default_blocks': true},
          },
        },
      });
    } catch (e) {
      razorpay.clear();
      finishErr(ApiException(e.toString(), cancelledCode));
    }

    return done.future.timeout(
      const Duration(minutes: 6),
      onTimeout: () {
        throw ApiException('Payment window timed out. No money was taken.', cancelledCode);
      },
    ).whenComplete(razorpay.clear);
  }
}
