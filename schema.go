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

// Package schema embeds the DiceBear JSON Schema definitions.
//
// It is a pure-data package, mirroring the npm (@dicebear/schema), Composer
// (dicebear/schema), PyPI (dicebear-schema) and crates.io (dicebear-schema)
// packages: the same source schemas under src/, with no logic. Consumers parse
// and validate (e.g. with github.com/santhosh-tekuri/jsonschema); this package
// only ships the bytes.
//
// Unlike the npm build, which serves the minified dist/, Go embeds and parses the
// unminified src/ JSON, matching the Python, PHP and Rust packages.
package schema

import _ "embed"

// Definition is the JSON Schema for DiceBear style definition files.
//
//go:embed src/definition.json
var Definition string

// Options is the JSON Schema for DiceBear avatar options.
//
//go:embed src/options.json
var Options string

// Get returns the raw JSON for the named schema ("definition" or "options"), or
// ("", false) if the name is unknown.
//
// Companion to All: All lists the names, Get fetches one.
func Get(name string) (string, bool) {
	switch name {
	case "definition":
		return Definition, true
	case "options":
		return Options, true
	}
	return "", false
}

// All returns the names of every embedded schema ("definition", "options").
func All() []string {
	return []string{"definition", "options"}
}
