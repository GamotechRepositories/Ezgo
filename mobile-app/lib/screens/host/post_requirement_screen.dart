import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/requirement_model.dart';
import '../../providers/requirements_provider.dart';

class PostRequirementScreen extends StatefulWidget {
  final String? initialCategory;
  final int? initialBudget;
  final int? initialGuests;
  final String? initialCity;

  const PostRequirementScreen({
    super.key,
    this.initialCategory,
    this.initialBudget,
    this.initialGuests,
    this.initialCity,
  });

  @override
  State<PostRequirementScreen> createState() => _PostRequirementScreenState();
}

class _PostRequirementScreenState extends State<PostRequirementScreen> {
  int _currentStep = 1; // 1, 2, 3

  // Step 1: Occasion & Event Details
  String _selectedOccasion = 'Wedding';
  DateTime _eventDate = DateTime.now().add(const Duration(days: 21));
  TimeOfDay _eventTime = const TimeOfDay(hour: 18, minute: 0);
  late String _city;
  final _areaController = TextEditingController(text: 'Baner');
  int _guestCount = 250;

  // Step 2: Selected Services
  final Set<String> _selectedServices = {'Catering', 'Photography', 'Decoration'};

  // Step 3: Budget
  late TextEditingController _budgetController;

  final List<Map<String, dynamic>> _occasions = [
    {'name': 'Wedding', 'icon': LucideIcons.heartHandshake, 'color': Color(0xFFFFECEB), 'active': Color(0xFFFF5148)},
    {'name': 'Sangeet', 'icon': LucideIcons.music, 'color': Color(0xFFE8F4FD), 'active': Color(0xFF2F80ED)},
    {'name': 'Birthday', 'icon': LucideIcons.cake, 'color': Color(0xFFE8F8F0), 'active': Color(0xFF27AE60)},
    {'name': 'Engagement', 'icon': LucideIcons.gem, 'color': Color(0xFFFFF0F5), 'active': Color(0xFFE91E63)},
    {'name': 'Anniversary', 'icon': LucideIcons.heart, 'color': Color(0xFFFFEAE9), 'active': Color(0xFFFF5148)},
    {'name': 'Corporate', 'icon': LucideIcons.briefcase, 'color': Color(0xFFF0ECFC), 'active': Color(0xFF7B61FF)},
    {'name': 'Festival', 'icon': LucideIcons.sparkles, 'color': Color(0xFFFFF4E8), 'active': Color(0xFFF2994A)},
    {'name': 'Other', 'icon': LucideIcons.user, 'color': Color(0xFFF2F4F7), 'active': Color(0xFF475467)},
  ];

  final List<Map<String, dynamic>> _allServices = [
    {
      'title': 'Catering',
      'benchmark': 'From ₹300 per plate',
      'detail': '300 guests menu',
      'asset': 'assets/images/service_catering.jpg',
      'image': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&auto=format&fit=crop&q=80',
    },
    {
      'title': 'Photography',
      'benchmark': 'From ₹5,000',
      'detail': 'Full event coverage',
      'asset': 'assets/images/occasion_parties.jpg',
      'image': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80',
    },
    {
      'title': 'Decoration',
      'benchmark': 'From ₹10,000',
      'detail': 'Theme stage setup',
      'asset': 'assets/images/occasion_weddings.jpg',
      'image': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
    },
    {
      'title': 'Venue',
      'benchmark': 'From ₹20,000',
      'detail': 'Banquet / Lawn',
      'asset': 'assets/images/occasion_corporate.jpg',
      'image': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&auto=format&fit=crop&q=80',
    },
    {
      'title': 'Makeup Artist',
      'benchmark': 'From ₹3,000',
      'detail': 'Bridal & Party HD glam',
      'asset': 'assets/images/occasion_birthdays.jpg',
      'image': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=80',
    },
    {
      'title': 'Mehendi Artist',
      'benchmark': 'From ₹2,500',
      'detail': 'Bridal henna & guests',
      'asset': 'assets/images/occasion_festivals.jpg',
      'image': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
    },
  ];

  static const List<String> _cities = [
    'Pune',
    'Mumbai',
    'Bengaluru',
    'Hyderabad',
    'Delhi',
    'Nagpur',
    'Nashik',
    'Jaipur',
    'Goa',
  ];

  @override
  void initState() {
    super.initState();
    final initialCityName = widget.initialCity?.split(',')[0].trim();
    _city = initialCityName != null && _cities.contains(initialCityName)
        ? initialCityName
        : 'Pune';

    _budgetController = TextEditingController(
      text: widget.initialBudget != null ? widget.initialBudget.toString() : '500000',
    );
    if (widget.initialGuests != null) {
      _guestCount = widget.initialGuests!;
    }
    if (widget.initialCategory != null) {
      _selectedServices.add(widget.initialCategory!);
    }
  }

  @override
  void dispose() {
    _areaController.dispose();
    _budgetController.dispose();
    super.dispose();
  }

