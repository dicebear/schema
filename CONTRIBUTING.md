# Contributing

Thanks for considering a contribution to `@dicebear/schema`.

This repository holds the JSON Schemas (Draft 07) that describe DiceBear
avatar style **definitions** and the **options** object consumers pass at
render time. The core library, the API, the definitions repo, the Figma
exporter, and third-party integrations all validate against these two
files, so schema changes tend to land in several repos at once.

## Before you start

- Bug fixes and small improvements: a pull request is fine.
- Anything that changes the shape of `definition.json` or `options.json`
  (new fields, renames, stricter constraints, removed keywords): open an
  issue first. Schema changes affect the core library, the API, the
  definitions repo, the DiceBear Studio plugin, and every third-party
  integration, so the coordination matters more than the diff.
- Security issues go to <contact@dicebear.com> privately, not into a
  public issue.
- Everyone participating is expected to follow the
  [Code of Conduct](https://github.com/dicebear/.github/blob/main/CODE_OF_CONDUCT.md).

## Requirements

- [Node.js](https://nodejs.org/) 20 or newer

## Local setup

```sh
git clone https://github.com/dicebear/schema.git
cd schema
npm install
```

## Scripts

| Script                 | What it does                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `npm run build`        | Runs `scripts/build.sh` to produce `dist/*.min.json` and `lib/dicebear_schema.dart` |
| `npm test`             | Runs the Node built-in test runner against `tests/`                                 |
| `npm run format`       | Runs Prettier on the whole repo                                                     |
| `npm run format:check` | Checks formatting without writing                                                   |

## Project layout

```
src/
├── definition.json    # Schema for avatar style definitions
└── options.json       # Schema for the user-supplied options object
lib/
└── dicebear_schema.dart  # Generated Dart shim embedding src/*.json (git-ignored)
tests/
├── definition/        # Fixtures that must validate against definition.json
├── options/           # Fixtures that must validate against options.json
├── standalone/        # Self-contained schema/fixture pairs
└── helpers/           # Ajv helpers shared by the suites
tool/
├── check_parity.dart  # CI guard: embedded Dart constants == src/*.json bytes
└── CheckParity/       # CI guard: embedded .NET resources == src/*.json bytes
scripts/
├── build.sh           # Builds the minified dist files and the Dart shim
├── sync-readme.sh     # Keeps the README CDN links in sync with the version
└── version.sh         # Bumps all four manifests and tags a release
```

The schemas also ship to PyPI as the data-only `dicebear-schema` package
(`pyproject.toml`), the Python counterpart of the npm and Composer
distributions. It carries no Python code: the same `src/*.json` files are
exposed under the `dicebear_schema` import name and read by the consumer with
the standard library.

NuGet gets the same treatment through `DiceBear.Schema.csproj` and the shim in
`schema.cs`, which sit at the repository root next to `Cargo.toml`/`schema.rs`
and `go.mod`/`schema.go`. MSBuild embeds `src/*.json` into the assembly
verbatim, so unlike the Dart package there is no generated copy to keep in
sync. What `tool/CheckParity` guards is the wiring: that each `LogicalName`
still resolves and hands back the bytes in `src/`.

## Making a change

1. Edit the relevant schema in `src/`.
2. Add a test fixture in `tests/definition/` or `tests/options/`:
   - `valid/*.json` fixtures must pass validation.
   - `invalid/*.json` fixtures must fail validation.
3. Run `npm test`. The suite uses [Ajv](https://ajv.js.org/) with
   `ajv-formats`; failures point at the offending fixture and keyword.
4. Run `npm run build` to refresh the generated files. Both outputs are
   git-ignored: only the npm publish ships `dist/*.min.json`, and only the
   pub.dev publish ships `lib/dicebear_schema.dart`; each publish builds its
   output fresh from `src/`.
5. Run `npm run format` before you open the pull request.

### Tips when editing the schemas

- Keep the two files separate: `definition.json` describes the style file
  shipped by `@dicebear/definitions`; `options.json` describes runtime
  options accepted by `@dicebear/core`. Avoid adding fields in the wrong
  one.
- `options.json` uses wildcard property names (`*Variant`, `*Color`,
  `*Rotate`, …) that `@dicebear/core` expands per component. If you add a
  new wildcard, follow the existing `patternProperties` pattern.
- Only a narrow set of SVG elements and attributes is allowed in
  definitions. Event handlers, external URLs, and CSS-injection patterns
  must stay blocked.

## Code style

- Prettier formats everything (`.prettierrc` is in the repo root).
- JSON files use two-space indentation (Prettier default).
- Keep schema keys in a consistent order within each object; run
  `npm run format` and let Prettier settle the rest.

## Releasing (maintainers only)

Publishing is fully automated via the
[publish workflow](.github/workflows/publish.yml). To cut a release, bump the
version across all four manifests and tag it:

```sh
scripts/version.sh <version>   # e.g. 1.1.0 or 1.1.0-rc.1
git push && git push --tags
```

`scripts/version.sh` updates `version` in `package.json`, `pyproject.toml`,
`Cargo.toml`, `pubspec.yaml` **and** `DiceBear.Schema.csproj`, syncs the README
CDN links (`scripts/sync-readme.sh`) and `package-lock.json`, then creates the
commit and the `v<version>` tag. All five manifests carry the same version, so
always release via this script (not `npm version`, which would bump only
`package.json`).

On the tag, the workflow:

1. Runs the schema tests and builds the minified dist files.
2. Publishes to npm with provenance (`@dicebear/schema`).
3. Builds the data-only wheel from `src/` and publishes to PyPI via Trusted
   Publishing (`dicebear-schema`).
4. Publishes the Rust crate to crates.io via Trusted Publishing
   (`dicebear-schema`).
5. Publishes the Dart package to pub.dev via the GitHub Actions integration
   (`dicebear_schema`). This requires automated publishing to be enabled in the
   pub.dev admin settings for the package (repository `dicebear/schema`, tag
   pattern `v{{version}}`).
6. Publishes the NuGet package via Trusted Publishing (`DiceBear.Schema`). This
   requires a trusted publishing policy on nuget.org for this repository and
   the `Publish` workflow.

Packagist (`dicebear/schema`) and the Go module proxy
(`github.com/dicebear/schema`) both pick up the same Git tag automatically, with
no publish step. The Go version lives entirely in the tag, so `scripts/version.sh`
does not touch `go.mod`. For prereleases, note that PyPI normalizes to PEP 440, so
npm publishes `1.1.0-rc.1` while PyPI publishes `1.1.0rc1`.

> **Major version bumps and Go.** Go encodes the major version in the import path.
> While this repo is on `v0`/`v1` the module path stays `github.com/dicebear/schema`
> (no suffix). When it moves to `v2`, the `go.mod` module path must gain a `/v2`
> suffix by hand (and the README import examples updated). `scripts/version.sh`
> only rewrites the semver in the npm/PyPI/crates/pub/NuGet manifests, not the
> Go module path.

## Licensing

By opening a pull request you agree that your contribution is released
under the repository's [MIT license](./LICENSE).
