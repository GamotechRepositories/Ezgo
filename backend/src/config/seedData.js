import Category from '../models/Category.js';
import User from '../models/User.js';
import Requirement from '../models/Requirement.js';
import Bid from '../models/Bid.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import Item from '../models/Item.js';

export const seedDatabase = async (forceReset = false) => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0 && !forceReset) {
      console.log('⚡ Database already contains seeded data.');
      return;
    }

    console.log('🚀 Seeding EzGo dynamic database on MongoDB Atlas...');

    // Clear old data if forceReset is requested
    if (forceReset) {
      await Promise.all([
        Category.deleteMany({}),
        User.deleteMany({}),
        Requirement.deleteMany({}),
        Bid.deleteMany({}),
        Booking.deleteMany({}),
        Transaction.deleteMany({}),
        Item.deleteMany({}),
      ]);
    }

    // 1. Service Categories Catalog
    const categoriesData = [
      {
        name: 'DJ & Sound Systems',
        slug: 'dj-sound',
        icon: 'Speaker',
        description: 'Line arrays, active tops, dual subwoofers, Pioneer DDJ consoles, wireless mics',
        avgPriceRange: '₹8,000 - ₹45,000',
        isActive: true,
      },
      {
        name: 'Stage & Mandap Decoration',
        slug: 'decor',
        icon: 'Sparkles',
        description: 'Custom flower arches, fairy light canopies, royal wedding mandap backdrops',
        avgPriceRange: '₹15,000 - ₹1,20,000',
        isActive: true,
      },
      {
        name: '4K Photography & Drone',
        slug: 'photography',
        icon: 'Camera',
        description: 'Cinematic 4K coverage, drone flybys, live stream mix, gimbal video rigs',
        avgPriceRange: '₹12,000 - ₹65,000',
        isActive: true,
      },
      {
        name: 'Catering Buffets',
        slug: 'catering',
        icon: 'Utensils',
        description: 'Multi-cuisine live counters, traditional thalis, premium chaat stalls',
        avgPriceRange: '₹350 - ₹1,200 / plate',
        isActive: true,
      },
      {
        name: 'Lighting & Trussing',
        slug: 'lighting',
        icon: 'Zap',
        description: 'Sharpy moving heads, LED par cans, aluminum box truss grids, fog machines',
        avgPriceRange: '₹10,000 - ₹50,000',
        isActive: true,
      },
      {
        name: 'Purohit & Priest Services',
        slug: 'purohit',
        icon: 'Flame',
        description: 'Vedic rituals, Griha Pravesh, Satyanarayana Puja & traditional Weddings',
        avgPriceRange: '₹3,500 - ₹15,000',
        isActive: true,
      },
      {
        name: 'Bridal Mehendi & Makeup',
        slug: 'mehendi-makeup',
        icon: 'Heart',
        description: 'Organic bridal Rajasthani Mehendi artists & HD airbrush makeup',
        avgPriceRange: '₹5,000 - ₹25,000',
        isActive: true,
      },
      {
        name: 'Tent & Stage Setup',
        slug: 'tent-stage',
        icon: 'Tent',
        description: 'German shamiana tents, VIP lounge chairs, stage risers & masking',
        avgPriceRange: '₹15,000 - ₹60,000',
        isActive: true,
      },
    ];
    await Category.insertMany(categoriesData);

    // 2. Users (Requesters, Providers, Admin)
    const host1 = await User.create({
      name: 'Ananya Sharma',
      phone: '+91 98765 43210',
      email: 'ananya.sharma@ezgoevents.in',
      role: 'requester',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const host2 = await User.create({
      name: 'Pooja Deshmukh',
      phone: '+91 98901 12345',
      email: 'pooja.d@gmail.com',
      role: 'requester',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    });

    const host3 = await User.create({
      name: 'Amitabh Sen',
      phone: '+91 98230 11223',
      email: 'amitabh.sen@techcorp.in',
      role: 'requester',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    const vendor1 = await User.create({
      name: 'Rajesh Sound & FX Pro',
      businessName: 'Rajesh Pro Audio & Lightings',
      phone: '+91 98231 45678',
      email: 'rajesh@punesoundpros.in',
      role: 'provider',
      categories: ['DJ & Sound Systems', 'Lighting & Trussing'],
      serviceArea: 'Pune, MH',
      rating: 4.9,
      reviewCount: 42,
      completedJobs: 58,
      isVerified: true,
      bankDetails: {
        accountHolder: 'Rajesh Pro Audio LLP',
        accountNumber: '••••••••9812',
        ifscCode: 'HDFC0001234',
        upiId: 'rajeshsound@okhdfc',
        isKycCompleted: true,
      },
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    });

    const vendor2 = await User.create({
      name: 'BeatDrop Audio Works',
      businessName: 'BeatDrop Audio Works',
      phone: '+91 97654 32100',
      email: 'contact@beatdrop.in',
      role: 'provider',
      categories: ['DJ & Sound Systems', '4K Photography & Drone'],
      serviceArea: 'Pune, MH',
      rating: 4.8,
      reviewCount: 31,
      completedJobs: 39,
      isVerified: true,
      bankDetails: {
        accountHolder: 'BeatDrop Audio Works',
        accountNumber: '••••••••1123',
        ifscCode: 'ICIC0002345',
        upiId: 'beatdrop@okaxis',
        isKycCompleted: true,
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const vendor3 = await User.create({
      name: 'Swara Mandap & Floral Decorators',
      businessName: 'Swara Events & Decor',
      phone: '+91 98877 66554',
      email: 'swara@decorpune.com',
      role: 'provider',
      categories: ['Stage & Mandap Decoration'],
      serviceArea: 'Pune, MH',
      rating: 4.6,
      reviewCount: 18,
      completedJobs: 22,
      isVerified: false,
      bankDetails: {
        accountHolder: 'Swara Decor Works',
        accountNumber: '••••••••4490',
        ifscCode: 'SBIN0005678',
        upiId: 'swaradecor@oksbi',
        isKycCompleted: false,
      },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const admin = await User.create({
      name: 'EzGo Operations Desk',
      phone: '+91 90000 00001',
      email: 'ops@ezgoevents.in',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    // 3. Live Requirements
    const req1 = await Requirement.create({
      requesterId: host2._id,
      category: 'DJ & Sound Systems',
      title: 'Sangeet Night Pro Sound & Intelligent Moving Lights',
      description: 'Need a punchy sound setup for 350 guests with 4 dual subwoofers, 2 wireless shure mics, and moving sharpies.',
      location: {
        city: 'Pune',
        area: 'Baner',
        venueAddress: 'The Orchid Banquets, Baner Link Road',
      },
      eventDate: '2026-10-15',
      timeWindow: { start: '18:00', end: '23:30' },
      guestCount: 350,
      budget: 35000,
      maxAcceptableBid: 29750, // 85% of budget
      status: 'OPEN',
      bidsCount: 2,
      lowestBid: 26000,
    });

    const req2 = await Requirement.create({
      requesterId: host1._id,
      category: 'Stage & Mandap Decoration',
      title: 'Modern Floral Backdrop with Fairy Light Canopy for Reception',
      description: 'Pastel artificial + real hydrangeas decoration with brass lamps and royal couple sofa seating.',
      location: {
        city: 'Pune',
        area: 'Koregaon Park',
        venueAddress: 'Mahalaxmi Lawns, North Main Road',
      },
      eventDate: '2026-10-22',
      timeWindow: { start: '16:00', end: '23:00' },
      guestCount: 500,
      budget: 85000,
      maxAcceptableBid: 72250,
      status: 'OPEN',
      bidsCount: 1,
      lowestBid: 68000,
    });

    const req3 = await Requirement.create({
      requesterId: host1._id,
      category: '4K Photography & Drone',
      title: 'Full Day Traditional Wedding & Reception 4K Drone Coverage',
      description: 'Need 2 Candid Photographers, 1 Traditional Videographer, and 1 4K Drone Operator with live feed.',
      location: {
        city: 'Pune',
        area: 'Kothrud',
        venueAddress: 'Shubharambh Lawns, DP Road',
      },
      eventDate: '2026-11-04',
      timeWindow: { start: '07:00', end: '22:00' },
      guestCount: 600,
      budget: 60000,
      maxAcceptableBid: 51000,
      status: 'OPEN',
      bidsCount: 0,
    });

    // 4. Bids on Requirements
    const bid1 = await Bid.create({
      requirementId: req1._id,
      providerId: vendor1._id,
      amount: 28000, // 20% discount -> ELIGIBLE
      proposalNotes: 'Includes JBL VRX line array tops, dual 18" subwoofers, 4 Sharpies, fog effect & dedicated audio engineer for 6 hours.',
      equipmentDetails: 'JBL VRX932LA + 2x JBL SRX828S Subs + Pioneer DDJ-1000 + 4x Beam 230 Sharpies',
      discountPercent: 20,
      isEligibleForAccept: true,
      status: 'PENDING',
    });

    const bid2 = await Bid.create({
      requirementId: req1._id,
      providerId: vendor2._id,
      amount: 26000, // 25.7% discount -> ELIGIBLE
      proposalNotes: 'Best rate in Pune. RCF active sound setup + smoke machine and Shure wireless microphones included.',
      equipmentDetails: 'RCF ART 745A Tops + 2x 18" Active Subs + Shure BLX288/PG58',
      discountPercent: 25.7,
      isEligibleForAccept: true,
      status: 'PENDING',
    });

    const bid3 = await Bid.create({
      requirementId: req2._id,
      providerId: vendor3._id,
      amount: 68000, // 20% discount -> ELIGIBLE
      proposalNotes: 'Includes 30ft Stage Truss Backdrop, real flower arch with carnations/orchids, royal sofa, and warm fairy canopy.',
      equipmentDetails: 'Aluminum Box Truss 30x12ft + 500m Fairy Lights + Brass Diya Stands',
      discountPercent: 20,
      isEligibleForAccept: true,
      status: 'PENDING',
    });

    // 5. Booking 1: ACTIVE in Escrow
    const reqWon1 = await Requirement.create({
      requesterId: host3._id,
      category: 'DJ & Sound Systems',
      title: 'Corporate Annual Gala Sound & Lighting',
      description: 'Stage audio, speech mics, and ambient uplighting for 200 tech delegates.',
      location: {
        city: 'Pune',
        area: 'Hinjawadi',
        venueAddress: 'Radisson Blu Ballroom, Hinjawadi Phase 1',
      },
      eventDate: '2026-10-08',
      timeWindow: { start: '17:30', end: '22:30' },
      guestCount: 200,
      budget: 30000,
      maxAcceptableBid: 25500,
      status: 'ACTIVE',
      bidsCount: 3,
      lowestBid: 24000,
    });

    const bidWon1 = await Bid.create({
      requirementId: reqWon1._id,
      providerId: vendor1._id,
      amount: 24000,
      proposalNotes: 'High-clarity speech sound with Shure wireless mics and 8 LED pars.',
      equipmentDetails: 'JBL tops + Shure dual mics + 8x LED Par 64',
      discountPercent: 20,
      isEligibleForAccept: true,
      status: 'ACCEPTED',
    });

    const bookingActive = await Booking.create({
      requirementId: reqWon1._id,
      bidId: bidWon1._id,
      requesterId: host3._id,
      providerId: vendor1._id,
      bidAmount: 24000,
      platformFee: 2400,
      totalPaid: 26400,
      status: 'ACTIVE',
      paymentDetails: {
        transactionId: 'TXN-ESC-9832104',
        method: 'UPI',
        paidAt: new Date(Date.now() - 3600000 * 12),
        escrowStatus: 'HELD',
      },
      isContactRevealed: true,
    });

    await Transaction.create({
      bookingId: bookingActive._id,
      type: 'PAYMENT_HELD_ESCROW',
      amount: 26400,
      fromUser: host3._id,
      toUser: vendor1._id,
      status: 'SUCCESS',
      referenceId: 'TXN-ESC-9832104',
      metadata: {
        bidAmount: 24000,
        platformFee: 2400,
        note: 'Funds held securely in Escrow Vault',
      },
    });

    // 6. Booking 2: COMPLETED (Payout Released)
    const reqWon2 = await Requirement.create({
      requesterId: host2._id,
      category: 'Stage & Mandap Decoration',
      title: 'Grand Floral Mandap with 40ft Light Canopy',
      description: 'Traditional wedding mandap with fresh marigold and orchids.',
      location: {
        city: 'Pune',
        area: 'Kothrud',
        venueAddress: 'Shubharambh Lawns, DP Road',
      },
      eventDate: '2026-10-02',
      timeWindow: { start: '08:00', end: '16:00' },
      guestCount: 650,
      budget: 80000,
      maxAcceptableBid: 68000,
      status: 'COMPLETED',
      bidsCount: 4,
      lowestBid: 62000,
    });

    const bidWon2 = await Bid.create({
      requirementId: reqWon2._id,
      providerId: vendor3._id,
      amount: 62000,
      proposalNotes: 'Complete mandap setup with authentic fresh flowers and brass pillars.',
      equipmentDetails: '40ft Floral Canopy + Brass Pillar Sets',
      discountPercent: 22.5,
      isEligibleForAccept: true,
      status: 'ACCEPTED',
    });

    const bookingCompleted = await Booking.create({
      requirementId: reqWon2._id,
      bidId: bidWon2._id,
      requesterId: host2._id,
      providerId: vendor3._id,
      bidAmount: 62000,
      platformFee: 6200,
      totalPaid: 68200,
      status: 'PAYOUT_RELEASED',
      paymentDetails: {
        transactionId: 'TXN-ESC-7712390',
        method: 'NetBanking',
        paidAt: new Date(Date.now() - 86400000 * 3),
        escrowStatus: 'RELEASED_TO_PROVIDER',
      },
      payoutDetails: {
        transferId: 'PAYOUT-991204',
        releasedAt: new Date(Date.now() - 86400000),
        amountToProvider: 62000,
        commissionRetained: 6200,
      },
      isContactRevealed: true,
      completedAt: new Date(Date.now() - 86400000),
    });

    await Transaction.create({
      bookingId: bookingCompleted._id,
      type: 'PAYOUT_RELEASED_PROVIDER',
      amount: 62000,
      fromUser: null,
      toUser: vendor3._id,
      status: 'SUCCESS',
      referenceId: 'PAYOUT-991204',
      metadata: {
        method: 'Direct Bank NEFT / IMPS',
      },
    });

    // 7. Equipment Items Catalog
    const equipmentItems = [
      {
        name: 'JBL VRX932LA Line Array Pair',
        category: 'DJ & Sound Systems',
        specs: 'Constant Curvature 1750W Peak, Dual Active Tops with DSP',
        dailyRate: 6500,
        isAvailable: true,
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'Pioneer DDJ-1000 4-Channel DJ Controller',
        category: 'DJ & Sound Systems',
        specs: 'Full size jog wheels, Magvel crossfader, Rekordbox ready',
        dailyRate: 4000,
        isAvailable: true,
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'Beam 230W 7R Sharpy Moving Heads (Set of 4)',
        category: 'Lighting & Trussing',
        specs: '14 colors + open, 17 gobos, 8-facet prism with flight case',
        dailyRate: 5000,
        isAvailable: true,
        condition: 'Good',
        image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80',
      },
      {
        name: 'Shure BLX288/PG58 Dual Wireless Vocal System',
        category: 'DJ & Sound Systems',
        specs: 'Dual channel UHF receiver, 300ft operating range',
        dailyRate: 1800,
        isAvailable: true,
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80',
      },
    ];
    await Item.insertMany(equipmentItems);

    console.log('✅ EzGo MongoDB database successfully seeded with live dynamic data!');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
};