  int get _budget => int.tryParse(_budgetController.text) ?? 500000;
  int get _ceiling => (_budget * 0.85).round();

  void _onQuickBudgetSelect(int amount) {
    setState(() {
      _budgetController.text = amount.toString();
    });
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _eventDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primary,
              onPrimary: Colors.white,
              onSurface: AppTheme.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _eventDate = picked);
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _eventTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primary,
              onPrimary: Colors.white,
              onSurface: AppTheme.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _eventTime = picked);
    }
  }

  void _handleSubmit() {
    final title = '$_selectedOccasion Celebration (${_selectedServices.join(", ")})';
    final primaryCategory = _selectedServices.isNotEmpty ? _selectedServices.first : 'Event Management';

    final req = RequirementModel(
      id: 'req_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      category: primaryCategory,
      description: 'Requirement for $_selectedOccasion with ${_selectedServices.join(", ")} for $_guestCount guests in ${_areaController.text}, $_city.',
      budget: _budget,
      maxAcceptableBid: _ceiling,
      bidsCount: 0,
      guestCount: _guestCount,
      eventDate: DateFormat('dd MMM yyyy').format(_eventDate),
      area: _areaController.text.trim().isNotEmpty ? _areaController.text.trim() : 'City Center',
      city: _city,
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    );

    context.read<RequirementsProvider>().addRequirement(req);
    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Event requirement posted! Verified vendors are now competing for your event.'),
        backgroundColor: AppTheme.emerald,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Create Event'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, size: 20),
          onPressed: () {
            if (_currentStep > 1) {
              setState(() => _currentStep--);
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 3-Step Sleek Segmented Progress Bar matching Mockup Screens 5, 6, 7
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 8),
              color: Colors.white,
              child: Row(
                children: [
                  Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      height: 3.5,
                      decoration: BoxDecoration(
                        color: _currentStep >= 1 ? const Color(0xFFFF5148) : const Color(0xFFE5E7EB),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      height: 3.5,
                      decoration: BoxDecoration(
                        color: _currentStep >= 2 ? const Color(0xFFFF5148) : const Color(0xFFE5E7EB),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      height: 3.5,
                      decoration: BoxDecoration(
                        color: _currentStep >= 3 ? const Color(0xFFFF5148) : const Color(0xFFE5E7EB),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: _currentStep == 1
                  ? _buildStep1Occasion()
                  : _currentStep == 2
                      ? _buildStep2Services()
                      : _buildStep3Budget(),
            ),

            // Bottom Sticky CTA
            _buildStickyBottomBar(),
          ],
        ),
      ),
    );
  }

  // STEP 1 — Event Details (Screen 5)
  Widget _buildStep1Occasion() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Tell us about your event',
          style: AppTheme.headingFont(fontSize: 20, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 6),
        const Text(
          'Select your occasion to get tailored vendors',
          style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 18),

        // 2-Column Occasion Grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.25,
          ),
          itemCount: _occasions.length,
          itemBuilder: (context, index) {
            final occ = _occasions[index];
            final name = occ['name'] as String;
            final isSelected = _selectedOccasion == name;

            return InkWell(
              onTap: () => setState(() => _selectedOccasion = name),
              borderRadius: BorderRadius.circular(16),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                decoration: BoxDecoration(
                  color: isSelected ? (occ['color'] as Color) : (occ['color'] as Color).withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? const Color(0xFFFF5148) : Colors.transparent,
                    width: isSelected ? 2 : 1,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: const Color(0xFFFF5148).withValues(alpha: 0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ]
                      : null,
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            occ['icon'] as IconData,
                            size: 32,
                            color: isSelected ? const Color(0xFFFF5148) : (occ['active'] as Color),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            name,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                              color: const Color(0xFF1F2937),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isSelected)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          width: 20,
                          height: 20,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFF5148),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check, size: 14, color: Colors.white),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),

        const SizedBox(height: 20),

        // Date and Time
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Event Schedule',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: _pickDate,
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.slate50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.calendar, size: 16, color: AppTheme.primary),
                            const SizedBox(width: 8),
                            Text(
                              DateFormat('dd MMM yyyy').format(_eventDate),
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: InkWell(
                      onTap: _pickTime,
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.slate50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.clock, size: 16, color: AppTheme.primary),
                            const SizedBox(width: 8),
                            Text(
                              _eventTime.format(context),
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // City & Location
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Location & City',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  // City Dropdown
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.slate50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _city,
                        icon: const Icon(LucideIcons.chevronDown, size: 14),
                        items: _cities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _city = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _areaController,
                      decoration: const InputDecoration(
                        hintText: 'Area / Landmark (e.g. Baner)',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Guest Count
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Guest Count',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                  ),
                  Text(
                    '$_guestCount guests expected',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(LucideIcons.minusCircle, color: AppTheme.primary, size: 24),
                    onPressed: () {
                      if (_guestCount > 25) {
                        setState(() => _guestCount -= 25);
                      }
                    },
                  ),
                  Text(
                    '$_guestCount',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.plusCircle, color: AppTheme.primary, size: 24),
                    onPressed: () {
                      setState(() => _guestCount += 25);
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // STEP 2 — Service Selection (Screen 6)
  Widget _buildStep2Services() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Select Services',
          style: AppTheme.headingFont(fontSize: 20, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 6),
        const Text(
          'Choose the services you need for your event',
          style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 16),

        ..._allServices.map((service) {
          final title = service['title'] as String;
          final isSelected = _selectedServices.contains(title);

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () {
                setState(() {
                  if (isSelected) {
                    if (_selectedServices.length > 1) {
                      _selectedServices.remove(title);
                    }
                  } else {
                    _selectedServices.add(title);
                  }
                });
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? AppTheme.primary : AppTheme.borderSubtle,
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    // Checkbox
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: isSelected ? AppTheme.primary : Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: isSelected ? AppTheme.primary : AppTheme.slate300,
                        ),
                      ),
                      child: isSelected
                          ? const Icon(Icons.check, size: 16, color: Colors.white)
                          : null,
                    ),
                    const SizedBox(width: 14),

                    // Thumbnail
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.asset(
                        service['asset'] as String,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                        filterQuality: FilterQuality.high,
                        errorBuilder: (_, _, _) => Image.network(
                          service['image'] as String,
                          width: 56,
                          height: 56,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => Container(
                            width: 56,
                            height: 56,
                            color: AppTheme.slate100,
                            child: const Icon(LucideIcons.image, size: 20, color: AppTheme.slate400),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),

                    // Title & benchmark
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            service['benchmark'] as String,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  // STEP 3 — Budget & Summary (Screen 7)
  Widget _buildStep3Budget() {
    final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Set Your Budget',
          style: AppTheme.headingFont(fontSize: 20, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 6),
        const Text(
          'Help vendors give the best competitive bids',
          style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 20),

        // Big Budget Display Box
        Container(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Column(
            children: [
              const Text(
                'YOUR TARGET EVENT BUDGET',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    '₹ ',
                    style: AppTheme.displayFont(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primary,
                    ),
                  ),
                  IntrinsicWidth(
                    child: TextField(
                      controller: _budgetController,
                      keyboardType: TextInputType.number,
                      onChanged: (_) => setState(() {}),
                      textAlign: TextAlign.center,
                      style: AppTheme.displayFont(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                      ),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Quick Chips (50K, 1L, 2L, 5L)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildBudgetChip(50000, '₹50K'),
                  const SizedBox(width: 8),
                  _buildBudgetChip(100000, '₹1L'),
                  const SizedBox(width: 8),
                  _buildBudgetChip(200000, '₹2L'),
                  const SizedBox(width: 8),
                  _buildBudgetChip(500000, '₹5L'),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Green Bidding Rules Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.successBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.2)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.shieldCheck, size: 20, color: AppTheme.emerald),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Vendors must bid at least 15% below your budget',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.successText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Bids above ${formatCurrency.format(_ceiling)} are automatically rejected. Get better prices automatically!',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppTheme.successText,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Selected Services Summary Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Selected Services (${_selectedServices.length})',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => setState(() => _currentStep = 2),
                    child: const Text(
                      'Edit',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ..._selectedServices.map((serviceTitle) {
                final match = _allServices.firstWhere(
                  (s) => s['title'] == serviceTitle,
                  orElse: () => {'title': serviceTitle, 'detail': 'Standard package'},
                );
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFECEB),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          serviceTitle == 'Catering'
                              ? LucideIcons.utensils
                              : serviceTitle == 'Photography'
                                  ? LucideIcons.camera
                                  : serviceTitle == 'Decoration'
                                      ? LucideIcons.sparkles
                                      : serviceTitle == 'Venue'
                                          ? LucideIcons.building2
                                          : LucideIcons.gem,
                          size: 16,
                          color: const Color(0xFFFF5148),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              serviceTitle,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF111827),
                              ),
                            ),
                            Text(
                              match['detail'] as String,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(LucideIcons.chevronRight, size: 16, color: Color(0xFF9CA3AF)),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBudgetChip(int amount, String label) {
    final isSelected = _budget == amount;

    return GestureDetector(
      onTap: () => _onQuickBudgetSelect(amount),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFF5148) : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFFFF5148).withValues(alpha: 0.3),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF4B5563),
          ),
        ),
      ),
    );
  }

  Widget _buildStickyBottomBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
      ),
      child: Row(
        children: [
          if (_currentStep == 2) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${_selectedServices.length} services selected',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF374151),
                ),
              ),
            ),
            const Spacer(),
          ],
          Expanded(
            flex: _currentStep == 2 ? 0 : 1,
            child: SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  if (_currentStep < 3) {
                    setState(() => _currentStep++);
                  } else {
                    _handleSubmit();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF5148),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  elevation: 0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _currentStep == 3 ? 'Post Requirement' : 'Next',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(width: 8),
                    const Icon(LucideIcons.arrowRight, size: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
