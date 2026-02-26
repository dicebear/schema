import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema, createValidator } from "../helpers/validator.js";

const schema = loadSchema("options.json");
const validate = createValidator(schema);

describe("options.json patternProperties", () => {
  describe("probability", () => {
    it("accepts valid probability value", () => {
      assert.equal(validate({ headProbability: 50 }), true);
    });

    it("accepts probability: 0", () => {
      assert.equal(validate({ headProbability: 0 }), true);
    });

    it("accepts probability: 100", () => {
      assert.equal(validate({ headProbability: 100 }), true);
    });

    it("rejects probability < 0", () => {
      assert.equal(validate({ headProbability: -1 }), false);
    });

    it("rejects probability > 100", () => {
      assert.equal(validate({ headProbability: 101 }), false);
    });
  });

  describe("variant", () => {
    it("accepts variant as string", () => {
      assert.equal(validate({ eyesVariant: "open" }), true);
    });

    it("accepts variant as array of strings", () => {
      assert.equal(validate({ eyesVariant: ["open", "closed"] }), true);
    });

    it("rejects variant array with non-string item", () => {
      assert.equal(validate({ eyesVariant: [123] }), false);
    });
  });

  describe("color", () => {
    it("accepts single hex color", () => {
      assert.equal(validate({ skinColor: "#ff0000" }), true);
    });

    it("accepts hex color without # prefix", () => {
      assert.equal(validate({ skinColor: "ff0000" }), true);
    });

    it("accepts array of hex colors", () => {
      assert.equal(validate({ skinColor: ["#ff0000", "#00ff00"] }), true);
    });

    it("rejects named color string", () => {
      assert.equal(validate({ skinColor: "red" }), false);
    });

    it("rejects invalid color string", () => {
      assert.equal(validate({ skinColor: "not-a-color" }), false);
    });
  });

  describe("rotate", () => {
    it("accepts bare rotate", () => {
      assert.equal(validate({ rotate: 45 }), true);
    });

    it("accepts prefixed rotate (headRotate)", () => {
      assert.equal(validate({ headRotate: 90 }), true);
    });

    it("accepts rotate as array", () => {
      assert.equal(validate({ rotate: [-30, 30] }), true);
    });

    it("accepts boundary: -360", () => {
      assert.equal(validate({ rotate: -360 }), true);
    });

    it("accepts boundary: 360", () => {
      assert.equal(validate({ rotate: 360 }), true);
    });

    it("rejects rotate > 360", () => {
      assert.equal(validate({ rotate: 361 }), false);
    });

    it("rejects rotate < -360", () => {
      assert.equal(validate({ rotate: -361 }), false);
    });

    it("rejects rotate array with 3 items", () => {
      assert.equal(validate({ rotate: [-30, 0, 30] }), false);
    });

    it("accepts rotate array with 1 item", () => {
      assert.equal(validate({ rotate: [30] }), true);
    });

    it("rejects rotate array with out-of-range value", () => {
      assert.equal(validate({ rotate: [-361, 30] }), false);
    });
  });

  describe("translateY", () => {
    it("accepts single value", () => {
      assert.equal(validate({ translateY: 10 }), true);
    });

    it("accepts prefixed (headTranslateY)", () => {
      assert.equal(validate({ headTranslateY: -5 }), true);
    });

    it("accepts array form", () => {
      assert.equal(validate({ translateY: [-10, 10] }), true);
    });

    it("rejects array with 3 items", () => {
      assert.equal(validate({ translateY: [-10, 0, 10] }), false);
    });

    it("accepts array with 1 item", () => {
      assert.equal(validate({ translateY: [10] }), true);
    });

    it("accepts boundary: -100", () => {
      assert.equal(validate({ translateY: -100 }), true);
    });

    it("accepts boundary: 100", () => {
      assert.equal(validate({ translateY: 100 }), true);
    });

    it("rejects value > 100", () => {
      assert.equal(validate({ translateY: 101 }), false);
    });

    it("rejects value < -100", () => {
      assert.equal(validate({ translateY: -101 }), false);
    });

    it("rejects array with out-of-range value", () => {
      assert.equal(validate({ translateY: [-101, 10] }), false);
    });
  });

  describe("translateX", () => {
    it("accepts single value", () => {
      assert.equal(validate({ translateX: 10 }), true);
    });

    it("accepts prefixed (headTranslateX)", () => {
      assert.equal(validate({ headTranslateX: -5 }), true);
    });

    it("accepts array form", () => {
      assert.equal(validate({ translateX: [-10, 10] }), true);
    });

    it("rejects array with 3 items", () => {
      assert.equal(validate({ translateX: [-10, 0, 10] }), false);
    });

    it("accepts array with 1 item", () => {
      assert.equal(validate({ translateX: [10] }), true);
    });

    it("accepts boundary: -100", () => {
      assert.equal(validate({ translateX: -100 }), true);
    });

    it("accepts boundary: 100", () => {
      assert.equal(validate({ translateX: 100 }), true);
    });

    it("rejects value > 100", () => {
      assert.equal(validate({ translateX: 101 }), false);
    });

    it("rejects value < -100", () => {
      assert.equal(validate({ translateX: -101 }), false);
    });

    it("rejects array with out-of-range value", () => {
      assert.equal(validate({ translateX: [-101, 10] }), false);
    });
  });
});
