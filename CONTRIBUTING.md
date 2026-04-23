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

- [Node.js](https://nodejs.org/) 20 or newer (matches the test workflow)

## Local setup

```sh
git clone https://github.com/dicebear/schema.git
cd schema
npm install
```

## Scripts

| Script                 | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `npm run build`        | Runs `scripts/build.sh` to produce `dist/*.min.json`    |
| `npm test`             | Runs the Node built-in test runner against `tests/`     |
| `npm run format`       | Runs Prettier on the whole repo                         |
| `npm run format:check` | Checks formatting without writing                       |

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
└── sync-readme.sh     # Keeps the README CDN links in sync on npm version
```

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
[publish workflow](.github/workflows/publish.yml). To cut a release:

```sh
npm version patch   # or minor / major
git push origin main --follow-tags
```

`npm version` updates `package.json`, syncs the README via
`scripts/sync-readme.sh`, commits, and creates the Git tag. The workflow
installs dependencies, runs the tests, and publishes to npm with
provenance. Packagist picks up the same tag automatically once the repo
is linked there.

## Licensing

By opening a pull request you agree that your contribution is released
under the repository's [MIT license](./LICENSE).
