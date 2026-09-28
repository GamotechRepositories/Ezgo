export interface CircularCategoryItem {
  id: string;
  name: string;
  image: string;
}

export interface OccasionCardItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  iconType: 'rings' | 'lotus' | 'corporate' | 'party' | 'birthday';
}

export const OCCASION_CARDS: OccasionCardItem[] = [
  {
    id: 'occ-weddings',
    name: 'Weddings',
    slug: 'weddings',
    image: '/occasion_weddings.jpg',
    iconType: 'rings',
  },
  {
    id: 'occ-festivals',
    name: 'Festivals',
    slug: 'festivals',
    image: '/occasion_festivals.jpg',
    iconType: 'lotus',
  },
  {
    id: 'occ-corporate',
    name: 'Corporate Events',
    slug: 'corporate-events',
    image: '/occasion_corporate.jpg',
    iconType: 'corporate',
  },
  {
    id: 'occ-parties',
    name: 'Private Parties',
    slug: 'private-parties',
    image: '/occasion_parties.jpg',
    iconType: 'party',
  },
  {
    id: 'occ-birthdays',
    name: 'Birthdays',
    slug: 'birthdays',
    image: '/occasion_birthdays.jpg',
    iconType: 'birthday',
  },
];

export const POPULAR_CIRCLE_CATEGORIES: CircularCategoryItem[] = [
  {
    id: 'dj-sound',
    name: 'DJ / Sound',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'catering',
    name: 'Catering',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'decoration',
    name: 'Decoration',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'photography',
    name: 'Photography',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'mehendi',
    name: 'Mehendi',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'purohit',
    name: 'Priest / Purohit',
    image: 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'lighting',
    name: 'Lighting',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'performers',
    name: 'Performers',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'tent-stage',
    name: 'Tent & Stage',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&auto=format&fit=crop&q=80',
  },
];

export interface EventCategoryData {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  tagline: string;
  description: string;
  avgPriceRange: string;
  typicalSavings: string;
  verifiedVendorsCount: number;
  popularServices: string[];
  sampleEquipments: string[];
}

