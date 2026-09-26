import User from '../models/User.js';

// Get or create demo session by role
export const getDemoUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// Login or switch active demo user
export const loginAsRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    let user = await User.findOne({ role });

    if (!user) {
      if (role === 'requester') {
        user = await User.create({
          name: 'Ananya Sharma',
          phone: '+91 98765 43210',
          email: 'ananya@ezgo.in',
          role: 'requester',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        });
      } else if (role === 'provider') {
        user = await User.create({
          name: 'Rajesh Sound & Lighting',
          businessName: 'Rajesh Pro Events & DJ Tech',
          phone: '+91 91234 56789',
          email: 'rajesh@events.in',
          role: 'provider',
          categories: ['DJ / Teenmar / Sound & Lighting', 'Lighting', 'Decoration'],
          serviceArea: 'Hyderabad (Madhapur, Gachibowli, Banjara Hills)',
          rating: 4.9,
          reviewCount: 38,
          completedJobs: 42,
          isVerified: true,
          bankDetails: {
            accountHolder: 'Rajesh Pro Events',
            accountNumber: '••••••••8921',
            ifscCode: 'HDFC0001234',
            upiId: 'rajesh.events@okaxis',
            isKycCompleted: true,
          },
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        });
      } else if (role === 'admin') {
        user = await User.create({
          name: 'EzGo Operations Lead',
          phone: '+91 90000 00001',
          email: 'admin@ezgo.in',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        });
      }
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Update provider KYC or bank details
export const updateProfile = async (req, res, next) => {
  try {
    const { userId, bankDetails, categories, serviceArea, businessName } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { bankDetails, categories, serviceArea, businessName },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
