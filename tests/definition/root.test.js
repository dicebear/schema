import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema, createValidator } from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const validate = createValidator(schema);

describe("definition.json root", () => {
  describe("valid documents", () => {
    it("accepts minimal document with canvas", () => {
      const data = { canvas: { elements: [], width: 100, height: 100 } };
      assert.equal(validate(data), true);
    });

    it("accepts document with all optional top-level keys", () => {
      const data = {
        meta: {},
        attributes: {},
        canvas: { elements: [], width: 100, height: 100 },
        components: {},
        colors: {},
      };
      assert.equal(validate(data), true);
    });

    it("accepts $schema field", () => {
      const data = {
        $schema: "https://static.dicebear.com/schema/v1/definition.json",
        canvas: { elements: [], width: 100, height: 100 },
      };
      assert.equal(validate(data), true);
    });

    it("accepts $comment field", () => {
      const data = {
        $comment: "My avatar style",
        canvas: { elements: [], width: 100, height: 100 },
      };
      assert.equal(validate(data), true);
    });

    it("accepts decimal dimensions", () => {
      const data = { canvas: { elements: [], width: 1.5, height: 2.7 } };
      assert.equal(validate(data), true);
    });
  });

  describe("invalid documents", () => {
    it("rejects empty object (missing canvas)", () => {
      assert.equal(validate({}), false);
    });

    it("rejects canvas without required fields", () => {
      const data = { canvas: {} };
      assert.equal(validate(data), false);
    });

    it("rejects width: 0", () => {
      const data = { canvas: { elements: [], width: 0, height: 100 } };
      assert.equal(validate(data), false);
    });

    it("rejects height: 0", () => {
      const data = { canvas: { elements: [], width: 100, height: 0 } };
      assert.equal(validate(data), false);
    });

    it("rejects negative width", () => {
      const data = { canvas: { elements: [], width: -5, height: 100 } };
      assert.equal(validate(data), false);
    });

    it("rejects negative height", () => {
      const data = { canvas: { elements: [], width: 100, height: -5 } };
      assert.equal(validate(data), false);
    });

    it("rejects elements as string", () => {
      const data = { canvas: { elements: "abc", width: 100, height: 100 } };
      assert.equal(validate(data), false);
    });

    it("rejects width as string", () => {
      const data = { canvas: { elements: [], width: "100", height: 100 } };
      assert.equal(validate(data), false);
    });
  });

  describe("boundary values", () => {
    it("accepts width: 1, height: 1 (minimum)", () => {
      const data = { canvas: { elements: [], width: 1, height: 1 } };
      assert.equal(validate(data), true);
    });

    it("rejects width: 0.999 (below minimum)", () => {
      const data = { canvas: { elements: [], width: 0.999, height: 100 } };
      assert.equal(validate(data), false);
    });
  });

  describe("additionalProperties", () => {
    it("rejects unknown top-level property", () => {
      const data = {
        canvas: { elements: [], width: 100, height: 100 },
        malicious: "payload",
      };
      assert.equal(validate(data), false);
    });

    it("rejects additional property in canvas", () => {
      const data = {
        canvas: { elements: [], width: 100, height: 100, extra: "data" },
      };
      assert.equal(validate(data), false);
    });
  });
});
