import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadSchema,
  createValidator,
  getDefSchema,
  LIMITS,
} from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const elementSchema = getDefSchema(schema, "element");
const validate = createValidator(elementSchema);

describe("definition.json $defs/element", () => {
  describe("valid elements", () => {
    it("accepts element with name", () => {
      assert.equal(validate({ type: "element", name: "rect" }), true);
    });

    it("accepts minimal text type with string value", () => {
      assert.equal(validate({ type: "text", value: "hi" }), true);
    });

    it("accepts component with name", () => {
      assert.equal(validate({ type: "component", name: "eyes" }), true);
    });

    for (const variableName of ["initial", "initials"]) {
      it(`accepts text with variable value object (${variableName})`, () => {
        assert.equal(
          validate({
            type: "text",
            value: { type: "variable", name: variableName },
          }),
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

    it("rejects component without required name", () => {
      assert.equal(validate({ type: "component" }), false);
    });

    it("rejects text without required value", () => {
      assert.equal(validate({ type: "text" }), false);
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
        validate({ type: "component", name: "Invalid Name" }),
        false,
      );
    });

    it("rejects wrong variable name", () => {
      assert.equal(
        validate({
          type: "text",
          value: { type: "variable", name: "fontFamily" },
        }),
        false,
      );
      assert.equal(
        validate({
          type: "text",
          value: { type: "variable", name: "skinColor" },
        }),
        false,
      );
    });

    it("rejects malformed variable reference", () => {
      assert.equal(
        validate({ type: "text", value: { name: "initial" } }),
        false,
      );
      assert.equal(
        validate({ type: "text", value: { type: "variable" } }),
        false,
      );
      assert.equal(
        validate({
          type: "text",
          value: { type: "variable", name: "initial", extra: true },
        }),
        false,
      );
    });

    it("rejects value on non-style element", () => {
      assert.equal(
        validate({ type: "element", name: "rect", value: "test" }),
        false,
      );
    });

    it(`rejects text value longer than ${LIMITS.elementValue} characters`, () => {
      assert.equal(
        validate({ type: "text", value: "a".repeat(LIMITS.elementValue + 1) }),
        false,
      );
    });

    it(`accepts text value of exactly ${LIMITS.elementValue} characters`, () => {
      assert.equal(
        validate({ type: "text", value: "a".repeat(LIMITS.elementValue) }),
        true,
      );
    });
  });

  describe("type-specific name and attribute rules", () => {
    it("rejects component type with an extra value property", () => {
      assert.equal(
        validate({ type: "component", name: "eyes", value: "rect" }),
        false,
      );
    });

    it("rejects component type with attributes", () => {
      assert.equal(
        validate({ type: "component", name: "eyes", attributes: {} }),
        false,
      );
    });

    it("rejects text type with an extra name property", () => {
      assert.equal(
        validate({ type: "text", value: "hi", name: "rect" }),
        false,
      );
    });

    it("rejects text type with attributes", () => {
      assert.equal(
        validate({ type: "text", value: "hi", attributes: {} }),
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

    it("rejects text type with children", () => {
      assert.equal(
        validate({
          type: "text",
          children: [{ type: "element", name: "tspan" }],
        }),
        false,
      );
    });

    it("rejects component type with children", () => {
      assert.equal(
        validate({
          type: "component",
          name: "eyes",
          children: [{ type: "element", name: "rect" }],
        }),
        false,
      );
    });
  });

  describe("style element content security", () => {
    const styleWithChildren = (...children) => ({
      type: "element",
      name: "style",
      children,
    });

    const styleWithCss = (...values) =>
      styleWithChildren(...values.map((value) => ({ type: "text", value })));

    it("rejects style element with value (value not valid on element types)", () => {
      assert.equal(
        validate({
          type: "element",
          name: "style",
          value: ".cls { fill: red; }",
        }),
        false,
      );
    });

    it("accepts style element with no children", () => {
      assert.equal(validate({ type: "element", name: "style" }), true);
    });

    it("accepts style element with empty children array", () => {
      assert.equal(validate(styleWithChildren()), true);
    });

    it("accepts style element with safe CSS text child", () => {
      assert.equal(
        validate(styleWithCss(".cls { fill: red; stroke: blue; }")),
        true,
      );
    });

    it("accepts style element with local url() reference in text child", () => {
      assert.equal(
        validate(styleWithCss(".cls { fill: url(#gradient); }")),
        true,
      );
    });

    it("accepts style element with multiple safe text children", () => {
      assert.equal(
        validate(styleWithCss(".a { fill: red; }", ".b { stroke: blue; }")),
        true,
      );
    });

    for (const [label, value] of [
      ["external url()", ".cls { background: url(https://evil.com/track); }"],
      ["@import", "@import url('https://evil.com/steal.css');"],
      [
        "@font-face",
        "@font-face { font-family: evil; src: url('https://evil.com/font.woff'); }",
      ],
      ["expression()", ".cls { width: expression(alert(1)); }"],
      ["-moz-binding", ".cls { -moz-binding: url(https://evil.com/xbl#xss); }"],
      [
        "CSS escape sequence (backslash)",
        ".cls { background: \\75\\72\\6C(https://evil.com); }",
      ],
    ]) {
      it(`rejects style element with ${label} in text child`, () => {
        assert.equal(validate(styleWithCss(value)), false);
      });
    }

    it("rejects style element with element child", () => {
      assert.equal(
        validate(styleWithChildren({ type: "element", name: "g" })),
        false,
      );
    });

    it("rejects style element with component child", () => {
      assert.equal(
        validate(styleWithChildren({ type: "component", name: "eyes" })),
        false,
      );
    });

    it("rejects style element with text child using variable value", () => {
      assert.equal(
        validate(
          styleWithChildren({
            type: "text",
            value: { type: "variable", name: "initial" },
          }),
        ),
        false,
      );
    });

    it("rejects style element with value AND children", () => {
      assert.equal(
        validate({
          ...styleWithCss(".a { fill: red; }"),
          value: ".cls { fill: red; }",
        }),
        false,
      );
    });
  });
});
