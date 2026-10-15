import 'package:flutter_test/flutter_test.dart';
import 'package:ezzygo_mobile/main.dart';
import 'package:ezzygo_mobile/screens/main_navigation_screen.dart';

void main() {
  testWidgets('EzzyGo app smoke test', (WidgetTester tester) async {
    // Build our app and trigger frames through splash transition
    await tester.pumpWidget(const EzzyGoApp());
    await tester.pump(const Duration(seconds: 1));
    await tester.pump(const Duration(seconds: 2));

    // Verify app builds without crashing
    expect(find.byType(EzzyGoApp), findsOneWidget);
  });
}
