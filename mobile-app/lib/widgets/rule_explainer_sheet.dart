import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../config/theme.dart';

class RuleExplainerSheet extends StatefulWidget {
  const RuleExplainerSheet({super.key});

  @override
  State<RuleExplainerSheet> createState() => _RuleExplainerSheetState();
}

class _RuleExplainerSheetState extends State<RuleExplainerSheet> {
  int _activeTab = 0; // 0: Overview, 1: Hosts, 2: Vendors, 3: Calculator
  int _testBudget = 40000;
  int _testBid = 32000;

  @override
  Widget build(BuildContext context) {
    final maxAcceptableBid = (_testBudget * 0.85).floor();
    final discountPercent = (((_testBudget - _testBid) / _testBudget) * 100).round();
    final isEligible = _testBid <= maxAcceptableBid;
    final platformFee = (_testBid * 0.10).round();
    final totalPayableByRequester = _testBid + platformFee;
    final netSavings = _testBudget - totalPayableByRequester;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: AppTheme.slate300,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.primary, Color(0xFFF59E0B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(LucideIcons.shieldCheck, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
                        ),
                        child: const Text(
                          'HOW EZZYGO WORKS · PLATFORM GUIDE',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.6,
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'How reverse bidding works',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.slate900),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'You post a budget. Vendors bid at least 15% lower. EzzyGo holds escrow until the event is done.',
                        style: TextStyle(fontSize: 11, color: AppTheme.slate600, height: 1.3),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(LucideIcons.x, size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),

          // Role Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                _buildTab(0, 'Complete Overview', LucideIcons.shield),
                _buildTab(1, 'For Event Hosts', LucideIcons.user),
                _buildTab(2, 'For Vendors', LucideIcons.briefcase),
                _buildTab(3, '15% Calculator', LucideIcons.calculator),
              ],
            ),
          ),

          const Divider(height: 20, color: AppTheme.slate200),

          // Tab Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              children: [
                if (_activeTab == 0) ...[
                  // 1. Overview Tab
                  _buildRuleCard(
                    icon: LucideIcons.percent,
                    iconColor: AppTheme.primary,
                    title: '1. The 15% Minimum Discount Rule',
                    description:
                        'When you post an event, you set the budget ceiling (e.g. ₹50,000). A vendor can ONLY place an acceptable bid if it is at least 15% lower than your budget (₹42,500 or lower). This guarantees you immediate real savings.',
                  ),
                  const SizedBox(height: 12),
                  _buildRuleCard(
                    icon: LucideIcons.shieldCheck,
                    iconColor: AppTheme.emerald,
                    title: '2. 100% Escrow Protection',
                    description:
                        'You never pay vendors directly upfront. When you accept a bid, you pay into the EzzyGo Escrow account (Bid Amount + 10% platform fee). Funds remain safely locked until you confirm the event is complete.',
                  ),
                  const SizedBox(height: 12),
                  _buildRuleCard(
                    icon: LucideIcons.unlock,
                    iconColor: const Color(0xFF3B82F6),
                    title: '3. Direct Contact Unlocked After Escrow',
                    description:
                        'To prevent spam and protect your privacy, phone numbers and direct WhatsApp links are revealed immediately after the escrow payment is confirmed.',
                  ),
                  const SizedBox(height: 12),
                  _buildRuleCard(
                    icon: LucideIcons.checkCircle2,
                    iconColor: const Color(0xFF8B5CF6),
                    title: '4. Instant Release After Successful Event',
                    description:
                        'After the event is smoothly executed, 1 tap releases 100% of the vendor\'s bid amount directly to their bank account. EzzyGo retains the 10% platform fee.',
                  ),
                ] else if (_activeTab == 1) ...[
                  // 2. Host Tab
                  _buildSectionHeader('How Hosts Save Money and Stay Safe'),
                  const SizedBox(height: 10),
                  _buildStepRow(1, 'Post your event details and the maximum budget you are willing to pay.'),
                  _buildStepRow(2, 'Watch local verified vendors bid lower and lower to win your event.'),
                  _buildStepRow(3, 'Compare vendor ratings, past completed jobs, and equipment specifications.'),
                  _buildStepRow(4, 'Accept the best bid and pay into EzzyGo Escrow.'),
                  _buildStepRow(5, 'Call/WhatsApp the vendor directly to coordinate setup timings.'),
                  _buildStepRow(6, 'Mark the event complete afterwards to release the vendor\'s payment.'),
                ] else if (_activeTab == 2) ...[
                  // 3. Vendor Tab
                  _buildSectionHeader('How Vendors Win Real Bookings & Guaranteed Payouts'),
                  const SizedBox(height: 10),
                  _buildStepRow(1, 'Browse live event requests in your operating city and categories.'),
                  _buildStepRow(2, 'Submit bids at least 15% under the host\'s budget ceiling with gear details.'),
                  _buildStepRow(3, 'When accepted, the host\'s full payment is held safely in escrow.'),
                  _buildStepRow(4, 'Coordinate directly with the host without worrying about non-payment.'),
                  _buildStepRow(5, 'Get paid 100% of your bid amount directly upon event completion.'),
                ] else ...[
                  // 4. Interactive Calculator Tab
                  _buildSectionHeader('Interactive 15% Rule & Net Savings Simulator'),
                  const SizedBox(height: 12),

                  // Budget Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Host Budget Ceiling:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      Text('₹${_testBudget.toString()}', style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primary, fontSize: 14)),
                    ],
                  ),
                  Slider(
                    value: _testBudget.toDouble(),
                    min: 10000,
                    max: 200000,
                    divisions: 38,
                    activeColor: AppTheme.primary,
                    onChanged: (val) {
                      setState(() {
                        _testBudget = val.round();
                        if (_testBid > _testBudget) _testBid = _testBudget;
                      });
                    },
                  ),

                  // Bid Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Vendor Proposed Bid:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      Text('₹${_testBid.toString()}', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF3B82F6), fontSize: 14)),
                    ],
                  ),
                  Slider(
                    value: _testBid.toDouble(),
                    min: 5000,
                    max: _testBudget.toDouble(),
                    divisions: 39,
                    activeColor: const Color(0xFF3B82F6),
                    onChanged: (val) => setState(() => _testBid = val.round()),
                  ),

                  const SizedBox(height: 12),

                  // Results Box
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isEligible ? AppTheme.emeraldLight : const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isEligible ? AppTheme.emerald.withValues(alpha: 0.3) : Colors.red.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              isEligible ? '✅ Valid Eligible Bid' : '❌ Ineligible Bid (Must be >=15% lower)',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 13,
                                color: isEligible ? AppTheme.emerald : Colors.red,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '$discountPercent% Lower',
                                style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 11,
                                  color: isEligible ? AppTheme.emerald : Colors.red,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 18),
                        _buildCalcRow('Max Acceptable Bid Cap (85%):', '₹${maxAcceptableBid.toString()}'),
                        _buildCalcRow('Vendor Bid Amount:', '₹${_testBid.toString()}'),
                        _buildCalcRow('EzzyGo Platform Fee (10%):', '+₹${platformFee.toString()}'),
                        const Divider(height: 14),
                        _buildCalcRow('Total Host Pays into Escrow:', '₹${totalPayableByRequester.toString()}', isBold: true),
                        _buildCalcRow('Net Savings from Budget Ceiling:', '₹${netSavings.toString()}', isBold: true, isGreen: true),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(int index, String label, IconData icon) {
    final isSelected = _activeTab == index;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = index),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : AppTheme.slate100,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isSelected ? Colors.white : AppTheme.slate600),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? Colors.white : AppTheme.slate700,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRuleCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.slate50,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.slate900)),
                const SizedBox(height: 3),
                Text(description, style: const TextStyle(fontSize: 11, color: AppTheme.slate600, height: 1.35)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.slate900),
    );
  }

  Widget _buildStepRow(int step, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 11,
            backgroundColor: AppTheme.primary,
            child: Text('$step', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: const TextStyle(fontSize: 12, color: AppTheme.slate700, fontWeight: FontWeight.w600, height: 1.35)),
          ),
        ],
      ),
    );
  }

  Widget _buildCalcRow(String label, String value, {bool isBold = false, bool isGreen = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isBold ? FontWeight.w800 : FontWeight.w500,
              color: isGreen ? AppTheme.emerald : AppTheme.slate700,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isBold ? 13 : 11,
              fontWeight: FontWeight.w900,
              color: isGreen ? AppTheme.emerald : (isBold ? AppTheme.slate900 : AppTheme.slate800),
            ),
          ),
        ],
      ),
    );
  }
}
