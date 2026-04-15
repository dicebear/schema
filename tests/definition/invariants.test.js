import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadSchema } from "../helpers/validator.js";

const schema = loadSchema("definition.json");

function walk(node, path, visit, insideNegation = false) {
  if (!node || typeof node !== "object") return;

  if (!insideNegation) {
    visit(node, path);
  }

  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object") {
      walk(value, [...path, key], visit, insideNegation || key === "not");
    }
  }
}

function isStringBounded(node) {
  if (node.maxLength !== undefined) return true;

  if (Array.isArray(node.allOf)) {
    return node.allOf.some(
      (entry) =>
        entry && typeof entry === "object" && entry.maxLength !== undefined,
    );
  }

  return false;
}

function isObjectBounded(node) {
  return node.additionalProperties === false || node.maxProperties !== undefined;
}

function isArrayBounded(node) {
  return node.maxItems !== undefined;
}

function collect() {
  const strings = [];
  const objects = [];
  const arrays = [];

  walk(schema, [], (node, path) => {
    if (node.type === "string") {
      strings.push({ node, path });
    } else if (node.type === "object") {
      objects.push({ node, path });
    } else if (node.type === "array") {
      arrays.push({ node, path });
    }
  });

  return { strings, objects, arrays };
}

function formatPaths(entries) {
  return entries.map(({ path }) => "/" + path.join("/")).join("\n");
}

describe("definition.json structural invariants", () => {
  const { strings, objects, arrays } = collect();

  it("every string schema is length-bounded", () => {
    const unbounded = strings.filter(({ node }) => !isStringBounded(node));
    assert.deepEqual(
      unbounded.map(({ path }) => path),
      [],
      `strings without maxLength:\n${formatPaths(unbounded)}`,
    );
  });

  it("every object schema is closed or has maxProperties", () => {
    const unbounded = objects.filter(({ node }) => !isObjectBounded(node));
    assert.deepEqual(
      unbounded.map(({ path }) => path),
      [],
      `objects without additionalProperties:false or maxProperties:\n${formatPaths(unbounded)}`,
    );
  });

  it("every array schema has maxItems", () => {
    const unbounded = arrays.filter(({ node }) => !isArrayBounded(node));
    assert.deepEqual(
      unbounded.map(({ path }) => path),
      [],
      `arrays without maxItems:\n${formatPaths(unbounded)}`,
    );
  });
});
