export interface ServiceCategory {
  id: string;
  name: string;
  tagline: string;
  startingPrice: string;
  iconName: string;
  badge?: string;
}

export interface OccasionItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  servicesIncluded: string[];
  gradient: string;
}

export interface LiveBidItem {
  id: string;
  providerName: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  originalBudget: number;
  bidAmount: number;
  savings: number;
  category: string;
  avatarText: string;
  avatarBg: string;
  bidTime: string;
}

export interface StepItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  highlight: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  location: string;
  rating: number;
  savedAmount: string;
  serviceType: string;
  avatar: string;
}

export interface TrustFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  stat: string;
}

export const SERVICES_DATA: ServiceCategory[] = [
  {
    id: 'dj-sound',
    name: 'DJ / Sound',
    tagline: 'Club-grade acoustics, JBL Line Arrays & Punjabi Dhol',
    startingPrice: '₹7,500',
    iconName: 'Speaker',
    badge: 'High Demand'
  },
  {
    id: 'catering',
    name: 'Catering',
    tagline: 'Multi-cuisine royal buffets, live counters & desserts',
    startingPrice: '₹350/plate',
    iconName: 'Utensils',
    badge: 'Popular'
  },
  {
    id: 'decoration',
    name: 'Decoration',
    tagline: 'Floral mandaps, neon backdrops, theme staging',
    startingPrice: '₹12,000',
    iconName: 'Sparkles',
    badge: 'Trending'
  },
  {
    id: 'photography',
    name: 'Photography',
    tagline: 'Cinematic 4K teaser reels, candid shots & drone coverage',
    startingPrice: '₹15,000',
    iconName: 'Camera',
    badge: 'Top Rated'
  },
  {
    id: 'mehendi',
    name: 'Mehendi',
    tagline: 'Bridal organic Rajasthani, Arabic & portrait artistry',
    startingPrice: '₹3,500',
    iconName: 'Palette'
  },
  {
    id: 'priest-purohit',
    name: 'Priest / Purohit',
    tagline: 'Vedic rituals, Griha Pravesh & Wedding ceremony experts',
    startingPrice: '₹4,100',
    iconName: 'Flame'
  },
  {
    id: 'lighting',
    name: 'Lighting',
    tagline: 'Fairy canopies, moving sharpies & ambient wash beams',
    startingPrice: '₹6,000',
    iconName: 'Lightbulb'
  },
  {
    id: 'performers',
    name: 'Performers',
    tagline: 'Sufi bands, illusionists, belly dancers & anchor MCs',
    startingPrice: '₹10,000',
    iconName: 'Mic2'
  },
  {
    id: 'tent-stage',
    name: 'Tent & Stage',
    tagline: 'Waterproof German hangars, velvet carpets & LED walls',
    startingPrice: '₹18,000',
    iconName: 'Tent'
  }
];

export const OCCASIONS_DATA: OccasionItem[] = [
  {
    id: 'weddings',
    title: 'Grand Weddings & Sangeet',
    subtitle: 'From Haldi setups to 7-course royal feasts and cinematic drone films.',
    badge: 'Wedding Season Special',
    servicesIncluded: ['Mandap Floral Decor', 'JBL Sound & DJ', 'Bridal Mehendi', '4K Teaser Film'],
    gradient: 'from-amber-900/80 via-black/70 to-slate-950/90'
  },
  {
    id: 'festivals',
    title: 'Festivals & Puja Ceremonies',
    subtitle: 'Vedic rituals, Ganesh Utsav stages, Dandiya sound & Navratri lighting.',
    badge: 'Sacred Rituals',
    servicesIncluded: ['Vedic Purohits', 'Puja Samagri & Decor', 'Bhakti Sound Setup', 'Prasad Catering'],
    gradient: 'from-orange-950/80 via-black/70 to-slate-950/90'
  },
  {
    id: 'corporate',
    title: 'Corporate Galas & Summits',
    subtitle: 'Seamless audio-visual staging, keynotes, luxury catering & executive hosts.',
    badge: 'B2B Certified',
    servicesIncluded: ['P2.6 LED Video Wall', 'Executive Luncheon', 'Corporate Emcee', 'Live Webcast'],
    gradient: 'from-blue-950/80 via-black/70 to-slate-950/90'
  },
  {
    id: 'private-parties',
    title: 'Private Parties & Birthdays',
    subtitle: 'Theme balloon art, mocktail bar stations, live acoustic bands & cake styling.',
    badge: 'Exclusive Vibes',
    servicesIncluded: ['Theme Backdrop', 'Live Mocktail Bar', 'Sound & Karaoke', 'Candid Reel Shoots'],
    gradient: 'from-rose-950/80 via-black/70 to-slate-950/90'
  }
];

