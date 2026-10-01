const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const mockAdminUser = {
    _id: 'usr-admin-1',
    name: 'Super Admin',
    phone: '+91 99000 00001',
    email: 'ops@ezgoevents.in',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
};
export const mockMetrics = {
    totalRequirements: 284,
    totalBookings: 142,
    activeBookings: 18,
    completedBookings: 124,
    totalProviders: 86,
    pendingVerificationCount: 3,
    totalGMV: 4850000,
    totalCommissionEarned: 485000,
    totalEscrowHeld: 580000,
    recentTransactions: [],
};
export const mockProviders = [
    {
        _id: 'usr-p1',
        name: 'Rajesh Sound & FX Pro',
        phone: '+91 98231 45678',
        email: 'rajesh@punesoundpros.in',
        role: 'provider',
        businessName: 'Rajesh Pro Audio LLP',
        categories: ['DJ & Sound Systems', 'Lighting & Trussing'],
        serviceArea: 'Pune & PCMC Region',
        rating: 4.9,
        reviewCount: 42,
        completedJobs: 58,
        isVerified: true,
        bankDetails: {
            accountHolder: 'Rajesh Pro Audio LLP',
            accountNumber: '•••• •••• 9812',
            ifscCode: 'HDFC0001234',
            upiId: 'rajeshsound@okhdfc',
            isKycCompleted: true,
        },
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
        _id: 'usr-p2',
        name: 'BeatDrop Audio Works',
        phone: '+91 97654 32100',
        email: 'contact@beatdrop.in',
        role: 'provider',
        businessName: 'BeatDrop Audio Works',
        categories: ['DJ & Sound Systems', '4K Photography & Drone'],
        serviceArea: 'Koregaon Park, Viman Nagar',
        rating: 4.8,
        reviewCount: 31,
        completedJobs: 39,
        isVerified: true,
        bankDetails: {
            accountHolder: 'BeatDrop Audio Works',
            accountNumber: '•••• •••• 1123',
            ifscCode: 'ICIC0002345',
            upiId: 'beatdrop@okaxis',
            isKycCompleted: true,
        },
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
        _id: 'usr-p3',
        name: 'Swara Mandap & Floral Decorators',
        phone: '+91 98877 66554',
        email: 'swara@decorpune.com',
        role: 'provider',
        businessName: 'Swara Events & Decor',
        categories: ['Stage & Mandap Decoration'],
        serviceArea: 'Baner, Aundh, Wakad',
        rating: 4.6,
        reviewCount: 18,
        completedJobs: 22,
        isVerified: false,
        bankDetails: {
            accountHolder: 'Swara Decor Works',
            accountNumber: '•••• •••• 4490',
            ifscCode: 'SBIN0005678',
            upiId: 'swaradecor@oksbi',
            isKycCompleted: false,
        },
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
];
export const mockCategories = [
    {
        _id: 'cat-1',
        name: 'DJ & Sound Systems',
        slug: 'dj-sound',
        icon: 'Speaker',
        description: 'Line arrays, active tops, subwoofers, Pioneer DDJ, wireless mics',
        avgPriceRange: '₹8,000 - ₹45,000',
        isActive: true,
    },
    {
        _id: 'cat-2',
        name: 'Stage & Mandap Decoration',
        slug: 'decor',
        icon: 'Sparkles',
        description: 'Custom flower arches, fairy light canopies, royal wedding backdrops',
        avgPriceRange: '₹15,000 - ₹1,20,000',
        isActive: true,
    },
    {
        _id: 'cat-3',
        name: '4K Photography & Drone',
        slug: 'photography',
        icon: 'Camera',
        description: 'Cinematic 4K coverage, drone flybys, live stream mix, gimbal rigs',
        avgPriceRange: '₹12,000 - ₹65,000',
        isActive: true,
    },
    {
        _id: 'cat-4',
        name: 'Catering Buffets',
        slug: 'catering',
        icon: 'Utensils',
        description: 'Multi-cuisine live counters, traditional thalis, chaat stalls',
        avgPriceRange: '₹350 - ₹1,200 / plate',
        isActive: true,
    },
    {
        _id: 'cat-5',
        name: 'Lighting & Trussing',
        slug: 'lighting',
        icon: 'Zap',
        description: 'Sharpy moving heads, LED par cans, aluminum box truss grids',
        avgPriceRange: '₹10,000 - ₹50,000',
        isActive: true,
    },
];
export const mockBookings = [
    {
        _id: 'bk-501',
        requirementId: {
            _id: 'req-won-1',
            requesterId: 'usr-c4',
            category: 'DJ & Sound Systems',
            title: 'Corporate Annual Gala Sound & Lighting',
            description: 'Stage audio, speech mics, and ambient uplighting for 200 tech delegates.',
            location: {
                city: 'Pune',
                area: 'Hinjawadi Phase 1',
                venueAddress: 'Radisson Blu Ballroom, Hinjawadi High Street',
            },
            eventDate: '2026-10-08',
            guestCount: 200,
            budget: 30000,
            maxAcceptableBid: 25500,
            status: 'ACTIVE',
            bidsCount: 4,
            createdAt: new Date().toISOString(),
        },
        bidId: null,
        requesterId: {
            _id: 'usr-c4',
            name: 'Amitabh Sen',
            phone: '+91 98230 11223',
            role: 'requester',
        },
        providerId: mockProviders[0],
        bidAmount: 24000,
        platformFee: 2400,
        totalPaid: 26400,
        status: 'ACTIVE',
        paymentDetails: {
            transactionId: 'TXN-ESC-9832104',
            method: 'UPI',
            paidAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            escrowStatus: 'HELD',
        },
        isContactRevealed: true,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
        _id: 'bk-502',
        requirementId: {
            _id: 'req-won-2',
            requesterId: 'usr-c5',
            category: 'Stage & Mandap Decoration',
            title: 'Grand Floral Mandap with 40ft Light Canopy',
            description: 'Traditional Maratha wedding mandap with real marigold and orchids.',
            location: {
                city: 'Pune',
                area: 'Kothrud',
                venueAddress: 'Shubharambh Lawns, DP Road',
            },
            eventDate: '2026-10-02',
            guestCount: 650,
            budget: 80000,
            maxAcceptableBid: 68000,
            status: 'COMPLETED',
            bidsCount: 5,
            createdAt: new Date().toISOString(),
        },
        bidId: null,
        requesterId: {
            _id: 'usr-c5',
            name: 'Kavita Joshi',
            phone: '+91 98902 44332',
            role: 'requester',
        },
        providerId: mockProviders[2],
        bidAmount: 62000,
        platformFee: 6200,
        totalPaid: 68200,
        status: 'PAYOUT_RELEASED',
        paymentDetails: {
            transactionId: 'TXN-ESC-7712390',
            method: 'NetBanking',
            paidAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            escrowStatus: 'RELEASED_TO_PROVIDER',
        },
        payoutDetails: {
            transferId: 'PAYOUT-991204',
            releasedAt: new Date(Date.now() - 86400000).toISOString(),
            amountToProvider: 62000,
            commissionRetained: 6200,
        },
        isContactRevealed: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
];
export const api = {
    async getMetrics() {
        try {
            const res = await fetch(`${API_BASE}/admin/metrics`);
            if (!res.ok)
                throw new Error('API error');
            const data = await res.json();
            return data.data || data;
        }
        catch (_) {
            return mockMetrics;
        }
    },
    async getProviders() {
        try {
            const res = await fetch(`${API_BASE}/admin/providers`);
            if (!res.ok)
                throw new Error('API error');
            const data = await res.json();
            return data.data || data;
        }
        catch (_) {
            return mockProviders;
        }
    },
    async verifyProvider(providerId, isVerified) {
        try {
            const res = await fetch(`${API_BASE}/admin/providers/${providerId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified }),
            });
            return await res.json();
        }
        catch (_) {
            return { success: true };
        }
    },
    async getBookings() {
        try {
            const res = await fetch(`${API_BASE}/bookings`);
            if (!res.ok)
                throw new Error('API error');
            const data = await res.json();
            return data.data || data;
        }
        catch (_) {
            return mockBookings;
        }
    },
    async getCategories() {
        try {
            const res = await fetch(`${API_BASE}/categories`);
            if (!res.ok)
                throw new Error('API error');
            const data = await res.json();
            return data.data || data;
        }
        catch (_) {
            return mockCategories;
        }
    },
    async addCategory(catData) {
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catData),
            });
            const data = await res.json();
            return data.data || data;
        }
        catch (_) {
            return {
                _id: 'cat-' + Date.now(),
                name: catData.name || 'New Category',
                slug: catData.slug || 'new-cat',
                icon: catData.icon || 'Sparkles',
                description: catData.description || '',
                avgPriceRange: catData.avgPriceRange || '₹10,000 - ₹50,000',
                isActive: true,
            };
        }
    },
};
