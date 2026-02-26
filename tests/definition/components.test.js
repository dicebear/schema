import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema, createValidator } from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const validate = createValidator(schema);

function withCanvas(extra) {
  return { canvas: { elements: [], width: 100, height: 100 }, ...extra };
}

describe("definition.json components", () => {
  describe("valid components", () => {
    it("accepts empty components object", () => {
      assert.equal(validate(withCanvas({ components: {} })), true);
    });

    it("accepts minimal component with width/height/variants", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), true);
    });

    it("accepts component with optional probability/rotate/translate", () => {
      const data = withCanvas({
        components: {
          eyes: {
            width: 50,
            height: 30,
            probability: 80,
            rotate: [-10, 10],
            translate: { x: [-5, 5], y: [0, 10] },
            variants: { open: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), true);
    });

    it("accepts rotate as single-item array", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            rotate: [45],
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), true);
    });

    it("accepts rotate boundary values [-360, 360]", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            rotate: [-360, 360],
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), true);
    });

    it("accepts probability: 0 (boundary)", () => {
      const data = withCanvas({
        components: {
          nose: {
            width: 10,
            height: 10,
            probability: 0,
            variants: { small: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), true);
    });

    it("accepts probability: 100 (boundary)", () => {
      const data = withCanvas({
        components: {
          nose: {
            width: 10,
            height: 10,
            probability: 100,
            variants: { small: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), true);
    });
  });

  describe("invalid components", () => {
    it("rejects name starting with uppercase letter", () => {
      const data = withCanvas({
        components: {
          Head: {
            width: 100,
            height: 100,
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects name starting with digit", () => {
      const data = withCanvas({
        components: {
          "1head": {
            width: 100,
            height: 100,
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects empty-string name", () => {
      const data = withCanvas({
        components: {
          "": {
            width: 100,
            height: 100,
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects missing required fields (width/height/variants)", () => {
      const data = withCanvas({
        components: { head: {} },
      });
      assert.equal(validate(data), false);
    });

    it("rejects probability > 100", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            probability: 101,
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects translate x with more than 2 items", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            translate: { x: [-5, 0, 5], y: [0] },
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects translate y with more than 2 items", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            translate: { x: [0], y: [-5, 0, 5] },
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects empty translate x array", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            translate: { x: [], y: [0] },
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects rotate value > 360", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            rotate: [0, 361],
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects rotate value < -360", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            rotate: [-361, 0],
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects variant name starting with uppercase", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            variants: { Round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects variant name starting with digit", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            variants: { "1round": { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects rotate with more than 2 items", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            rotate: [-10, 0, 10],
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects empty rotate array", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            rotate: [],
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects probability < 0", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            probability: -1,
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });
  });

  describe("additionalProperties", () => {
    it("rejects additional property in component", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            variants: { round: { elements: [] } },
            extra: "data",
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects additional property in variant", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            variants: { round: { elements: [], extra: "data" } },
          },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects additional property in translate", () => {
      const data = withCanvas({
        components: {
          head: {
            width: 100,
            height: 100,
            translate: { x: [0], y: [0], z: [0] },
            variants: { round: { elements: [] } },
          },
        },
      });
      assert.equal(validate(data), false);
    });
  });
});
