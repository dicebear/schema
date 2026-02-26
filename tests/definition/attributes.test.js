import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadSchema,
  createValidator,
  getDefSchema,
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
        validate({ fill: { type: "color", value: "skinColor" } }),
        true,
      );
    });

    it("accepts fill with local url(#id)", () => {
      assert.equal(validate({ fill: "url(#myGradient)" }), true);
    });

    it("accepts stroke with local url(#id)", () => {
      assert.equal(validate({ stroke: "url(#myPattern)" }), true);
    });

    it("rejects fill with external url()", () => {
      assert.equal(validate({ fill: "url(https://evil.com/grad.svg#g)" }), false);
    });

    it("rejects fill with uppercase URL(#id)", () => {
      assert.equal(validate({ fill: "URL(#myGradient)" }), false);
    });

    it("rejects fill with empty id url(#)", () => {
      assert.equal(validate({ fill: "url(#)" }), false);
    });

    it("rejects stroke with external url()", () => {
      assert.equal(validate({ stroke: "url(https://evil.com/grad.svg#g)" }), false);
    });

    it("accepts multiple attributes", () => {
      assert.equal(validate({ d: "M0 0", fill: "red", opacity: "0.5" }), true);
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

    it("rejects style with external url()", () => {
      assert.equal(
        validate({ style: "background: url(https://evil.com/steal)" }),
        false,
      );
    });

    it("rejects style with external URL() (uppercase)", () => {
      assert.equal(
        validate({ style: "background: URL(https://evil.com/steal)" }),
        false,
      );
    });

    it("rejects style with external mixed-case Url()", () => {
      assert.equal(
        validate({ style: "background: Url(https://evil.com/steal)" }),
        false,
      );
    });

    it("rejects style with @import", () => {
      assert.equal(
        validate({ style: "@import url(https://evil.com/steal.css)" }),
        false,
      );
    });

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

    it("accepts id with underscores and hyphens", () => {
      assert.equal(validate({ id: "_my-element.v2" }), true);
    });

    it("rejects id with HTML tags", () => {
      assert.equal(validate({ id: "<script>alert(1)</script>" }), false);
    });

    it("rejects id with spaces", () => {
      assert.equal(validate({ id: "my element" }), false);
    });

    it("rejects id starting with a digit", () => {
      assert.equal(validate({ id: "1invalid" }), false);
    });

    it("rejects id with quotes", () => {
      assert.equal(validate({ id: 'a"onload="alert(1)' }), false);
    });
  });

  describe("class attribute security", () => {
    it("accepts valid class name", () => {
      assert.equal(validate({ class: "my-class" }), true);
    });

    it("accepts multiple class names", () => {
      assert.equal(validate({ class: "class1 class2" }), true);
    });

    it("rejects class with HTML tags", () => {
      assert.equal(
        validate({ class: '<img src=x onerror="alert(1)">' }),
        false,
      );
    });

    it("rejects class with curly braces", () => {
      assert.equal(validate({ class: "a{color:red}" }), false);
    });

    it("rejects class with quotes", () => {
      assert.equal(validate({ class: 'a" onclick="alert(1)' }), false);
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
