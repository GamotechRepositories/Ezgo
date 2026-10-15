import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme.dart';
import 'post_requirement_screen.dart';

class ServiceCatalogScreen extends StatefulWidget {
  final String? initialCategory;
  const ServiceCatalogScreen({super.key, this.initialCategory});

  @override
  State<ServiceCatalogScreen> createState() => _ServiceCatalogScreenState();
}

class _ServiceCatalogScreenState extends State<ServiceCatalogScreen> {
  late String _selectedCategory;
  final TextEditingController _searchController = TextEditingController();
  final Set<String> _favorites = {};

  final List<String> _categories = [
    'All',
    'Catering',
    'Photography',
    'Decor',
    'Venue',
    'Makeup',
    'Mehendi',
  ];

  final List<Map<String, dynamic>> _services = [
    {
      'id': 'srv_catering',
      'title': 'Catering',
      'category': 'Catering',
      'rating': '4.8',
      'reviews': '1.2k',
      'description': 'Delicious menus for every occasion',
      'price': 'From ₹300 per plate',
      'benchmark': 300,
      'asset': 'assets/images/service_catering.jpg',
      'image': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
    },
    {
      'id': 'srv_photo',
      'title': 'Photography',
      'category': 'Photography',
      'rating': '4.7',
      'reviews': '980',
      'description': 'Capture your special moments',
      'price': 'From ₹5,000',
      'benchmark': 5000,
      'asset': 'assets/images/occasion_parties.jpg',
      'image': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    },
    {
      'id': 'srv_decor',
      'title': 'Decoration',
      'category': 'Decor',
      'rating': '4.6',
      'reviews': '850',
      'description': 'Theme based decoration for all events',
      'price': 'From ₹10,000',
      'benchmark': 10000,
      'asset': 'assets/images/occasion_weddings.jpg',
      'image': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    },
    {
      'id': 'srv_venue',
      'title': 'Venue',
      'category': 'Venue',
      'rating': '4.5',
      'reviews': '610',
      'description': 'Beautiful venues for your celebration',
      'price': 'From ₹20,000',
      'benchmark': 20000,
      'asset': 'assets/images/occasion_corporate.jpg',
      'image': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
    },
    {
      'id': 'srv_makeup',
      'title': 'Makeup Artist',
      'category': 'Makeup',
      'rating': '4.9',
      'reviews': '730',
      'description': 'Bridal & party glam makeup with HD styling',
      'price': 'From ₹3,000',
      'benchmark': 3000,
      'asset': 'assets/images/occasion_birthdays.jpg',
      'image': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
    },
    {
      'id': 'srv_mehendi',
      'title': 'Mehendi Artist',
      'category': 'Mehendi',
      'rating': '4.8',
      'reviews': '520',
      'description': 'Intricate bridal henna designs & organic stain',
      'price': 'From ₹2,500',
      'benchmark': 2500,
      'asset': 'assets/images/occasion_festivals.jpg',
      'image': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All';
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onViewService(Map<String, dynamic> service) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PostRequirementScreen(
          initialCategory: service['title'] as String,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.trim().toLowerCase();
    final filtered = _services.where((s) {
      final matchesCategory = _selectedCategory == 'All' || s['category'] == _selectedCategory;
      final matchesQuery = query.isEmpty ||
          (s['title'] as String).toLowerCase().contains(query) ||
          (s['description'] as String).toLowerCase().contains(query);
      return matchesCategory && matchesQuery;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('All Services'),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.slidersHorizontal, size: 20),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Search input
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Search services...',
                  hintStyle: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                  prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppTheme.textSecondary),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {});
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 13, horizontal: 14),
                ),
              ),
            ),
          ),

          // Category Chips Row
          SizedBox(
            height: 38,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat;

                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = cat),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.primary : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? AppTheme.primary : AppTheme.borderSubtle,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        cat,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? Colors.white : AppTheme.textPrimary,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Services List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.searchX, size: 40, color: AppTheme.slate400),
                        const SizedBox(height: 12),
                        Text(
                          'No services found',
                          style: AppTheme.headingFont(fontSize: 16),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: filtered.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 14),
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      final id = item['id'] as String;
                      final isFav = _favorites.contains(id);

                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.borderSubtle),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Thumbnail
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Stack(
                                children: [
                                  Image.asset(
                                    item['asset'] as String,
                                    width: 95,
                                    height: 95,
                                    fit: BoxFit.cover,
                                    filterQuality: FilterQuality.high,
                                    errorBuilder: (_, _, _) => Image.network(
                                      item['image'] as String,
                                      width: 95,
                                      height: 95,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, _, _) => Container(
                                        width: 95,
                                        height: 95,
                                        color: AppTheme.slate100,
                                        child: const Icon(LucideIcons.image, color: AppTheme.slate400),
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    top: 6,
                                    left: 6,
                                    child: GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          if (isFav) {
                                            _favorites.remove(id);
                                          } else {
                                            _favorites.add(id);
                                          }
                                        });
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(alpha: 0.9),
                                          shape: BoxShape.circle,
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: 0.1),
                                              blurRadius: 4,
                                            ),
                                          ],
                                        ),
                                        child: Icon(
                                          isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                          size: 14,
                                          color: isFav ? AppTheme.primary : AppTheme.textSecondary,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(width: 12),

                            // Details (Matching Screen 4 Mockup)
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title'] as String,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF111827),
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Row(
                                    children: [
                                      const Icon(Icons.star_rounded, size: 16, color: Color(0xFFFF9500)),
                                      const SizedBox(width: 3),
                                      Text(
                                        item['rating'] as String,
                                        style: const TextStyle(
                                          fontSize: 12.5,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF111827),
                                        ),
                                      ),
                                      Text(
                                        ' (${item['reviews']})',
                                        style: const TextStyle(
                                          fontSize: 11.5,
                                          fontWeight: FontWeight.w500,
                                          color: Color(0xFF6B7280),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    item['description'] as String,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF4B5563),
                                      height: 1.25,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        item['price'] as String,
                                        style: const TextStyle(
                                          fontSize: 13.5,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF111827),
                                        ),
                                      ),
                                      SizedBox(
                                        height: 32,
                                        child: ElevatedButton(
                                          onPressed: () => _onViewService(item),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFFFF5148),
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(horizontal: 18),
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(20),
                                            ),
                                            elevation: 0,
                                          ),
                                          child: const Text(
                                            'View',
                                            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
