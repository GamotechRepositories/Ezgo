import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../widgets/custom_button.dart';

class AvailabilityScreen extends StatefulWidget {
  const AvailabilityScreen({super.key});

  @override
  State<AvailabilityScreen> createState() => _AvailabilityScreenState();
}

class _AvailabilityScreenState extends State<AvailabilityScreen> {
  final List<String> _blockedDates = ['2026-11-28', '2026-12-01'];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Availability Calendar',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.slate900),
        ),
        const SizedBox(height: 6),
        const Text(
          'Block dates when you are booked for offline gigs to avoid bid collisions.',
          style: TextStyle(color: AppTheme.slate600, fontSize: 13),
        ),
        const SizedBox(height: 16),

        CustomButton(
          text: 'Block A New Date',
          icon: LucideIcons.calendarPlus,
          onPressed: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: DateTime.now().add(const Duration(days: 1)),
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 365)),
            );
            if (picked != null) {
              final dateStr = '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
              setState(() => _blockedDates.add(dateStr));
            }
          },
        ),

        const SizedBox(height: 20),

        const Text('Currently Blocked Dates:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 10),

        ..._blockedDates.map((d) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.slate200),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(LucideIcons.calendarX, color: AppTheme.rose, size: 18),
                      const SizedBox(width: 10),
                      Text(d, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.trash2, size: 18, color: AppTheme.slate400),
                    onPressed: () => setState(() => _blockedDates.remove(d)),
                  ),
                ],
              ),
            )),
      ],
    );
  }
}
