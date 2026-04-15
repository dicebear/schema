import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadSchema,
  createValidator,
  getDefSchema,
  LIMITS,
} from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const colorValueSchema = getDefSchema(schema, "colorValue");
const validate = createValidator(colorValueSchema);

describe("definition.json $defs/colorValue", () => {
  describe("accepted color strings (not syntactically validated)", () => {
    for (const value of [
      "red",
      "DarkSlateGray",
      "currentColor",
      "transparent",
      "none",
      "inherit",
      "#fff",
      "#FF00FF",
      "#FF00FF80",
      "#ffff",
      "rgb(255, 0, 128)",
      "rgba(255, 0, 128, 0.5)",
      "rgb(255 0 128 / 50%)",
      "hsl(120, 50%, 50%)",
      "oklch(70.5% 0.15 280 / 50%)",
      "color(display-p3 1 0.5 0)",
      "color-mix(in srgb, #ff0000, #00ff00)",
      "light-dark(white, black)",
      "url(#myGradient)",
      "url(#pattern.v2)",
    ]) {
      it(`accepts ${JSON.stringify(value)}`, () => {
        assert.equal(validate(value), true);
      });
    }

    it("accepts syntactically nonsense strings — the browser will ignore them", () => {
      assert.equal(validate("rgb(abc)"), true);
      assert.equal(validate("oklch(xxxxxxxx)"), true);
      assert.equal(validate("not-a-color"), true);
    });
  });

  describe("injection prevention", () => {
    it("rejects external url()", () => {
      assert.equal(validate("url(https://evil.com/grad.svg#g)"), false);
    });

    it("rejects external url() in color-mix argument", () => {
      assert.equal(
        validate("color-mix(in srgb, url(https://evil.com), #000)"),
        false,
      );
    });

    it("rejects uppercase URL() external reference", () => {
      assert.equal(validate("URL(https://evil.com)"), false);
    });

    it("rejects mixed-case Url() external reference", () => {
      assert.equal(validate("Url(https://evil.com)"), false);
    });

    it("rejects url() with whitespace before non-hash target", () => {
      assert.equal(validate("url( https://evil.com)"), false);
    });

    it("rejects expression()", () => {
      assert.equal(validate("expression(alert(1))"), false);
    });

    it("rejects mixed-case Expression()", () => {
      assert.equal(validate("Expression(alert(1))"), false);
    });

    it("rejects behavior:", () => {
      assert.equal(validate("behavior: url(xss.htc)"), false);
    });

    it("rejects -moz-binding", () => {
      assert.equal(validate("-moz-binding: url(xss.xbl)"), false);
    });

    it("rejects backslash escape sequences", () => {
      assert.equal(validate("\\75\\72\\6C(https://evil.com)"), false);
    });

    it(`accepts string of exactly ${LIMITS.colorValue} characters`, () => {
      assert.equal(validate("a".repeat(LIMITS.colorValue)), true);
    });

    it(`rejects string longer than ${LIMITS.colorValue} characters`, () => {
      assert.equal(validate("a".repeat(LIMITS.colorValue + 1)), false);
    });
  });

  describe("local url(#id) references are allowed", () => {
    it("accepts url(#id)", () => {
      assert.equal(validate("url(#myGradient)"), true);
    });

    it("accepts url(#id) with dots and hyphens", () => {
      assert.equal(validate("url(#my-gradient.v2)"), true);
    });

    it("accepts url(#id) with leading whitespace", () => {
      assert.equal(validate("url( #myGradient)"), true);
    });
  });

  describe("object form (palette reference)", () => {
    it("accepts valid camelCase palette reference", () => {
      assert.equal(validate({ type: "color", name: "skinColor" }), true);
    });

    it("accepts single-word palette reference", () => {
      assert.equal(validate({ type: "color", name: "hair" }), true);
    });

    it("rejects missing name", () => {
      assert.equal(validate({ type: "color" }), false);
    });

    it("rejects missing type", () => {
      assert.equal(validate({ name: "hair" }), false);
    });

    it("rejects palette name starting with uppercase", () => {
      assert.equal(validate({ type: "color", name: "SkinColor" }), false);
    });

    it("rejects palette name with special characters", () => {
      assert.equal(validate({ type: "color", name: "skin-color" }), false);
    });

    it("rejects hex color as palette name", () => {
      assert.equal(validate({ type: "color", name: "#ff0000" }), false);
    });

    it("rejects arbitrary string as palette name", () => {
      assert.equal(
        validate({ type: "color", name: "url(https://evil.com)" }),
        false,
      );
    });

    it("rejects additional properties", () => {
      assert.equal(
        validate({ type: "color", name: "hair", extra: "data" }),
        false,
      );
    });
  });

  describe("non-string, non-object types", () => {
    it("rejects number", () => {
      assert.equal(validate(123), false);
    });

    it("rejects null", () => {
      assert.equal(validate(null), false);
    });

    it("rejects boolean", () => {
      assert.equal(validate(true), false);
    });

    it("accepts empty string (browser treats it as no value)", () => {
      assert.equal(validate(""), true);
    });
  });
});
