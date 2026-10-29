export type OccasionItem = {
  name: string;
  occasion: string;
  image: string;
  iconType: 'rings' | 'lotus' | 'corporate' | 'party' | 'birthday';
};

export type EventServiceItem = {
  id: string;
  title: string;
  shortName: string;
  filterKey: string;
  description: string;
  priceRange: string;
  priceFrom: string;
  image: string;
  accent: string;
};

export const APP_OCCASIONS: OccasionItem[] = [
  { name: 'Weddings', occasion: 'Wedding', image: '/occasion_weddings.jpg', iconType: 'rings' },
  { name: 'Festivals', occasion: 'Festivals', image: '/occasion_festivals.jpg', iconType: 'lotus' },
  { name: 'Corporate Events', occasion: 'Corporate', image: '/occasion_corporate.jpg', iconType: 'corporate' },
  { name: 'Private Parties', occasion: 'Private Parties', image: '/occasion_parties.jpg', iconType: 'party' },
  { name: 'Birthdays', occasion: 'Birthday', image: '/occasion_birthdays.jpg', iconType: 'birthday' },
];

export const APP_EVENT_SERVICES: EventServiceItem[] = [
  {
    id: 'dj-sound',
    title: 'DJ & Sound Systems',
    shortName: 'DJ / Sound',
    filterKey: 'dj',
    description: 'Line arrays, DJ consoles, wireless mics for sangeet, receptions and college fests.',
    priceRange: '₹12,000 - ₹45,000',
    priceFrom: 'From ₹12,000',
    image: '/occasion_festivals.jpg',
    accent: '#7C3AED',
  },
  {
    id: 'decoration',
    title: 'Stage & Mandap Decoration',
    shortName: 'Decoration',
    filterKey: 'decor',
    description: 'Floral mandaps, entrance arches, fairy-light canopies and theme stage backdrops.',
    priceRange: '₹15,000 - ₹1,20,000',
    priceFrom: 'From ₹15,000',
    image: '/occasion_weddings.jpg',
    accent: '#E11D48',
  },
  {
    id: 'photography',
    title: 'Photography & 4K Film',
    shortName: 'Photography',
    filterKey: 'photography',
    description: 'Candid coverage, cinematic films, drone aerials and traditional albums.',
    priceRange: '₹12,000 - ₹65,000',
    priceFrom: 'From ₹12,000',
    image: '/occasion_parties.jpg',
    accent: '#2563EB',
  },
  {
    id: 'catering',
    title: 'Catering Buffets',
    shortName: 'Catering',
    filterKey: 'catering',
    description: 'Multi-cuisine live counters, traditional thalis and premium chaat stalls.',
    priceRange: '₹350 - ₹1,200 / plate',
    priceFrom: 'From ₹350 / plate',
    image: '/service_catering.jpg',
    accent: '#DC2626',
  },
  {
    id: 'lighting',
    title: 'Lighting & Trussing',
    shortName: 'Lighting',
    filterKey: 'lighting',
    description: 'Moving heads, LED pars, truss grids and outdoor garden illumination.',
    priceRange: '₹8,000 - ₹50,000',
    priceFrom: 'From ₹8,000',
    image: '/occasion_festivals.jpg',
    accent: '#D97706',
  },
  {
    id: 'purohit',
    title: 'Purohit & Priest Services',
    shortName: 'Priest',
    filterKey: 'priest',
    description: 'Vedic rituals, Griha Pravesh, Satyanarayana Puja and wedding ceremonies.',
    priceRange: '₹3,500 - ₹15,000',
    priceFrom: 'From ₹3,500',
    image: '/occasion_corporate.jpg',
    accent: '#B45309',
  },
  {
    id: 'mehendi',
    title: 'Bridal Mehendi',
    shortName: 'Mehendi',
    filterKey: 'mehendi',
    description: 'Organic bridal henna, guest counters and Arabic designer patterns.',
    priceRange: '₹5,000 - ₹25,000',
    priceFrom: 'From ₹5,000',
    image: '/occasion_festivals.jpg',
    accent: '#059669',
  },
  {
    id: 'makeup',
    title: 'Makeup Artist',
    shortName: 'Makeup',
    filterKey: 'makeup',
    description: 'Bridal and party HD glam makeup with airbrush styling.',
    priceRange: '₹5,000 - ₹25,000',
    priceFrom: 'From ₹5,000',
    image: '/occasion_birthdays.jpg',
    accent: '#DB2777',
  },
];

export const SERVICE_FILTERS = ['All', 'Sound & DJ', 'Decor', 'Photography', 'Catering', 'Lighting'];

export function filterEventServices(category: string, query = '') {
  const q = query.trim().toLowerCase();
  return APP_EVENT_SERVICES.filter((s) => {
    const matchesQuery =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.shortName.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (category === 'All') return true;
    const n = `${s.title} ${s.shortName} ${s.filterKey}`.toLowerCase();
    if (category === 'Sound & DJ') return n.includes('dj') || n.includes('sound');
    if (category === 'Decor') return n.includes('decor') || n.includes('mandap');
    if (category === 'Photography') return n.includes('photo') || n.includes('film') || n.includes('drone');
    if (category === 'Catering') return n.includes('cater') || n.includes('food');
    if (category === 'Lighting') return n.includes('light') || n.includes('tent') || n.includes('truss');
    return s.filterKey === category.toLowerCase();
  });
}

export const SERVICE_COVERS: Record<string, string[]> = {
  dj: ['DJ console and mixer', 'Speakers, mics and on-site tech', 'Sangeet, reception or party sets'],
  decor: ['Mandap, stage or entrance decor', 'Fresh flowers and lighting accents', 'Setup and teardown on your date'],
  photography: ['Candid photos and 4K film', 'Drone shots where allowed', 'Edited album after the event'],
  catering: ['Menu planned to your guest count', 'Live counters or plated service', 'Staff, crockery and cleanup'],
  lighting: ['Stage and floor lighting', 'Truss and LED fixtures', 'Technician for the full event'],
  priest: ['Vedic rituals for your occasion', 'Puja samagri guidance', 'On-time arrival at your venue'],
  mehendi: ['Bridal and guest henna', 'Organic cones', 'Arabic or traditional designs'],
  makeup: ['HD / airbrush makeup', 'Hair and draping add-ons', 'Trial on request'],
  tent: ['Shamiana or hangar tent', 'Stage, chairs and carpet', 'Install before guests arrive'],
};

export function getEventService(id?: string | null) {
  if (!id) return undefined;
  return APP_EVENT_SERVICES.find((s) => s.id === id);
}
