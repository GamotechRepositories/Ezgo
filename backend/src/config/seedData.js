import Category from '../models/Category.js';
import User from '../models/User.js';
import Requirement from '../models/Requirement.js';
import Bid from '../models/Bid.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';

export const seedDatabase = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log('⚡ Database already seeded or populated.');
      return;
    }

    console.log(' Seeding initial EzGo marketplace data...');

    // 1. Initial Categories
    const categoriesData = [
      { name: 'DJ / Teenmar / Sound & Lighting', slug: 'dj-sound-lighting', icon: 'Volume2', avgPriceRange: '₹8,000 - ₹35,000' },
      { name: 'Catering', slug: 'catering', icon: 'Utensils', avgPriceRange: '₹15,000 - ₹1,50,000' },
      { name: 'Decoration', slug: 'decoration', icon: 'Sparkles', avgPriceRange: '₹10,000 - ₹75,000' },
      { name: 'Lighting', slug: 'lighting', icon: 'Lightbulb', avgPriceRange: '₹5,000 - ₹25,000' },
      { name: 'Purohit / Priest services', slug: 'purohit-priest', icon: 'Flame', avgPriceRange: '₹3,500 - ₹15,000' },
      { name: 'Dancers / Performers', slug: 'dancers-performers', icon: 'Music', avgPriceRange: '₹12,000 - ₹45,000' },
      { name: 'Photography & Videography', slug: 'photography-videography', icon: 'Camera', avgPriceRange: '₹15,000 - ₹80,000' },
      { name: 'Mehendi', slug: 'mehendi', icon: 'Heart', avgPriceRange: '₹4,000 - ₹20,000' },
      { name: 'Tent & Stage setup', slug: 'tent-stage', icon: 'Tent', avgPriceRange: '₹15,000 - ₹60,000' },
      { name: 'Wedding planning (full-service)', slug: 'wedding-planning', icon: 'Crown', avgPriceRange: '₹50,000 - ₹3,00,000' },
      { name: 'Festival-specific event setup', slug: 'festival-setup', icon: 'Sun', avgPriceRange: '₹8,000 - ₹40,000' },
    ];
    await Category.insertMany(categoriesData);

    // 2. Demo Users
    const requester = await User.create({
      name: 'Ananya Sharma',
      phone: '+91 98765 43210',
      email: 'ananya@ezgo.in',
      role: 'requester',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const provider1 = await User.create({
      name: 'Rajesh Pro Events & DJ',
      businessName: 'Rajesh Sound & Teenmar Beats',
      phone: '+91 91234 56789',
      email: 'rajesh@events.in',
      role: 'provider',
      categories: ['DJ / Teenmar / Sound & Lighting', 'Lighting'],
      serviceArea: 'Hyderabad (Madhapur, Gachibowli, Jubilee Hills)',
      rating: 4.9,
      reviewCount: 42,
      completedJobs: 45,
      isVerified: true,
      bankDetails: {
        accountHolder: 'Rajesh Sound & Beats',
        accountNumber: '••••••••8921',
        ifscCode: 'HDFC0001234',
        upiId: 'rajesh.events@okaxis',
        isKycCompleted: true,
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const provider2 = await User.create({
      name: 'Sri Krishna Decors',
      businessName: 'Sri Krishna Floral & Stage Design',
      phone: '+91 98111 22334',
      email: 'krishna@decors.in',
      role: 'provider',
      categories: ['Decoration', 'Tent & Stage setup'],
      serviceArea: 'Hyderabad (Secunderabad, Kukatpally, Miyapur)',
      rating: 4.8,
      reviewCount: 29,
      completedJobs: 33,
      isVerified: true,
      bankDetails: {
        accountHolder: 'Sri Krishna Decors',
        accountNumber: '••••••••4512',
        ifscCode: 'SBIN0005432',
        upiId: 'krishna.decors@okhdfcbank',
        isKycCompleted: true,
      },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    const provider3 = await User.create({
      name: 'Vedic Purohit Sangam',
      businessName: 'Pandit Sharma & Vedic Rituals',
      phone: '+91 94444 55555',
      email: 'pandit@vedic.in',
      role: 'provider',
      categories: ['Purohit / Priest services'],
      serviceArea: 'Hyderabad (All Zones)',
      rating: 5.0,
      reviewCount: 56,
      completedJobs: 60,
      isVerified: true,
      bankDetails: {
        accountHolder: 'Pandit Sharma',
        accountNumber: '••••••••1123',
        ifscCode: 'ICIC0009988',
        upiId: 'pandit.rituals@oksbi',
        isKycCompleted: true,
      },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    });

    const admin = await User.create({
      name: 'EzGo Operations Lead',
      phone: '+91 90000 00001',
      email: 'admin@ezgo.in',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    });

    // 3. Sample Open Requirements
    const req1 = await Requirement.create({
      requesterId: requester._id,
      category: 'DJ / Teenmar / Sound & Lighting',
      title: 'Sangeet Night DJ & High-Bass Sound Setup',
      description: 'Need a top-tier DJ with Punjabi + Telugu wedding mixes, moving head lights, smoke machine, and wireless mics for 250 guests.',
      location: {
        city: 'Hyderabad',
        area: 'Gachibowli',
        venueAddress: 'Fort Grand Convention Hall, Financial District',
      },
      eventDate: '2026-10-15',
      timeWindow: { start: '19:00', end: '23:30' },
      budget: 18000,
      guestCount: 250,
      status: 'OPEN',
    });

    const req2 = await Requirement.create({
      requesterId: requester._id,
      category: 'Decoration',
      title: 'Traditional Marigold & Brass Decor for Ganesh Puja',
      description: 'Looking for authentic South Indian style backdrop with fresh marigolds, banana trunks, brass lamps, and hanging bell elements.',
      location: {
        city: 'Hyderabad',
        area: 'Jubilee Hills',
        venueAddress: 'Road No 36, Private Villa',
      },
      eventDate: '2026-10-20',
      timeWindow: { start: '08:00', end: '14:00' },
      budget: 12000,
      guestCount: 80,
      status: 'OPEN',
    });

    // 4. Sample Bids on req1 (demonstrating both eligible and ineligible bids for 15% rule)
    // Budget: 18000 -> Max acceptable (15% discount): 15300
    await Bid.create({
      requirementId: req1._id,
      providerId: provider1._id,
      amount: 14500, // ~19.4% discount -> ELIGIBLE
      proposalNotes: 'Includes full JBL line-array audio, 4 moving heads, DJ booth, fog effect, and 4 hours live performance.',
      equipmentDetails: 'JBL VRX Line Array + Pioneer DDJ-1000 + 4 Beam 230 Lights',
      discountPercent: 19,
      isEligibleForAccept: true,
      status: 'PENDING',
    });

    await Bid.create({
      requirementId: req1._id,
      providerId: provider2._id,
      amount: 16500, // only 8.3% discount -> INELIGIBLE (< 15%)
      proposalNotes: 'Basic sound setup with dual 15-inch active speakers and 2 par lights.',
      equipmentDetails: 'Yamaha DXR15 + Basic DJ controller',
      discountPercent: 8,
      isEligibleForAccept: false,
      status: 'PENDING',
    });

    req1.bidsCount = 2;
    req1.lowestBid = 14500;
    await req1.save();

    console.log(' EzGo database successfully seeded with live marketplace data!');
  } catch (error) {
    console.error('⚠️ Seeding error:', error.message);
  }
};
