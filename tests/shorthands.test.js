import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema } from "./helpers/validator.js";

function walk(node, path, visit) {
  if (!node || typeof node !== "object") return;

  visit(node, path);

  for (const value of Object.values(node)) {
    if (value && typeof value === "object") {
      walk(value, path, visit);
    }
  }
}

// Regex shorthands do not mean the same thing in every engine, and these
// schemas are compiled by seven of them. `\s` is the one that bit: PCRE,
// Python, RE2, .NET and ECMA-262 disagree on which code points it covers, so
// the same definition validated in one language and failed in another. `\v` is
// worse, PCRE reads it as a character class where the others read a single
// character. Spell the characters out instead.
const SHORTHAND = /\\[sSdDwWvVbBhHRX]/;

for (const filename of ["definition.json", "options.json"]) {
  describe(`${filename} regex portability`, () => {
    const schema = loadSchema(filename);

    it("no pattern uses a shorthand character class", () => {
      const offenders = [];

      walk(schema, [], (node) => {
        if (typeof node.pattern === "string" && SHORTHAND.test(node.pattern)) {
          offenders.push(node.pattern);
        }

        if (
          node.patternProperties &&
          typeof node.patternProperties === "object"
        ) {
          for (const key of Object.keys(node.patternProperties)) {
            if (SHORTHAND.test(key)) {
              offenders.push(key);
            }
          }
        }
      });

      assert.deepEqual(
        offenders,
        [],
        `patterns using a shorthand:\n${offenders.join("\n")}`,
      );
    });
  });
}
