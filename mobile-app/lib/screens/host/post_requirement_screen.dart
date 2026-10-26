import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../data/event_services.dart';
import '../../models/requirement_model.dart';
import '../../providers/requirements_provider.dart';
import '../../utils/app_nav.dart';
import '../../widgets/shell_bottom_insets.dart';

class PostRequirementScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialOccasion;
  final int? initialBudget;
  final int? initialGuests;
  final String? initialCity;

  const PostRequirementScreen({
    super.key,
    this.initialCategory,
    this.initialOccasion,
    this.initialBudget,
    this.initialGuests,
    this.initialCity,
  });

  @override
  State<PostRequirementScreen> createState() => _PostRequirementScreenState();
}

class _PostRequirementScreenState extends State<PostRequirementScreen> {
  int _currentStep = 1; // 1 Occasion, 2 Services, 3 Details, 4 Review
  String _venueType = 'Banquet Hall';

  // Step 1: Occasion & Event Details
  String _selectedOccasion = 'Wedding';
  DateTime _eventDate = DateTime.now().add(const Duration(days: 21));
  TimeOfDay _eventTime = const TimeOfDay(hour: 18, minute: 0);
  late String _city;
  final _areaController = TextEditingController(text: 'Baner');
  final _titleController = TextEditingController();
  final _notesController = TextEditingController();
  int _guestCount = 200;

  // Step 2: Selected Services
  final Set<String> _selectedServices = {};

  // Step 3: Budget
  late TextEditingController _budgetController;

  final List<Map<String, dynamic>> _occasions = [
    {'name': 'Wedding', 'asset': 'assets/images/occasion_weddings.jpg'},
    {'name': 'Festivals', 'asset': 'assets/images/occasion_festivals.jpg'},
    {'name': 'Birthday', 'asset': 'assets/images/occasion_birthdays.jpg'},
    {'name': 'Corporate', 'asset': 'assets/images/occasion_corporate.jpg'},
    {'name': 'Private Parties', 'asset': 'assets/images/occasion_parties.jpg'},
    {'name': 'Engagement', 'asset': 'assets/images/occasion_parties.jpg'},
  ];

