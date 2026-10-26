import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import '../../data/event_services.dart';
import '../../utils/app_nav.dart';
import '../../widgets/shell_bottom_insets.dart';
import 'post_requirement_screen.dart';

class ServiceDetailScreen extends StatelessWidget {
  final Map<String, String> service;

  const ServiceDetailScreen({super.key, required this.service});

  List<String> _covers(EventService? matched, String title) {
    switch (matched?.filterKey) {
      case 'dj':
        return ['DJ console and mixer', 'Speakers, mics and on-site tech', 'Sangeet, reception or party sets'];
      case 'decor':
        return ['Mandap, stage or entrance decor', 'Fresh flowers and lighting accents', 'Setup and teardown on your date'];
      case 'photography':
        return ['Candid photos and 4K film', 'Drone shots where allowed', 'Edited album after the event'];
      case 'catering':
        return ['Menu planned to your guest count', 'Live counters or plated service', 'Staff, crockery and cleanup'];
      case 'lighting':
        return ['Stage and floor lighting', 'Truss and LED fixtures', 'Technician for the full event'];
      case 'priest':
        return ['Vedic rituals for your occasion', 'Puja samagri guidance', 'On-time arrival at your venue'];
      case 'mehendi':
        return ['Bridal and guest henna', 'Organic cones', 'Arabic or traditional designs'];
      case 'makeup':
        return ['HD / airbrush makeup', 'Hair and draping add-ons', 'Trial on request'];
      case 'tent':
        return ['Shamiana or hangar tent', 'Stage, chairs and carpet', 'Install before guests arrive'];
      default:
        return [
          'Verified local vendors for $title',
          'Quotes on your date and city',
          'Payment held until the event is done',
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final matched = EventServices.byTitle(service['title']);
    final title = matched?.title ?? service['title'] ?? 'Service';
    final shortName = matched?.shortName ?? title;
    final occasion = service['occasion'];
    final priceRange = matched?.priceRange ?? service['priceRange'] ?? service['price'] ?? '';
    final description = matched?.description ??
        service['description'] ??
        'Verified vendors in your city will bid on this service for your event date.';
    final asset = matched?.asset ?? service['asset'] ?? 'assets/images/occasion_weddings.jpg';
    final image = matched?.image ?? service['image'] ?? '';
    final covers = _covers(matched, shortName);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                Stack(
                  children: [
                    Image.asset(
                      asset,
                      height: 220,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => image.isNotEmpty
                          ? Image.network(image, height: 220, width: double.infinity, fit: BoxFit.cover)
                          : Container(height: 220, color: AppTheme.slate100),
                    ),
                    Positioned.fill(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.45),
                              Colors.transparent,
                            ],
                            stops: const [0, 0.55],
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 12,
                      left: 12,
                      child: _roundBtn(LucideIcons.arrowLeft, () => AppNav.pop(context)),
                    ),
                    Positioned(
                      left: 16,
                      right: 16,
                      bottom: 14,
                      child: Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          height: 1.2,
                        ),
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        description,
                        style: const TextStyle(fontSize: 14, height: 1.45, color: AppTheme.slate600),
                      ),
                      const SizedBox(height: 14),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Typical market price',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.slate500),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              priceRange,
                              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'This is not a fixed price. You set a budget. Vendors must bid at least 15% below it.',
                              style: TextStyle(fontSize: 13, height: 1.4, color: AppTheme.slate600, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                      const Text('How this works', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 10),
                      _step(1, 'Post your date, city and max budget', 'Free. Takes about 1 minute.'),
                      _step(2, 'Vendors send lower bids', 'You only see prices at least 15% below your budget.'),
                      _step(3, 'Pick one and pay to EzzyGo', 'We hold the money. Vendor is paid after you mark the event done.'),
                      const SizedBox(height: 18),
                      const Text('Usually includes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 10),
                      ...covers.map(
                        (line) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(top: 2),
                                child: Icon(LucideIcons.checkCircle2, size: 16, color: AppTheme.emerald),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  line,
                                  style: const TextStyle(fontSize: 14, height: 1.35, color: AppTheme.slate700, fontWeight: FontWeight.w500),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.fromLTRB(16, 10, 16, ShellBottomInsets.of(context)),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
            ),
            child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => PostRequirementScreen(
                              initialOccasion: occasion,
                              initialCategory: occasion == null || occasion.isEmpty ? shortName : null,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: Text(
                        'Get bids for $shortName',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Free to post. Pay only after you choose a vendor.',
                    style: TextStyle(fontSize: 12, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
          ),
        ],
      ),
    );
  }

  Widget _step(int n, String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 26,
            height: 26,
            alignment: Alignment.center,
            decoration: const BoxDecoration(color: AppTheme.primaryLight, shape: BoxShape.circle),
            child: Text(
              '$n',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.primary),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 12, height: 1.35, color: AppTheme.slate500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _roundBtn(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
        child: Icon(icon, size: 18, color: AppTheme.textPrimary),
      ),
    );
  }
}
