import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ezzygo_mobile/main.dart';
import 'package:ezzygo_mobile/screens/role_selection_screen.dart';

void main() {
  testWidgets('EzzyGo app smoke test', (WidgetTester tester) async {
    // Build our app and trigger frames through splash transition
    await tester.pumpWidget(const EzzyGoApp());
    await tester.pump(const Duration(seconds: 1));
    await tester.pump(const Duration(seconds: 2));

    // Verify app builds without crashing
    expect(find.byType(EzzyGoApp), findsOneWidget);
  });

  testWidgets('RoleSelectionScreen renders Event Host and Service Provider roles', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: RoleSelectionScreen(),
      ),
    );
    await tester.pump();

    expect(find.text("Event Host"), findsOneWidget);
    expect(find.text("Service Provider"), findsOneWidget);
    expect(find.textContaining("Choose one to continue"), findsOneWidget);
    expect(find.textContaining("Continue as Event Host"), findsOneWidget);
  });
}
