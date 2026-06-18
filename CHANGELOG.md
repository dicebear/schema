# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This repository holds the JSON Schema that defines the DiceBear avatar style
definition format (distributed via npm, Composer, PyPI, crates.io, Go modules,
and pub.dev). Versions track the schema itself, independently of the DiceBear
library release line.

## [Unreleased]

## [1.3.0-rc.1] - 2026-06-18

## [1.2.0] - 2026-06-08

### Added

- **Dart:** The schemas are now available as a `dicebear_schema` package on
  pub.dev. The Dart shim landed after the `v1.2.0` tag, so the pub.dev release
  of this version came from a later commit. Dart has no compile-time file
  embedding, so `scripts/build.sh` generates
  `lib/dicebear_schema.dart` with `definition.json` and `options.json` embedded
  as string constants (`definition`, `options`), plus `get(name)` and `all`;
  the Dart, Rust and Go shims share one API. The generated `lib/` is
  git-ignored (like the npm `dist/`) and built fresh by the test and publish
  workflows; `tool/check_parity.dart` proves in CI that the embedded constants
  are byte-identical to their `src/*.json` sources.
- **Go:** The schemas are now available as a Go module
  (`github.com/dicebear/schema`). `definition.json` and `options.json` are
  embedded and exposed as `string` variables (`Definition`, `Options`) and via
  `Get(name)`/`All()`.
- **Rust:** Added `get(name)` and `all()` helpers, so the Rust and Go shims share
  one API (`DEFINITION`/`OPTIONS` constant or variable + `get(name)` + `all()`),
  matching the `dicebear-styles`/`@dicebear/styles` shims.

## [1.1.0] - 2026-06-03

### Added

- **Rust distribution:** A `dicebear-schema` crate is now published to crates.io,
  alongside the existing npm, Composer, and PyPI distributions. It embeds the same
  JSON Schemas via `include_str!` and exposes them as `&'static str` constants
  (`DEFINITION`, `OPTIONS`).

### Fixed

- Canvas and component dimensions (`canvas.width`/`height` and the component
  base `width`/`height`) now have an upper bound of `1000000` in addition to the
  existing `minimum: 1`. Without it, extreme values could diverge across the
  language ports' number-to-string formatting. The bound never rejects a real
  avatar (official styles use ~100) and matches the precedent already set on
  the `weight` field.

## [1.1.0-rc.2] - 2026-05-31

### Changed

- Prerelease versions are now published to npm under the `next` dist-tag, so
  `npm install @dicebear/schema` continues to resolve the latest stable release.

## [1.1.0-rc.1] - 2026-05-31

### Added

- **Python distribution:** A `dicebear-schema` package is now published to PyPI,
  alongside the existing npm and Composer distributions, exposing the same JSON
  Schema to Python consumers.

## [1.0.0] - 2026-05-17

First stable release of the DiceBear style definition schema.

### Added

- A versioned JSON Schema (draft-07) describing avatar **style definitions** and
  their **options**, with a build step that injects the matching `$id` and
  publishes minified output.
- **Color fills:** `colorFill` (solid, linear, and radial), `colorFillStops`,
  and `colorRotate` for gradient configuration.
- **Weighted variants:** per-variant `weight` to control how frequently each
  component variant is selected.
- **Component aliases** via `extends`, and a component-level `scale` option.
- Distribution via npm and Composer (Packagist), plus a CDN with automatic
  versioning.

[Unreleased]: https://github.com/dicebear/schema/compare/v1.3.0-rc.1...HEAD
[1.3.0-rc.1]: https://github.com/dicebear/schema/compare/v1.2.0...v1.3.0-rc.1
[1.2.0]: https://github.com/dicebear/schema/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/dicebear/schema/compare/v1.1.0-rc.2...v1.1.0
[1.1.0-rc.2]: https://github.com/dicebear/schema/compare/v1.1.0-rc.1...v1.1.0-rc.2
[1.1.0-rc.1]: https://github.com/dicebear/schema/compare/v1.0.0...v1.1.0-rc.1
[1.0.0]: https://github.com/dicebear/schema/releases/tag/v1.0.0
