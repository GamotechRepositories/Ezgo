import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class EventService {
  final String id;
  final String title;
  final String shortName;
  final String filterKey;
  final String description;
  final String priceRange;
  final String priceFrom;
  final String asset;
  final String image;
  final IconData icon;

  const EventService({
    required this.id,
    required this.title,
    required this.shortName,
    required this.filterKey,
    required this.description,
    required this.priceRange,
    required this.priceFrom,
    required this.asset,
    required this.image,
    required this.icon,
  });

  Map<String, String> get detailMap => {
        'title': title,
        'price': priceFrom,
        'priceRange': priceRange,
        'description': description,
        'asset': asset,
        'image': image,
      };
}

class EventServices {
  static const filters = [
    'All',
    'Sound & DJ',
    'Decor',
    'Photography',
    'Catering',
    'Lighting',
  ];

  static const all = [
    EventService(
      id: 'dj-sound',
      title: 'DJ & Sound Systems',
      shortName: 'DJ / Sound',
      filterKey: 'dj',
      description: 'Line arrays, DJ consoles, wireless mics for sangeet, receptions and college fests.',
      priceRange: '₹12,000 - ₹45,000',
      priceFrom: 'From ₹12,000',
      asset: 'assets/images/occasion_festivals.jpg',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.volume2,
    ),
    EventService(
      id: 'decoration',
      title: 'Stage & Mandap Decoration',
      shortName: 'Decoration',
      filterKey: 'decor',
      description: 'Floral mandaps, entrance arches, fairy-light canopies and theme stage backdrops.',
      priceRange: '₹15,000 - ₹1,20,000',
      priceFrom: 'From ₹15,000',
      asset: 'assets/images/occasion_weddings.jpg',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.sparkles,
    ),
    EventService(
      id: 'photography',
      title: 'Photography & 4K Film',
      shortName: 'Photography',
      filterKey: 'photography',
      description: 'Candid coverage, cinematic films, drone aerials and traditional albums.',
      priceRange: '₹12,000 - ₹65,000',
      priceFrom: 'From ₹12,000',
      asset: 'assets/images/occasion_parties.jpg',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.camera,
    ),
    EventService(
      id: 'catering',
      title: 'Catering Buffets',
      shortName: 'Catering',
      filterKey: 'catering',
      description: 'Multi-cuisine live counters, traditional thalis and premium chaat stalls.',
      priceRange: '₹350 - ₹1,200 / plate',
      priceFrom: 'From ₹350 / plate',
      asset: 'assets/images/service_catering.jpg',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.utensils,
    ),
    EventService(
      id: 'lighting',
      title: 'Lighting & Trussing',
      shortName: 'Lighting',
      filterKey: 'lighting',
      description: 'Moving heads, LED pars, truss grids and outdoor garden illumination.',
      priceRange: '₹8,000 - ₹50,000',
      priceFrom: 'From ₹8,000',
      asset: 'assets/images/occasion_festivals.jpg',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.lightbulb,
    ),
    EventService(
      id: 'purohit',
      title: 'Purohit & Priest Services',
      shortName: 'Priest',
      filterKey: 'priest',
      description: 'Vedic rituals, Griha Pravesh, Satyanarayana Puja and wedding ceremonies.',
      priceRange: '₹3,500 - ₹15,000',
      priceFrom: 'From ₹3,500',
      asset: 'assets/images/occasion_corporate.jpg',
      image: 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.flame,
    ),
    EventService(
      id: 'mehendi',
      title: 'Bridal Mehendi',
      shortName: 'Mehendi',
      filterKey: 'mehendi',
      description: 'Organic bridal henna, guest counters and Arabic designer patterns.',
      priceRange: '₹5,000 - ₹25,000',
      priceFrom: 'From ₹5,000',
      asset: 'assets/images/occasion_festivals.jpg',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.heart,
    ),
    EventService(
      id: 'makeup',
      title: 'Makeup Artist',
      shortName: 'Makeup',
      filterKey: 'makeup',
      description: 'Bridal and party HD glam makeup with airbrush styling.',
      priceRange: '₹5,000 - ₹25,000',
      priceFrom: 'From ₹5,000',
      asset: 'assets/images/occasion_birthdays.jpg',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.palette,
    ),
    EventService(
      id: 'tent-stage',
      title: 'Tent & Stage Setup',
      shortName: 'Tent & Stage',
      filterKey: 'tent',
      description: 'German hangar tents, VIP seating, stage risers and red-carpet entrance.',
      priceRange: '₹15,000 - ₹60,000',
      priceFrom: 'From ₹15,000',
      asset: 'assets/images/occasion_corporate.jpg',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
      icon: LucideIcons.tent,
    ),
  ];

  static List<EventService> filter({required String category, String query = ''}) {
    final q = query.trim().toLowerCase();
    return all.where((s) {
      final matchesQuery = q.isEmpty ||
          s.title.toLowerCase().contains(q) ||
          s.shortName.toLowerCase().contains(q) ||
          s.description.toLowerCase().contains(q);
      if (!matchesQuery) return false;
      if (category == 'All') return true;
      final n = '${s.title} ${s.shortName} ${s.filterKey}'.toLowerCase();
      if (category == 'Sound & DJ') return n.contains('dj') || n.contains('sound');
      if (category == 'Decor') return n.contains('decor') || n.contains('mandap');
      if (category == 'Photography') return n.contains('photo') || n.contains('film') || n.contains('drone');
      if (category == 'Catering') return n.contains('cater') || n.contains('food');
      if (category == 'Lighting') return n.contains('light') || n.contains('tent') || n.contains('truss');
      return s.filterKey == category.toLowerCase();
    }).toList();
  }

  static String matchTitle(String? raw) {
    if (raw == null || raw.trim().isEmpty) return all.first.shortName;
    final q = raw.toLowerCase();
    for (final s in all) {
      if (q.contains(s.shortName.toLowerCase()) ||
          q.contains(s.title.toLowerCase()) ||
          s.title.toLowerCase().contains(q) ||
          s.shortName.toLowerCase().contains(q) ||
          q.contains(s.filterKey)) {
        return s.shortName;
      }
    }
    return raw;
  }

  static EventService? byTitle(String? raw) {
    if (raw == null) return null;
    final matched = matchTitle(raw);
    for (final s in all) {
      if (s.shortName == matched || s.title == raw) return s;
    }
    return null;
  }
}
