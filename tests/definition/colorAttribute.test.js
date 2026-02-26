import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadSchema,
  createValidator,
  getDefSchema,
} from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const colorAttrSchema = getDefSchema(schema, "colorAttribute");
const validate = createValidator(colorAttrSchema);

describe("definition.json $defs/colorAttribute", () => {
  describe("named colors", () => {
    it('accepts "red"', () => {
      assert.equal(validate("red"), true);
    });

    it('accepts "DarkSlateGray"', () => {
      assert.equal(validate("DarkSlateGray"), true);
    });

    it('rejects empty string ""', () => {
      assert.equal(validate(""), false);
    });
  });

  describe("hex colors", () => {
    it('accepts "#fff"', () => {
      assert.equal(validate("#fff"), true);
    });

    it('accepts "#FF00FF"', () => {
      assert.equal(validate("#FF00FF"), true);
    });

    it('accepts "#FF00FF80" (8-digit hex with alpha)', () => {
      assert.equal(validate("#FF00FF80"), true);
    });

    it('rejects "#ffff" (4-digit hex)', () => {
      assert.equal(validate("#ffff"), false);
    });

    it('rejects "#ggg" (invalid hex chars)', () => {
      assert.equal(validate("#ggg"), false);
    });

    it('"fff" matches named color pattern', () => {
      assert.equal(validate("fff"), true);
    });
  });

  describe("rgb/rgba", () => {
    it('accepts "rgb(255, 0, 128)"', () => {
      assert.equal(validate("rgb(255, 0, 128)"), true);
    });

    it('accepts "rgba(255, 0, 128, 0.5)"', () => {
      assert.equal(validate("rgba(255, 0, 128, 0.5)"), true);
    });

    it("rejects alpha > 1", () => {
      assert.equal(validate("rgba(255, 0, 128, 2)"), false);
    });
  });

  describe("hsl/hsla", () => {
    it('accepts "hsl(120, 50%, 50%)"', () => {
      assert.equal(validate("hsl(120, 50%, 50%)"), true);
    });

    it('accepts "hsla(120, 50%, 50%, 0.5)"', () => {
      assert.equal(validate("hsla(120, 50%, 50%, 0.5)"), true);
    });

    it("rejects missing % signs", () => {
      assert.equal(validate("hsl(120, 50, 50)"), false);
    });
  });

  describe("hsb/hsba", () => {
    it('accepts "hsb(120, 50%, 50%)"', () => {
      assert.equal(validate("hsb(120, 50%, 50%)"), true);
    });

    it('accepts "hsba(120, 50%, 50%, 0.5)"', () => {
      assert.equal(validate("hsba(120, 50%, 50%, 0.5)"), true);
    });
  });

  describe("object form (name reference)", () => {
    it("accepts valid camelCase name reference", () => {
      assert.equal(validate({ type: "color", value: "skinColor" }), true);
    });

    it("accepts single-word name reference", () => {
      assert.equal(validate({ type: "color", value: "hair" }), true);
    });

    it("rejects missing value", () => {
      assert.equal(validate({ type: "color" }), false);
    });

    it("rejects missing type", () => {
      assert.equal(validate({ value: "hair" }), false);
    });

    it("rejects value starting with uppercase", () => {
      assert.equal(validate({ type: "color", value: "SkinColor" }), false);
    });

    it("rejects value with special characters", () => {
      assert.equal(validate({ type: "color", value: "skin-color" }), false);
    });

    it("rejects hex color as value", () => {
      assert.equal(validate({ type: "color", value: "#ff0000" }), false);
    });

    it("rejects arbitrary string as value", () => {
      assert.equal(
        validate({ type: "color", value: "url(https://evil.com)" }),
        false,
      );
    });

    it("rejects additional properties", () => {
      assert.equal(
        validate({ type: "color", value: "hair", extra: "data" }),
        false,
      );
    });
  });

  describe("type errors", () => {
    it("rejects number", () => {
      assert.equal(validate(123), false);
    });

    it("rejects null", () => {
      assert.equal(validate(null), false);
    });

    it("rejects url(#id) (paint server reference not allowed in colorAttribute)", () => {
      assert.equal(validate("url(#myGradient)"), false);
    });
  });
});
