import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../data/occasion_cards.dart';
import '../../providers/requirements_provider.dart';
import '../../widgets/image_poster_card.dart';
import '../../widgets/other_request_card.dart';
import '../../widgets/shell_bottom_insets.dart';
import 'post_requirement_screen.dart';

class OccasionCatalogScreen extends StatelessWidget {
  const OccasionCatalogScreen({super.key});

  void _openOccasion(BuildContext context, OccasionCard occ) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PostRequirementScreen(
          initialOccasion: occ.occasion,
          initialCity: context.read<RequirementsProvider>().selectedCity,
        ),
      ),
    );
  }

  void _openOtherEvent(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PostRequirementScreen(
          initialOccasion: 'Other',
          initialCity: context.read<RequirementsProvider>().selectedCity,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final items = OccasionCards.all;
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('All Occasions'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, size: 22),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: GridView.builder(
        padding: EdgeInsets.fromLTRB(16, 12, 16, ShellBottomInsets.of(context)),
        itemCount: items.length + 1,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.72,
        ),
        itemBuilder: (context, i) {
          if (i == items.length) {
            return OtherRequestCard(
              title: 'Other Events',
              subtitle: 'Not listed? Tell us the occasion and vendors will bid on it.',
              onTap: () => _openOtherEvent(context),
            );
          }
          final occ = items[i];
          return ImagePosterCard(
            title: occ.name,
            asset: occ.image,
            iconWidget: occ.iconWidget,
            onTap: () => _openOccasion(context, occ),
          );
        },
      ),
    );
  }
}
