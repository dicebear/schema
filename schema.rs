// -----------------------------------------------------------------------------
// MIT License
//
// Copyright (c) 2026 Florian Körner
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// -----------------------------------------------------------------------------

//! DiceBear JSON Schema definitions, embedded at compile time.
//!
//! This is a pure-data crate. It mirrors the npm (`@dicebear/schema`), Composer
//! (`dicebear/schema`) and PyPI (`dicebear-schema`) packages: the same source
//! schemas under `src/`, with no logic. Consumers parse and validate (e.g. with
//! the `jsonschema` crate); this crate only ships the bytes.
//!
//! Unlike npm — which serves the minified `dist/` over the browser — Rust embeds
//! the JSON into the binary and parses it at runtime, so the unminified `src/`
//! files are used directly, matching the Python and PHP packages.

/// `definition.json` — JSON Schema for DiceBear style definition files.
pub const DEFINITION: &str = include_str!("src/definition.json");

/// `options.json` — JSON Schema for DiceBear avatar options.
pub const OPTIONS: &str = include_str!("src/options.json");

/// Returns the raw JSON for the named schema (`"definition"` or `"options"`), or
/// `None` if the name is unknown.
///
/// Companion to `all`: `all()` lists the names, `get(name)` fetches one. Mirrors
/// the `dicebear-styles` crate's API.
pub fn get(name: &str) -> Option<&'static str> {
    match name {
        "definition" => Some(DEFINITION),
        "options" => Some(OPTIONS),
        _ => None,
    }
}

/// Names of every embedded schema (`"definition"`, `"options"`).
pub fn all() -> Vec<&'static str> {
    vec!["definition", "options"]
}