  List<Map<String, dynamic>> get _allServices => EventServices.all
      .map((s) => {
            'title': s.shortName,
            'benchmark': s.priceFrom,
            'detail': s.description,
            'asset': s.asset,
            'image': s.image,
          })
      .toList();

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
    if (widget.initialOccasion != null) {
      final wanted = widget.initialOccasion!.toLowerCase();
      final match = _occasions.cast<Map<String, dynamic>>().where((o) {
        final name = (o['name'] as String).toLowerCase();
        return name == wanted || name.contains(wanted) || wanted.contains(name);
      });
      if (match.isNotEmpty) {
        _selectedOccasion = match.first['name'] as String;
      }
    }
    if (widget.initialCategory != null) {
      _selectedServices.add(EventServices.matchTitle(widget.initialCategory));
      _currentStep = 2;
    } else {
      _selectedServices.addAll(['Catering', 'Photography', 'Decoration']);
    }
  }

  @override
  void dispose() {
    _areaController.dispose();
    _titleController.dispose();
    _notesController.dispose();
    _budgetController.dispose();
    super.dispose();
  }

  int get _budget => int.tryParse(_budgetController.text) ?? 500000;
  int get _ceiling => (_budget * 0.85).round();

  int _estimateFor(String title) {
    final t = title.toLowerCase();
    if (t.contains('cater')) return 300 * _guestCount;
    if (t.contains('decor')) return 25000;
    if (t.contains('photo')) return 15000;
    if (t.contains('dj') || t.contains('sound') || t.contains('music')) return 12000;
    if (t.contains('makeup')) return 8000;
    if (t.contains('pandit') || t.contains('priest') || t.contains('mehendi')) return 5000;
    if (t.contains('light')) return 8000;
    if (t.contains('tent') || t.contains('venue') || t.contains('stage')) return 15000;
    return 10000;
  }

  int get _retailTotal => _selectedServices.fold(0, (sum, title) => sum + _estimateFor(title));

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

  bool _isSubmitting = false;

  Future<void> _handleSubmit() async {
    if (_isSubmitting) return;
    final title = _titleController.text.trim().isNotEmpty
        ? _titleController.text.trim()
        : '$_selectedOccasion Celebration (${_selectedServices.join(", ")})';
    final primaryCategory = _selectedServices.isNotEmpty ? _selectedServices.first : 'Event Management';
    final area = _areaController.text.trim().isNotEmpty ? _areaController.text.trim() : 'City Center';
    final budget = _budget < 1000 ? 1000 : _budget;

    final req = RequirementModel(
      id: '',
      title: title,
      category: primaryCategory,
      occasion: _selectedOccasion,
      description: _notesController.text.trim().isNotEmpty
          ? _notesController.text.trim()
          : 'Requirement for $_selectedOccasion with ${_selectedServices.join(", ")} for $_guestCount guests in $area, $_city.',
      budget: budget,
      maxAcceptableBid: (budget * 0.85).floor(),
      bidsCount: 0,
      guestCount: _guestCount,
      eventDate: DateFormat('yyyy-MM-dd').format(_eventDate),
      area: area,
      city: _city,
      venueAddress: _venueType,
      status: 'OPEN',
    );

    setState(() => _isSubmitting = true);
    try {
      await context.read<RequirementsProvider>().addRequirement(req);
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Event posted. Verified vendors can now bid lower.'),
          backgroundColor: AppTheme.emerald,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: AppTheme.rose,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: _currentStep <= 1,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        setState(() => _currentStep--);
      },
      child: Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Create Your Event'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, size: 20),
          onPressed: () {
            if (_currentStep > 1) {
              setState(() => _currentStep--);
            } else {
              AppNav.pop(context);
            }
          },
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
              color: Colors.white,
              child: Row(
                children: List.generate(4, (i) {
                  final step = i + 1;
                  final labels = ['Occasion', 'Services', 'Details', 'Review'];
                  final active = _currentStep == step;
                  final done = _currentStep > step;
                  return Expanded(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 12,
                          backgroundColor: active || done ? AppTheme.primary : const Color(0xFFE5E7EB),
                          child: Text(
                            '$step',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: active || done ? Colors.white : AppTheme.slate500,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          labels[i],
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: active ? AppTheme.primary : AppTheme.slate500,
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ),

            Expanded(
              child: _currentStep == 1
                  ? _buildStep1Occasion()
                  : _currentStep == 2
                      ? _buildStep2Services()
                      : _currentStep == 3
                          ? _buildStep3Specs()
                          : _buildStep3Budget(),
            ),

            // Bottom Sticky CTA
            _buildStickyBottomBar(),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildStep1Occasion() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Select Occasion', style: AppTheme.headingFont(fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.05,
          ),
          itemCount: _occasions.length,
          itemBuilder: (context, index) {
            final occ = _occasions[index];
            final name = occ['name'] as String;
            final isSelected = _selectedOccasion == name;
            return InkWell(
              onTap: () => setState(() => _selectedOccasion = name),
              borderRadius: BorderRadius.circular(18),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.borderSubtle, width: isSelected ? 2 : 1),
                ),
                child: Stack(
                  children: [
                    Column(
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                            child: Image.asset(occ['asset'] as String, width: double.infinity, fit: BoxFit.cover),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          child: Text(name, style: TextStyle(fontWeight: FontWeight.w800, color: isSelected ? AppTheme.primary : AppTheme.textPrimary)),
                        ),
                      ],
                    ),
                    if (isSelected)
                      const Positioned(
                        top: 8,
                        right: 8,
                        child: CircleAvatar(radius: 11, backgroundColor: AppTheme.primary, child: Icon(Icons.check, size: 14, color: Colors.white)),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _guestTierChip(String label, int count) {
    final selected = _guestCount == count;
    return GestureDetector(
      onTap: () => setState(() => _guestCount = count),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryLight : AppTheme.slate50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: selected ? AppTheme.primary : AppTheme.borderSubtle),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: selected ? AppTheme.primaryDark : AppTheme.slate600,
          ),
        ),
      ),
    );
  }

  // STEP 2 — Service Selection (Screen 6)
  Widget _buildStep2Services() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Select Services', style: AppTheme.headingFont(fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 6),
        const Text(
          'Choose the services you need',
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
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: isSelected ? AppTheme.primary : Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.slate300),
                      ),
                      child: isSelected ? const Icon(Icons.check, size: 16, color: Colors.white) : null,
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

  Widget _buildStep3Specs() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Event Details', style: AppTheme.headingFont(fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 18),
        const Text('Guest Count', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.borderSubtle)),
          child: Row(
            children: [
              const Icon(LucideIcons.users, size: 18, color: AppTheme.primary),
              const Spacer(),
              IconButton(onPressed: () { if (_guestCount > 25) setState(() => _guestCount -= 25); }, icon: const Icon(LucideIcons.minus)),
              Text('$_guestCount Guests', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
              IconButton(onPressed: () => setState(() => _guestCount += 25), icon: const Icon(LucideIcons.plus, color: AppTheme.primary)),
            ],
          ),
        ),
        const SizedBox(height: 14),
        const Text('Event Date', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        InkWell(
          onTap: _pickDate,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.borderSubtle)),
            child: Row(children: [
              const Icon(LucideIcons.calendar, size: 18, color: AppTheme.primary),
              const SizedBox(width: 10),
              Text(DateFormat('dd MMM yyyy').format(_eventDate), style: const TextStyle(fontWeight: FontWeight.w700)),
            ]),
          ),
        ),
        const SizedBox(height: 14),
        const Text('Event Location', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.borderSubtle)),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _city,
              isExpanded: true,
              items: _cities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
              onChanged: (val) { if (val != null) setState(() => _city = val); },
            ),
          ),
        ),
        const SizedBox(height: 14),
        const Text('Venue Type (Optional)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.borderSubtle)),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _venueType,
              isExpanded: true,
              items: const ['Banquet Hall', 'Lawn / Farmhouse', 'Hotel', 'Home', 'Other']
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (val) { if (val != null) setState(() => _venueType = val); },
            ),
          ),
        ),
        const SizedBox(height: 14),
        const Text('Additional Notes (Optional)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        TextField(
          controller: _notesController,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Any special requirements?'),
        ),
      ],
    );
  }

  Widget _buildStep3Budget() {
    final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    final savings = (_retailTotal * 0.15).round();
    final target = _retailTotal - savings;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Review Your Event Plan', style: AppTheme.headingFont(fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.borderSubtle)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Expanded(child: Text('Selected Services', style: TextStyle(fontWeight: FontWeight.w800))),
                  GestureDetector(
                    onTap: () => setState(() => _currentStep = 2),
                    child: const Text('Edit', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              ..._selectedServices.map((title) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600))),
                        Text(formatCurrency.format(_estimateFor(title)), style: const TextStyle(fontWeight: FontWeight.w800)),
                      ],
                    ),
                  )),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.borderSubtle)),
          child: Column(
            children: [
              _reviewRow(LucideIcons.heart, 'Occasion', _selectedOccasion),
              _reviewRow(LucideIcons.users, 'Guest Count', '$_guestCount Guests'),
              _reviewRow(LucideIcons.calendar, 'Event Date', DateFormat('dd MMM yyyy').format(_eventDate)),
              _reviewRow(LucideIcons.mapPin, 'Location', '$_city, Maharashtra'),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.borderSubtle)),
          child: Column(
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Estimated Total', style: TextStyle(fontWeight: FontWeight.w700)),
                Text(formatCurrency.format(_retailTotal), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
              ]),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Potential Savings', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF18794E))),
                Text(formatCurrency.format(savings), style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF18794E))),
              ]),
              const Divider(height: 20),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Estimated Price', style: TextStyle(fontWeight: FontWeight.w800)),
                Text(formatCurrency.format(target), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: AppTheme.primary)),
              ]),
            ],
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Savings shown are the 15% minimum from reverse-bidding rules. Final payable is the accepted bid plus a 10% fee.',
          style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, height: 1.35),
        ),
      ],
    );
  }

  Widget _reviewRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.primary),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildStickyBottomBar() {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 16, 16, ShellBottomInsets.of(context)),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppTheme.emeraldLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(LucideIcons.lock, size: 16, color: AppTheme.emerald),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  '100% Free to Post • Escrow Safe',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.slate900),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              if (_currentStep > 1) ...[
                OutlinedButton(
                  onPressed: () => setState(() => _currentStep--),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.slate700,
                    side: const BorderSide(color: AppTheme.slate200),
                    minimumSize: const Size(88, 48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Back', style: TextStyle(fontWeight: FontWeight.w800)),
                ),
                const SizedBox(width: 10),
              ],
              if (_currentStep == 2) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_selectedServices.length} services',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF374151),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton(
                onPressed: _isSubmitting
                    ? null
                    : () {
                  if (_currentStep == 3 && _titleController.text.trim().isEmpty) {
                    _titleController.text =
                        '$_selectedOccasion · ${_selectedServices.join(", ")} ($_guestCount Guests in $_city)';
                    _budgetController.text = '$_retailTotal';
                  }
                  if (_currentStep < 4) {
                    setState(() => _currentStep++);
                  } else {
                    _handleSubmit();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(
                      child: Text(
                        _currentStep == 1
                            ? 'Next: Select Services'
                            : _currentStep == 2
                                ? 'Next: Event Details'
                                : _currentStep == 3
                                    ? 'Next: Review'
                                    : 'Request Vendor Bids',
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                      ),
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
        ],
      ),
    );
  }
}