export const EVENT_CATEGORIES: EventCategoryData[] = [
  {
    id: 'cat-1',
    name: 'DJ / Teenmar / Sound & Lighting',
    slug: 'dj-sound',
    iconName: 'Volume2',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    tagline: 'High-energy DJ setups, line arrays & intelligent lighting',
    description: 'Pioneer DJ consoles, JBL/RCF line arrays, moving head beam lights, haze & smoke machines, wireless mics for Sangeet, Cocktails & Receptions.',
    avgPriceRange: '₹12,000 - ₹45,000',
    typicalSavings: '₹3,000 - ₹9,500',
    verifiedVendorsCount: 48,
    popularServices: ['Sangeet DJ Night', 'Wedding Reception Sound', 'Teenmar Dhol Beats', 'College Fest Sound Stage'],
    sampleEquipments: ['JBL VRX Line Array', 'Pioneer DDJ-1000', 'Beam 230W Moving Heads', 'Smoke & Cold Pyro Machines', 'Shure Wireless Mics']
  },
  {
    id: 'cat-2',
    name: 'Decoration & Stage Design',
    slug: 'decoration',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    tagline: 'Floral mandaps, grand entrance arches & theme stages',
    description: 'Exquisite fresh floral setups, luxury velvet draping, fairytale fairy light canopies, photo booth backdrops and bridal stage designs.',
    avgPriceRange: '₹20,000 - ₹1,20,000',
    typicalSavings: '₹5,000 - ₹25,000',
    verifiedVendorsCount: 64,
    popularServices: ['Mandap Floral Decor', 'Reception Grand Stage', 'Haldi / Mehendi Yellow Canopy', 'Birthday Theme Backdrop'],
    sampleEquipments: ['Imported Dutch Flowers', 'Brass Urli & Diya Stands', 'Fairy Light Tunnel', 'Custom Acrylic Monograms', 'LED Neon Signage']
  },
  {
    id: 'cat-3',
    name: 'Photography & 4K Cinematography',
    slug: 'photography',
    iconName: 'Camera',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80',
    tagline: 'Candid wedding moments, cinematic films & 4K drones',
    description: 'Award-winning candid photographers and cinematographers capturing emotions, pre-wedding teasers, live 4K LED streaming & drone aerials.',
    avgPriceRange: '₹25,000 - ₹1,50,000',
    typicalSavings: '₹6,000 - ₹35,000',
    verifiedVendorsCount: 52,
    popularServices: ['Candid Wedding Photography', 'Cinematic Wedding Film', '4K Drone Aerial Coverage', 'Traditional Full Event Album'],
    sampleEquipments: ['Sony FX3 / A7 IV Cameras', 'DJI Mavic 3 Cine Drone', 'G Master Prime Lenses', 'Gimbal Stabilizers', 'Live LED Video Switcher']
  },
  {
    id: 'cat-4',
    name: 'Catering & Live Food Counters',
    slug: 'catering',
    iconName: 'Utensils',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
    tagline: 'Authentic multi-cuisine buffets & live gourmet stalls',
    description: 'Hyderabadi Dum Biryani, South Indian Royal Thali, North Indian delicacies, live Chaat & Dosa counters, mocktail bars and artisanal desserts.',
    avgPriceRange: '₹450 - ₹1,400 per plate',
    typicalSavings: '15% - 22% total bill',
    verifiedVendorsCount: 41,
    popularServices: ['Grand Wedding Buffet', 'Corporate Lunch Catering', 'Live Chaat & Pasta Station', 'Cocktail Appetizer Platters'],
    sampleEquipments: ['Stainless Steel Chafing Dishes', 'Live BBQ & Tandoor Setup', 'Artisanal Mocktail Bar', 'Uniformed Waitstaff & Captains']
  },
  {
    id: 'cat-5',
    name: 'Lighting & Stage Trussing',
    slug: 'lighting',
    iconName: 'Lightbulb',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    tagline: 'Architectural building wash, LED pars & laser matrix',
    description: 'Turn any venue into a magical spectacle with high-lumen floodlights, serial fairy light trees, ambient warm mood lighting and stage trusses.',
    avgPriceRange: '₹8,000 - ₹35,000',
    typicalSavings: '₹2,000 - ₹7,500',
    verifiedVendorsCount: 36,
    popularServices: ['Building Serial Lighting', 'Warm Amber Mood Wash', 'Laser & Strobes for Dance Floor', 'Outdoor Garden Tree Illumination'],
    sampleEquipments: ['LED Par 64 RGBW', 'Sharpy 7R Beams', 'DMX Lighting Controller', 'Waterproof Outdoor LED Strings']
  },
  {
    id: 'cat-6',
    name: 'Purohit & Vedic Ritual Services',
    slug: 'purohit',
    iconName: 'Flame',
    image: 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=800&auto=format&fit=crop&q=80',
    tagline: 'Experienced Vedic priests for auspicious ceremonies',
    description: 'Certified Vedic pandits and purohits fluent in Telugu, Hindi, Tamil & Kannada for Griha Pravesh, Satyanarayana Vratam, Weddings & Namakaranam.',
    avgPriceRange: '₹5,000 - ₹20,000',
    typicalSavings: '₹1,500 - ₹4,500',
    verifiedVendorsCount: 29,
    popularServices: ['Griha Pravesh (House Warming)', 'Satyanarayana Swamy Vratam', 'Lagna Patrika & Wedding Rituals', 'Ganapathi & Navagraha Homam'],
    sampleEquipments: ['Complete Puja Samagri Kit', 'Copper Havan Kund', 'Sacred Mantras & Vidhi Guidelines']
  },
  {
    id: 'cat-7',
    name: 'Bridal Mehendi & Henna Art',
    slug: 'mehendi',
    iconName: 'Heart',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    tagline: 'Organic dark-stain bridal & guest henna designs',
    description: 'Master artists crafting intricate Rajasthani, Arabic, Indo-Western and portrait Mehendi using 100% pure organic chemical-free henna paste.',
    avgPriceRange: '₹5,000 - ₹25,000',
    typicalSavings: '₹1,500 - ₹5,000',
    verifiedVendorsCount: 33,
    popularServices: ['Bridal Full Arm & Feet Mehendi', 'Sangeet Guest Mehendi Counter', 'Arabic Designer Henna', 'Groom Minimalist Mehendi'],
    sampleEquipments: ['100% Organic Sojat Henna Cones', 'Eucalyptus Aftercare Essential Oils', 'Custom Portrait Stencils']
  },
  {
    id: 'cat-8',
    name: 'Tent, Shamiana & VIP Stage Seating',
    slug: 'tent-stage',
    iconName: 'Tent',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
    tagline: 'Waterproof German hangars, shamiana & VIP lounge sofas',
    description: 'Weatherproof German pagodas, luxury round tables with linen, velvet Maharaja chairs, carpeting and heavy-duty event stage platforms.',
    avgPriceRange: '₹15,000 - ₹75,000',
    typicalSavings: '₹4,000 - ₹18,000',
    verifiedVendorsCount: 27,
    popularServices: ['German Hangar Pagoda Tents', 'VIP Banquet Tables & Chiavari Chairs', 'Raised Wooden Stage Truss', 'Red Carpet VIP Entrance'],
    sampleEquipments: ['Aluminum Frame Hangar', 'Chiavari Golden Chairs', 'Duchess Round Tables', 'Heavy Duty Hydraulic Stage']
  }
];

