import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadSchema,
  createValidator,
  getDefSchema,
} from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const animationSchema = getDefSchema(schema, "animation");
const validateAnimation = createValidator(animationSchema);
const elementSchema = getDefSchema(schema, "element");
const validateElement = createValidator(elementSchema);

const minimalTrack = { keyframes: [{ at: 0, value: 1 }] };

function block(extra) {
  return { duration: 1, tracks: { opacity: minimalTrack }, ...extra };
}

describe("definition.json $defs/animation", () => {
  describe("valid animations", () => {
    it("accepts a minimal block (duration + one track)", () => {
      assert.equal(validateAnimation(block()), true);
    });

    it("accepts every optional field at once", () => {
      assert.equal(
        validateAnimation({
          duration: 5.4,
          delay: -7,
          iterations: "infinite",
          direction: "alternate",
          fill: "forwards",
          easing: "easeOut",
          origin: { x: 50, y: 100 },
          tracks: {
            translateX: minimalTrack,
            translateY: minimalTrack,
            rotate: minimalTrack,
            scaleX: minimalTrack,
            scaleY: minimalTrack,
            opacity: minimalTrack,
          },
        }),
        true,
      );
    });

    for (const easing of [
      "linear",
      "ease",
      "easeIn",
      "easeOut",
      "easeInOut",
      "hold",
    ]) {
      it(`accepts named easing "${easing}"`, () => {
        assert.equal(validateAnimation(block({ easing })), true);
      });
    }

    it("accepts a cubic bezier easing with overshoot y values", () => {
      assert.equal(
        validateAnimation(
          block({ easing: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 } }),
        ),
        true,
      );
    });

    it("accepts a per-keyframe easing", () => {
      assert.equal(
        validateAnimation(
          block({
            tracks: {
              rotate: {
                keyframes: [
                  { at: 0, value: 0, easing: "hold" },
                  {
                    at: 50,
                    value: 180,
                    easing: { x1: 0, y1: 0, x2: 1, y2: 1 },
                  },
                  { at: 100, value: 360 },
                ],
              },
            },
          }),
        ),
        true,
      );
    });

    it("accepts finite iterations", () => {
      assert.equal(validateAnimation(block({ iterations: 3 })), true);
    });

    it("accepts a camelCase name", () => {
      assert.equal(validateAnimation(block({ name: "blink" })), true);
      assert.equal(validateAnimation(block({ name: "lookAround2" })), true);
    });

    it("accepts a track with 64 keyframes", () => {
      const keyframes = Array.from({ length: 64 }, (_, i) => ({
        at: (i * 100) / 63,
        value: i,
      }));
      assert.equal(
        validateAnimation(block({ tracks: { opacity: { keyframes } } })),
        true,
      );
    });

    it("accepts boundary block values", () => {
      assert.equal(validateAnimation(block({ duration: 3600 })), true);
      assert.equal(validateAnimation(block({ delay: -3600 })), true);
      assert.equal(validateAnimation(block({ delay: 3600 })), true);
      assert.equal(validateAnimation(block({ iterations: 10000 })), true);
      assert.equal(
        validateAnimation(block({ origin: { x: -1000, y: 1000 } })),
        true,
      );
    });

    it("accepts boundary keyframe values", () => {
      assert.equal(
        validateAnimation(
          block({
            tracks: {
              rotate: {
                keyframes: [
                  { at: 0, value: -36000 },
                  { at: 100, value: 36000 },
                ],
              },
            },
          }),
        ),
        true,
      );
    });
  });

  describe("invalid animations", () => {
    it("rejects a block without duration", () => {
      assert.equal(
        validateAnimation({ tracks: { opacity: minimalTrack } }),
        false,
      );
    });

    it("rejects a block without tracks", () => {
      assert.equal(validateAnimation({ duration: 1 }), false);
    });

    it("rejects empty tracks", () => {
      assert.equal(validateAnimation({ duration: 1, tracks: {} }), false);
    });

    it("rejects a duration of 0", () => {
      assert.equal(validateAnimation(block({ duration: 0 })), false);
    });

    it("rejects a name outside the camelCase pattern", () => {
      assert.equal(validateAnimation(block({ name: "Blink" })), false);
      assert.equal(validateAnimation(block({ name: "has-dash" })), false);
      assert.equal(validateAnimation(block({ name: "" })), false);
    });

    it("rejects an unknown track name", () => {
      assert.equal(
        validateAnimation(block({ tracks: { skewX: minimalTrack } })),
        false,
      );
    });

    it("rejects a track without keyframes", () => {
      assert.equal(
        validateAnimation(block({ tracks: { opacity: { keyframes: [] } } })),
        false,
      );
    });

    it("rejects a track with 65 keyframes", () => {
      const keyframes = Array.from({ length: 65 }, (_, i) => ({
        at: 0,
        value: i,
      }));
      assert.equal(
        validateAnimation(block({ tracks: { opacity: { keyframes } } })),
        false,
      );
    });

    it("rejects at above 100", () => {
      assert.equal(
        validateAnimation(
          block({
            tracks: { opacity: { keyframes: [{ at: 101, value: 1 }] } },
          }),
        ),
        false,
      );
    });

    it("rejects a negative at", () => {
      assert.equal(
        validateAnimation(
          block({ tracks: { opacity: { keyframes: [{ at: -1, value: 1 }] } } }),
        ),
        false,
      );
    });

    it("rejects a keyframe without value", () => {
      assert.equal(
        validateAnimation(
          block({ tracks: { opacity: { keyframes: [{ at: 0 }] } } }),
        ),
        false,
      );
    });

    it("rejects an unknown easing keyword", () => {
      assert.equal(validateAnimation(block({ easing: "bounce" })), false);
    });

    it("rejects the CSS spelling ease-in-out", () => {
      assert.equal(validateAnimation(block({ easing: "ease-in-out" })), false);
    });

    it("rejects a bezier with x1 outside 0..1", () => {
      assert.equal(
        validateAnimation(block({ easing: { x1: 1.5, y1: 0, x2: 1, y2: 1 } })),
        false,
      );
    });

    it("rejects a bezier with y1 outside -4..4", () => {
      assert.equal(
        validateAnimation(block({ easing: { x1: 0, y1: 5, x2: 1, y2: 1 } })),
        false,
      );
    });

    it("rejects a bezier missing a control point", () => {
      assert.equal(
        validateAnimation(block({ easing: { x1: 0, y1: 0, x2: 1 } })),
        false,
      );
    });

    it("rejects iterations of 0", () => {
      assert.equal(validateAnimation(block({ iterations: 0 })), false);
    });

    it("rejects values above the block maximums", () => {
      assert.equal(validateAnimation(block({ duration: 3601 })), false);
      assert.equal(validateAnimation(block({ delay: 3601 })), false);
      assert.equal(validateAnimation(block({ delay: -3601 })), false);
      assert.equal(validateAnimation(block({ iterations: 10001 })), false);
      assert.equal(
        validateAnimation(block({ origin: { x: 1001, y: 0 } })),
        false,
      );
    });

    it("rejects an unknown direction", () => {
      assert.equal(
        validateAnimation(block({ direction: "alternate-reverse" })),
        false,
      );
    });

    it("rejects fill backwards", () => {
      assert.equal(validateAnimation(block({ fill: "backwards" })), false);
    });

    it("rejects an origin missing y", () => {
      assert.equal(validateAnimation(block({ origin: { x: 50 } })), false);
    });

    it("rejects an unknown block property", () => {
      assert.equal(validateAnimation(block({ speed: 2 })), false);
    });

    it("rejects an unknown keyframe property", () => {
      assert.equal(
        validateAnimation(
          block({
            tracks: {
              opacity: { keyframes: [{ at: 0, value: 1, hold: true }] },
            },
          }),
        ),
        false,
      );
    });
  });
});

