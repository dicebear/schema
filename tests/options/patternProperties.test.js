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

    it("accepts probability as float", () => {
      assert.equal(validate({ headProbability: 50.5 }), true);
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

    it("accepts empty variant array", () => {
      assert.equal(validate({ eyesVariant: [] }), true);
    });

    it("rejects variant array with more than 128 items", () => {
      assert.equal(validate({ eyesVariant: Array(129).fill("open") }), false);
    });

    it("rejects variant array with non-string item", () => {
      assert.equal(validate({ eyesVariant: [123] }), false);
    });

    it("accepts variant as object with weights", () => {
      assert.equal(
        validate({ eyesVariant: { open: 5, closed: 1 } }),
        true
      );
    });

    it("accepts variant object with weight 0 (boundary)", () => {
      assert.equal(validate({ eyesVariant: { open: 0 } }), true);
    });

    it("accepts variant object with fractional weight", () => {
      assert.equal(validate({ eyesVariant: { open: 0.5 } }), true);
    });

    it("accepts empty variant object", () => {
      assert.equal(validate({ eyesVariant: {} }), true);
    });

    it("rejects variant object with more than 128 properties", () => {
      const obj = Object.fromEntries(
        Array.from({ length: 129 }, (_, i) => [`v${i}`, 1])
      );
      assert.equal(validate({ eyesVariant: obj }), false);
    });

    it("rejects variant object with negative weight", () => {
      assert.equal(validate({ eyesVariant: { open: -1 } }), false);
    });

    it("rejects variant object key starting with uppercase", () => {
      assert.equal(validate({ eyesVariant: { Open: 10 } }), false);
    });

    it("rejects variant object key starting with digit", () => {
      assert.equal(validate({ eyesVariant: { "1open": 10 } }), false);
    });

    it("rejects variant object with string value", () => {
      assert.equal(
        validate({ eyesVariant: { open: "high" } }),
        false
      );
    });

    it("rejects the removed *VariantRarity option", () => {
      assert.equal(
        validate({ eyesVariantRarity: { open: 5 } }),
        false
      );
    });
  });

  describe("color", () => {
    it("accepts single hex color", () => {
      assert.equal(validate({ skinColor: "#ff0000" }), true);
    });

    it("accepts hex color without # prefix", () => {
      assert.equal(validate({ skinColor: "ff0000" }), true);
    });

    it("accepts 4-digit hex color", () => {
      assert.equal(validate({ skinColor: "#f00a" }), true);
    });

    it("accepts array of hex colors", () => {
      assert.equal(validate({ skinColor: ["#ff0000", "#00ff00"] }), true);
    });

    it("accepts empty color array", () => {
      assert.equal(validate({ skinColor: [] }), true);
    });

    it("rejects color array with more than 128 items", () => {
      assert.equal(validate({ skinColor: Array(129).fill("#ff0000") }), false);
    });

    it("rejects named color string", () => {
      assert.equal(validate({ skinColor: "red" }), false);
    });

    it("rejects invalid color string", () => {
      assert.equal(validate({ skinColor: "not-a-color" }), false);
    });
  });

  describe("colorFill", () => {
    it("accepts single colorFill value", () => {
      assert.equal(validate({ skinColorFill: "solid" }), true);
    });

    it("accepts all valid colorFill values", () => {
      assert.equal(validate({ skinColorFill: "linear" }), true);
      assert.equal(validate({ skinColorFill: "radial" }), true);
    });

    it("accepts array of colorFill values", () => {
      assert.equal(validate({ skinColorFill: ["solid", "linear"] }), true);
    });

    it("accepts empty colorFill array", () => {
      assert.equal(validate({ skinColorFill: [] }), true);
    });

    it("rejects colorFill array with more than 128 items", () => {
      assert.equal(validate({ skinColorFill: Array(129).fill("solid") }), false);
    });

    it("rejects invalid colorFill string", () => {
      assert.equal(validate({ skinColorFill: "gradient" }), false);
    });

    it("rejects array with invalid colorFill item", () => {
      assert.equal(validate({ skinColorFill: ["solid", "invalid"] }), false);
    });
  });

  describe("colorFillStops", () => {
    it("accepts single colorFillStops value", () => {
      assert.equal(validate({ skinColorFillStops: 2 }), true);
    });

    it("accepts colorFillStops: 1", () => {
      assert.equal(validate({ skinColorFillStops: 1 }), true);
    });

    it("accepts colorFillStops > 2", () => {
      assert.equal(validate({ skinColorFillStops: 5 }), true);
    });

    it("accepts colorFillStops as [min, max] array", () => {
      assert.equal(validate({ skinColorFillStops: [2, 5] }), true);
    });

    it("accepts colorFillStops array with 1 item", () => {
      assert.equal(validate({ skinColorFillStops: [3] }), true);
    });

    it("accepts empty colorFillStops array", () => {
      assert.equal(validate({ skinColorFillStops: [] }), true);
    });

    it("rejects colorFillStops < 1", () => {
      assert.equal(validate({ skinColorFillStops: 0 }), false);
    });

    it("rejects negative colorFillStops", () => {
      assert.equal(validate({ skinColorFillStops: -1 }), false);
    });

    it("rejects colorFillStops as float", () => {
      assert.equal(validate({ skinColorFillStops: 2.5 }), false);
    });

    it("rejects colorFillStops array with 3 items", () => {
      assert.equal(validate({ skinColorFillStops: [2, 3, 5] }), false);
    });

    it("rejects colorFillStops array with out-of-range value", () => {
      assert.equal(validate({ skinColorFillStops: [0, 5] }), false);
    });
  });

  describe("colorAngle", () => {
    it("accepts single colorAngle value", () => {
      assert.equal(validate({ skinColorAngle: 45 }), true);
    });

    it("accepts colorAngle as float", () => {
      assert.equal(validate({ skinColorAngle: 45.5 }), true);
    });

    it("accepts colorAngle as [min, max] array", () => {
      assert.equal(validate({ skinColorAngle: [-90, 90] }), true);
    });

    it("accepts colorAngle array with 1 item", () => {
      assert.equal(validate({ skinColorAngle: [45] }), true);
    });

    it("accepts empty colorAngle array", () => {
      assert.equal(validate({ skinColorAngle: [] }), true);
    });

    it("accepts boundary: -360", () => {
      assert.equal(validate({ skinColorAngle: -360 }), true);
    });

    it("accepts boundary: 360", () => {
      assert.equal(validate({ skinColorAngle: 360 }), true);
    });

    it("rejects colorAngle > 360", () => {
      assert.equal(validate({ skinColorAngle: 361 }), false);
    });

    it("rejects colorAngle < -360", () => {
      assert.equal(validate({ skinColorAngle: -361 }), false);
    });

    it("rejects colorAngle array with 3 items", () => {
      assert.equal(validate({ skinColorAngle: [-90, 0, 90] }), false);
    });

    it("rejects colorAngle array with out-of-range value", () => {
      assert.equal(validate({ skinColorAngle: [-361, 90] }), false);
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

    it("accepts rotate array with 1 item", () => {
      assert.equal(validate({ rotate: [30] }), true);
    });

    it("accepts empty rotate array", () => {
      assert.equal(validate({ rotate: [] }), true);
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

    it("accepts array with 1 item", () => {
      assert.equal(validate({ translateY: [10] }), true);
    });

    it("accepts empty translateY array", () => {
      assert.equal(validate({ translateY: [] }), true);
    });

    it("accepts boundary: -100", () => {
      assert.equal(validate({ translateY: -100 }), true);
    });

    it("accepts boundary: 100", () => {
      assert.equal(validate({ translateY: 100 }), true);
    });

    it("rejects array with 3 items", () => {
      assert.equal(validate({ translateY: [-10, 0, 10] }), false);
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

    it("accepts array with 1 item", () => {
      assert.equal(validate({ translateX: [10] }), true);
    });

    it("accepts empty translateX array", () => {
      assert.equal(validate({ translateX: [] }), true);
    });

    it("accepts boundary: -100", () => {
      assert.equal(validate({ translateX: -100 }), true);
    });

    it("accepts boundary: 100", () => {
      assert.equal(validate({ translateX: 100 }), true);
    });

    it("rejects array with 3 items", () => {
      assert.equal(validate({ translateX: [-10, 0, 10] }), false);
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
