import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadSchema,
  createValidator,
  withCanvas,
} from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const validate = createValidator(schema);

const makeComponent = (overrides = {}) =>
  withCanvas({
    components: {
      head: {
        width: 100,
        height: 100,
        variants: { round: { elements: [] } },
        ...overrides,
      },
    },
  });

const componentWithName = (name) =>
  withCanvas({
    components: {
      [name]: {
        width: 100,
        height: 100,
        variants: { round: { elements: [] } },
      },
    },
  });

const assertValid = (data) => assert.equal(validate(data), true);
const assertInvalid = (data) => assert.equal(validate(data), false);

describe("definition.json components", () => {
  describe("valid components", () => {
    it("accepts empty components object", () => {
      assertValid(withCanvas({ components: {} }));
    });

    it("accepts minimal component (width/height/variants)", () => {
      assertValid(makeComponent());
    });

    it("accepts component with probability/rotate/translate", () => {
      assertValid(
        makeComponent({
          probability: 80,
          rotate: [-10, 10],
          translate: { x: [-5, 5], y: [0, 10] },
        }),
      );
    });
  });

  describe("component names", () => {
    it("rejects name starting with uppercase letter", () => {
      assertInvalid(componentWithName("Head"));
    });

    it("rejects name starting with digit", () => {
      assertInvalid(componentWithName("1head"));
    });

    it("rejects empty-string name", () => {
      assertInvalid(componentWithName(""));
    });
  });

  describe("component structure", () => {
    it("rejects missing required fields", () => {
      assertInvalid(withCanvas({ components: { head: {} } }));
    });

    it("rejects additional property on component", () => {
      assertInvalid(makeComponent({ extra: "data" }));
    });

    it("rejects additional property on translate", () => {
      assertInvalid(makeComponent({ translate: { x: [0], y: [0], z: [0] } }));
    });
  });

  describe("probability bounds", () => {
    it("accepts boundary 0", () => {
      assertValid(makeComponent({ probability: 0 }));
    });

    it("accepts boundary 100", () => {
      assertValid(makeComponent({ probability: 100 }));
    });

    it("rejects > 100", () => {
      assertInvalid(makeComponent({ probability: 101 }));
    });

    it("rejects < 0", () => {
      assertInvalid(makeComponent({ probability: -1 }));
    });
  });

  describe("rotate bounds", () => {
    it("accepts single-item array", () => {
      assertValid(makeComponent({ rotate: [45] }));
    });

    it("accepts boundary values [-360, 360]", () => {
      assertValid(makeComponent({ rotate: [-360, 360] }));
    });

    it("rejects value > 360", () => {
      assertInvalid(makeComponent({ rotate: [0, 361] }));
    });

    it("rejects value < -360", () => {
      assertInvalid(makeComponent({ rotate: [-361, 0] }));
    });

    it("rejects more than 2 items", () => {
      assertInvalid(makeComponent({ rotate: [-10, 0, 10] }));
    });

    it("rejects empty array", () => {
      assertInvalid(makeComponent({ rotate: [] }));
    });

    it("rejects bare number (arrays only)", () => {
      assertInvalid(makeComponent({ rotate: 45 }));
    });
  });

  describe("translate bounds", () => {
    it("accepts boundary values (±1000)", () => {
      assertValid(
        makeComponent({
          translate: { x: [-1000, 1000], y: [-1000, 1000] },
        }),
      );
    });

    it("rejects x with more than 2 items", () => {
      assertInvalid(makeComponent({ translate: { x: [-5, 0, 5], y: [0] } }));
    });

    it("rejects y with more than 2 items", () => {
      assertInvalid(makeComponent({ translate: { x: [0], y: [-5, 0, 5] } }));
    });

    it("rejects empty array", () => {
      assertInvalid(makeComponent({ translate: { x: [], y: [0] } }));
    });

    it("rejects bare number (arrays only)", () => {
      assertInvalid(makeComponent({ translate: { x: 5, y: -10 } }));
    });

    it("rejects value below lower bound (-1001)", () => {
      assertInvalid(makeComponent({ translate: { x: [-1001, 0], y: [0] } }));
    });

    it("rejects value above upper bound (1001)", () => {
      assertInvalid(makeComponent({ translate: { x: [0, 1001], y: [0] } }));
    });
  });

  describe("variants", () => {
    it("rejects variant name starting with uppercase", () => {
      assertInvalid(makeComponent({ variants: { Round: { elements: [] } } }));
    });

    it("rejects variant name starting with digit", () => {
      assertInvalid(
        makeComponent({ variants: { "1round": { elements: [] } } }),
      );
    });

    it("rejects additional property on variant", () => {
      assertInvalid(
        makeComponent({
          variants: { round: { elements: [], extra: "data" } },
        }),
      );
    });

    describe("weight", () => {
      it("accepts integer weight", () => {
        assertValid(
          makeComponent({ variants: { round: { elements: [], weight: 10 } } }),
        );
      });

      it("accepts weight boundary 0", () => {
        assertValid(
          makeComponent({ variants: { round: { elements: [], weight: 0 } } }),
        );
      });

      it("accepts fractional weight", () => {
        assertValid(
          makeComponent({
            variants: { round: { elements: [], weight: 0.5 } },
          }),
        );
      });

      it("accepts multiple variants with different weights", () => {
        assertValid(
          makeComponent({
            variants: {
              round: { elements: [], weight: 50 },
              square: { elements: [], weight: 10 },
              star: { elements: [], weight: 1 },
            },
          }),
        );
      });

      it("rejects negative weight", () => {
        assertInvalid(
          makeComponent({
            variants: { round: { elements: [], weight: -1 } },
          }),
        );
      });

      it("rejects string weight", () => {
        assertInvalid(
          makeComponent({
            variants: { round: { elements: [], weight: "high" } },
          }),
        );
      });

      it("rejects the removed rarity property (renamed to weight)", () => {
        assertInvalid(
          makeComponent({
            variants: { round: { elements: [], rarity: 10 } },
          }),
        );
      });
    });
  });
});
