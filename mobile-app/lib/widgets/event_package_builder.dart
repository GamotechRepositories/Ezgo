import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../screens/host/post_requirement_screen.dart';

class EventPackageBuilder extends StatefulWidget {
  const EventPackageBuilder({super.key});

  @override
  State<EventPackageBuilder> createState() => _EventPackageBuilderState();
}

class _EventPackageBuilderState extends State<EventPackageBuilder> {
  String _selectedOccasion = 'Wedding';
  int _guestCount = 200;
  final Set<String> _selectedServices = {'decor', 'dj', 'photo'};

  final List<Map<String, dynamic>> _serviceOptions = [
    {
      'id': 'decor',
      'name': 'Stage & Mandap Decor',
      'price': 25000,
      'icon': LucideIcons.palette,
    },
    {
      'id': 'dj',
      'name': 'Sound & DJ Line Array',
      'price': 18000,
      'icon': LucideIcons.music,
    },
    {
      'id': 'catering',
      'name': 'Catering & Live Food Counters',
      'price': 45000, // per 100 guests = 450/plate
      'icon': LucideIcons.utensils,
    },
    {
      'id': 'photo',
      'name': 'Photography & Candid Film',
      'price': 30000,
      'icon': LucideIcons.camera,
    },
    {
      'id': 'video',
      'name': '4K Cinematic Drone Videography',
      'price': 35000,
      'icon': LucideIcons.video,
    },
    {
      'id': 'lighting',
      'name': 'Lighting & Stage Trussing',
      'price': 18000,
      'icon': LucideIcons.lightbulb,
    },
    {
      'id': 'mehendi',
      'name': 'Bridal Mehendi Artist',
      'price': 10000,
      'icon': LucideIcons.heart,
    },
  ];

  int get _packageRetailTotal {
    int total = 0;
    for (final s in _serviceOptions) {
      if (_selectedServices.contains(s['id'])) {
        if (s['id'] == 'catering') {
          total += ((_guestCount / 100) * (s['price'] as int)).round();
        } else {
          total += s['price'] as int;
        }
      }
    }
    return total;
  }

  int get _estimatedWinningBid => (_packageRetailTotal * 0.74).round(); // ~26% savings
  int get _estimatedSavings => _packageRetailTotal - _estimatedWinningBid;

