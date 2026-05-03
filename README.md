# @dicebear/schema

JSON Schema definitions for [DiceBear](https://dicebear.com) avatar styles and options.

## Schemas

This package exports two JSON Schemas (Draft 07):

### `definition.json`

Validates avatar style definitions — the files that describe how a DiceBear avatar style is structured. A definition includes:

- **`canvas`** _(required)_ — The SVG canvas dimensions and root element tree
- **`components`** — Named, reusable SVG components with variants. At render time, a PRNG selects one variant per component.
- **`colors`** — Named color palettes. Colors can define constraints such as `notEqualTo` (must differ from another color) or `contrastTo` (picks the highest-contrast value).
- **`attributes`** — Global SVG attributes applied to the root `<svg>` element
- **`meta`** — License, creator, and source metadata

Only a safe subset of SVG elements and attributes is permitted. Event handlers, external URL references, and CSS injection patterns are explicitly blocked.

### `options.json`

Validates the options object passed by users when generating an avatar. Supported properties include:

| Property          | Type                           | Description                                                   |
| ----------------- | ------------------------------ | ------------------------------------------------------------- |
| `seed`            | `string`                       | PRNG seed for reproducible avatars                            |
| `size`            | `integer`                      | Output size in pixels                                         |
| `flip`            | `string \| array`              | Mirror direction: `none`, `horizontal`, `vertical`, or `both` |
| `scale`           | `number \| [min, max]`         | Scaling factor (0 to 10, 1 = original size)                   |
| `rotate`          | `number \| [min, max]`         | Rotation in degrees (−360 to 360)                             |
| `translateX`      | `number \| [min, max]`         | Horizontal offset (−1000 to 1000)                             |
| `translateY`      | `number \| [min, max]`         | Vertical offset (−1000 to 1000)                               |
| `borderRadius`    | `number \| [min, max]`         | Corner radius (0 = sharp, 50 = circle)                        |
| `idRandomization` | `boolean`                      | SVG ID randomization to avoid conflicts                       |
| `fontFamily`      | `string \| array`              | Font family for text rendering                                |
| `fontWeight`      | `integer \| array`             | Font weight (1 to 1000)                                       |
| `*Probability`    | `number`                       | Component display probability (0 to 100)                      |
| `*Variant`        | `string \| string[] \| object` | Component variant filter and weights                          |
| `*Color`          | `string \| array`              | Hex colors                                                    |
| `*ColorFill`      | `string \| array`              | Color fill: `solid`, `linear`, or `radial`                    |
| `*ColorFillStops` | `integer \| [min, max]`        | Gradient color stops (min 2)                                  |
| `*ColorAngle`     | `number \| [min, max]`         | Gradient angle (−360 to 360)                                  |
| `*Rotate`         | `number \| [min, max]`         | Component rotation in degrees (−360 to 360)                   |
| `*TranslateX`     | `number \| [min, max]`         | Component horizontal offset (−1000 to 1000)                   |
| `*TranslateY`     | `number \| [min, max]`         | Component vertical offset (−1000 to 1000)                     |

When an option accepts an array, the PRNG either picks from the list (for discrete values) or picks a value within the range (for numeric min/max pairs).

## Installation

**npm**

```sh
npm install @dicebear/schema
```

**Composer**

```sh
composer require dicebear/schema
```

**CDN**

The schemas are available directly via CDN — no installation required. We recommend using a specific version to ensure stability:

```
https://cdn.hopjs.net/npm/@dicebear/schema@0.14.0/dist/definition.min.json
https://cdn.hopjs.net/npm/@dicebear/schema@0.14.0/dist/options.min.json
```

## Usage

**JavaScript**

```js
import definitionSchema from "@dicebear/schema/definition.json" assert { type: "json" };
import optionsSchema from "@dicebear/schema/options.json" assert { type: "json" };
```

**PHP**

```php
$basePath = \Composer\InstalledVersions::getInstallPath('dicebear/schema');

$definition = json_decode(file_get_contents($basePath . '/src/definition.json'), true);
$options    = json_decode(file_get_contents($basePath . '/src/options.json'), true);
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local development, testing,
and the release process.

## Sponsors

Advertisement: Many thanks to our sponsors who provide us with free or discounted products.

<a href="https://bunny.net/" target="_blank" rel="noopener noreferrer">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://www.dicebear.com/sponsors/bunny-light.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://www.dicebear.com/sponsors/bunny-dark.svg">
        <img alt="bunny.net" src="https://www.dicebear.com/sponsors/bunny-dark.svg" height="64">
    </picture>
</a>
