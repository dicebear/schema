import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadSchema,
  createValidator,
  getDefSchema,
  LIMITS,
} from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const attrSchema = getDefSchema(schema, "attributes");
const validate = createValidator(attrSchema);

describe("definition.json $defs/attributes", () => {
  describe("valid attributes", () => {
    it("accepts empty object", () => {
      assert.equal(validate({}), true);
    });

    it("accepts string attribute", () => {
      assert.equal(validate({ d: "M0 0L10 10" }), true);
    });

    it("accepts color ref with named color", () => {
      assert.equal(validate({ fill: "red" }), true);
    });

    it("accepts color ref with hex", () => {
      assert.equal(validate({ stroke: "#ff0000" }), true);
    });

    it("accepts color ref with object (name reference)", () => {
      assert.equal(
        validate({ fill: { type: "color", name: "skinColor" } }),
        true,
      );
    });

    it("accepts multiple attributes", () => {
      assert.equal(validate({ d: "M0 0", fill: "red", opacity: "0.5" }), true);
    });
  });

  describe("paint server references (fill/stroke)", () => {
    it("accepts fill with local url(#id)", () => {
      assert.equal(validate({ fill: "url(#myGradient)" }), true);
    });

    it("accepts stroke with local url(#id)", () => {
      assert.equal(validate({ stroke: "url(#myPattern)" }), true);
    });

    it("accepts fill with uppercase URL(#id)", () => {
      assert.equal(validate({ fill: "URL(#myGradient)" }), true);
    });

    it("accepts fill with empty fragment url(#)", () => {
      assert.equal(validate({ fill: "url(#)" }), true);
    });

    it("rejects fill with external url()", () => {
      assert.equal(
        validate({ fill: "url(https://evil.com/grad.svg#g)" }),
        false,
      );
    });

    it("rejects stroke with external url()", () => {
      assert.equal(
        validate({ stroke: "url(https://evil.com/grad.svg#g)" }),
        false,
      );
    });
  });

  describe("injection filter (attributeString)", () => {
    it("accepts normal path data", () => {
      assert.equal(validate({ d: "M0 0L10 10 Z" }), true);
    });

    it("accepts transform with translate/scale", () => {
      assert.equal(validate({ transform: "translate(10, 20) scale(2)" }), true);
    });

    it("rejects d with external url()", () => {
      assert.equal(validate({ d: "url(https://evil.com/path.svg)" }), false);
    });

    it("rejects transform with expression()", () => {
      assert.equal(validate({ transform: "expression(alert(1))" }), false);
    });

    it("rejects font-size with behavior:", () => {
      assert.equal(validate({ "font-size": "behavior: url(xss.htc)" }), false);
    });

    it("rejects stdDeviation with -moz-binding", () => {
      assert.equal(
        validate({ stdDeviation: "-moz-binding: url(xss.xbl)" }),
        false,
      );
    });

    it("rejects opacity with backslash escape", () => {
      assert.equal(validate({ opacity: "\\75rl(x)" }), false);
    });

    it("accepts local url(#id) in an attributeString value", () => {
      assert.equal(validate({ d: "foo url(#ref) bar" }), true);
    });

    it("rejects fill with javascript: URI", () => {
      assert.equal(validate({ fill: "javascript:alert(1)" }), false);
    });

    it("rejects fill with mixed-case JavaScript: URI", () => {
      assert.equal(validate({ fill: "JavaScript:alert(1)" }), false);
    });

    it("rejects stroke with vbscript: URI", () => {
      assert.equal(validate({ stroke: "vbscript:MsgBox(1)" }), false);
    });
  });

  describe("length bounds", () => {
    it(`accepts attributeString at ${LIMITS.attributeString} characters`, () => {
      assert.equal(
        validate({ transform: "a".repeat(LIMITS.attributeString) }),
        true,
      );
    });

    it(`rejects attributeString over ${LIMITS.attributeString} characters`, () => {
      assert.equal(
        validate({ transform: "a".repeat(LIMITS.attributeString + 1) }),
        false,
      );
    });

    it(`accepts d (pathDataString) at ${LIMITS.pathDataString} characters`, () => {
      assert.equal(validate({ d: "M".repeat(LIMITS.pathDataString) }), true);
    });

    it(`rejects d (pathDataString) over ${LIMITS.pathDataString} characters`, () => {
      assert.equal(
        validate({ d: "M".repeat(LIMITS.pathDataString + 1) }),
        false,
      );
    });
  });

  describe("variable references in attributes", () => {
    it("accepts correct variable for font-family and font-weight", () => {
      assert.equal(
        validate({ "font-family": { type: "variable", name: "fontFamily" } }),
        true,
      );
      assert.equal(
        validate({ "font-weight": { type: "variable", name: "fontWeight" } }),
        true,
      );
    });

    it("rejects wrong variable name", () => {
      assert.equal(
        validate({ "font-family": { type: "variable", name: "fontWeight" } }),
        false,
      );
      assert.equal(
        validate({ "font-weight": { type: "variable", name: "fontFamily" } }),
        false,
      );
      assert.equal(
        validate({ "font-family": { type: "variable", name: "initial" } }),
        false,
      );
      assert.equal(
        validate({ "font-family": { type: "variable", name: "unknownVar" } }),
        false,
      );
    });

    it("rejects malformed variable reference", () => {
      assert.equal(validate({ "font-family": { name: "fontFamily" } }), false);
      assert.equal(validate({ "font-family": { type: "variable" } }), false);
      assert.equal(
        validate({
          "font-family": { type: "variable", name: "fontFamily", extra: true },
        }),
        false,
      );
    });
  });

  describe("invalid attributes", () => {
    it("rejects unknown attribute (additionalProperties: false)", () => {
      assert.equal(validate({ unknownProp: "value" }), false);
    });

    it("rejects attribute with wrong type", () => {
      assert.equal(validate({ d: 123 }), false);
    });
  });

  describe("href validation", () => {
    it("accepts internal reference #myElement", () => {
      assert.equal(validate({ href: "#myElement" }), true);
    });

    it("accepts data URI (png)", () => {
      assert.equal(
        validate({ href: "data:image/png;base64,iVBORw0KGgo=" }),
        true,
      );
    });

    it("accepts data URI (jpeg)", () => {
      assert.equal(
        validate({ href: "data:image/jpeg;base64,/9j/4AAQ=" }),
        true,
      );
    });

    it("rejects data URI with image/jpg (not a registered IANA media type)", () => {
      assert.equal(
        validate({ href: "data:image/jpg;base64,/9j/4AAQ=" }),
        false,
      );
    });

    it("rejects external URL", () => {
      assert.equal(validate({ href: "https://example.com/img.png" }), false);
    });

    it("rejects javascript URI", () => {
      assert.equal(validate({ href: "javascript:alert(1)" }), false);
    });

    it('rejects empty reference "#"', () => {
      assert.equal(validate({ href: "#" }), false);
    });

    it("rejects unsupported image type (svg)", () => {
      assert.equal(validate({ href: "data:image/svg;base64,PHN2Zz4=" }), false);
    });

    it("rejects data URI with svg+xml MIME type", () => {
      assert.equal(
        validate({ href: "data:image/svg+xml;base64,PHN2Zz4=" }),
        false,
      );
    });

    it("rejects data URI with text/html MIME type", () => {
      assert.equal(
        validate({ href: "data:text/html;base64,PHNjcmlwdD4=" }),
        false,
      );
    });

    it("rejects mixed-case JavaScript URI", () => {
      assert.equal(validate({ href: "JavaScript:alert(1)" }), false);
    });

    it("rejects vbscript URI", () => {
      assert.equal(validate({ href: "vbscript:MsgBox(1)" }), false);
    });

    it("rejects protocol-relative URL", () => {
      assert.equal(validate({ href: "//example.com/img.png" }), false);
    });

    it("rejects FTP URL", () => {
      assert.equal(validate({ href: "ftp://example.com/img.png" }), false);
    });

    it("rejects data URI without base64 encoding", () => {
      assert.equal(validate({ href: "data:image/png,rawcontent" }), false);
    });

    it("rejects whitespace-prefixed javascript URI", () => {
      assert.equal(validate({ href: " javascript:alert(1)" }), false);
    });

    it("rejects tab-prefixed javascript URI", () => {
      assert.equal(validate({ href: "\tjavascript:alert(1)" }), false);
    });

    it("rejects data URI with application MIME type", () => {
      assert.equal(
        validate({ href: "data:application/xml;base64,PHN2Zz4=" }),
        false,
      );
    });

    it("accepts fragment reference containing underscores and dots", () => {
      assert.equal(validate({ href: "#_my.id-2" }), true);
    });

    it("accepts fragment with consecutive separators", () => {
      assert.equal(validate({ href: "#my--id" }), true);
    });

    it("accepts fragment with trailing separator", () => {
      assert.equal(validate({ href: "#foo-" }), true);
    });

    it("rejects fragment starting with digit", () => {
      assert.equal(validate({ href: "#1foo" }), false);
    });

    it("rejects fragment with colon", () => {
      assert.equal(validate({ href: "#foo:bar" }), false);
    });

    it(`rejects data URI larger than ${LIMITS.dataUri} characters`, () => {
      const payload = "A".repeat(LIMITS.dataUri + 1);
      assert.equal(
        validate({ href: `data:image/png;base64,${payload}` }),
        false,
      );
    });
  });

  describe("event handler attributes (XSS prevention)", () => {
    for (const attr of [
      "onclick",
      "onload",
      "onerror",
      "onmouseover",
      "onfocus",
      "onanimationend",
      "onbegin",
      "onend",
      "onrepeat",
    ]) {
      it(`rejects ${attr}`, () => {
        assert.equal(validate({ [attr]: "alert(1)" }), false);
      });
    }
  });

  describe("namespace attributes (XSS prevention)", () => {
    for (const [attr, value] of [
      ["xlink:href", "javascript:alert(1)"],
      ["xmlns", "http://www.w3.org/2000/svg"],
      ["xmlns:xlink", "http://www.w3.org/1999/xlink"],
      ["XLINK:href", "javascript:alert(1)"],
      ["xml:base", "https://evil.com/"],
    ]) {
      it(`rejects ${attr}`, () => {
        assert.equal(validate({ [attr]: value }), false);
      });
    }
  });

  describe("style attribute security", () => {
    it("accepts safe inline style", () => {
      assert.equal(validate({ style: "fill: red; stroke: blue" }), true);
    });

    it("accepts style with opacity", () => {
      assert.equal(validate({ style: "opacity: 0.5" }), true);
    });

    it("accepts style with local url(#id) reference", () => {
      assert.equal(validate({ style: "fill: url(#myGradient)" }), true);
    });

    for (const fn of ["url", "URL", "Url"]) {
      it(`rejects style with external ${fn}()`, () => {
        assert.equal(
          validate({ style: `background: ${fn}(https://evil.com/steal)` }),
          false,
        );
      });
    }

    for (const [label, value] of [
      ["@import", "@import url(https://evil.com/steal.css)"],
      ["@import string form", "@import 'https://evil.com/steal.css'"],
      ["@IMPORT (case-insensitive)", "@IMPORT 'https://evil.com/steal.css'"],
      [
        "@font-face",
        "@font-face { font-family: evil; src: url('https://evil.com/font.woff') }",
      ],
      ["@document", "@document url-prefix('https://evil.com') { fill: red }"],
      ["@charset", '@charset "UTF-8"'],
    ]) {
      it(`rejects style with ${label}`, () => {
        assert.equal(validate({ style: value }), false);
      });
    }

    it("rejects style with expression()", () => {
      assert.equal(validate({ style: "width: expression(alert(1))" }), false);
    });

    it("rejects style with -moz-binding", () => {
      assert.equal(
        validate({ style: "-moz-binding: url(https://evil.com/xbl)" }),
        false,
      );
    });

    it("rejects style with behavior:", () => {
      assert.equal(
        validate({ style: "behavior: url(https://evil.com/xss.htc)" }),
        false,
      );
    });

    it("rejects style with url() and whitespace before parenthesis", () => {
      assert.equal(
        validate({ style: "background: url (https://evil.com/steal)" }),
        false,
      );
    });

    it("rejects style with CSS escape sequence (backslash)", () => {
      assert.equal(
        validate({ style: "background: \\75\\72\\6C(https://evil.com)" }),
        false,
      );
    });
  });

  describe("id attribute security", () => {
    it("accepts valid id", () => {
      assert.equal(validate({ id: "myElement" }), true);
    });

    it("rejects id with backslash escape", () => {
      assert.equal(validate({ id: "foo\\bar" }), false);
    });

    it("rejects id with javascript: scheme", () => {
      assert.equal(validate({ id: "javascript:alert(1)" }), false);
    });

    it("rejects id with external url()", () => {
      assert.equal(validate({ id: "url(https://evil.com/x)" }), false);
    });
  });

  describe("class attribute security", () => {
    it("accepts valid class name", () => {
      assert.equal(validate({ class: "my-class" }), true);
    });

    it("accepts multiple class names", () => {
      assert.equal(validate({ class: "class1 class2" }), true);
    });

    it("accepts utility-framework class syntax", () => {
      assert.equal(
        validate({ class: "hover:bg-red-500 w-[200px] sm:text-lg" }),
        true,
      );
    });

    it("rejects class with backslash escape", () => {
      assert.equal(validate({ class: "foo\\bar" }), false);
    });

    it("rejects class with javascript: scheme", () => {
      assert.equal(validate({ class: "javascript:alert(1)" }), false);
    });

    it("rejects class with external url()", () => {
      assert.equal(validate({ class: "url(https://evil.com/x)" }), false);
    });

    it("rejects class with expression()", () => {
      assert.equal(validate({ class: "expression(alert(1))" }), false);
    });
  });

  describe("URL-referencing attributes (external resource prevention)", () => {
    it("accepts filter with local url(#id)", () => {
      assert.equal(validate({ filter: "url(#myFilter)" }), true);
    });

    it("accepts filter with inline value", () => {
      assert.equal(validate({ filter: "blur(5px)" }), true);
    });

    it("accepts filter: none", () => {
      assert.equal(validate({ filter: "none" }), true);
    });

    it("rejects filter with external url()", () => {
      assert.equal(
        validate({ filter: "url(https://evil.com/filter.svg#f)" }),
        false,
      );
    });

    it("rejects filter with data: url()", () => {
      assert.equal(validate({ filter: "url(data:image/svg+xml,...)" }), false);
    });

    it("accepts clip-path with local url(#id)", () => {
      assert.equal(validate({ "clip-path": "url(#myClip)" }), true);
    });

    it("accepts clip-path with inline value", () => {
      assert.equal(validate({ "clip-path": "circle(50%)" }), true);
    });

    it("rejects clip-path with external url()", () => {
      assert.equal(
        validate({ "clip-path": "url(https://evil.com/clip.svg#c)" }),
        false,
      );
    });

    it("accepts mask with local url(#id)", () => {
      assert.equal(validate({ mask: "url(#myMask)" }), true);
    });

    it("rejects mask with external url()", () => {
      assert.equal(
        validate({ mask: "url(https://evil.com/mask.svg#m)" }),
        false,
      );
    });

    it("accepts marker-end with local url(#id)", () => {
      assert.equal(validate({ "marker-end": "url(#arrow)" }), true);
    });

    it("accepts marker-mid with local url(#id)", () => {
      assert.equal(validate({ "marker-mid": "url(#arrow)" }), true);
    });

    it("accepts marker-start with local url(#id)", () => {
      assert.equal(validate({ "marker-start": "url(#arrow)" }), true);
    });

    it("rejects marker-end with external url()", () => {
      assert.equal(
        validate({ "marker-end": "url(https://evil.com/marker.svg#m)" }),
        false,
      );
    });

    it("rejects marker-mid with external url()", () => {
      assert.equal(
        validate({ "marker-mid": "url(http://evil.com/marker.svg#m)" }),
        false,
      );
    });

    it("rejects marker-start with external url()", () => {
      assert.equal(
        validate({
          "marker-start": "url(https://evil.com/marker.svg#m)",
        }),
        false,
      );
    });

    it("rejects filter with javascript: url()", () => {
      assert.equal(validate({ filter: "url(javascript:alert(1))" }), false);
    });

    it("rejects filter with mixed-case URL()", () => {
      assert.equal(
        validate({ filter: "URL(https://evil.com/filter.svg#f)" }),
        false,
      );
    });

    it("rejects filter with CSS escape sequence (backslash)", () => {
      assert.equal(
        validate({ filter: "\\75\\72\\6C(https://evil.com/f.svg#f)" }),
        false,
      );
    });

    it("rejects clip-path with backslash bypass", () => {
      assert.equal(
        validate({ "clip-path": "\\75rl(https://evil.com/c.svg#c)" }),
        false,
      );
    });

    it("rejects mask with backslash bypass", () => {
      assert.equal(
        validate({ mask: "\\75rl(https://evil.com/m.svg#m)" }),
        false,
      );
    });

    for (const attr of [
      "filter",
      "clip-path",
      "mask",
      "marker-start",
      "marker-mid",
      "marker-end",
    ]) {
      for (const [label, value] of [
        ["expression()", "expression(alert(1))"],
        ["mixed-case Expression()", "Expression(alert(1))"],
        ["behavior:", "behavior: url(xss.htc)"],
        ["-moz-binding", "-moz-binding: url(xss.xbl)"],
      ]) {
        it(`rejects ${attr} with ${label}`, () => {
          assert.equal(validate({ [attr]: value }), false);
        });
      }
    }
  });

  describe("prototype pollution prevention", () => {
    it("rejects __proto__ as attribute key (JSON input)", () => {
      const obj = JSON.parse('{"__proto__": "value"}');
      assert.equal(validate(obj), false);
    });

    it("rejects constructor as attribute key", () => {
      assert.equal(validate({ constructor: "value" }), false);
    });

    it("rejects prototype as attribute key", () => {
      assert.equal(validate({ prototype: "value" }), false);
    });
  });
});
