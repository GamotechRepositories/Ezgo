import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/bookings_provider.dart';

class VendorBookingsScreen extends StatelessWidget {
  const VendorBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final bookings = context.watch<BookingsProvider>().bookings;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'My Vendor Jobs',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.slate900),
        ),
        const SizedBox(height: 6),
        const Text(
          'Jobs where hosts accepted your bid.',
          style: TextStyle(color: AppTheme.slate600, fontSize: 13),
        ),
        const SizedBox(height: 16),
        ...bookings.map((b) => Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.slate200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(b.status, style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.emerald)),
                      Text('You get ₹${b.bidAmount}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(b.requirementTitle, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text('Host: ${b.hostName} · ${b.hostPhone}', style: const TextStyle(fontSize: 12, color: AppTheme.slate600)),
                ],
              ),
            )),
      ],
    );
  }
}
