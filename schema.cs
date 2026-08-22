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

using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;

namespace DiceBear
{
    /// <summary>
    /// The DiceBear JSON Schema definitions, embedded in the assembly.
    /// </summary>
    /// <remarks>
    /// <para>
    /// A pure-data package. It mirrors the schema packages published to the
    /// other registries: the same source schemas under <c>src/</c>, with no
    /// logic. Consumers parse and validate (e.g. with JsonSchema.Net); this
    /// package only ships the bytes.
    /// </para>
    /// <para>
    /// Unlike the npm build, which serves the minified <c>dist/</c> over the
    /// browser, the assembly embeds the unminified <c>src/</c> JSON and parses
    /// it at runtime.
    /// </para>
    /// </remarks>
    public static class Schema
    {
        private const string ResourcePrefix = "DiceBear.Schema.";

        private static string? _definition;
        private static string? _options;

        /// <summary>
        /// <c>definition.json</c> — JSON Schema for DiceBear style definition
        /// files.
        /// </summary>
        public static string Definition => _definition ??= Read("definition");

        /// <summary>
        /// <c>options.json</c> — JSON Schema for DiceBear avatar options.
        /// </summary>
        public static string Options => _options ??= Read("options");

        /// <summary>
        /// Returns the raw JSON for the named schema (<c>"definition"</c> or
        /// <c>"options"</c>), or <see langword="null"/> if the name is unknown.
        /// </summary>
        /// <remarks>
        /// Companion to <see cref="All"/>: <c>All()</c> lists the names,
        /// <c>Get(name)</c> fetches one.
        /// </remarks>
        public static string? Get(string name)
        {
            switch (name)
            {
                case "definition":
                    return Definition;
                case "options":
                    return Options;
                default:
                    return null;
            }
        }

        /// <summary>
        /// Names of every embedded schema (<c>"definition"</c>,
        /// <c>"options"</c>).
        /// </summary>
        public static IReadOnlyList<string> All() => new[] { "definition", "options" };

        /// <summary>
        /// Reads one embedded schema as UTF-8 text.
        /// </summary>
        private static string Read(string name)
        {
            var assembly = typeof(Schema).GetTypeInfo().Assembly;
            var resource = ResourcePrefix + name + ".json";

            using (var stream = assembly.GetManifestResourceStream(resource))
            {
                if (stream == null)
                {
                    throw new InvalidOperationException(
                        "Embedded schema resource is missing: " + resource);
                }

                // The JSON files are committed without a byte order mark, and
                // BOM detection is switched off so that one appearing in src/
                // would survive into the string instead of being stripped. That
                // keeps the bytes identical to src/*.json on every platform, and
                // it lets tool/CheckParity see the difference: File.ReadAllText
                // does strip a BOM, so the comparison would fail and report it.
                using (var reader = new StreamReader(
                    stream, new UTF8Encoding(false), detectEncodingFromByteOrderMarks: false))
                {
                    return reader.ReadToEnd();
                }
            }
        }
    }
}