describe("definition.json animations on elements", () => {
  const animations = [block()];

  it("accepts animations on a generic element", () => {
    assert.equal(
      validateElement({ type: "element", name: "g", animations }),
      true,
    );
  });

  it("accepts animations on a component reference", () => {
    assert.equal(
      validateElement({ type: "component", name: "eyes", animations }),
      true,
    );
  });

  it("accepts eight animation blocks", () => {
    assert.equal(
      validateElement({
        type: "element",
        name: "g",
        animations: Array.from({ length: 8 }, () => block()),
      }),
      true,
    );
  });

  it("rejects animations on a text element", () => {
    assert.equal(
      validateElement({ type: "text", value: "hi", animations }),
      false,
    );
  });

  it("rejects animations on a style element", () => {
    assert.equal(
      validateElement({ type: "element", name: "style", animations }),
      false,
    );
  });

  it("rejects an empty animations array", () => {
    assert.equal(
      validateElement({ type: "element", name: "g", animations: [] }),
      false,
    );
  });

  it("rejects nine animation blocks", () => {
    assert.equal(
      validateElement({
        type: "element",
        name: "g",
        animations: Array.from({ length: 9 }, () => block()),
      }),
      false,
    );
  });
});

describe("definition.json animations below defs and clipPath", () => {
  const animations = [block()];
  const animated = { type: "element", name: "circle", animations };
  const still = { type: "element", name: "circle" };

  it("accepts still children below defs and clipPath", () => {
    assert.equal(
      validateElement({ type: "element", name: "defs", children: [still] }),
      true,
    );
    assert.equal(
      validateElement({
        type: "element",
        name: "clipPath",
        children: [still],
      }),
      true,
    );
  });

  it("accepts animations below a mask", () => {
    assert.equal(
      validateElement({ type: "element", name: "mask", children: [animated] }),
      true,
    );
  });

  it("accepts animations on the defs element itself", () => {
    assert.equal(
      validateElement({
        type: "element",
        name: "g",
        animations,
        children: [{ type: "element", name: "defs", children: [still] }],
      }),
      true,
    );
  });

  it("rejects animations on a child of defs", () => {
    assert.equal(
      validateElement({ type: "element", name: "defs", children: [animated] }),
      false,
    );
  });

  it("rejects animations on a child of clipPath", () => {
    assert.equal(
      validateElement({
        type: "element",
        name: "clipPath",
        children: [animated],
      }),
      false,
    );
  });

  it("rejects animations further down below defs", () => {
    assert.equal(
      validateElement({
        type: "element",
        name: "defs",
        children: [{ type: "element", name: "g", children: [animated] }],
      }),
      false,
    );
  });

  it("rejects an animated component reference below defs", () => {
    assert.equal(
      validateElement({
        type: "element",
        name: "defs",
        children: [{ type: "component", name: "eyes", animations }],
      }),
      false,
    );
  });
});

describe("definition.json animations on elements a group cannot wrap", () => {
  const animations = [block()];

  for (const name of ["stop", "tspan", "textPath", "mpath", "feGaussianBlur"]) {
    it(`rejects animations on ${name}`, () => {
      assert.equal(
        validateElement({ type: "element", name, animations }),
        false,
      );
    });
  }

  it("accepts the same elements without animations", () => {
    assert.equal(validateElement({ type: "element", name: "stop" }), true);
    assert.equal(
      validateElement({ type: "element", name: "feGaussianBlur" }),
      true,
    );
  });

  it("accepts animations on the parent of such elements", () => {
    assert.equal(
      validateElement({
        type: "element",
        name: "text",
        animations,
        children: [{ type: "element", name: "tspan" }],
      }),
      true,
    );
  });
});
