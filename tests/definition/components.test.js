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

const makeAliasPair = (aliasOverrides = {}) =>
  withCanvas({
    components: {
      eyes: {
        width: 100,
        height: 100,
        variants: { round: { elements: [] } },
      },
      eyesRight: {
        extends: "eyes",
        ...aliasOverrides,
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
          rotate: { min: -10, max: 10 },
          translate: { x: { min: -5, max: 5 }, y: { min: 0, max: 10 } },
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
      assertInvalid(
        makeComponent({
          translate: { x: { min: 0, max: 0 }, y: { min: 0, max: 0 }, z: { min: 0, max: 0 } },
        }),
      );
    });

    it("rejects additional property on translate range object", () => {
      assertInvalid(
        makeComponent({
          translate: { x: { min: 0, max: 10, extra: 1 }, y: { min: 0, max: 0 } },
        }),
      );
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
    it("accepts range object", () => {
      assertValid(makeComponent({ rotate: { min: -360, max: 360 } }));
    });

    it("accepts range object with step", () => {
      assertValid(makeComponent({ rotate: { min: -180, max: 180, step: 15 } }));
    });

    it("accepts fixed value via min === max", () => {
      assertValid(makeComponent({ rotate: { min: 45, max: 45 } }));
    });

    it("rejects max > 360", () => {
      assertInvalid(makeComponent({ rotate: { min: 0, max: 361 } }));
    });

    it("rejects min < -360", () => {
      assertInvalid(makeComponent({ rotate: { min: -361, max: 0 } }));
    });

    it("accepts fractional step", () => {
      assertValid(makeComponent({ rotate: { min: 0, max: 10, step: 0.5 } }));
    });

    it("rejects step <= 0", () => {
      assertInvalid(makeComponent({ rotate: { min: 0, max: 10, step: 0 } }));
    });

    it("rejects missing max", () => {
      assertInvalid(makeComponent({ rotate: { min: 0 } }));
    });

    it("rejects missing min", () => {
      assertInvalid(makeComponent({ rotate: { max: 10 } }));
    });

    it("rejects bare number", () => {
      assertInvalid(makeComponent({ rotate: 45 }));
    });

    it("rejects array form", () => {
      assertInvalid(makeComponent({ rotate: [45] }));
    });
  });

  describe("translate bounds", () => {
    it("accepts boundary range objects (±1000)", () => {
      assertValid(
        makeComponent({
          translate: {
            x: { min: -1000, max: 1000 },
            y: { min: -1000, max: 1000 },
          },
        }),
      );
    });

    it("accepts fixed value via min === max", () => {
      assertValid(
        makeComponent({ translate: { x: { min: 5, max: 5 }, y: { min: 0, max: 0 } } }),
      );
    });

    it("rejects bare numbers", () => {
      assertInvalid(makeComponent({ translate: { x: 5, y: -10 } }));
    });

    it("accepts x range with step", () => {
      assertValid(
        makeComponent({
          translate: { x: { min: 0, max: 100, step: 5 }, y: { min: 0, max: 0 } },
        }),
      );
    });

    it("accepts y range with step", () => {
      assertValid(
        makeComponent({
          translate: { x: { min: 0, max: 0 }, y: { min: 0, max: 100, step: 5 } },
        }),
      );
    });

    it("rejects array form for x", () => {
      assertInvalid(
        makeComponent({ translate: { x: [0, 100], y: { min: 0, max: 0 } } }),
      );
    });

    it("rejects array form for y", () => {
      assertInvalid(
        makeComponent({ translate: { x: { min: 0, max: 0 }, y: [0, 100] } }),
      );
    });

    it("accepts fractional step", () => {
      assertValid(
        makeComponent({
          translate: { x: { min: 0, max: 100, step: 2.5 }, y: { min: 0, max: 0 } },
        }),
      );
    });

    it("rejects step <= 0", () => {
      assertInvalid(
        makeComponent({
          translate: { x: { min: 0, max: 100, step: 0 }, y: { min: 0, max: 0 } },
        }),
      );
    });

    it("rejects value below lower bound (-1001)", () => {
      assertInvalid(
        makeComponent({
          translate: { x: { min: -1001, max: 0 }, y: { min: 0, max: 0 } },
        }),
      );
    });

    it("rejects value above upper bound (1001)", () => {
      assertInvalid(
        makeComponent({
          translate: { x: { min: 0, max: 1001 }, y: { min: 0, max: 0 } },
        }),
      );
    });
  });

  describe("scale bounds", () => {
    it("accepts range object with float bounds", () => {
      assertValid(makeComponent({ scale: { min: 0.8, max: 1.2 } }));
    });

    it("accepts boundary range [0, 10]", () => {
      assertValid(makeComponent({ scale: { min: 0, max: 10 } }));
    });

    it("accepts range object with step", () => {
      assertValid(makeComponent({ scale: { min: 0, max: 10, step: 1 } }));
    });

    it("accepts fixed value via min === max", () => {
      assertValid(makeComponent({ scale: { min: 1.5, max: 1.5 } }));
    });

    it("rejects max > 10", () => {
      assertInvalid(makeComponent({ scale: { min: 1, max: 10.1 } }));
    });

    it("rejects min < 0", () => {
      assertInvalid(makeComponent({ scale: { min: -0.1, max: 1 } }));
    });

    it("accepts fractional step", () => {
      assertValid(makeComponent({ scale: { min: 0.8, max: 1.2, step: 0.1 } }));
    });

    it("rejects step <= 0", () => {
      assertInvalid(makeComponent({ scale: { min: 0, max: 1, step: 0 } }));
    });

    it("rejects bare number", () => {
      assertInvalid(makeComponent({ scale: 1.5 }));
    });

    it("rejects array form", () => {
      assertInvalid(makeComponent({ scale: [1.5] }));
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

  describe("aliases (extends)", () => {
    describe("valid aliases", () => {
      it("accepts minimal alias", () => {
        assertValid(makeAliasPair());
      });
    });

    describe("invalid aliases", () => {
      it("rejects alias with probability override", () => {
        assertInvalid(makeAliasPair({ probability: 50 }));
      });

      it("rejects alias with rotate override", () => {
        assertInvalid(makeAliasPair({ rotate: { min: -15, max: 15 } }));
      });

      it("rejects alias with scale override", () => {
        assertInvalid(makeAliasPair({ scale: { min: 0.9, max: 1.1 } }));
      });

      it("rejects alias with translate override", () => {
        assertInvalid(makeAliasPair({ translate: { x: { min: -5, max: 5 }, y: 0 } }));
      });

      it("rejects alias with width", () => {
        assertInvalid(makeAliasPair({ width: 100 }));
      });

      it("rejects alias with height", () => {
        assertInvalid(makeAliasPair({ height: 100 }));
      });

      it("rejects alias with variants", () => {
        assertInvalid(makeAliasPair({ variants: { round: { elements: [] } } }));
      });

      it("rejects alias missing extends", () => {
        assertInvalid(
          withCanvas({
            components: {
              eyes: {
                width: 100,
                height: 100,
                variants: { round: { elements: [] } },
              },
              eyesRight: {},
            },
          }),
        );
      });

      it("rejects alias with additional property", () => {
        assertInvalid(makeAliasPair({ extra: "data" }));
      });

      it("rejects extends with uppercase name", () => {
        assertInvalid(makeAliasPair({ extends: "Eyes" }));
      });

      it("rejects extends as non-string", () => {
        assertInvalid(makeAliasPair({ extends: 42 }));
      });
    });
  });
});
