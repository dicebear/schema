import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema, createValidator } from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const validate = createValidator(schema);

function withCanvas(extra) {
  return { canvas: { elements: [], width: 100, height: 100 }, ...extra };
}

describe("definition.json colors", () => {
  describe("valid colors", () => {
    it("accepts empty colors object", () => {
      assert.equal(validate(withCanvas({ colors: {} })), true);
    });

    it("accepts color group with empty values array", () => {
      const data = withCanvas({
        colors: { skin: { values: [] } },
      });
      assert.equal(validate(data), true);
    });

    it("accepts color group with values", () => {
      const data = withCanvas({
        colors: { skin: { values: ["#ff0000", "#00ff00"] } },
      });
      assert.equal(validate(data), true);
    });

    it("accepts hex with #", () => {
      const data = withCanvas({
        colors: { skin: { values: ["#ff0000"] } },
      });
      assert.equal(validate(data), true);
    });

    it("accepts notEqualTo with valid name pattern", () => {
      const data = withCanvas({
        colors: {
          skin: { values: ["#ff0000"], notEqualTo: ["hair"] },
        },
      });
      assert.equal(validate(data), true);
    });

    it("accepts contrastTo with valid name pattern", () => {
      const data = withCanvas({
        colors: {
          skin: { values: ["#ff0000"], contrastTo: "background" },
        },
      });
      assert.equal(validate(data), true);
    });
  });

  describe("invalid colors", () => {
    it("rejects missing values", () => {
      const data = withCanvas({
        colors: { skin: {} },
      });
      assert.equal(validate(data), false);
    });

    it("rejects hex without #", () => {
      const data = withCanvas({
        colors: { skin: { values: ["ff0000"] } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects invalid hex in values", () => {
      const data = withCanvas({
        colors: { skin: { values: ["#xyz123"] } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects 4-digit hex in values", () => {
      const data = withCanvas({
        colors: { skin: { values: ["#fff0"] } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects invalid name in notEqualTo (starts with uppercase)", () => {
      const data = withCanvas({
        colors: {
          skin: { values: ["#ff0000"], notEqualTo: ["Uppercase"] },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects invalid name in contrastTo (starts with uppercase)", () => {
      const data = withCanvas({
        colors: {
          skin: { values: ["#ff0000"], contrastTo: "Background" },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects invalid name in contrastTo (contains hyphen)", () => {
      const data = withCanvas({
        colors: {
          skin: { values: ["#ff0000"], contrastTo: "back-ground" },
        },
      });
      assert.equal(validate(data), false);
    });
  });

  describe("additionalProperties", () => {
    it("rejects additional property in color group", () => {
      const data = withCanvas({
        colors: { skin: { values: ["#ff0000"], extra: "data" } },
      });
      assert.equal(validate(data), false);
    });
  });
});