export const LIVE_BIDS_INITIAL: LiveBidItem[] = [
  {
    id: 'bid-1',
    providerName: 'Royal Events & Staging',
    verified: true,
    rating: 4.9,
    reviewsCount: 320,
    originalBudget: 10000,
    bidAmount: 8500,
    savings: 1500,
    category: 'DJ & Sound System',
    avatarText: 'RE',
    avatarBg: 'bg-amber-600',
    bidTime: '2 mins ago'
  },
  {
    id: 'bid-2',
    providerName: 'Dream Decor Artistry',
    verified: true,
    rating: 4.8,
    reviewsCount: 186,
    originalBudget: 10000,
    bidAmount: 7900,
    savings: 2100,
    category: 'Floral Mandap Theme',
    avatarText: 'DD',
    avatarBg: 'bg-rose-600',
    bidTime: '4 mins ago'
  },
  {
    id: 'bid-3',
    providerName: 'Shree Sound & Lighting',
    verified: true,
    rating: 4.7,
    reviewsCount: 420,
    originalBudget: 10000,
    bidAmount: 9200,
    savings: 800,
    category: 'JBL 4-Bass Array',
    avatarText: 'SS',
    avatarBg: 'bg-indigo-600',
    bidTime: '7 mins ago'
  },
  {
    id: 'bid-4',
    providerName: 'Pixel Stories Cinematic',
    verified: true,
    rating: 4.9,
    reviewsCount: 265,
    originalBudget: 25000,
    bidAmount: 20500,
    savings: 4500,
    category: '4K Candid Film',
    avatarText: 'PS',
    avatarBg: 'bg-cyan-600',
    bidTime: '11 mins ago'
  }
];

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Post a Requirement',
    subtitle: 'Specify Date, Venue & Budget',
    description: 'Select your event service, set your target budget, and specify custom requirements in 60 seconds.',
    iconName: 'FileText',
    highlight: 'Takes < 1 minute'
  },
  {
    number: '02',
    title: 'Get Multiple Bids',
    subtitle: 'Verified Providers Compete',
    description: 'Local vetted professionals view your request and submit competing bids (must be ≥15% lower than your max budget).',
    iconName: 'TrendingDown',
    highlight: 'Guaranteed 15%+ lower'
  },
  {
    number: '03',
    title: 'Choose the Best',
    subtitle: 'Compare Reviews & Portfolios',
    description: 'Review real past work photos, customer star ratings, and transparent bids to pick your ideal partner.',
    iconName: 'CheckCircle2',
    highlight: '100% Verified Profiles'
  },
  {
    number: '04',
    title: 'Pay Securely',
    subtitle: 'EzGo Escrow Protection',
    description: 'Deposit payment into EzGo SafeLock. Money is held securely and only released when you mark the event complete.',
    iconName: 'ShieldCheck',
    highlight: 'Zero Advance Risk'
  },
  {
    number: '05',
    title: 'Enjoy Your Event',
    subtitle: 'Flawless Execution',
    description: 'Sit back and celebrate with your guests while verified top-rated professionals execute with precision.',
    iconName: 'Sparkles',
    highlight: 'Peace of Mind'
  }
];

export const TRUST_FEATURES: TrustFeature[] = [
  {
    id: 'trust-1',
    title: 'Verified Providers',
    subtitle: 'Identity & Skill Vetted',
    description: 'Every vendor undergoes strict background checks, past client reviews verification, and equipment inspection.',
    iconName: 'BadgeCheck',
    stat: '2,000+ Vetted'
  },
  {
    id: 'trust-2',
    title: 'Best Price Guarantee',
    subtitle: 'Reverse Bidding Advantage',
    description: 'Providers compete in real-time. Eligible bids must be at least 15% lower than standard offline quotes.',
    iconName: 'Percent',
    stat: 'Avg ₹4,500 Saved'
  },
  {
    id: 'trust-3',
    title: 'Secure Escrow Payments',
    subtitle: '100% Money Protection',
    description: 'Funds are securely locked until the service is delivered to your satisfaction. No surprise charges.',
    iconName: 'Lock',
    stat: '100% Protected'
  },
  {
    id: 'trust-4',
    title: 'Hassle-Free Events',
    subtitle: 'Dedicated Event Concierge',
    description: '24/7 on-call coordinator backup ensures zero no-shows and seamless on-ground coordination.',
    iconName: 'HeartHandshake',
    stat: '99.8% On-Time'
  }
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'test-1',
    quote: "Got an amazing 4K cinematic photographer at 30% less than my initial budget. The whole reverse-bidding process was effortless and transparent!",
    author: 'Priya Sharma',
    role: 'Bride',
    location: 'Jaipur / Delhi',
    rating: 5,
    savedAmount: 'Saved ₹8,500',
    serviceType: 'Wedding Photography',
    avatar: 'PS'
  },
  {
    id: 'test-2',
    quote: "As a sound & lighting vendor, EzGo gives me high-intent genuine client leads with zero middleman commissions. The escrow payouts are always on time.",
    author: 'Rahul Kapoor',
    role: 'Owner, Royal Acoustics',
    location: 'Mumbai',
    rating: 5,
    savedAmount: 'Top Provider',
    serviceType: 'Sound & DJ Vendor',
    avatar: 'RK'
  },
  {
    id: 'test-3',
    quote: "Used EzGo for my brother's Sangeet & Reception decor in Bangalore. Within 2 hours we had 5 top decor teams bidding. Flawless execution!",
    author: 'Sneha Mukhopadhyay',
    role: 'Event Host',
    location: 'Bangalore',
    rating: 5,
    savedAmount: 'Saved ₹14,200',
    serviceType: 'Reception Decoration',
    avatar: 'SM'
  }
];

export const COMPARISON_BIDS = [
  { provider: 'Royal Events Staging', rating: '4.9 ★', jobs: '320 jobs', bid: 22000, savings: 3000, best: false },
  { provider: 'Pixel Stories Studios', rating: '4.9 ★', jobs: '265 jobs', bid: 20500, savings: 4500, best: false },
  { provider: 'Dream Decor & Florals', rating: '4.8 ★', jobs: '186 jobs', bid: 21000, savings: 4000, best: false },
  { provider: 'Shree Sound & Stage', rating: '4.7 ★', jobs: '420 jobs', bid: 19500, savings: 5500, best: true }
];

export const STATS_DATA = [
  { value: '10K+', label: 'Happy Event Hosts', sublabel: 'Across 18+ Indian cities' },
  { value: '2K+', label: 'Verified Providers', sublabel: 'Background vetted & tested' },
  { value: '4.8/5', label: 'Average Rating', sublabel: 'From 35,000+ client reviews' },
  { value: '50K+', label: 'Successful Bookings', sublabel: '100% Escrow protected' }
];
