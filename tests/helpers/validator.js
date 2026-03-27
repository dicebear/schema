import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaDir = resolve(__dirname, "../../src");

export function loadSchema(filename) {
  const content = readFileSync(resolve(schemaDir, filename), "utf-8");
  return JSON.parse(content);
}

export function createValidator(schema) {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  return ajv.compile(schema);
}

export function withCanvas(extra) {
  return { canvas: { elements: [], width: 100, height: 100 }, ...extra };
}

export function getDefSchema(schema, defName) {
  const def = schema.$defs?.[defName];
  if (!def) {
    throw new Error(`$def "${defName}" not found in schema`);
  }

  // Build a standalone schema that includes all $defs for $ref resolution
  return {
    $schema: schema.$schema,
    $defs: schema.$defs,
    ...def,
  };
}
