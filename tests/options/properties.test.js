import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema, createValidator } from "../helpers/validator.js";

const schema = loadSchema("options.json");
const validate = createValidator(schema);

describe("options.json named properties", () => {
  describe("valid properties", () => {
    it("accepts empty object", () => {
      assert.equal(validate({}), true);
    });

    it("accepts seed as string", () => {
      assert.equal(validate({ seed: "myAvatar" }), true);
    });

    it("accepts size as integer", () => {
      assert.equal(validate({ size: 128 }), true);
    });

    it("accepts seed with 1024 characters", () => {
      assert.equal(validate({ seed: "a".repeat(1024) }), true);
    });

    it("accepts boundary: size: 1", () => {
      assert.equal(validate({ size: 1 }), true);
    });

    it("accepts idRandomization as boolean", () => {
      assert.equal(validate({ idRandomization: true }), true);
    });

    it("accepts flip: none", () => {
      assert.equal(validate({ flip: "none" }), true);
    });

    it("accepts flip: horizontal", () => {
      assert.equal(validate({ flip: "horizontal" }), true);
    });

    it("accepts flip: vertical", () => {
      assert.equal(validate({ flip: "vertical" }), true);
    });

    it("accepts flip: both", () => {
      assert.equal(validate({ flip: "both" }), true);
    });

    it("accepts flip as array", () => {
      assert.equal(validate({ flip: ["horizontal", "vertical"] }), true);
    });

    it("accepts empty flip array", () => {
      assert.equal(validate({ flip: [] }), true);
    });

    it("accepts fontFamily as string", () => {
      assert.equal(validate({ fontFamily: "Arial" }), true);
    });

    it("accepts fontFamily with spaces", () => {
      assert.equal(validate({ fontFamily: "Times New Roman" }), true);
    });

    it("accepts fontFamily with hyphen", () => {
      assert.equal(validate({ fontFamily: "Noto-Sans" }), true);
    });

    it("accepts fontFamily with underscore", () => {
      assert.equal(validate({ fontFamily: "My_Font" }), true);
    });

    it("accepts fontFamily as array", () => {
      assert.equal(validate({ fontFamily: ["Arial", "Helvetica"] }), true);
    });

    it("accepts fontFamily with comma-separated fallback", () => {
      assert.equal(validate({ fontFamily: "Arial, Helvetica" }), true);
    });

    it("accepts fontFamily with comma-separated fallback (no space)", () => {
      assert.equal(validate({ fontFamily: "Arial,Helvetica" }), true);
    });

    it("accepts fontFamily with multi-word and fallback chain", () => {
      assert.equal(
        validate({ fontFamily: "Times New Roman, Arial, sans-serif" }),
        true,
      );
    });

    it("accepts empty fontFamily array", () => {
      assert.equal(validate({ fontFamily: [] }), true);
    });

    it("accepts fontWeight: 400", () => {
      assert.equal(validate({ fontWeight: 400 }), true);
    });

    it("accepts fontWeight as array", () => {
      assert.equal(validate({ fontWeight: [400, 700] }), true);
    });

    it("accepts empty fontWeight array", () => {
      assert.equal(validate({ fontWeight: [] }), true);
    });

    it("accepts boundary: fontWeight: 1", () => {
      assert.equal(validate({ fontWeight: 1 }), true);
    });

    it("accepts boundary: fontWeight: 1000", () => {
      assert.equal(validate({ fontWeight: 1000 }), true);
    });

    it("accepts boundary: fontWeight array [1, 1000]", () => {
      assert.equal(validate({ fontWeight: [1, 1000] }), true);
    });

    it("accepts scale as single value", () => {
      assert.equal(validate({ scale: 2 }), true);
    });

    it("accepts scale as [min, max] array", () => {
      assert.equal(validate({ scale: [0.8, 1.2] }), true);
    });

    it("accepts scale array with 1 item", () => {
      assert.equal(validate({ scale: [0.8] }), true);
    });

    it("accepts scale as float", () => {
      assert.equal(validate({ scale: 1.5 }), true);
    });

    it("accepts empty scale array", () => {
      assert.equal(validate({ scale: [] }), true);
    });

    it("accepts boundary: scale: 0", () => {
      assert.equal(validate({ scale: 0 }), true);
    });

    it("accepts boundary: scale: 10", () => {
      assert.equal(validate({ scale: 10 }), true);
    });

    it("accepts boundary: size: 4096", () => {
      assert.equal(validate({ size: 4096 }), true);
    });

    it("accepts borderRadius as single value", () => {
      assert.equal(validate({ borderRadius: 10 }), true);
    });

    it("accepts borderRadius as [min, max] array", () => {
      assert.equal(validate({ borderRadius: [0, 50] }), true);
    });

    it("accepts borderRadius array with 1 item", () => {
      assert.equal(validate({ borderRadius: [25] }), true);
    });

    it("accepts borderRadius as float", () => {
      assert.equal(validate({ borderRadius: 10.5 }), true);
    });

    it("accepts empty borderRadius array", () => {
      assert.equal(validate({ borderRadius: [] }), true);
    });

    it("accepts boundary: borderRadius: 0", () => {
      assert.equal(validate({ borderRadius: 0 }), true);
    });

    it("accepts boundary: borderRadius: 50", () => {
      assert.equal(validate({ borderRadius: 50 }), true);
    });

    it("accepts tags as a single string", () => {
      assert.equal(validate({ tags: "hairLength:long" }), true);
    });

    it("accepts tags as an array of include/exclude tokens", () => {
      assert.equal(
        validate({ tags: ["hairLength:long", "!facialHair:beard"] }),
        true,
      );
    });

    it("accepts a bare-category exclude token", () => {
      assert.equal(validate({ tags: ["!facialHair"] }), true);
    });

    it("accepts an empty tags array", () => {
      assert.equal(validate({ tags: [] }), true);
    });

    it("accepts tags alongside a variant option", () => {
      assert.equal(
        validate({ tags: ["hairLength:long"], topVariant: ["shortFlat"] }),
        true,
      );
    });

    it("accepts the tags maxItems boundary (128)", () => {
      assert.equal(
        validate({
          tags: Array.from({ length: 128 }, (_, i) => `axis:value${i}`),
        }),
        true,
      );
    });

    it("accepts a filter token at the maxLength boundary (130)", () => {
      assert.equal(validate({ tags: ["!" + "a".repeat(129)] }), true);
    });

    it("accepts duplicate filter tokens (no uniqueItems, unlike variant tags)", () => {
      assert.equal(
        validate({ tags: ["hairLength:long", "hairLength:long"] }),
        true,
      );
    });
  });

  describe("invalid properties", () => {
    it("rejects seed with more than 1024 characters", () => {
      assert.equal(validate({ seed: "a".repeat(1025) }), false);
    });

    it("rejects seed as number", () => {
      assert.equal(validate({ seed: 123 }), false);
    });

    it("rejects size: 0", () => {
      assert.equal(validate({ size: 0 }), false);
    });

    it("rejects size: 1.5 (not integer)", () => {
      assert.equal(validate({ size: 1.5 }), false);
    });

    it("rejects idRandomization as string", () => {
      assert.equal(validate({ idRandomization: "true" }), false);
    });

    it("rejects idRandomization as number", () => {
      assert.equal(validate({ idRandomization: 1 }), false);
    });

    it("rejects invalid flip enum", () => {
      assert.equal(validate({ flip: "diagonal" }), false);
    });

    it("rejects flip array with more than 4 items", () => {
      assert.equal(
        validate({ flip: ["none", "horizontal", "vertical", "both", "none"] }),
        false,
      );
    });

    it("rejects flip array with invalid enum value", () => {
      assert.equal(validate({ flip: ["horizontal", "diagonal"] }), false);
    });

    it("rejects fontFamily array with more than 128 items", () => {
      assert.equal(validate({ fontFamily: Array(129).fill("Arial") }), false);
    });

    it("rejects fontFamily as number", () => {
      assert.equal(validate({ fontFamily: 123 }), false);
    });

    it("rejects fontFamily with special characters", () => {
      assert.equal(validate({ fontFamily: "Arial; color: red" }), false);
    });

    it("rejects fontFamily with parentheses", () => {
      assert.equal(validate({ fontFamily: "expression(alert(1))" }), false);
    });

    it("rejects fontWeight array with more than 128 items", () => {
      assert.equal(validate({ fontWeight: Array(129).fill(400) }), false);
    });

    it("rejects fontWeight as float", () => {
      assert.equal(validate({ fontWeight: 400.5 }), false);
    });

    it("rejects fontWeight: 0", () => {
      assert.equal(validate({ fontWeight: 0 }), false);
    });

    it("rejects fontWeight: 1001", () => {
      assert.equal(validate({ fontWeight: 1001 }), false);
    });

    it("rejects fontWeight as string", () => {
      assert.equal(validate({ fontWeight: "bold" }), false);
    });

    it("rejects fontWeight array with out-of-range value", () => {
      assert.equal(validate({ fontWeight: [400, 1001] }), false);
    });

    it("rejects fontWeight array with float", () => {
      assert.equal(validate({ fontWeight: [400, 700.5] }), false);
    });

    it("rejects scale as string", () => {
      assert.equal(validate({ scale: "big" }), false);
    });

    it("rejects scale < 0", () => {
      assert.equal(validate({ scale: -1 }), false);
    });

    it("rejects scale > 10", () => {
      assert.equal(validate({ scale: 10.1 }), false);
    });

    it("rejects scale: Infinity", () => {
      assert.equal(validate({ scale: Infinity }), false);
    });

    it("rejects scale array with item < 0", () => {
      assert.equal(validate({ scale: [-1, 1] }), false);
    });

    it("rejects scale array with item > 10", () => {
      assert.equal(validate({ scale: [1, 11] }), false);
    });

    it("rejects scale array with 3+ items", () => {
      assert.equal(validate({ scale: [0.8, 1, 1.2] }), false);
    });

    it("rejects size > 4096", () => {
      assert.equal(validate({ size: 4097 }), false);
    });

    it("rejects borderRadius as string", () => {
      assert.equal(validate({ borderRadius: "round" }), false);
    });

    it("rejects borderRadius > 50", () => {
      assert.equal(validate({ borderRadius: 51 }), false);
    });

    it("rejects borderRadius < 0", () => {
      assert.equal(validate({ borderRadius: -1 }), false);
    });

    it("rejects borderRadius array with item > 50", () => {
      assert.equal(validate({ borderRadius: [0, 51] }), false);
    });

    it("rejects borderRadius array with item < 0", () => {
      assert.equal(validate({ borderRadius: [-1, 30] }), false);
    });

    it("rejects borderRadius array with 3+ items", () => {
      assert.equal(validate({ borderRadius: [0, 25, 50] }), false);
    });

    it("rejects a malformed tag token (uppercase)", () => {
      assert.equal(validate({ tags: ["Hair:Long"] }), false);
    });

    it("rejects a three-segment tag token", () => {
      assert.equal(validate({ tags: ["hair:long:weird"] }), false);
    });

    it("rejects a negated token with an invalid (uppercase) body", () => {
      assert.equal(validate({ tags: ["!Hair"] }), false);
    });

    it("rejects a double negation", () => {
      assert.equal(validate({ tags: ["!!hair"] }), false);
    });

    it("rejects an empty-string token", () => {
      assert.equal(validate({ tags: [""] }), false);
    });

    it("rejects a non-string tag item", () => {
      assert.equal(validate({ tags: [123] }), false);
    });

    it("rejects tags array with more than 128 items", () => {
      assert.equal(
        validate({
          tags: Array.from({ length: 129 }, (_, i) => `axis:value${i}`),
        }),
        false,
      );
    });

    it("rejects a tag token exceeding maxLength (130)", () => {
      assert.equal(validate({ tags: ["a".repeat(131)] }), false);
    });

    it("rejects an array mixing a valid and an invalid token", () => {
      assert.equal(validate({ tags: ["hairLength:long", "!!bad"] }), false);
    });

    it("rejects a malformed single-string token", () => {
      assert.equal(validate({ tags: "Bad:X" }), false);
    });
  });
});
