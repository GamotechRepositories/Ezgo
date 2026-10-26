import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';
import '../widgets/image_poster_card.dart';

class OccasionCard {
  final String name;
  final String occasion;
  final String image;
  final String iconType;
  final String description;

  const OccasionCard({
    required this.name,
    required this.occasion,
    required this.image,
    required this.iconType,
    required this.description,
  });

  Map<String, String> get detailMap => {
        'title': name,
        'occasion': occasion,
        'asset': image,
        'description': description,
        'price': '',
        'priceRange': 'Vendors bid on your budget',
      };

  Widget get iconWidget {
    switch (iconType) {
      case 'rings':
        return const WeddingRingsIcon(size: 18);
      case 'lotus':
        return const Icon(LucideIcons.flower2, size: 18, color: AppTheme.primary);
      case 'corporate':
        return const Icon(LucideIcons.briefcase, size: 17, color: AppTheme.primary);
      case 'party':
        return const Icon(LucideIcons.partyPopper, size: 17, color: AppTheme.primary);
      case 'birthday':
        return const Icon(LucideIcons.cake, size: 17, color: AppTheme.primary);
      default:
        return const Icon(LucideIcons.sparkles, size: 17, color: AppTheme.primary);
    }
  }
}

class OccasionCards {
  static const all = [
    OccasionCard(
      name: 'Weddings',
      occasion: 'Wedding',
      image: 'assets/images/occasion_weddings.jpg',
      iconType: 'rings',
      description: 'Mandap, decor, catering, photography and more — post your budget and verified vendors bid lower.',
    ),
    OccasionCard(
      name: 'Festivals',
      occasion: 'Festivals',
      image: 'assets/images/occasion_festivals.jpg',
      iconType: 'lotus',
      description: 'Pooja, lighting, stage and catering for festivals. Get reverse bids from local professionals.',
    ),
    OccasionCard(
      name: 'Corporate Events',
      occasion: 'Corporate',
      image: 'assets/images/occasion_corporate.jpg',
      iconType: 'corporate',
      description: 'Conferences, offsites and brand nights. Compare vendor bids on venue, AV, decor and catering.',
    ),
    OccasionCard(
      name: 'Private Parties',
      occasion: 'Private Parties',
      image: 'assets/images/occasion_parties.jpg',
      iconType: 'party',
      description: 'House parties, receptions and get-togethers. Vendors compete to match your date and budget.',
    ),
    OccasionCard(
      name: 'Birthdays',
      occasion: 'Birthday',
      image: 'assets/images/occasion_birthdays.jpg',
      iconType: 'birthday',
      description: 'Cake, decor, photography and entertainment for birthdays. Post once and receive lower bids.',
    ),
  ];
}
