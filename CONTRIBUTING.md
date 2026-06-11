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
  definitions repo, the Figma exporter, and every third-party integration,
  so the coordination matters more than the diff.
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

| Script                 | What it does                                         |
| ---------------------- | ---------------------------------------------------- |
| `npm run build`        | Runs `scripts/build.sh` to produce `dist/*.min.json` |
| `npm test`             | Runs the Node built-in test runner against `tests/`  |
| `npm run format`       | Runs Prettier on the whole repo                      |
| `npm run format:check` | Checks formatting without writing                    |

## Project layout

```
src/
├── definition.json    # Schema for avatar style definitions
└── options.json       # Schema for the user-supplied options object
tests/
├── definition/        # Fixtures that must validate against definition.json
├── options/           # Fixtures that must validate against options.json
├── standalone/        # Self-contained schema/fixture pairs
└── helpers/           # Ajv helpers shared by the suites
scripts/
├── build.sh           # Builds the minified dist files
├── sync-readme.sh     # Keeps the README CDN links in sync with the version
└── version.sh         # Bumps package.json + pyproject.toml and tags a release
```

The schemas also ship to PyPI as the data-only `dicebear-schema` package
(`pyproject.toml`), the Python counterpart of the npm and Composer
distributions. It carries no Python code: the same `src/*.json` files are
exposed under the `dicebear_schema` import name and read by the consumer with
the standard library.

## Making a change

1. Edit the relevant schema in `src/`.
2. Add a test fixture in `tests/definition/` or `tests/options/`:
   - `valid/*.json` fixtures must pass validation.
   - `invalid/*.json` fixtures must fail validation.
3. Run `npm test`. The suite uses [Ajv](https://ajv.js.org/) with
   `ajv-formats`; failures point at the offending fixture and keyword.
4. Run `npm run build` and commit the regenerated `dist/*.min.json` files
   along with the source changes.
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
version across all three manifests and tag it:

```sh
scripts/version.sh <version>   # e.g. 1.1.0 or 1.1.0-rc.1
git push && git push --tags
```

`scripts/version.sh` updates `version` in `package.json`, `pyproject.toml` **and**
`Cargo.toml`, syncs the README CDN links (`scripts/sync-readme.sh`) and
`package-lock.json`, then creates the commit and the `v<version>` tag. All three
manifests carry the same version, so always release via this script (not
`npm version`, which would bump only `package.json`).

On the tag, the workflow:

1. Runs the schema tests and builds the minified dist files.
2. Publishes to npm with provenance (`@dicebear/schema`).
3. Builds the data-only wheel from `src/` and publishes to PyPI via Trusted
   Publishing (`dicebear-schema`).
4. Publishes the Rust crate to crates.io via Trusted Publishing
   (`dicebear-schema`).

Packagist (`dicebear/schema`) and the Go module proxy
(`github.com/dicebear/schema`) both pick up the same Git tag automatically, with
no publish step. The Go version lives entirely in the tag, so `scripts/version.sh`
does not touch `go.mod`. For prereleases, note that PyPI normalizes to PEP 440, so
npm publishes `1.1.0-rc.1` while PyPI publishes `1.1.0rc1`.

> **Major version bumps and Go.** Go encodes the major version in the import path.
> While this repo is on `v0`/`v1` the module path stays `github.com/dicebear/schema`
> (no suffix). When it moves to `v2`, the `go.mod` module path must gain a `/v2`
> suffix by hand (and the README import examples updated). `scripts/version.sh`
> only rewrites the semver in the npm/PyPI/crates manifests, not the Go module path.

## Licensing

By opening a pull request you agree that your contribution is released
under the repository's [MIT license](./LICENSE).
