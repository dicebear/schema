// Verifies that every schema constant embedded in lib/dicebear_schema.dart is
// byte-identical to its src/*.json source, and that `all` matches the file
// list. This guards the string escaping in scripts/build.sh's Dart generator.
// Run it from the repo root: dart run tool/check_parity.dart

import 'dart:io';

import 'package:dicebear_schema/dicebear_schema.dart' as schema;

void main() {
  // Sort the bare schema names (not the file paths) so the order matches the
  // generator, which sorts basenames under LC_ALL=C.
  final names = Directory('src')
      .listSync()
      .whereType<File>()
      .map((f) => f.uri.pathSegments.last)
      .where((f) => f.endsWith('.json'))
      .map((f) => f.substring(0, f.length - '.json'.length))
      .toList()
    ..sort();

  var failures = 0;

  for (final name in names) {
    final file = File('src/$name.json');

    final embedded = schema.get(name);
    if (embedded == null) {
      stderr.writeln('MISSING: no embedded constant for `$name`');
      failures++;
    } else if (embedded != file.readAsStringSync()) {
      stderr.writeln('MISMATCH: `$name` differs from src/$name.json');
      failures++;
    }
  }

  if (schema.all.join('\n') != names.join('\n')) {
    stderr.writeln('MISMATCH: `all` does not match the src/*.json file list');
    failures++;
  }

  if (failures > 0) {
    exit(1);
  }

  print('OK: ${names.length} schemas byte-identical to src/');
}