  void _toggleService(String id) {
    setState(() {
      if (_selectedServices.contains(id)) {
        if (_selectedServices.length > 1) {
          _selectedServices.remove(id);
        }
      } else {
        _selectedServices.add(id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.amber.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Eyebrow & Live pros badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.package, size: 12, color: AppTheme.primary),
                    SizedBox(width: 4),
                    Text(
                      'PACKAGE BUILDER',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.emeraldLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppTheme.emerald, shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                    const Text(
                      '34 Verified Pros Active',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.emerald),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Headline
          Text(
            'Plan Your Event, Your Way',
            style: AppTheme.displayFont(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.slate900),
          ),
          const SizedBox(height: 4),
          Text(
            'Select your occasion, choose the services you need, and get the best quotes through reverse bidding.',
            style: AppTheme.bodyFont(fontSize: 12, color: AppTheme.slate600),
          ),

          const SizedBox(height: 14),

          // 3-Step Process Flow Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.slate50,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.slate200),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Row(
                  children: [
                    CircleAvatar(radius: 8, backgroundColor: AppTheme.primary, child: Text('1', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold))),
                    SizedBox(width: 4),
                    Text('Select Services', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                  ],
                ),
                Text('→', style: TextStyle(color: AppTheme.slate400, fontSize: 12)),
                Row(
                  children: [
                    CircleAvatar(radius: 8, backgroundColor: AppTheme.slate300, child: Text('2', style: TextStyle(color: AppTheme.slate700, fontSize: 9, fontWeight: FontWeight.bold))),
                    SizedBox(width: 4),
                    Text('Compare Bids', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate600)),
                  ],
                ),
                Text('→', style: TextStyle(color: AppTheme.slate400, fontSize: 12)),
                Row(
                  children: [
                    CircleAvatar(radius: 8, backgroundColor: AppTheme.slate300, child: Text('3', style: TextStyle(color: AppTheme.slate700, fontSize: 9, fontWeight: FontWeight.bold))),
                    SizedBox(width: 4),
                    Text('Book', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate600)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Step 1: Occasion selector
          Row(
            children: [
              const CircleAvatar(radius: 9, backgroundColor: AppTheme.primary, child: Text('1', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
              const SizedBox(width: 8),
              Text('Select Occasion', style: AppTheme.headingFont(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900)),
            ],
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['Wedding', 'Sangeet & Haldi', 'Reception', 'Birthday Bash', 'Corporate Gala', 'Other Events'].map((occ) {
                final isSelected = _selectedOccasion == occ;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(occ),
                    selected: isSelected,
                    onSelected: (val) => setState(() => _selectedOccasion = occ),
                    selectedColor: AppTheme.primaryLight,
                    backgroundColor: Colors.white,
                    labelStyle: TextStyle(
                      color: isSelected ? AppTheme.primary : AppTheme.slate700,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 12,
                    ),
                    side: BorderSide(
                      color: isSelected ? AppTheme.primary : AppTheme.slate200,
                      width: isSelected ? 1.5 : 1,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 18),

          // Step 2: Select Services
          Row(
            children: [
              const CircleAvatar(radius: 9, backgroundColor: AppTheme.primary, child: Text('2', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
              const SizedBox(width: 8),
              Text('Select Services', style: AppTheme.headingFont(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900)),
            ],
          ),
          const SizedBox(height: 8),

          ..._serviceOptions.map((service) {
            final id = service['id'] as String;
            final isChecked = _selectedServices.contains(id);
            final name = service['name'] as String;
            final basePrice = service['price'] as int;
            final icon = service['icon'] as IconData;
            final displayPrice = id == 'catering'
                ? ((_guestCount / 100) * basePrice).round()
                : basePrice;

            return InkWell(
              onTap: () => _toggleService(id),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: isChecked ? AppTheme.primaryLight.withValues(alpha: 0.4) : AppTheme.slate50,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isChecked ? AppTheme.primary : AppTheme.slate200,
                    width: isChecked ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: isChecked ? AppTheme.primary : Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: isChecked ? AppTheme.primary : AppTheme.slate400),
                      ),
                      child: isChecked ? const Icon(LucideIcons.check, size: 14, color: Colors.white) : null,
                    ),
                    const SizedBox(width: 10),
                    Icon(icon, size: 16, color: isChecked ? AppTheme.primary : AppTheme.slate600),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        name,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isChecked ? FontWeight.w800 : FontWeight.w500,
                          color: isChecked ? AppTheme.slate900 : AppTheme.slate700,
                        ),
                      ),
                    ),
                    Text(
                      '₹${displayPrice.toString()}',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppTheme.slate800),
                    ),
                  ],
                ),
              ),
            );
          }),

          const SizedBox(height: 18),

          // Step 3: Estimated Guests
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const CircleAvatar(radius: 9, backgroundColor: AppTheme.primary, child: Text('3', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
                  const SizedBox(width: 8),
                  Text('Estimated Guests', style: AppTheme.headingFont(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.slate100,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.slate200),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    InkWell(
                      onTap: () => setState(() => _guestCount = (_guestCount - 50).clamp(50, 2000)),
                      child: const Icon(LucideIcons.minus, size: 14, color: AppTheme.slate700),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text('$_guestCount', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppTheme.slate900)),
                    ),
                    InkWell(
                      onTap: () => setState(() => _guestCount = (_guestCount + 50).clamp(50, 2000)),
                      child: const Icon(LucideIcons.plus, size: 14, color: AppTheme.primary),
                    ),
                  ],
                ),
              ),
            ],
          ),

          Slider(
            value: _guestCount.toDouble(),
            min: 50,
            max: 1000,
            divisions: 19,
            activeColor: AppTheme.primary,
            onChanged: (val) => setState(() => _guestCount = val.round()),
          ),

          const SizedBox(height: 12),

          // Price Matrix / "Your Event Package" Card (Exact Website Styling)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.slate50,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.slate200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Your Event Package',
                      style: AppTheme.displayFont(fontSize: 17, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('LIVE ESTIMATE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary)),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  '${_selectedServices.length} Services Selected • $_selectedOccasion',
                  style: const TextStyle(fontSize: 11, color: AppTheme.slate500, fontWeight: FontWeight.w600),
                ),
                const Divider(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Standard Market Rate:', style: TextStyle(fontSize: 12, color: AppTheme.slate500)),
                    Text(
                      '₹$_packageRetailTotal',
                      style: const TextStyle(fontSize: 13, color: AppTheme.slate400, decoration: TextDecoration.lineThrough, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('EzzyGo Target Bid:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppTheme.slate900)),
                        const Text('Reverse-Bid Estimate', style: TextStyle(fontSize: 10, color: AppTheme.emerald, fontWeight: FontWeight.w700)),
                      ],
                    ),
                    Text(
                      '₹$_estimatedWinningBid',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.primary),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Green savings banner
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.emeraldLight,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(2),
                            decoration: const BoxDecoration(color: AppTheme.emerald, shape: BoxShape.circle),
                            child: const Icon(LucideIcons.check, size: 10, color: Colors.white),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Est. Savings: ₹$_estimatedSavings (26%)',
                            style: const TextStyle(color: AppTheme.emerald, fontSize: 11, fontWeight: FontWeight.w800),
                          ),
                        ],
                      ),
                      const Text(
                        'Guaranteed Best',
                        style: TextStyle(color: AppTheme.emerald, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          ElevatedButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => PostRequirementScreen(
                    initialBudget: _packageRetailTotal,
                    initialGuests: _guestCount,
                  ),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 2,
              shadowColor: AppTheme.primary.withValues(alpha: 0.3),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Get Competitive Quotes Now', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                SizedBox(width: 6),
                Icon(LucideIcons.arrowRight, size: 16),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // 3 Micro trust badges
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.shield, size: 13, color: AppTheme.primary),
                  SizedBox(width: 4),
                  Text('Verified Vendors', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate600)),
                ],
              ),
              Row(
                children: [
                  Icon(LucideIcons.indianRupee, size: 13, color: AppTheme.primary),
                  SizedBox(width: 4),
                  Text('Best Bids', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate600)),
                ],
              ),
              Row(
                children: [
                  Icon(LucideIcons.lock, size: 13, color: AppTheme.primary),
                  SizedBox(width: 4),
                  Text('Escrow Safe', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate600)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
