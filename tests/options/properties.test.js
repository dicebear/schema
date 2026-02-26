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
      assert.equal(
        validate({ flip: ["horizontal", "vertical"] }),
        true,
      );
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

    it("accepts fontWeight: 400", () => {
      assert.equal(validate({ fontWeight: 400 }), true);
    });

    it("accepts boundary: fontWeight: 1", () => {
      assert.equal(validate({ fontWeight: 1 }), true);
    });

    it("accepts boundary: fontWeight: 1000", () => {
      assert.equal(validate({ fontWeight: 1000 }), true);
    });

    it("accepts fontWeight as array", () => {
      assert.equal(validate({ fontWeight: [400, 700] }), true);
    });

    it("accepts boundary: fontWeight array [1, 1000]", () => {
      assert.equal(validate({ fontWeight: [1, 1000] }), true);
    });

    it("accepts scale as single value", () => {
      assert.equal(validate({ scale: 100 }), true);
    });

    it("accepts scale as [min, max] array", () => {
      assert.equal(validate({ scale: [80, 120] }), true);
    });

    it("accepts borderRadius as single value", () => {
      assert.equal(validate({ borderRadius: 10 }), true);
    });

    it("accepts borderRadius as [min, max] array", () => {
      assert.equal(validate({ borderRadius: [0, 50] }), true);
    });

    it("accepts boundary: size: 1", () => {
      assert.equal(validate({ size: 1 }), true);
    });

    it("accepts boundary: borderRadius: 0", () => {
      assert.equal(validate({ borderRadius: 0 }), true);
    });

    it("accepts boundary: borderRadius: 50", () => {
      assert.equal(validate({ borderRadius: 50 }), true);
    });

    it("accepts boundary: scale: 0", () => {
      assert.equal(validate({ scale: 0 }), true);
    });
  });

  describe("invalid properties", () => {
    it("rejects size: 0", () => {
      assert.equal(validate({ size: 0 }), false);
    });

    it("rejects size: 1.5 (not integer)", () => {
      assert.equal(validate({ size: 1.5 }), false);
    });

    it("rejects seed as number", () => {
      assert.equal(validate({ seed: 123 }), false);
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

    it("rejects invalid flip enum", () => {
      assert.equal(validate({ flip: "diagonal" }), false);
    });

    it("rejects flip array with invalid enum value", () => {
      assert.equal(validate({ flip: ["horizontal", "diagonal"] }), false);
    });

    it("rejects idRandomization as string", () => {
      assert.equal(validate({ idRandomization: "true" }), false);
    });

    it("rejects idRandomization as number", () => {
      assert.equal(validate({ idRandomization: 1 }), false);
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

    it("rejects scale < 0", () => {
      assert.equal(validate({ scale: -1 }), false);
    });

    it("rejects scale array with item < 0", () => {
      assert.equal(validate({ scale: [-1, 50] }), false);
    });

    it("rejects scale array with 3+ items", () => {
      assert.equal(validate({ scale: [80, 100, 120] }), false);
    });

    it("rejects scale array with 1 item", () => {
      assert.equal(validate({ scale: [80] }), false);
    });
  });
});