export const TESTIMONIALS = [
  {
    name: 'Sneha & Karthik Reddy',
    occasion: 'Sangeet & Reception',
    location: 'Gachibowli, Hyderabad',
    savedAmount: '₹8,500 Saved',
    quote: 'We set a ₹35,000 budget for our Sangeet DJ setup. 3 providers placed bids and we locked in a top-rated DJ with full truss lights for ₹26,500! Escrow gave us complete peace of mind.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    cardImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    name: 'Vikram Malhotra',
    occasion: 'Corporate Annual Gala',
    location: 'Hitec City, Hyderabad',
    savedAmount: '₹14,000 Saved',
    quote: 'The 15% guaranteed savings rule is revolutionary. We got a 4K drone cinematography team that delivered Hollywood-grade video below our budget ceiling. Zero commission hassle!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    cardImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=80',
    verified: true
  },
  {
    name: 'Pooja Iyer',
    occasion: 'Griha Pravesh Puja',
    location: 'Madhapur, Hyderabad',
    savedAmount: '₹3,200 Saved',
    quote: 'Finding a reliable Vedic Purohit in Hyderabad was so simple. The pandit arrived right on time with all authentic samagri. The phone number was revealed instantly once escrow was funded.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    cardImage: 'https://images.unsplash.com/photo-1609137144822-26f6eb8b973c?w=500&auto=format&fit=crop&q=80',
    verified: true
  }
];

export const FAQS = [
  {
    question: 'How does the EzGo 15% Minimum Discount rule benefit me?',
    answer: 'When you post your event requirement, you specify your budget. Providers can ONLY submit bids that are at least 15% lower than your budget ceiling. This guarantees you real savings on every confirmed booking compared to traditional offline negotiations.'
  },
  {
    question: 'How is my money protected with Escrow?',
    answer: 'When you accept an eligible bid, your payment (bid amount + 10% platform fee) is deposited into an RBI-compliant Escrow account. The provider does NOT receive the payout until you inspect the service at your event and mark the job as Completed.'
  },
  {
    question: 'When will I get the service provider\'s phone number and direct contact?',
    answer: 'To prevent disintermediation and protect both parties, vendor phone numbers and direct chat are unmasked instantly as soon as you accept the bid and fund the escrow.'
  },
  {
    question: 'What if a provider fails to show up or cancels last minute?',
    answer: 'Your escrow payment is 100% refundable. Furthermore, EzGo\'s Emergency Provider Dispatch matches you with an instant standby verified provider in your city at no extra surcharge.'
  },
  {
    question: 'Do providers pay any hidden commission on EzGo?',
    answer: 'None! Providers receive 100% of their quoted bid amount upon completion. EzGo charges zero commission to vendors, which encourages top-quality pros to give you the most aggressive competitive rates.'
  }
];
