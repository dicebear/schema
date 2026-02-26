import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema, createValidator } from "../helpers/validator.js";

const schema = loadSchema("definition.json");
const validate = createValidator(schema);

function withCanvas(extra) {
  return { canvas: { elements: [], width: 100, height: 100 }, ...extra };
}

describe("definition.json meta", () => {
  describe("valid meta", () => {
    it("accepts empty meta", () => {
      assert.equal(validate(withCanvas({ meta: {} })), true);
    });

    it("accepts full meta with all sub-objects", () => {
      const data = withCanvas({
        meta: {
          license: {
            name: "MIT",
            url: "https://opensource.org/license/mit",
            text: "...",
          },
          creator: { name: "DiceBear", url: "https://dicebear.com" },
          source: { name: "MyProject", url: "https://example.com" },
        },
      });
      assert.equal(validate(data), true);
    });

    it("accepts partial meta", () => {
      const data = withCanvas({
        meta: { creator: { name: "Jane" } },
      });
      assert.equal(validate(data), true);
    });
  });

  describe("invalid meta", () => {
    it("rejects name as number", () => {
      const data = withCanvas({
        meta: { creator: { name: 123 } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects meta as string", () => {
      const data = withCanvas({ meta: "invalid" });
      assert.equal(validate(data), false);
    });
  });

  describe("additionalProperties", () => {
    it("rejects additional property in meta", () => {
      const data = withCanvas({
        meta: { extra: "data" },
      });
      assert.equal(validate(data), false);
    });

    it("rejects additional property in license", () => {
      const data = withCanvas({
        meta: { license: { name: "MIT", extra: "data" } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects additional property in creator", () => {
      const data = withCanvas({
        meta: { creator: { name: "John", extra: "data" } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects additional property in source", () => {
      const data = withCanvas({
        meta: { source: { name: "Proj", extra: "data" } },
      });
      assert.equal(validate(data), false);
    });
  });

  describe("URL security", () => {
    it("accepts https URL", () => {
      const data = withCanvas({
        meta: { creator: { url: "https://example.com" } },
      });
      assert.equal(validate(data), true);
    });

    it("accepts http URL", () => {
      const data = withCanvas({
        meta: { creator: { url: "http://example.com" } },
      });
      assert.equal(validate(data), true);
    });

    it("rejects javascript URI in creator url", () => {
      const data = withCanvas({
        meta: { creator: { url: "javascript:alert(1)" } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects javascript URI in license url", () => {
      const data = withCanvas({
        meta: { license: { url: "javascript:alert(1)" } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects data URI in source url", () => {
      const data = withCanvas({
        meta: {
          source: { url: "data:text/html,<script>alert(1)</script>" },
        },
      });
      assert.equal(validate(data), false);
    });

    it("rejects file:// URI", () => {
      const data = withCanvas({
        meta: { creator: { url: "file:///etc/passwd" } },
      });
      assert.equal(validate(data), false);
    });

    it("rejects protocol-relative URL", () => {
      const data = withCanvas({
        meta: { creator: { url: "//evil.com/steal" } },
      });
      assert.equal(validate(data), false);
    });
  });
});
