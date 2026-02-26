import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema, createValidator } from "../helpers/validator.js";

const schema = loadSchema("options.json");
const validate = createValidator(schema);

describe("options.json additionalProperties", () => {
  it("rejects unknown properties", () => {
    assert.equal(validate({ unknownProp: "value" }), false);
  });

  it("allows patternProperty matches (no conflict with additionalProperties)", () => {
    assert.equal(validate({ headProbability: 50 }), true);
  });

  it("allows mix of valid properties and valid patternProperties", () => {
    const data = {
      seed: "test",
      size: 64,
      headProbability: 75,
      eyesVariant: "open",
      skinColor: "#ff0000",
      rotate: 45,
    };
    assert.equal(validate(data), true);
  });
});
